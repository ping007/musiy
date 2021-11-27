import * as functions from "firebase-functions";
import { selectUserByUserId, updateUserPaymentInfo } from "../users";

import Stripe from "stripe";
// "sk_test_51HaMF7KWST1gjh7LgYpmbhILg9QJVHQpRh3Vq08iyyDuFT6tciNLL4y01vv1mubpXc5XnQiOnMUAaZ54BwL4ti7a00QS4QXUCl"
const stripe = new Stripe(functions.config().stripe.secretkey, {
  apiVersion: "2020-08-27",
  typescript: true,
});

const runtimeOpts: any = {
  memory: "2GB",
};
/**
 * Stripeの顧客データを新規作成
 * @param email
 */
const createStripeCustomer = async (email: string) => {
  const customer = await stripe.customers.create({
    email,
  });
  return customer;
};

/**
 * Stripeの顧客データを取得
 * @param customerId
 */
const getStripeCustomer = async (customerId: string) => {
  const customer:
    | Stripe.Customer
    | Stripe.DeletedCustomer = await stripe.customers.retrieve(customerId);
  return customer;
};

/**
 * Stripeの顧客データのメタデータを更新
 * @param customerId
 * @param metadata
 */
const updateStripeCustomerMetadata = async (
  customerId: string,
  newMetadata
) => {
  const customer:
    | Stripe.Customer
    | Stripe.DeletedCustomer = await stripe.customers.update(customerId, {
    metadata: newMetadata,
  });
  return customer;
};

/**
 * カード支払い情報を新規作成
 * @param cardInfo
 */
const createStripeCardPaymentMethod = async (cardInfo: any) => {
  let paymentMethod: Stripe.PaymentMethod = null;
  try {
    paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: cardInfo.cardNumber,
        exp_month: cardInfo.cardMonth,
        exp_year: cardInfo.cardYear,
        cvc: cardInfo.cardCvv,
      },
      billing_details: { name: cardInfo.cardName },
    });
  } catch (error) {
    throw new functions.https.HttpsError("invalid-argument", error);
  }

  return paymentMethod;
};

/**
 * 支払い情報をStripeの顧客情報と関連付ける
 * @param customerId
 * @param paymentMethod
 */
const addStripePaymentMethodToCustomer = async (
  customerId: string,
  paymentMethod: Stripe.PaymentMethod
) => {
  const resultPaymentMethod = await stripe.paymentMethods.attach(
    paymentMethod.id,
    {
      customer: customerId,
    }
  );

  return resultPaymentMethod;
};

/**
 * カード情報を定額支払用に登録
 * @param customerId
 * @param paymentMethodId
 */
const addDefaultPaymentMethod = async (
  customerId: string,
  paymentMethodId: string
) => {
  const customer = await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
  console.log("updated customer", customer);
  return customer;
};
/**
 * 支払い情報をStripeの顧客情報から削除
 * @param customerId
 * @param paymentMethodId
 */
const removeStripePaymentMethodToCustomer = async (
  customerId: string,
  paymentMethodId: string
) => {
  const resultPaymentMethod = await stripe.paymentMethods.detach(
    paymentMethodId
  );
  // 定額支払用から削除
  const customer = await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: null },
  });
  console.log("updated customer delete", customer);
  return resultPaymentMethod;
};

/**
 * Stripeの顧客IDからデフォルト支払用の支払IDを取得する
 * @param stripeCustomerId
 */
const getDefaultPaymentMethodId = async (stripeCustomerId) => {
  const stripeCustomer:
    | Stripe.Customer
    | Stripe.DeletedCustomer = await getStripeCustomer(stripeCustomerId);
  let paymentMethodId: string = null;
  if (!stripeCustomer.deleted) {
    paymentMethodId = (stripeCustomer as Stripe.Customer).invoice_settings.default_payment_method?.toString();
  }
  return paymentMethodId;
};

/**
 * Stripeの支払情報を取得する
 * @param paymentMethodId
 */
const getDefaultPaymentMethod = async (paymentMethodId) => {
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  return paymentMethod;
};

export const load_card_info = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    const result: any = {};
    try {
      const userId = context.auth.uid;
      const res: any = await selectUserByUserId(userId);
      const user: any = res.rows[0];
      const stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        result.error = {
          code: "no cards",
          message: "支払い用のカード情報が登録されていません",
        };
      } else {
        const paymentMethodId = await getDefaultPaymentMethodId(
          stripeCustomerId
        );
        const paymentMethod = await getDefaultPaymentMethod(paymentMethodId);
        result.cardInfo = {
          cardName: paymentMethod.billing_details.name,
          cardNumber: "**** **** **** " + paymentMethod.card.last4,
          cardMonth: paymentMethod.card.exp_month,
          cardYear: paymentMethod.card.exp_year,
          cardCvv: "",
          cardType: paymentMethod.card.brand,
        };
      }
    } catch (error) {
      console.log("Error fetching card data:", error);
      result.error = error;
    }
    return result;
  });

