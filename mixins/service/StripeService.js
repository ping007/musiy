import { loadStripe } from "@stripe/stripe-js";
export default {
  data() {
    return {
      stripe: undefined,
    };
  },
  async created() {
    this.stripe = await loadStripe(process.env.VUE_APP_STRIPE_PUB_KEY);
  },
  methods: {
    async StripeService_ExecCardPayment(amount) {
      try {
        const result = await this.$functions.httpsCallable(
          "exec_purchase_at_once"
        )({
          amount,
        });

        let stripeResult;
        if (result && result.data) {
          stripeResult = await this.stripe.confirmCardPayment(
            result.data.clientSecret,
            {
              payment_method: result.data.paymentMethodId,
            }
          );
        }

        return stripeResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async StripeService_SaveCardInfo(cardInfo) {
      try {
        const result = await this.$functions.httpsCallable("save_card_info")({
          cardInfo,
        });
        console.log("SQL Result:", result);
        return result.data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async StripeService_loadCardInfo() {
      try {
        const result = await this.$functions.httpsCallable("load_card_info")(
          {}
        );
        console.log("SQL Result:", result);
        return result.data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async StripeService_SaveAccountInfo(accountInfo) {
      try {
        const result = await this.$functions.httpsCallable("save_account_info")(
          {
            accountInfo,
          }
        );
        console.log("SQL Result:", result);
        return result.data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async StripeService_loadAccountInfo(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "load_account_info"
        )({ userId });
        console.log("SQL Result:", result);
        return result.data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
