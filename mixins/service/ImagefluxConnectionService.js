export default {
  methods: {
    async ImagefluxConnectionService_createChannel() {
      try {
        const result = await this.$functions.httpsCallable(
          "imageflux_create_channel"
        )({});
        console.log("API Result:", result);
        if (result && result.data) {
          console.log("result data:", result.data);
        }
        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async ImagefluxConnectionService_deleteChannel(channelId) {
      try {
        await this.$functions.httpsCallable("imageflux_delete_channel")({
          channel_id: channelId,
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
