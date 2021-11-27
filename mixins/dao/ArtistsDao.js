export default {
  methods: {
    async ArtistsDao_SelectNewArtistUsers() {
      try {
        const result = await this.$functions.httpsCallable(
          "select_new_artist_users"
        )({});
        console.log("SQL Result:", result);
        let artistUsers = [];
        if (result && result.data && result.data.rows.length > 0) {
          artistUsers = result.data.rows;
          console.log("artistUsers:", artistUsers);
        }
        return artistUsers;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async ArtistsDao_SelectArtistUsersByGenre(genre) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_artist_users_by_genre"
        )({ genre });
        console.log("SQL Result:", result);
        let artistUsers = [];
        if (result && result.data && result.data.rows.length > 0) {
          artistUsers = result.data.rows;
          console.log("artistUsers:", artistUsers);
        }
        return artistUsers;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async ArtistsDao_SelectFollowingArtistByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_following_artist_users"
        )({ userId });
        console.log("SQL Result:", result);
        let artistUsers = [];
        if (result && result.data && result.data.rows.length > 0) {
          artistUsers = result.data.rows;
          console.log("artistUsers:", artistUsers);
        }
        return artistUsers;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async ArtistsDao_SelectSupportingArtistByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_supporting_artist_users"
        )({ userId });
        console.log("SQL Result:", result);
        let artistUsers = [];
        if (result && result.data && result.data.rows.length > 0) {
          artistUsers = result.data.rows;
          console.log("artistUsers:", artistUsers);
        }
        return artistUsers;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async ArtistsDao_SelectArtistByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_artist_by_user_id"
        )({ userId });
        console.log("SQL Result:", result);
        let artist = [];
        if (result && result.data && result.data.rows.length > 0) {
          artist = result.data.rows;
          console.log("artist:", artist);
        }
        return artist;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
