export default {
  methods: {
    async PointsDao_SelectPointsByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_points_by_user_id"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        let points = [];
        if (result && result.data && result.data.rows.length > 0) {
          points = result.data.rows;
          console.log("PointsDao_SelectPointsByUserId points:", points);
        }
        return points;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
