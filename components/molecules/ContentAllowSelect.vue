<template>
  <div class="content-allow-select">
    <div>
      <v-select
        v-model="allowType"
        :rules="rules ? rules : []"
        item-text="label"
        item-value="value"
        :disabled="disabled"
        :items="getAllowItems()"
        label="公開範囲"
        @change="selectedAllowTypeAction()"
      />
    </div>
    <div v-if="allowType >= contentAllowType.Supporters" class="mx-1">
      <div v-if="plans && plans.length > 0">
        <v-select
          v-model="selectedPlanId"
          :rules="
            allowType >= contentAllowType.Supporters
              ? [validateRules.required]
              : []
          "
          item-text="planName"
          item-value="planId"
          :disabled="disabled"
          :items="plans"
          label="公開対象プラン選択"
          @change="selectedPlan()"
        >
          <template slot="item" slot-scope="data">
            {{ data.item.planName }} ({{ data.item.planPrice + "円" }}) 以上
          </template>
          <template slot="selection" slot-scope="data">
            {{ data.item.planName }} ({{ data.item.planPrice + "円" }}) 以上
          </template>
        </v-select>
      </div>
    </div>
    <div v-if="!plans || plans.length === 0">
      <div class="my-3">
        <span
          class="primary--text"
          v-text="
            'ファンクラブの応援プランを作成することで、有償で応援してくれるファンに公開対象を限定したコンテンツ投稿が可能になります'
          "
        ></span>
      </div>
      <v-btn block rounded dark color="primary" @click="createSupportPlan">
        <span v-text="'ファンクラブの応援プランを作成する'"></span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { ValidateRules, ContentAllowType } from "~/constant.js";
export default {
  props: {
    rules: {
      type: Array,
      default: undefined,
    },
    plans: {
      type: Array,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    selectedAllowType: undefined,
    selectedPlanIdAlready: undefined,
  },
  data() {
    return {
      validateRules: ValidateRules,
      contentAllowType: ContentAllowType,
      selectedPlanId: undefined,
      allowType: ContentAllowType.All,
    };
  },
  created() {
    if (this.selectedAllowType && this.selectedAllowType > 0) {
      this.allowType = parseInt(this.selectedAllowType);
    }
  },
  methods: {
    getAllowItems() {
      let result = [
        { label: "全体公開", value: ContentAllowType.All },
        {
          label: "フォロワーに公開",
          value: ContentAllowType.FollowersOrSupporters,
        },
      ];
      if (this.plans && this.plans.length > 0) {
        result = [
          { label: "全体公開", value: ContentAllowType.All },
          {
            label: "フォロワーとファンに公開",
            value: ContentAllowType.FollowersOrSupporters,
          },
          { label: "ファンにのみ公開", value: ContentAllowType.Supporters },
        ];
      }
      return result;
    },
    createSupportPlan() {
      this.$router.push({ name: "artists-createplan" });
    },
    selectedPlan() {
      let result;
      if (this.selectedPlanId && this.plans) {
        result = this.plans.find((plan) => {
          return plan.planId === this.selectedPlanId;
        });
      } else if (this.selectedPlanIdAlready && this.plans) {
        this.selectedPlanId = this.selectedPlanIdAlready;
        result = this.plans.find((plan) => {
          return plan.planId === this.selectedPlanId;
        });
      }
      this.$emit("plan-selected", result);
    },
    selectedAllowTypeAction() {
      if (this.allowType !== ContentAllowType.Supporters) {
        this.selectedPlanId = "";
      }
      this.$emit("change");
      this.$emit("allow-type", this.allowType);
    },
  },
};
</script>

<style lang="scss" scoped>
.content-allow-select {
  width: 100%;
}
</style>
