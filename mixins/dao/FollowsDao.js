export default {
  methods: {
    async FollowsDao_SelectFollowsByFollowFromUserId(followFromUserId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_follows_by_follow_from_user_id"
        )({
          followFromUserId,
        });
        console.log("SQL Result:", result);
        let follows = [];
        if (result && result.data && result.data.rows.length > 0) {
          follows = result.data.rows;
          console.log("follows:", follows);
        }
        return follows;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async FollowsDao_SelectFollowsByFollowToUserId(followToUserId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_follows_by_follow_to_user_id"
        )({
          followToUserId,
        });
        console.log("SQL Result:", result);
        let follows = [];
        if (result && result.data && result.data.rows.length > 0) {
          follows = result.data.rows;
          console.log("follows:", follows);
        }
        return follows;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async FollowsDao_UpsertFollow(
      followFromUserId,
      followToUserId,
      isFollowing
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable("upsert_follow")({
          followFromUserId,
          followToUserId,
          isFollowing,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async FollowsDao_SelectFollowsAndFansByFollowToUserId(followToUserId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_follows_and_fans_by_follow_to_user_id"
        )({
          followToUserId,
        });
        console.log("SQL Result:", result);
        let follows = [];
        if (result && result.data && result.data.rows.length > 0) {
          follows = result.data.rows;
          console.log("follows:", follows);
        }
        return follows;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
