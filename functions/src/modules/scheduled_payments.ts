import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import * as Handlebars from "handlebars";
import {
  execMultiQueryWithTransaction,
  execSingleQueryWithParams,
  Postgres,
} from "./common/dao";
import { selectPlanByPlanId } from "./plans";
import { trnPurchaseContent } from "./purchased_contents";
import { trnSelectValidUserByUserId } from "./users";
import {
  failedMonthlyPaymentMailTitle,
  failedMonthlyPaymentMailContext,
} from "./mail/template/failed_monthly_payment";
import {
  succeededMonthlyPaymentMailTitle,
  succeededMonthlyPaymentMailContext,
} from "./mail/template/succeeded_monthly_payment";
import { updateSupporterIsEnable } from "./supporters";
import { sendMail } from "./mail/mailer";

const columns = `
    scheduled_payments.scheduled_payment_id AS "scheduledPaymentId",
    scheduled_payments.content_id AS "contentId",
    scheduled_payments.content_type AS "contentType",
    scheduled_payments.user_id AS "userId",
    scheduled_payments.price AS "price",
    scheduled_payments.expiration_datetime AS "expirationDatetime",
    scheduled_payments.is_payment_succeeded AS "isPaymentSucceeded",
    scheduled_payments.is_canceled AS "isCanceled",
    scheduled_payments.cr_user_id AS "crUserId",
    to_char(scheduled_payments.cr_datetime,'YYYY/MM/DD HH24:MI:SS') AS "crDatetime",
    to_char(scheduled_payments.up_datetime,'YYYY/MM/DD HH24:MI:SS') AS "upDatetime"
`;

const sql_select_scheduled_payments = `
  SELECT
    ${columns},
    plans.plan_name AS "planName",
    plans.plan_description AS "planDescription",
    plans.plan_price AS "planPrice"
  FROM scheduled_payments
  LEFT JOIN plans
  ON plans.plan_id = scheduled_payments.content_id
`;

const selectScheduledPayments = function() {
  const params = [];
  return execSingleQueryWithParams(sql_select_scheduled_payments, params);
};

export const select_scheduled_payments = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return selectScheduledPayments().then((result) => {
      return result;
    });
  });

const sql_select_scheduled_payments_by_user_id = `
  SELECT
    ${columns},
    plans.plan_name AS "planName",
    plans.plan_description AS "planDescription",
    plans.plan_price AS "planPrice"
  FROM scheduled_payments
  LEFT JOIN plans
  ON plans.plan_id = scheduled_payments.content_id
  WHERE scheduled_payments.user_id = $1
`;

export const trnSelectScheduledPaymentsByUserId = async function(
  db: Postgres,
  userId: string
) {
  const params = [userId];
  return await db.execute(sql_select_scheduled_payments_by_user_id, params);
};

// + '9 hours' <= UTC to JST
const sql_upsert_scheduled_payment = `
INSERT INTO scheduled_payments ( scheduled_payment_id, content_id, content_type, user_id, price,
    expiration_datetime, is_payment_succeeded, cr_user_id, cr_datetime, up_datetime)
  VALUES ($1, $2, $3, $4, $5, DATE_TRUNC('month', now() + '9 hours' + '1 months')+ '-1 sec', $6, $7, now() + '9 hours', now() + '9 hours')
  ON CONFLICT ON CONSTRAINT scheduled_payments_pkey
  DO UPDATE SET scheduled_payment_id=$1, content_id=$2, content_type=$3,
    user_id=$4, price=$5, expiration_datetime=DATE_TRUNC('month', now() + '9 hours' + '1 months')+ '-1 sec', is_payment_succeeded=$6, up_datetime=now() + '9 hours'
`;

export const trn_upsert_scheduled_payment = async function(
  db: Postgres,
  scheduledPaymentId: string,
  contentId: string,
  contentType: string,
  userId: string,
  price: number,
  isPaymentSucceeded: boolean,
  crUserId: string
) {
  let primaryId = scheduledPaymentId;
  if (!primaryId) {
    primaryId = uuidv4();
  }
  const params = [
    primaryId,
    contentId,
    contentType,
    userId,
    String(price),
    String(isPaymentSucceeded),
    crUserId,
  ];
  return {
    id: scheduledPaymentId,
    db_res: await db.execute(sql_upsert_scheduled_payment, params),
  };
};

