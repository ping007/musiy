export default {
  methods: {
    async ChatDao_IsValidMessage(message) {
      try {
        const result = await this.$functions.httpsCallable(
          "is_valid_message"
        )({
          message,
        });
        console.log("Result:", result);
        let res_message = false;
        if (result && result.data) {
          res_message = result.data;
          console.log("ChatDao_CheckChatMessage message:", res_message);
        }
        return res_message;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
