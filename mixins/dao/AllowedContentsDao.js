export default {
  methods: {
    async AllowedContentsDao_SelectAllowedContentByContentId(
      contentId
    ) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_allowed_content_by_content_id"
        )({
          contentId
        });
        console.log("SQL Result:", result);
        let allowedContent = {};
        if (result && result.data && result.data.rows.length > 0 && result.data.rows[0]) {
          allowedContent = result.data.rows[0];
        }
        return allowedContent;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async AllowedContentsDao_UpsertAllowedContent(
      contentId,
      planId,
      planName,
      planPrice
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "upsert_allowed_content"
        )({
          contentId,
          planId,
          planName,
          planPrice,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async AllowedContentsDao_DeleteAllowedContent(
      contentId,
      planId
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "delete_allowed_content"
        )({
          contentId,
          planId
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