export const trn_set_scheduled_payment = async function(
  db: Postgres,
  contentId: string,
  contentType: string,
  userId: string,
  price: number
) {
  let newPlanPrice = price;
  let payment = undefined;
  const resPayment = await trnSelectScheduledPaymentsByUserId(db, userId);
  if (resPayment && resPayment.rows && resPayment.rows.length > 0) {
    payment = resPayment.rows[0];
  }
  let scheduledPaymentId = undefined;
  if (payment) {
    // 既に他のプランで支払いを行っている場合で高いプランにアップグレードした場合、
    // 例)100円のプランから300円のプランにアップグレードした場合
    // 引数のpriceの中には差額の200円が入っている(今月分は差額を払えば良いだけなので)が、
    // 翌月の支払いは300円にすべきなので
    // 新しいプランの支払い額を代入するように調整している
    // プランのダウングレードの場合も同じ。
    const planId = contentId;
    const result: any = await selectPlanByPlanId(planId);
    if (result && result.rows && result.rows.length > 0) {
      const plan = result.rows[0];
      newPlanPrice = plan.planPrice;
    }
    scheduledPaymentId = payment.scheduledPaymentId;
  }
  const res = await trn_upsert_scheduled_payment(
    db,
    scheduledPaymentId,
    contentId,
    contentType,
    userId,
    newPlanPrice,
    true,
    userId
  );
  return res;
};

/**
 * 月次支払の実行
 */
const exec_monthly_scheduled_payment = async function() {
  const result: any = await selectScheduledPayments();
  if (result && result.rows && result.rows.length > 0) {
    const payments = result.rows;
    let isPaymentSucceeded = false;
    payments.forEach(async (payment) => {
      try {
        if (payment.isCanceled) {
          // 解約対象の場合は課金せず、サポート状態を無効にする
          await execMultiQueryWithTransaction(
            trn_upsert_scheduled_payment,
            payment.scheduledPaymentId,
            payment.contentId,
            payment.contentType,
            payment.userId,
            payment.price,
            false,
            payment.userId
          );
          await updateSupporterIsEnable(
            payment.userId,
            payment.contentId,
            false
          );
        } else {
          await execMultiQueryWithTransaction(
            trnPurchaseContent,
            payment.userId,
            payment.contentId,
            payment.contentType,
            payment.price
          );
          await updateSupporterIsEnable(
            payment.userId,
            payment.contentId,
            true
          );
          isPaymentSucceeded = true;
          console.log(
            `月次支払成功 userId：${payment.userId} contentId：${payment.contentId} contentType：${payment.contentType} price：${payment.price} `
          );
        }
      } catch (error) {
        if (error.message === "Not enough points") {
          console.log(
            `月次支払失敗 ポイント不足 userId：${payment.userId} contentId：${payment.contentId} contentType：${payment.contentType} price：${payment.price} `
          );
          // ポイント不足で更新に失敗した場合
          await execMultiQueryWithTransaction(
            trn_upsert_scheduled_payment,
            payment.scheduledPaymentId,
            payment.contentId,
            payment.contentType,
            payment.userId,
            payment.price,
            false,
            payment.userId
          );
          await updateSupporterIsEnable(
            payment.userId,
            payment.contentId,
            false
          );
        } else {
          console.log(
            `月次支払失敗 その他 userId：${payment.userId} contentId：${payment.contentId} contentType：${payment.contentType} price：${payment.price} `
          );
        }
        console.error(error);
      }
      const res: any = await execMultiQueryWithTransaction(
        trnSelectValidUserByUserId,
        payment.userId
      );
      if (res && res.rows && res.rows.length > 0) {
        const user = res.rows[0];
        let mailTitle = failedMonthlyPaymentMailTitle;
        let mailContext = failedMonthlyPaymentMailContext;
        if (isPaymentSucceeded) {
          // 成功時は購入完了メール文面を設定
          mailTitle = succeededMonthlyPaymentMailTitle;
          mailContext = succeededMonthlyPaymentMailContext;
        }
        const template = Handlebars.compile(mailContext);
        const content = template({
          user: {
            name: user.username,
          },
          planName: payment.planName,
        });

        await sendMail(user.email, mailTitle, content);
        console.log(
          `メール送信完了 email：${user.email} planName：${payment.planName} isPaymentSucceeded：${isPaymentSucceeded}  `
        );
      }
    });
  }
};

export const monthly_scheduled_payment = functions
  .region("asia-northeast1")
  .pubsub.schedule("1 of month 00:00")
  .timeZone("Asia/Tokyo")
  .onRun(async (context) => {
    await exec_monthly_scheduled_payment();
    console.log("月次支払い完了");
    return null;
  });

const sql_update_scheduled_payments_is_canceled = `
UPDATE scheduled_payments SET is_canceled = true WHERE content_id=$1 and user_id = $2
`;

const updateScheduledPaymentsIsCanceled = function(
  contentId: string,
  userId: string
) {
  const params = [contentId, userId];
  return execSingleQueryWithParams(
    sql_update_scheduled_payments_is_canceled,
    params
  );
};

export const update_scheduled_payments_is_canceled = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return updateScheduledPaymentsIsCanceled(data.contentId, data.userId).then(
      (result) => {
        return result;
      }
    );
  });
