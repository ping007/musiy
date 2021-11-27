/* eslint-disable semi */
export default {
  methods: {
    async BroadcastsDao_InsertBroadcast(
      broadcastId,
      fee,
      title,
      broadcastDatetime,
      explanation,
      imageId,
      artists,
      allowType,
      imagefluxChannelInfoStr
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "insert_broadcast"
        )({
          broadcastId,
          fee,
          title,
          broadcastDatetime,
          explanation,
          imageId,
          artists,
          allowType,
          imagefluxChannelInfoStr,
        });
        console.log("BroadcastsDao_InsertBroadcast SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async BroadcastsDao_UpdateBroadcast(
      broadcastId,
      title,
      broadcastDatetime,
      explanation,
      imageId,
      artists
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "update_broadcast"
        )({
          broadcastId,
          title,
          broadcastDatetime,
          explanation,
          imageId,
          artists,
        });
        console.log("BroadcastsDao_UpdateBroadcast SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    /**
     * アーティスト用配信キャンセル
     */
    async BroadcastsDao_CancelOneBroadcast(broadcastId) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "cancel_one_broadcast"
        )({
          broadcastId,
        });
        console.log("BroadcastsDao_CancelOneBroadcast SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async BroadcastsDao_SelectBroadcastByBroadcastIds(broadcastIds) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_broadcast_by_broadcasts_ids"
        )({
          broadcastIds,
        });
        console.log("SQL Result BroadcastsDao_SelectBroadcastByBroadcastIds:", result);
        let broadcasts = [];
        if (result && result.data && result.data.rows.length > 0) {
          broadcasts = result.data.rows;
          console.log("broadcasts:", broadcasts);
        }
        return broadcasts;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    /**
     * アーティスト用配信終了
     */
    async BroadcastsDao_finishBroadcast(broadcastId) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "finish_broadcast"
        )({
          broadcastId,
        });
        console.log("BroadcastsDao_finishBroadcast SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    /**
     * アーティストの管理画面用の配信一覧取得
     * 購入者数やキャンセル数、売上を取得しています。
     *
     */
    async BroadcastsDao_SelectFullStatementOfBroadcasts() {
      try {
        const result = await this.$functions.httpsCallable(
          "select_full_statement_of_broadcasts"
        )({});
        console.log("SQL Result:", result);
        let broadcastsContents = [];
        if (result && result.data && result.data.rows.length > 0) {
          broadcastsContents = result.data.rows;
          console.log(
            "BroadcastsDao_SelectFullStatementOfBroadcasts broadcastsContents:",
            broadcastsContents
          );
        }
        return broadcastsContents;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    /**
     * 通常会員用画面でアーティストごとの配信一覧をアーティスト
     * のUserIdを指定して取得
     *
     */
    async BroadcastsDao_SelectBroadcastsByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_broadcasts_by_user_id"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        let broadcastsContents = [];
        if (result && result.data && result.data.rows.length > 0) {
          broadcastsContents = result.data.rows;
          console.log(
            "BroadcastsDao_SelectBroadcastsByUserId broadcastsContents:",
            broadcastsContents
          );
        }
        return broadcastsContents;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    /**
     * 通常会員用画面で新着100件の配信一覧を取得
     *
     */
    async BroadcastsDao_SelectTop100NewBroadcasts() {
      try {
        const user = this.$store.state.user.user;
        let userId = "";
        if (user) {
          userId = user.userId;
        }
        const result = await this.$functions.httpsCallable(
          "select_top_100_new_broadcasts"
        )({ userId });
        console.log("SQL Result:", result);
        let broadcasts = [];
        if (result && result.data && result.data.rows.length > 0) {
          broadcasts = result.data.rows;
          console.log("broadcasts:", broadcasts);
        }
        return broadcasts;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    /**
     * 通常会員用画面で配信IDを用いての配信取得
     */
    async BroadcastsDao_SelectOneBroadcast(broadcastId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_one_broadcast"
        )({
          broadcastId,
        });
        console.log("SQL Result:", result);
        let broadcastsContent;
        if (result && result.data && result.data.rows.length > 0) {
          broadcastsContent = result.data.rows[0];
          console.log(
            "BroadcastsDao_SelectOneBroadcast broadcastsContent:",
            broadcastsContent
          );
        }
        return broadcastsContent;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    /**
     * 購入したチケットの一覧
     * @param db
     * @param userId
     * @param isWatched
     */
    async BroadcastsDao_SelectTicketsByUserId(isWatched) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_tickets_by_user_id"
        )({ isWatched });
        console.log("SQL Result:", result);
        let broadcastsContents = [];
        if (result && result.data && result.data.rows.length > 0) {
          broadcastsContents = result.data.rows;
          console.log(
            "BroadcastsDao_SelectTicketsByUserId broadcastsContents:",
            broadcastsContents
          );
        }
        return broadcastsContents;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    /**
     * チケット購入
     */
    async BroadcastsDao_PurchaseBroadcastTicket(userId, broadcastId) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "purchase_broadcast_ticket"
        )({
          userId,
          broadcastId,
        });
        console.log(
          "BroadcastsDao_PurchaseBroadcastTicket SQL Result:",
          sqlResult
        );
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    /**
     * 一般ユーザ用購入済チケットキャンセル
     */
    async BroadcastsDao_CancelBroadcastTicket(userId, purchaseId) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "cancel_broadcast_ticket"
        )({
          userId,
          purchaseId,
        });
        console.log(
          "BroadcastsDao_CancelBroadcastTicket SQL Result:",
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
