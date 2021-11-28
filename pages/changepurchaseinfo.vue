<template>
  <div>
    <Loading v-model="loadingValue" />
    <v-container class="change-purchase-info" fluid>
      <div v-if="cardNumFourDigits" class="card-num ml-2">
        <span
          v-text="'現在登録中のカード番号（下4桁）' + cardNumFourDigits"
        ></span>
      </div>
      <div v-show="isShowCreateNewCardInfoAlertStr">
        <span
          class="msy-color-text-red"
          v-text="
            '【注意！】このページでカード情報の登録を行っただけではチケット等のコンテンツの購入は完了しません。カード情報の登録後に再度コンテンツの購入操作を行い購入を完了してください。'
          "
        ></span>
      </div>
      <CreditCardInput @click-register="savePurchaseInfo" />
      <v-snackbar
        v-model="isShowSuccessSnackbar"
        top
        :multi-line="true"
        :color="'success'"
        :timeout="3000"
      >
        <span v-text="successStr"></span>
      </v-snackbar>
      <v-snackbar
        v-model="isShowErrorSnackbar"
        top
        :multi-line="true"
        :color="'error'"
        :timeout="10000"
      >
        <span v-text="errorStr"></span>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import CreditCardInput from "~/components/organisms/CreditCardInput";
import Loading from "~/components/molecules/Loading";
import stripeService from "~/mixins/service/StripeService";
import UsersDao from "~/mixins/dao/UsersDao";
export default {
  components: {
    CreditCardInput,
    Loading,
  },
  mixins: [stripeService, UsersDao],
  data() {
    return {
      loadingValue: 0,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      cardNumFourDigits: undefined,
      isShowCreateNewCardInfoAlertStr: false,
      fromContent: undefined,
      fromIsMovie: false,
      fromIsMusic: false,
      fromIsPoint: false,
      fromIsPlan: false,
      fromIsTicket: false,
    };
  },
  created() {
    const fromPage = this.$route.params.fromPage;
    if (fromPage && fromPage === "no-cards") {
      this.isShowCreateNewCardInfoAlertStr = true;
      const fromContent = this.$route.params.fromContent;
      if (fromContent) {
        this.fromContent = fromContent;
        this.fromIsMovie =
          this.$route.params.fromIsMovie !== undefined &&
          this.$route.params.fromIsMovie;
        this.fromIsMusic =
          this.$route.params.fromIsMusic !== undefined &&
          this.$route.params.fromIsMusic;
        this.fromIsPoint =
          this.$route.params.fromIsPoint !== undefined &&
          this.$route.params.fromIsPoint;
        this.fromIsPlan =
          this.$route.params.fromIsPlan !== undefined &&
          this.$route.params.fromIsPlan;
        this.fromIsTicket =
          this.$route.params.fromIsTicket !== undefined &&
          this.$route.params.fromIsTicket;
      }
    }
    const user = this.$store.state.user.user;
    this.cardNumFourDigits = user.cardNumFourDigits;
    this.loadingValue = 100;
  },
  methods: {
    async savePurchaseInfo(cardInfo) {
      this.loadingValue = 20;
      const res = await this.StripeService_SaveCardInfo(cardInfo);
      if (res.error) {
        this.isShowErrorSnackbar = true;
        const errorCode = res.error.code;
        const errorMessage = res.error.details;
        this.loadingValue = 100;
        this.errorStr = `カード登録時にエラーが発生しました。\n${this.errorCodeConverter(
          errorCode,
          errorMessage
        )}`;
      } else {
        const user = this.$store.state.user.user;
        this.loadingValue = 60;
        const updatedUser = await this.UsersDao_SelectUserByUserId(user.userId);
        this.loadingValue = 100;
        this.$store.commit("user/setUser", updatedUser);
        if (this.fromContent) {
          this.toContentPage();
        } else {
          this.toMainPage();
        }
      }
    },
    toMainPage() {
      this.isShowSuccessSnackbar = true;
      this.successStr = "登録が完了しました。３秒後にメイン画面に戻ります";
      setTimeout(() => {
        this.$router.push({
          name: "fans-main",
        });
      }, 3000);
    },
    toContentPage() {
      this.isShowSuccessSnackbar = true;
      this.successStr =
        "登録が完了しました。３秒後にコンテンツ購入画面に戻ります";
      setTimeout(() => {
        this.$router.push({
          name: "fans-purchase",
          params: {
            content: this.fromContent,
            isMovie: this.fromIsMovie,
            isMusic: this.fromIsMusic,
            isPoint: this.fromIsPoint,
            isPlan: this.fromIsPlan,
            isTicket: this.fromIsTicket,
          },
        });
      }, 3000);
    },
    errorCodeConverter(errorCode, errorMessage) {
      let message = "";
      switch (errorCode) {
      case "invalid-argument":
        message = "入力内容に不備があります。内容を確認してください。";
        break;
      }
      return message;
    },
  },
};
</script>

<style lang="scss" scoped>
.card-num {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.65);
}
.change-purchase-info {
  padding-bottom: 48px;
}
div.error span {
  white-space: pre;
}
</style>
