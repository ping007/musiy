export default {
  methods: {
    async MusicDetailsDao_SelectMusicDetailsByParentContentId(parentContentId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_music_details_by_parent_content_id"
        )({ parentContentId });
        console.log("SQL Result:", result);
        let musicDetails = [];
        if (result && result.data && result.data.rows.length > 0) {
          musicDetails = result.data.rows;
          console.log("musicDetails:", musicDetails);
        }
        return musicDetails;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MusicDetailsDao_UpsertMusicDetail(
      musicDetailId,
      parentContentId,
      musicDetailTitle,
      musicDetailDescription,
      copyrightType,
      copyrightCode,
      composer,
      arranger,
      lyricist
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "upsert_music_detail"
        )({
          musicDetailId,
          parentContentId,
          musicDetailTitle,
          musicDetailDescription,
          copyrightType,
          copyrightCode,
          composer,
          arranger,
          lyricist,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MusicDetailsDao_DeleteMusicDetail(
      musicDetailId,
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "delete_music_detail"
        )({
          musicDetailId,
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
