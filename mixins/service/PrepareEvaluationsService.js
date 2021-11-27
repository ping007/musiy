import EvaluationsDao from "~/mixins/dao/EvaluationsDao";
export default {
  mixins: [EvaluationsDao],
  methods: {
    async PrepareEvaluationsService_prepareContentsEvaluations(contents) {
      await contents.forEach(async (content) => {
        await this.initContent_(content);
      });
    },
    async PrepareEvaluationsService_prepareContentEvaluations(content) {
      await this.initContent_(content);
    },
    async initContent_(content) {
      const contentId = this.getContentId_(content);
      const loadAll = [];
      loadAll.push(this.getContentEvaluationsIsLiked_(content, contentId));
      loadAll.push(this.getContentEvaluationsLikes_(content, contentId));
      loadAll.push(this.getContentEvaluationsComments_(content, contentId));
      loadAll.push(
        this.getContentEvaluationsCommentsLikes_(content, contentId)
      );
      await Promise.all(loadAll);
    },
    getContentId_(content) {
      let contentId = content.feedId;
      if (!contentId) {
        contentId = content.movieId;
      }
      if (!contentId) {
        contentId = content.musicId;
      }
      if (!contentId) {
        contentId = content.imageId;
      }
      return contentId;
    },
    async getContentEvaluationsIsLiked_(content, contentId) {
      try {
        const user = this.$store.state.user.user;
        const evaluation = await this.EvaluationsDao_SelectEvaluationsIsLikedByContentIdAndUserId(
          contentId,
          user.userId
        );
        if (!evaluation) {
          content.evaluationIsLiked = { isLiked: false };
        } else {
          content.evaluationIsLiked = evaluation;
        }
        // console.log("content.evaluationIsLiked :", content.evaluationIsLiked)
      } catch (error) {
        console.error(error);
        console.log("error content id ", contentId);
      }
    },
    async getContentEvaluationsLikes_(content, contentId) {
      try {
        const evaluations = await this.EvaluationsDao_SelectEvaluationsIsLikedByContentId(
          contentId
        );
        if (!evaluations) {
          content.evaluationsLikes = [];
        } else {
          content.evaluationsLikes = evaluations;
        }
        // console.log("content.evaluationsLikes :", content.evaluationsLikes)
      } catch (error) {
        console.error(error);
        console.log("error content id ", contentId);
      }
    },
    async getContentEvaluationsComments_(content, contentId) {
      try {
        const evaluations = await this.EvaluationsDao_SelectEvaluationsCommentsByContentId(
          contentId
        );
        if (!evaluations) {
          content.evaluationsComments = [];
        } else {
          content.evaluationsComments = evaluations;
        }
      } catch (error) {
        console.error(error);
        console.log("error content id ", contentId);
      }
    },
    async getContentEvaluationsCommentsLikes_(content, contentId) {
      try {
        const evaluations = await this.EvaluationsDao_SelectEvaluationsIsLikedByLikeContentId(
          contentId + "/like/"
        );
        if (!evaluations) {
          content.evaluationsCommentsIsLiked = [];
        } else {
          content.evaluationsCommentsIsLiked = evaluations;
        }
      } catch (error) {
        console.error(error);
        console.log("error content id ", contentId);
      }
    },
  },
};
