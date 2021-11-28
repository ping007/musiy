<template>
  <v-row
    v-inview:once.enter="onShowingElement"
    class="display-block mx-0 px-8 pt-2 msy-color-gray"
  >
    <v-row class="mx-0 mb-2">
      <span
        class="default-font"
        v-text="showingCommentCount + ' 件のコメント'"
      ></span>
    </v-row>
    <v-row class="mx-0 mb-1">
      <v-textarea
        v-model="newCommentText"
        :disabled="commentSending"
        solo
        rounded
        clearable
        auto-grow
        rows="1"
        background-color="white"
        label="コメントを入力..."
        class="evaluation-comment-textarea"
      />
    </v-row>
    <v-row class="mx-0 mb-2" align="center" justify="end">
      <v-btn
        :loading="commentSending"
        :disabled="commentSending"
        color="rgb(231, 64, 89)"
        width="6rem"
        class="msy-color-text-white"
        @click="addComment(content)"
        v-text="commentSending ? '' : 'コメント'"
      />
    </v-row>
    <v-row v-if="isShow" class="mx-0 px-4">
      <v-row
        v-if="
          evaluationsComments &&
            evaluationsComments.length > 0 &&
            showingCommentCount > 0
        "
        class="fixed-row"
      >
        <v-row
          v-for="evaluationsComment in evaluationsComments"
          :key="evaluationsComment.evaluationId"
          class="py-2 mx-0 fixed-row"
        >
          <v-list-item
            v-show="evaluationsComment.isShowComment"
            class="mx-0 px-0 center-top fixed-row"
          >
            <v-list-item-avatar size="40" color="grey" class="center-top">
              <img
                v-if="evaluationsComment.userImageId"
                :src="imgUrl(evaluationsComment.userImageId)"
                alt="artist image"
              />
              <img
                v-else
                :src="'/images/no_image.png'"
                class="no-profile-image"
                alt="artist no image"
              />
            </v-list-item-avatar>
            <v-list-item-content class="pt-0">
              <div class="mb-1">
                <span
                  class="evaluation-comment-username"
                  v-text="evaluationsComment.username"
                ></span>
                <span
                  class="msy-color-text-blue-gray"
                  v-text="getJPDatetime(evaluationsComment.crDatetime)"
                ></span>
              </div>
              <v-list-item-title
                class="evaluation-comment mt-1 mr-2"
                v-text="evaluationsComment.evaluationComment"
              />
            </v-list-item-content>
            <div
              v-if="!evaluationsComment.commentIsLikedUpdating"
              class="center-top"
            >
              <v-btn icon>
                <v-icon
                  v-if="commentIsLike(evaluationsComment)"
                  :color="'rgb(231, 64, 89)'"
                  large
                  @click="setCommentIsLiked(evaluationsComment)"
                >
                  mdi-heart
                </v-icon>
                <v-icon
                  v-else
                  :color="'msy-color-text-blue-gray'"
                  large
                  @click="setCommentIsLiked(evaluationsComment)"
                >
                  mdi-heart-outline
                </v-icon>
              </v-btn>
              <span
                :class="
                  commentIsLike(evaluationsComment)
                    ? 'msy-color-text-red'
                    : 'msy-color-text-blue-gray'
                "
                v-text="commentIsLikeCount(evaluationsComment)"
              >
              </span>
              <span
                :class="
                  commentIsLike(evaluationsComment)
                    ? 'msy-color-text-red'
                    : 'msy-color-text-blue-gray'
                "
              ></span>
            </div>
            <div v-if="evaluationsComment.commentIsLikedUpdating">
              <v-progress-circular
                class="mr-2"
                indeterminate
                :color="'rgb(231, 64, 89)'"
              />
            </div>
            <div class="ml-2">
              <ContentMenus
                :items="contentItems(evaluationsComment)"
                @deletecomment="deleteComment(evaluationsComment)"
                @sendreport="toSendReportPage(evaluationsComment)"
              />
            </div>
          </v-list-item>
        </v-row>
      </v-row>
      <v-row v-else>
        <v-row align="center" justify="center" class="mt-3">
          <v-col>
            <span v-text="'まだコメントはありません'"></span>
          </v-col>
        </v-row>
      </v-row>
    </v-row>
    <v-row v-else>
      <v-row justify="center" align="center" class="py-5 px-0 ma-0">
        <v-progress-circular
          indeterminate
          :size="48"
          :width="5"
          :rotate="360"
          color="rgb(231, 64, 89)"
        />
      </v-row>
    </v-row>
    <v-snackbar
      v-model="isShowSuccessSnackbar"
      top
      :multi-line="true"
      :color="'success'"
      :timeout="3000"
    >
      <span v-text="successStr"></span>
    </v-snackbar>
    <v-snackbar
      v-model="isShowErrorSnackbar"
      top
      :multi-line="true"
      :color="'error'"
      :timeout="3000"
    >
      <span v-text="errorStr"></span>
    </v-snackbar>
  </v-row>
