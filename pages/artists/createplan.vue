<template>
  <div>
    <div class="create-plan">
      <v-form ref="form">
        <v-row class="mx-1 py-5">
          <h2
            v-text="
              mode === 'create'
                ? 'ファンクラブの応援プランを作成'
                : 'ファンクラブの応援プランを編集'
            "
          ></h2>
        </v-row>
        <v-card
          v-for="(plan, idx) in plans"
          :key="plan.planId"
          class="ma-4 pa-4"
        >
          <v-row class="mx-1">
            <span class="title" v-text="'プラン' + (idx + 1)"></span>
          </v-row>
          <v-row class="mx-1">
            <v-text-field
              v-model="plan.planName"
              :rules="[rules.required]"
              label="プラン名"
              @change="hasChanges = true"
            />
          </v-row>
          <v-row class="mx-1">
            <v-textarea
              v-model="plan.planDescription"
              label="プランの説明"
              @change="hasChanges = true"
            />
          </v-row>
          <v-row class="mx-1">
            <v-text-field
              v-model="plan.planPrice"
              type="tel"
              :rules="[
                rules.required,
                rules.minValue(plan.planPrice, 100),
                rules.maxValue(plan.planPrice, 1000000),
              ]"
              prefix="¥"
              min="0"
              label="プランの価格"
              onpaste="return false;"
              autocomplete="off"
              @keypress="validateNumOnly"
              @keyup="applyCurrencyRule(plan.planPrice, idx)"
            />
          </v-row>
          <v-row class="mx-1">
            <span>プランを表す画像を設定できます</span>
            <UploadImageFile
              :image-id="plan.planImageId"
              @uploaded="setImageObj($event, plan)"
            />
          </v-row>
        </v-card>
        <v-row class="mx-3 py-5 my-5">
          <v-btn
            v-if="mode === 'create'"
            block
            dark
            class="msy-color-red"
            large
            @click="execSave"
            v-text="'プランを作成する'"
          />
          <v-btn
            v-if="mode === 'edit'"
            block
            dark
            class="msy-color-red"
            large
            @click="execSave"
            v-text="'変更を保存する'"
          />
        </v-row>
      </v-form>
    </div>
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
    <PreventUnload :when="hasChanges" />
  </div>
</template>

<script>
import PreventUnload from "vue-prevent-unload";
import UploadImageFile from "~/components/molecules/UploadImageFile";
import { ValidateRules } from "~/constant.js";
import PlansDao from "~/mixins/dao/PlansDao";
export default {
  layout: "artist",
  components: {
    UploadImageFile,
    PreventUnload,
  },
  mixins: [PlansDao],
  data() {
    return {
      mode: "create",
      rules: ValidateRules,
      hasChanges: false,
      plans: [],
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
    };
  },
  async created() {
    const user = this.$store.state.user.user;
    const plansData = await this.PlansDao_SelectPlansByUserId(user.userId);
    if (plansData && plansData.length > 0) {
      this.mode = "edit";
      this.plans = plansData;
    } else {
      this.initData();
    }
  },
  methods: {
    initData() {
      const user = this.$store.state.user.user;
      for (let i = 0; i < 3; i++) {
        let defaultPlanName = "体験プラン";
        let defaultPrice = 100;
        if (i === 1) {
          defaultPlanName = "スタンダードプラン";
          defaultPrice = 300;
        } else if (i === 2) {
          defaultPlanName = "フルサポートプラン";
          defaultPrice = 500;
        }
        this.plans.push({
          planId: this.$uuid.v4(),
          userId: user.userId,
          planName: defaultPlanName,
          planDescription: "",
          planPrice: defaultPrice,
          planImageId: "",
          crUserId: user.userId,
          upUserId: user.userId,
        });
      }
    },
    setImageObj(imageObject, plan) {
      plan.planImageId = imageObject.imageId;
      this.hasChanges = true;
    },
    toArtistMainPage() {
      const user = this.$store.state.user.user;
      this.$router.push({
        name: "artists-main",
        params: { artistId: user.userId },
      });
    },
    async execSave() {
      if (this.$refs.form.validate()) {
        try {
          const results = [];
          this.plans.forEach((plan) => {
            const planId = plan.planId;
            const userId = plan.userId;
            const planName = plan.planName;
            const planDescription = plan.planDescription;
            const planPrice = plan.planPrice;
            const planImageId = plan.planImageId;
            const crUserId = plan.crUserId;
            const upUserId = plan.upUserId;
            results.push(
              this.PlansDao_UpsertPlan(
                planId,
                userId,
                planName,
                planDescription,
                planPrice,
                planImageId,
                crUserId,
                upUserId
              )
            );
          });
          await Promise.all(results);
          this.hasChanges = false;
          this.isShowSuccessSnackbar = true;
          this.successStr =
            this.mode === "create"
              ? "プランの作成が完了しました。メインページへ戻ります"
              : "プランの更新が完了しました。メインページへ戻ります";
          setTimeout(() => {
            this.toArtistMainPage();
          }, 3000);
        } catch (error) {
          console.error(error);
          this.isShowErrorSnackbar = true;
          this.errorStr =
            this.mode === "create"
              ? "プランの作成に失敗しました"
              : "プランの更新に失敗しました";
        }
      } else {
        this.isShowErrorSnackbar = true;
        this.errorStr = "入力値が不正です。確認してください";
      }
    },
    validateNumOnly(e) {
      const charCode = e.which ? e.which : e.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        e.preventDefault();
      }
    },
    applyCurrencyRule(points, idx) {
      this.plans[idx].planPrice = parseInt(String(points) || "0");
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.hasChanges) {
      const answer = window.confirm(
        "保存されていないデータがあります。ページを移動してよろしいですか？"
      );
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
};
</script>

<style lang="scss" scoped>
.create-plan {
  padding-bottom: 112px;
  background-color: rgba(0, 0, 0, 0.01);
}
</style>
