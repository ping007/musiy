export default {
  methods: {
    async CloudinaryDao_DeleteFileByPublicId(contentId) {
      try {
        const result = await this.$functions.httpsCallable(
          "delete_file_by_public_id"
        )({
          publicId: contentId,
        });
        console.log("API Result:", result);
        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