</template>

<script>
import { Cloudinary } from "~/constant";
import EvaluationsDao from "~/mixins/dao/EvaluationsDao";
import PrepareEvaluationsService from "~/mixins/service/PrepareEvaluationsService";
import NotificationsService from "~/mixins/service/NotificationsService";
import ContentMenus from "~/components/atoms/ContentMenus";
export default {
  components: {
    ContentMenus,
  },
  mixins: [EvaluationsDao, PrepareEvaluationsService, NotificationsService],
  props: ["content", "contentId"],
  data() {
    return {
      showComment: false,
      newCommentText: "",
      commentSending: false,
      commentSendingValue: 0,
      cloudinary: Cloudinary,
      evaluationIsLiked: { isLiked: false },
      evaluationsLikes: [],
      evaluationsComments: [],
      evaluationsCommentsIsLiked: [],
      isShow: false,
      conetentItems: [
        { value: "deletecomment", icon: "mdi-delete", title: "コメントを削除" },
      ],
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
    };
  },
  computed: {
    commentIsLikeCount() {
      return function (evaluationsComment) {
        let result = [];
        if (this.evaluationsCommentsIsLiked) {
          result = this.evaluationsCommentsIsLiked.filter((element) => {
            return (
              element.contentId.includes(evaluationsComment.evaluationId) &&
              element.isLiked === true
            );
          });
        }
        return result.length;
      };
    },
    commentIsLike() {
      return function (evaluationsComment) {
        const user = this.$store.state.user.user;
        let result = [];
        if (this.evaluationsCommentsIsLiked) {
          result = this.evaluationsCommentsIsLiked.filter((element) => {
            return (
              element.contentId.includes(evaluationsComment.evaluationId) &&
              element.isLiked === true &&
              element.userId === user.userId
            );
          });
        }
        return result.length >= 1;
      };
    },
    showingCommentCount() {
      if (!this.evaluationsComments) {
        return 0;
      }
      const result = this.evaluationsComments.filter((element) => {
        return element.isShowComment === true;
      });
      return result.length;
    },
  },
  // watch: {
  //   async content(newValue, oldValue) {
  //     if (newValue) {
  //       this.evaluationIsLiked = { isLiked: false };
  //       this.evaluationsLikes = [];
  //       this.evaluationsComments = [];
  //       this.evaluationsCommentsIsLiked = [];
  //       this.showComment = false;
  //       this.isShow = false;
  //       await this.PrepareEvaluationsService_prepareContentEvaluations(
  //         newValue
  //       );
  //       this.evaluationIsLiked = newValue.evaluationIsLiked;
  //       this.evaluationsLikes = newValue.evaluationsLikes;
  //       if (newValue.evaluationsComments) {
  //         newValue.evaluationsComments.forEach((evaluationsComment) => {
  //           evaluationsComment.commentIsLikedUpdating = false;
  //         });
  //       }
  //       this.evaluationsComments = newValue.evaluationsComments;
  //       this.evaluationsCommentsIsLiked = newValue.evaluationsCommentsIsLiked;
  //       this.isShow = true;
  //       this.refreshLiked();
  //     }
  //   },
  // },
  methods: {
    imgUrl(imageId) {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${imageId}`;
    },
    async onShowingElement() {
      if (this.content) {
        await this.PrepareEvaluationsService_prepareContentEvaluations(
          this.content
        );
        this.$nextTick(() => {
          this.evaluationIsLiked = this.content.evaluationIsLiked;
          this.evaluationsLikes = this.content.evaluationsLikes;
          this.evaluationsComments = this.content.evaluationsComments;
          this.evaluationsCommentsIsLiked =
            this.content.evaluationsCommentsIsLiked;
          this.isShow = true;
          this.refreshLiked();
        });
      }
    },
    getJPDatetime(datetime) {
      return this.$moment(datetime).add(9, "h").format("YYYY/MM/DD");
    },
    async setCommentIsLiked(comment) {
      comment.commentIsLikedUpdating = true;
      const user = this.$store.state.user.user;
      const commentLike = this.evaluationsCommentsIsLiked.filter((like) => {
        return (
          like.contentId.includes(comment.evaluationId) &&
          like.userId === user.userId
        );
      });
      console.log(commentLike);
      let isLiked = false;
      let evaluationId = this.$uuid.v4();
      if (commentLike.length > 0 && commentLike[0]) {
        evaluationId = commentLike[0].evaluationId;
        isLiked = commentLike[0].isLiked;
      }
      const result = await this.EvaluationsDao_UpsertEvaluation(
        evaluationId,
        this.contentId + "/like/" + comment.evaluationId,
        user.userId,
        !isLiked,
        "",
        0,
        user.userId
      );
      // console.log("update result:", result);
      this.evaluationsCommentsIsLiked =
        await this.EvaluationsDao_SelectEvaluationsIsLikedByLikeContentId(
          comment.contentId + "/like/"
        );
      comment.commentIsLikedUpdating = false;
    },
    async setIsLiked(content) {
      console.log("content:", content);
      if (content) {
        if (!content.evaluationIsLiked) {
          content.evaluationIsLiked = {};
        }
        if (!content.evaluationIsLiked.evaluationId) {
          content.evaluationIsLiked.evaluationId = this.$uuid.v4();
        }
      } else {
        return;
      }
      const user = this.$store.state.user.user;
      const evaluationId = content.evaluationIsLiked.evaluationId;
      const contentId = this.contentId;
      const userId = user.userId;
      const isLiked = !this.evaluationIsLiked.isLiked;
      const evaluationComment = null;
      const rating = 0;
      const crUserId = user.userId;
      const result = await this.EvaluationsDao_UpsertEvaluation(
        evaluationId,
        contentId,
        userId,
        isLiked,
        evaluationComment,
        rating,
        crUserId
      );
      console.log("update result:", result);
      const evaluations =
        await this.EvaluationsDao_SelectEvaluationsIsLikedByContentId(
          contentId
        );
      console.log("contentId result:", contentId);
      console.log("evaluations result:", evaluations);
      this.evaluationIsLiked.isLiked = isLiked;
      if (evaluations) {
        this.evaluationsLikes = evaluations;
      } else {
        this.evaluationsLikes = [];
      }
      this.refreshLiked();
    },
    async addComment(content) {
      this.commentSending = true;
      this.commentSendingValue = 40;
      const user = this.$store.state.user.user;
      const evaluationId = this.$uuid.v4();
      const contentId = this.contentId;
      const userId = user.userId;
      const isLiked = false;
      const evaluationComment = this.newCommentText;
      const rating = 0;
      const crUserId = user.userId;
      const result = await this.EvaluationsDao_UpsertEvaluation(
        evaluationId,
        contentId,
        userId,
        isLiked,
        evaluationComment,
        rating,
        crUserId
      );
      console.log("update result:", result);
      this.commentSendingValue = 70;
      const evaluations =
        await this.EvaluationsDao_SelectEvaluationsCommentsByContentId(
          contentId
        );

      // コメント通知の生成
      const actionFromUserId = userId;
      const actionToUserId = content.userId;
      let contentType = "";
      if (content.feedId) {
        contentType = "feed";
      } else if (content.musicId) {
        contentType = "music";
      } else if (content.movieId) {
        contentType = "movie";
      }
      const contentTitle = content.title;
      await this.NotificationsService_addCommentNotification(
        actionFromUserId,
        actionToUserId,
        contentType,
        contentTitle
      );

      this.newCommentText = "";
      this.commentSendingValue = 100;
      this.evaluationsComments = evaluations;
      this.commentSending = false;
    },
    async deleteComment(evaluation) {
      const answer = window.confirm(
        "コメントを削除すると戻せません。よろしいですか？"
      );
      if (answer) {
        try {
          const result =
            await this.EvaluationsDao_UpdateEvaluationsIsShowCommentFalse(
              evaluation.evaluationId
            );
          evaluation.isShowComment = false;
          this.isShowSuccessSnackbar = true;
          this.successStr = "コメントの削除が完了しました";
        } catch (error) {
          this.isShowErrorSnackbar = true;
          this.errorStr = "コメントの削除に失敗しました";
        }
      }
    },
    refreshLiked() {
      this.$emit("refreshLikesEvent");
    },
    contentItems(comment) {
      const result = [
        { value: "sendreport", icon: "mdi-bullhorn", title: "違反を報告" },
      ];
      const user = this.$store.state.user.user;
      if (user && comment.userId === user.userId) {
        result.push({
          value: "deletecomment",
          icon: "mdi-delete",
          title: "コメントを削除",
        });
      }
      return result;
    },
    toSendReportPage(comment) {
      this.$router.push({
        name: "sendreport",
        params: { contentType: "evaluations", contentId: comment.contentId },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.display-block {
  display: block;
}
.fixed-row {
  width: 100% !important;
}
.evaluation-comment-username {
  margin-right: 1rem;
}
.evaluation-comment {
  white-space: pre-wrap;
  line-height: 1.5rem;
}
.icon-comment {
  transform: scale(-1, 1);
}
.v-list-item > .v-avatar {
  margin-top: 0 !important;
}
.no-profile-image {
  object-fit: cover;
}
.center-top {
  top: 0px;
  align-items: start;
  align-self: start;
}
</style>
