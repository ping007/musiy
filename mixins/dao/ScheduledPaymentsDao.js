export default {
  methods: {
    async ScheduledPaymentsDao_UpdateScheduledPaymentsIsCanceled(
      contentId,
      userId
    ) {
      try {
        const result = await this.$functions.httpsCallable(
          "update_scheduled_payments_is_canceled"
        )({
          contentId,
          userId,
        });
        console.log(
          "ScheduledPaymentsDao_UpdateUserIsArtist SQL Result:",
          result
        );
        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
