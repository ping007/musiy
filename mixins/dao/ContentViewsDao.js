export default {
  methods: {
    async ContentViewsDao_SelectViewsByContentId(contentId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_views_by_content_id"
        )({
          contentId,
        });
        console.log("SQL Result:", result);
        let views = 0;
        if (result && result.data && result.data.rows.length > 0) {
          views = result.data.rows[0].views;
        }
        return views;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async ContentViewsDao_Upsertviews(
      contentId,
      views
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable("upsert_views")({
          contentId,
          views,
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
