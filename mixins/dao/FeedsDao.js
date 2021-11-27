export default {
  methods: {
    async FeedsDao_SelectFeedByFeedId(feedId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_feed_by_feed_id"
        )({
          feedId,
        });
        console.log("SQL Result:", result);
        let feed = {};
        if (result && result.data && result.data.rows.length > 0) {
          const feeds = result.data.rows;
          feed = feeds[0];
          console.log("feed:", feed);
        }
        return feed;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async FeedsDao_SelectFeedsByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_feeds_by_user_id"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        let feeds = [];
        if (result && result.data && result.data.rows.length > 0) {
          feeds = result.data.rows;
          console.log("FeedsDao_SelectFeedsByUserId feeds:", feeds);
        }
        return feeds;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async FeedsDao_UpsertFeed(
      feedId,
      userId,
      movieId,
      musicId,
      imageId,
      title,
      feedContent,
      allowType,
      crUserId,
      upUserId,
      isShow
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable("upsert_feed")({
          feedId,
          userId,
          movieId,
          musicId,
          imageId,
          title,
          feedContent,
          allowType,
          crUserId,
          upUserId,
          isShow,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async FeedsDao_MoveToFeedsHist(feedId) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "move_to_feeds_hist"
        )({
          feedHistId: this.$uuid.v4(),
          feedId,
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
