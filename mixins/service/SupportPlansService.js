import PlansDao from "~/mixins/dao/PlansDao";
export default {
  mixins: [PlansDao],
  methods: {
    SupportPlansService_CanUseContentBySupportedPlan(
      artistUserId,
      supporterUserId,
      contentPrice
    ) {
      let result = false;
      const plan = this.PlansDao_SelectPlanBySupporterUserId(
        artistUserId,
        supporterUserId
      );
      if (plan) {
        result = parseInt(plan.planPrice) >= parseInt(contentPrice);
      } else if (contentPrice === 0) {
        result = true;
      }
      return result;
    },
  },
};
