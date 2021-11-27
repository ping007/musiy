export default {
  methods: {
    async PlayLaterDao_ExistPlayLater(contentId) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "exist_play_later"
        )({
          contentId,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult.data.rows[0].exists;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async PlayLaterDao_UpsertPlayLater(userId, contentId) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "upsert_play_later"
        )({
          userId,
          contentId,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async PlayLaterDao_DeletePlayLater(contentId) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "delete_play_later"
        )({
          contentId,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  },
};
