<template>
  <div class="support-plans">
    <Loading v-model="loadingValue" />
    <v-row class="py-5 page-title">
      <h4
        class="msy-text-color-black"
        v-text="'ファンクラブの応援プランを選択してください'"
      ></h4>
    </v-row>
    <v-card
      v-for="plan in plans"
      :key="plan.planId"
      class="ma-4 support-plan-card"
      elevation="0"
      flat
      @click="selectPlan(plan)"
    >
      <div
        v-if="plan.planImageId && plan.planImageId !== ''"
        class="support-plan-img"
      >
        <v-img
          class="support-plan-img-inner"
          :src="imgUrl(plan.planImageId)"
          lazy-src="/images/no_image.png"
        >
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="grey lighten-5" />
            </v-row>
          </template>
        </v-img>
        <h2 class="support-plan-name" v-text="plan.planName"></h2>
      </div>
      <div v-else class="support-plan-img">
        <v-img class="support-plan-img-inner" src="/images/no_image.png" />
        <h2 class="support-plan-name" v-text="plan.planName"></h2>
      </div>
      <v-row class="ma-4">
        <v-col cols="9">
          <p v-text="plan.planDescription"></p>
        </v-col>
        <v-col cols="3">
          <div class="support-plan-price">
            <p v-text="plan.planPrice + 'P'"></p>
          </div>
        </v-col>
      </v-row>
    </v-card>
    <v-row class="pt-5" align="center" justify="center">
      <v-btn
        v-if="supportedPlan && supportedPlan.isEnable"
        class="cancel-support-btn"
        outlined
        rounded
        color="rgba(231, 64, 89, 0.65)"
        dense
        @click="cancelSupport"
      >
        <v-icon small>mdi-cancel</v-icon>
        <span v-text="'応援プランを解約する'"></span>
      </v-btn>
    </v-row>
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
      :timeout="3000"
    >
      <span v-text="errorStr"></span>
    </v-snackbar>
  </div>
</template>

<script>
import { Cloudinary } from "~/constant";
import ScheduledPaymentsDao from "~/mixins/dao/ScheduledPaymentsDao";
import Loading from "~/components/molecules/Loading";
export default {
  components: {
    Loading,
  },
  mixins: [ScheduledPaymentsDao],
  data() {
    return {
      plans: [],
      loadingValue: 0,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      cloudinary: Cloudinary,
      supportedPlan: undefined,
    };
  },
  created() {
    const plans = this.$route.params.plans;
    if (plans) {
      this.plans = plans;
      this.supportedPlan = this.$route.params.supportedPlan;
      this.loadingValue = 100;
    } else {
      this.loadingValue = 100;
      this.$router.push({
        name: "fans-main",
      });
    }
  },
  methods: {
    imgUrl(imageId) {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${imageId}`;
    },
    selectPlan(plan) {
      let price = 0;
      if (this.supportedPlan && this.supportedPlan.isEnable) {
        if (plan.planPrice > this.supportedPlan.planPrice) {
          price = plan.planPrice - this.supportedPlan.planPrice;
        }
      } else {
        price = plan.planPrice;
      }
      const content = {
        plan,
        imageUrl:
          plan.planImageId && plan.planImageId !== ""
            ? this.imgUrl(plan.planImageId)
            : "",
        title: plan.planName,
        price,
      };
      this.$router.push({
        name: "fans-purchase",
        params: {
          content,
          isPlan: true,
          isMovie: false,
          isMusic: false,
          isPoint: false,
          isTicket: false,
        },
      });
    },
    async cancelSupport() {
      const res = confirm(
        `${this.supportedPlan.planName}を本当に解約しますか？（月末まではプランの特典を利用可能です）`
      );
      if (res) {
        const user = this.$store.state.user.user;
        if (user) {
          try {
            this.loadingValue = 30;
            const result = await this.ScheduledPaymentsDao_UpdateScheduledPaymentsIsCanceled(
              this.supportedPlan.planId,
              user.userId
            );
            this.loadingValue = 100;
            this.isShowSuccessSnackbar = true;
            this.successStr = "プランの解約が完了しました。";
            setTimeout(() => {
              this.$router.push({
                name: "fans-main",
              });
            }, 3000);
          } catch (error) {
            this.loadingValue = 100;
            console.error(error);
            this.isShowErrorSnackbar = true;
            this.errorStr = "プランの解約に失敗しました。";
          }
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.support-plans {
  padding-bottom: 112px;
  background-color: #dddddd;
}
.page-title {
  background-color: #ffffff;
  width: 100%;
  border-bottom: 1px solid rgba(231, 64, 89, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
}
.support-plan-card {
  border-radius: 12px;
}
.support-plan-img {
  position: relative;
}
.support-plan-img-inner {
  max-height: 30vh;
  object-fit: contain;
  border-radius: 12px 12px 0 0;
}
.support-plan-name {
  position: absolute;
  z-index: 3;
  height: 100%;
  color: white;
  width: 100%;
  top: 0;
  left: 0;
  text-shadow: 0px 0px 10px rgba(0, 0, 0, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.25);
}
.support-plan-price {
  border-radius: 12px;
  height: 24px;
  width: 56px;
  background: linear-gradient(
    135deg,
    rgba(231, 64, 89, 1) 0%,
    rgba(189, 100, 153, 1) 100%
  );
  color: #ffffff;
  text-align: center;
}
.cancel-support-btn {
  color: white;
}
</style>
