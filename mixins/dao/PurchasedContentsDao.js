export default {
  methods: {
    async PurchasedContentsDao_SelectPurchasedContentsByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_purchased_contents_by_user_id"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        let purchasedContents = [];
        if (result && result.data && result.data.rows.length > 0) {
          purchasedContents = result.data.rows;
          console.log(
            "PurchasedContentsDao_SelectPurchasedContentsByUserId purchasedContents:",
            purchasedContents
          );
        }
        return purchasedContents;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async PurchasedContentsDao_SelectPurchasedContentsAmountByArtistUserId() {
      try {
        const result = await this.$functions.httpsCallable(
          "select_purchased_contents_amount_by_artist_user_id"
        )({});
        console.log("SQL Result:", result);
        let purchasedContentsAmount = 0;
        if (result && result.data && result.data.rows.length > 0) {
          purchasedContentsAmount = result.data.rows[0];
          console.log(
            "PurchasedContentsDao_SelectPurchasedContentsAmountByArtistUserId purchasedContentsAmount:",
            purchasedContentsAmount
          );
        }
        return purchasedContentsAmount;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async PurchasedContentsDao_SelectPurchasedMediaBySpecifiedYear() {
      try {
        const result = await this.$functions.httpsCallable(
          "select_purchased_media_by_specified_year"
        )({
        });
        console.log("SQL Result:", result);
        let purchasedContents = [];
        if (result && result.data && result.data.rows.length > 0) {
          purchasedContents = result.data.rows;
          console.log(
            "PurchasedContentsDao_SelectPurchasedMediaBySpecifiedYear purchasedContents:",
            purchasedContents
          );
        }
        return purchasedContents;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async PurchasedContentsDao_UpsertPurchasedContent(
      contentId,
      contentType,
      price
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "upsert_purchased_content"
        )({
          contentId,
          contentType,
          price,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    /**
     * ログインユーザーが対象のコンテンツを購入済みか判定する
     */
    async PurchasedContentsDao_isPurchasedContent(userId, contentId) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "is_purchased_content"
        )({
          userId,
          contentId,
        });
        console.log(
          "PurchasedContentsDao_isPurchasedContent SQL Result:",
          sqlResult
        );
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
