export default {
  methods: {
    async SupportersDao_SelectSupportersByArtistUserId(artistUserId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_supporters_by_artist_user_id"
        )({
          artistUserId,
        });
        console.log("SQL Result:", result);
        let supporters = [];
        if (result && result.data && result.data.rows.length > 0) {
          supporters = result.data.rows;
          console.log(
            "SupportersDao_SelectSupportersByArtistUserId supporters:",
            supporters
          );
        }
        return supporters;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async SupportersDao_SelectSupportersBySupporterUserId(supporterUserId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_supporters_by_supporter_user_id"
        )({
          supporterUserId,
        });
        console.log("SQL Result:", result);
        let supporters = [];
        if (result && result.data && result.data.rows.length > 0) {
          supporters = result.data.rows;
          console.log(
            "SupportersDao_SelectSupportersBySupporterUserId supporters:",
            supporters
          );
        }
        return supporters;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async SupportersDao_UpsertSupporter(
      artistUserId,
      supporterUserId,
      planId,
      isEnable
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "upsert_supporter"
        )({
          artistUserId,
          supporterUserId,
          planId,
          isEnable,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async SupportersDao_SendMailWhenContentUploadByPlanId(planId, contentId, contentType) {
      try {
        const result = await this.$functions.httpsCallable(
          "send_mail_when_content_upload_by_plan_id"
        )({ planId, contentId, contentType });
        console.log("SQL Result:", result);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
