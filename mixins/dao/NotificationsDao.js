export default {
  methods: {
    async NotificationsDao_SelectNotificationsByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_notifications_by_user_id"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        let notifications = [];
        if (result && result.data && result.data.rows.length > 0) {
          notifications = result.data.rows;
          console.log(
            "NotificationsDao_SelectNotificationsByUserId notifications:",
            notifications
          );
        }
        return notifications;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async NotificationsDao_UpsertNotification(
      notificationId,
      actionFromUserId,
      actionToUserId,
      notificationType,
      isConfirmed,
      message,
      contentUri
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "upsert_notification"
        )({
          notificationId,
          actionFromUserId,
          actionToUserId,
          notificationType,
          isConfirmed,
          message,
          contentUri,
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