export const save_card_info = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    let result: any = {};
    try {
      const userId = context.auth.uid;
      const res: any = await selectUserByUserId(userId);
      const user: any = res.rows[0];
      const email = user.email;
      console.log("userId", userId);
      console.log("user", user);
      console.log("email", email);

      let stripeCustomerId = user.stripeCustomerId;
      const hasCardData = user.cardNumFourDigits !== null;
      console.log("stripeCustomerId 1", stripeCustomerId);
      console.log("data.cardInfo", data.cardInfo);
      // カードの支払い情報を作成
      let stripeCardPaymentMethod = await createStripeCardPaymentMethod(
        data.cardInfo
      );
      if (stripeCardPaymentMethod) {
        if (!stripeCustomerId) {
          // stripeの顧客IDが無い場合は
          // カードの支払い情報をStripe側に保持するためにStripeの顧客情報を新規作成
          const stripeCustomer = await createStripeCustomer(email);
          stripeCustomerId = stripeCustomer.id;
        }
        // 新しく登録するカードの支払い情報とStripeの顧客情報を紐づける
        stripeCardPaymentMethod = await addStripePaymentMethodToCustomer(
          stripeCustomerId,
          stripeCardPaymentMethod
        );
        if (hasCardData) {
          // stripeの顧客に既に支払い情報のカードが登録されている場合は削除
          const paymentMethodId = await getDefaultPaymentMethodId(
            stripeCustomerId
          );
          if (paymentMethodId) {
            const deletedPaymentMethod = await removeStripePaymentMethodToCustomer(
              stripeCustomerId,
              paymentMethodId
            );
            console.log("deletedPaymentMethod", deletedPaymentMethod);
          }
        }
        // 新しく登録するカードの支払い情報を定額支払用として登録
        const customer = await addDefaultPaymentMethod(
          stripeCustomerId,
          stripeCardPaymentMethod.id
        );
        console.log("updated stripeCustomer", customer);

        // Musiy側のDBにStripeの顧客IDとカードの番号の下４桁を登録
        const cardNumStr = String(data.cardInfo.cardNumber).slice(-4);
        result = await updateUserPaymentInfo(
          userId,
          stripeCustomerId,
          cardNumStr
        );
      }
    } catch (error) {
      console.log("Error saving card data:", error);
      result.error = error;
    }
    return result;
  });

/**
 * 支払いデータを作成
 *
 */
const createNewPaymentIntent = async (
  stripeCustomerId: string,
  amount: number
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    customer: stripeCustomerId,
    amount: amount,
    currency: "jpy",
    payment_method_types: ["card"],
  });
  return paymentIntent;
};

/**
 * 振込先口座情報を取得する
 */
export const load_account_info = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    const result: any = {};
    try {
      let userId = context.auth.uid;
      if (data.userId) {
        userId = data.userId;
      }
      const res: any = await selectUserByUserId(userId);
      const user: any = res.rows[0];
      const stripeCustomerId = user.stripeCustomerId;
      const customer:
        | Stripe.Customer
        | Stripe.DeletedCustomer = await getStripeCustomer(stripeCustomerId);

      if (customer && customer instanceof Object && "metadata" in customer) {
        const metadata: any = customer.metadata;
        if (metadata && metadata.bankCode) {
          result.accountInfo = {
            bankCode: metadata.bankCode,
            bankName: metadata.bankName,
            branchCode: metadata.branchCode,
            branchName: metadata.branchName,
            accountType: metadata.accountType,
            accountNumber: metadata.accountNumber,
            kanaName: metadata.kanaName,
          };
        }
      }
    } catch (error) {
      console.log("Error fetching card data:", error);
      result.error = error;
    }
    return result;
  });

/**
 * 振込先口座情報登録用のメソッド
 */
export const save_account_info = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    let result: any = {};
    try {
      const userId = context.auth.uid;
      const res: any = await selectUserByUserId(userId);
      const user: any = res.rows[0];
      const email = user.email;
      let stripeCustomerId: string = user.stripeCustomerId;
      if (!stripeCustomerId) {
        // stripeの顧客IDが無い場合は
        // 支払い口座情報をStripe側に保持するためにStripeの顧客情報を新規作成
        const stripeCustomer = await createStripeCustomer(email);
        stripeCustomerId = stripeCustomer.id;
        // Musiy側のDBにStripeの顧客IDを登録
        await updateUserPaymentInfo(userId, stripeCustomerId, null);
      }
      result = await updateStripeCustomerMetadata(
        stripeCustomerId,
        data.accountInfo
      );
    } catch (error) {
      console.log("Error create payment data:", error);
      result.error = error;
    }
    return result;
  });

/**
 * 都度支払い用のメソッド
 */
export const exec_purchase_at_once = functions
  .region("asia-northeast1")
  .runWith(runtimeOpts)
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    const result: any = {
      clientSecret: undefined,
      paymentMethodId: undefined,
    };

    try {
      const userId = context.auth.uid;
      const res: any = await selectUserByUserId(userId);
      const user: any = res.rows[0];
      const stripeCustomerId = user.stripeCustomerId;
      const hasCardData = user.cardNumFourDigits !== null;
      if (stripeCustomerId && hasCardData) {
        // カードの支払い情報を取得
        const paymentMethodId = await getDefaultPaymentMethodId(
          stripeCustomerId
        );
        result.paymentMethodId = paymentMethodId;
        const amount = data.amount;

        if (amount && amount >= 0) {
          const paymentIntent = await createNewPaymentIntent(
            stripeCustomerId,
            amount
          );
          result.clientSecret = paymentIntent.client_secret;
        }
      }
    } catch (error) {
      console.log("Error create payment data:", error);
      result.error = error;
    }
    return result;
  });
