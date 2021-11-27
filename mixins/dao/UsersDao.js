export default {
  methods: {
    async UsersDao_SelectUserByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_user_by_user_id"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        let loginUser = {};
        if (result && result.data && result.data.rows.length > 0) {
          const users = result.data.rows;
          loginUser = users[0];
          console.log("loginUser:", loginUser);
        }
        return loginUser;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async UsersDao_SelectAllArtists() {
      try {
        const result = await this.$functions.httpsCallable(
          "select_all_artists"
        )({
        });
        console.log("UsersDao_SelectAllArtists SQL Result:", result);
        let artists = {};
        if (result && result.data && result.data.rows.length > 0) {
          artists = result.data.rows;
          console.log("artists:", artists);
        }
        return artists;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async UsersDao_UpsertUser(
      userId,
      username,
      email,
      imageId,
      crUserId,
      upUserId,
      isArtist,
      genres,
      description,
      homepageUrl,
      blogUrl,
      facebookUrl,
      twitterUrl
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable("upsert_user")({
          userId,
          username,
          email,
          imageId,
          crUserId,
          upUserId,
          isArtist,
          genres,
          description,
          homepageUrl,
          blogUrl,
          facebookUrl,
          twitterUrl,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async UsersDao_UpdateUserLatestLoginDatetime(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "update_user_latest_login_datetime"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async UsersDao_UpdateUserIsArtist(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "update_user_is_artist"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
