export default {
  methods: {
    async PlansDao_SelectPlanByPlanIds(planIds) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_plan_by_plan_ids"
        )({
          planIds,
        });
        console.log("SQL Result PlansDao_SelectPlanByPlanIds:", result);
        let plans = [];
        if (result && result.data && result.data.rows.length > 0) {
          plans = result.data.rows;
          console.log("plans:", plans);
        }
        return plans;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async PlansDao_SelectPlansByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_plans_by_user_id"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        let plans = [];
        if (result && result.data && result.data.rows.length > 0) {
          plans = result.data.rows;
          console.log("PlansDao_SelectPlansByUserId plans:", plans);
        }
        return plans;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async PlansDao_SelectPlanBySupporterUserId(artistUserId, supporterUserId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_plan_by_supporter_user_id"
        )({
          artistUserId,
          supporterUserId,
        });
        console.log("SQL Result:", result);
        let plan;
        if (result && result.data && result.data.rows.length > 0) {
          plan = result.data.rows[0];
          console.log("PlansDao_SelectPlanBySupporterUserId plan:", plan);
        }
        return plan;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async PlansDao_UpsertPlan(
      planId,
      userId,
      planName,
      planDescription,
      planPrice,
      planImageId,
      crUserId,
      upUserId
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable("upsert_plan")({
          planId,
          userId,
          planName,
          planDescription,
          planPrice,
          planImageId,
          crUserId,
          upUserId,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
