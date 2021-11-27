export default {
  methods: {
    async MusicsDao_SelectPlayLaterMusicsByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_play_later_musics_by_user_id"
        )({ userId });
        console.log("SQL Result:", result);
        let musics = [];
        if (result && result.data && result.data.rows.length > 0) {
          musics = result.data.rows;
          console.log("musics:", musics);
        }
        return musics;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MusicsDao_SelectTop100PlayMusics() {
      try {
        const user = this.$store.state.user.user;
        let userId = "";
        if (user) {
          userId = user.userId;
        }
        const result = await this.$functions.httpsCallable(
          "select_top_100_play_musics"
        )({ userId });
        console.log("SQL Result:", result);
        let musics = [];
        if (result && result.data && result.data.rows.length > 0) {
          musics = result.data.rows;
          console.log("musics:", musics);
        }
        return musics;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MusicsDao_SelectTop100NewMusics() {
      try {
        const user = this.$store.state.user.user;
        let userId = "";
        if (user) {
          userId = user.userId;
        }
        const result = await this.$functions.httpsCallable(
          "select_top_100_new_musics"
        )({ userId });
        console.log("SQL Result:", result);
        let musics = [];
        if (result && result.data && result.data.rows.length > 0) {
          musics = result.data.rows;
          console.log("musics:", musics);
        }
        return musics;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MusicsDao_SelectMusicByMusicId(musicId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_music_by_music_id"
        )({
          musicId,
        });
        console.log("SQL Result MusicsDao_SelectMusicByMusicId:", result);
        let music = {};
        if (result && result.data && result.data.rows.length > 0) {
          const musics = result.data.rows;
          music = musics[0];
          console.log("music:", music);
        }
        return music;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MusicsDao_SelectMusicByMusicIds(musicIds) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_music_by_music_ids"
        )({
          musicIds,
        });
        console.log("SQL Result MusicsDao_SelectMusicByMusicIds:", result);
        let musics = [];
        if (result && result.data && result.data.rows.length > 0) {
          musics = result.data.rows;
          console.log("musics:", musics);
        }
        return musics;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MusicsDao_SelectMusicsByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_musics_by_user_id"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        let musics = [];
        if (result && result.data && result.data.rows.length > 0) {
          musics = result.data.rows;
          console.log("musics:", musics);
        }
        return musics;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MusicsDao_SelectPurchasedMusicsByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_purchased_musics_by_user_id"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        let musics = [];
        if (result && result.data && result.data.rows.length > 0) {
          musics = result.data.rows;
          console.log("musics:", musics);
        }
        return musics;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MusicsDao_UpsertMusic(
      musicId,
      userId,
      imageId,
      title,
      description,
      genre,
      price,
      copyrightType,
      startSeconds,
      fileExtension,
      allowType,
      isShow,
      crUserId,
      upUserId
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable("upsert_music")({
          musicId,
          userId,
          imageId,
          title,
          description,
          genre,
          price,
          copyrightType,
          startSeconds,
          fileExtension,
          allowType,
          isShow,
          crUserId,
          upUserId,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MusicsDao_UpdateMusicPlayCounts(musicId) {
      try {
        const result = await this.$functions.httpsCallable(
          "update_music_play_counts"
        )({
          musicId,
        });
        console.log("SQL Result:", result);
        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MusicsDao_SelectMusicsByArtistUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_musics_by_artist_user_id"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        let musics = [];
        if (result && result.data && result.data.rows.length > 0) {
          musics = result.data.rows;
          console.log("musics:", musics);
        }
        return musics;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
