export default {
  methods: {
    async EvaluationsDao_SelectEvaluationsByContentId(contentId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_evaluations_by_content_id"
        )({
          contentId,
        });
        // console.log("SQL Result:", result)
        let evaluations = [];
        if (result && result.data && result.data.rows.length > 0) {
          evaluations = result.data.rows;
          // console.log("evaluations:", evaluations)
        }
        return evaluations;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async EvaluationsDao_SelectEvaluationsCommentsByContentId(contentId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_evaluations_comments_by_content_id"
        )({
          contentId,
        });
        // console.log("SQL Result:", result)
        let evaluations = [];
        if (result && result.data && result.data.rows.length > 0) {
          evaluations = result.data.rows;
          // console.log("evaluations:", evaluations)
        }
        return evaluations;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async EvaluationsDao_SelectEvaluationsIsLikedByContentId(contentId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_evaluations_is_liked_by_content_id"
        )({
          contentId,
        });
        // console.log("SQL Result:", result)
        let evaluations = [];
        if (result && result.data && result.data.rows.length > 0) {
          evaluations = result.data.rows;
          // console.log("evaluations:", evaluations)
        }
        return evaluations;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async EvaluationsDao_SelectEvaluationsIsLikedByUserId() {
      try {
        const result = await this.$functions.httpsCallable(
          "select_evaluations_is_liked_by_user_id"
        )({});
        // console.log("SQL Result:", result);
        let evaluations = [];
        if (result && result.data && result.data.rows.length > 0) {
          evaluations = result.data.rows;
          // console.log("evaluations:", evaluations);
        }
        return evaluations;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async EvaluationsDao_SelectEvaluationsIsLikedByContentIdAndUserId(
      contentId,
      userId
    ) {
      // console.log("contentId:", contentId)
      // console.log("userId:", userId)
      try {
        const result = await this.$functions.httpsCallable(
          "select_evaluations_is_liked_by_content_id_and_user_id"
        )({
          contentId,
          userId,
        });
        // console.log("SQL Result:", result)
        let evaluation = { isLiked: false };
        if (result && result.data && result.data.rows.length > 0) {
          evaluation = result.data.rows[0];
        }
        return evaluation;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async EvaluationsDao_SelectEvaluationsByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_evaluations_by_user_id"
        )({
          userId,
        });
        // console.log("SQL Result:", result)
        let evaluations = [];
        if (result && result.data && result.data.rows.length > 0) {
          evaluations = result.data.rows;
          console.log("evaluations:", evaluations);
        }
        return evaluations;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async EvaluationsDao_UpsertEvaluation(
      evaluationId,
      contentId,
      userId,
      isLiked,
      evaluationComment,
      rating,
      crUserId
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable(
          "upsert_evaluation"
        )({
          evaluationId,
          contentId,
          userId,
          isLiked,
          evaluationComment,
          rating,
          crUserId,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async EvaluationsDao_UpdateEvaluationsIsShowCommentFalse(evaluationId) {
      try {
        const result = await this.$functions.httpsCallable(
          "update_evaluations_is_show_comment_false"
        )({
          evaluationId,
        });
        console.log("SQL Result:", result);
        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async EvaluationsDao_SelectEvaluationsIsLikedByLikeContentId(contentId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_evaluations_is_liked_by_like_content_id"
        )({
          contentId,
        });
        // console.log("SQL Result:", result)
        let evaluations = [];
        if (result && result.data && result.data.rows.length > 0) {
          evaluations = result.data.rows;
          // console.log("evaluations:", evaluations)
        }
        return evaluations;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
