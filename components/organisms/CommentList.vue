<template>
  <div class="comment-list">
    <v-row no-gutters>
      <v-col sm="12" style="position: relative">
        <div
          ref="commentContainer"
          :class="'comment-container' + (isHost ? ' host' : '')"
          @scroll="additionalLoading"
        >
          <comment
            v-show="isShowComments"
            ref="comment"
            class="comment-area"
            :comments="comments"
            :room-id="roomId"
            @imageLoad="scrollToEnd"
          />
        </div>
        <div class="typer">
          <input
            v-show="!isShowOnly"
            v-model="content"
            type="text"
            placeholder="コメントを入力"
          />
          <v-btn
            v-show="!isShowOnly"
            class="send-comment-btn msy-color-red"
            dark
            :disabled="content === '' || isCommentSending"
            @click="sendComment"
          >
            <span v-text="'送信'"></span>
          </v-btn>
          <div class="comment-visible-icon">
            <div v-if="isShowComments" @click="toggleShowComments">
              <v-icon color="rgb(231, 64, 89)">
                mdi-message-bulleted-off
              </v-icon>
              <span
                class="msy-color-text-red comment-icon-text"
                v-text="'コメント非表示'"
              ></span>
            </div>
            <div v-if="!isShowComments" @click="toggleShowComments">
              <v-icon color="rgb(231, 64, 89)"> mdi-message-bulleted </v-icon>
              <span
                class="msy-color-text-red comment-icon-text"
                v-text="'コメント表示'"
              ></span>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-snackbar
      v-model="isShowErrorSnackbar"
      top
      :multi-line="true"
      :color="'error'"
      :timeout="3000"
    >
      <span v-text="errorStr"></span>
    </v-snackbar>
  </div>
</template>

<script>
import Comment from "../molecules/Comment.vue";
import ChatDao from "~/mixins/dao/ChatDao";
import NoLoginStreamingTestMode from "~/no-login-streaming-test/no-login-streaming-test-mode.js";

export default {
  name: "CommentList",
  components: {
    comment: Comment,
  },
  mixins: [ChatDao],
  props: ["roomId", "isShowOnly", "isHost"],
  data() {
    return {
      content: "",
      Comments: [],
      loading: false,
      firstCommentCount: 0,
      readLimit: 20,
      totalCommentHeight: 0,
      isShowComments: true,
      isCommentSending: false,
      isShowErrorSnackbar: false,
      errorStr: "",
    };
  },
  computed: {
    comments() {
      return this.Comments;
    },
  },
  mounted() {
    this.isCommentSending = false;
    this.loadChat();
  },
  methods: {
    async loadChat() {
      if (NoLoginStreamingTestMode.enabled) {
        const receiveComment = () => {
          this.Comments.push(NoLoginStreamingTestMode.comment);
          this.scrollToEnd();
        };
        Array(3).fill().forEach(receiveComment);
        const timerId = setInterval(() => {
          receiveComment();
          if (this.Comments.length >= 10) {
            clearInterval(timerId);
          }
        }, 10000);
        return;
      }
      this.totalCommentHeight = this.$refs.commentContainer.scrollHeight;
      this.loading = false;
      if (this.roomId !== undefined) {
        this.loading = true;
        // 初期表示分の取得
        const initQuery = this.$firestore
          .collection("broadcast_comments")
          .doc(this.roomId)
          .collection("comment")
          .where("isDeleted", "==", false)
          .orderBy("createdAt", "desc")
          .limit(this.readLimit);
        const initData = await initQuery.get();
        let lastData;
        initData.docs.forEach((doc, index) => {
          const d = doc.data();
          if (index === 0) {
            lastData = d; // 監視開始位置用
          }
          d.id = doc.id;
          d.deletable = false;
          this.Comments.splice(0, 0, d);
          this.firstCommentCount = this.Comments.length;
        });
        this.scrollToEnd();
        this.loading = false;

        // 最後のデータ以降をリッスン
        let query = this.$firestore
          .collection("broadcast_comments")
          .doc(this.roomId)
          .collection("comment")
          .orderBy("createdAt", "asc");
        // 初回表示でコメントがまだない場合にstartAfterを利用しないため
        if (lastData !== undefined) {
          query = query.startAfter(lastData.createdAt);
        }
        query.onSnapshot((ref) => {
          ref.docChanges().forEach((change) => {
            const { newIndex, oldIndex, doc, type } = change;
            const d = doc.data();
            d.id = doc.id;
            d.deletable = true;
            if (type === "added") {
              this.Comments.splice(newIndex + this.firstCommentCount, 0, d);
              this.scrollToEnd();
            } else if (type === "modified") {
              this.Comments.splice(oldIndex + this.firstCommentCount, 1, d);
            } else if (type === "removed") {
              this.Comments.splice(oldIndex + this.firstCommentCount, 1);
            }
          });
        });
      }
    },
    // 追加読み込み
    async additionalLoading() {
      if (NoLoginStreamingTestMode.enabled) {
        return;
      }
      const scrollValue = this.$refs.commentContainer.scrollTop;
      if (scrollValue < 50 && !this.loading) {
        this.totalCommentHeight = this.$refs.commentContainer.scrollHeight;
        this.loading = true;
        const currentTopComment = this.Comments[0];
        if (currentTopComment === undefined) {
          this.loading = false;
          return;
        }

        const query = this.$firestore
          .collection("broadcast_comments")
          .doc(this.roomId)
          .collection("comment")
          .where("isDeleted", "==", false)
          .orderBy("createdAt", "desc")
          .startAfter(currentTopComment.createdAt)
          .limit(this.readLimit);

        const AdditionalLoading = await query.get();
        AdditionalLoading.docs.forEach((doc) => {
          const d = doc.data();
          d.id = doc.id;
          d.deletable = false;
          this.Comments.splice(0, 0, d);
          this.scrollTo();
        });
        this.firstCommentCount += AdditionalLoading.docs.length;
        this.loading = false;
      }
    },
    async sendComment() {
      this.isCommentSending = true;
      if (NoLoginStreamingTestMode.enabled) {
        this.Comments.push(
          Object.assign(NoLoginStreamingTestMode.comment, {
            content: this.content,
            deletable: true,
          })
        );
        this.isCommentSending = false;
        this.scrollToEnd();
        this.content = "";
        return;
      }
      if (this.content !== "" && (await this.isValidMessage(this.content))) {
        const user = this.$store.state.user.user;
        this.$firestore
          .collection("broadcast_comments")
          .doc(this.roomId)
          .collection("comment")
          .add({
            content: this.content,
            userId: user.userId,
            userImageId: user.imageId,
            username: user.username,
            createdAt: new Date(),
            isDeleted: false,
          });
        this.isCommentSending = false;
        this.content = "";
      } else {
        this.isShowErrorSnackbar = true;
        this.errorStr = "投稿文言に不正な単語が含まれています";
      }
      this.isCommentSending = false;
    },
    scrollToEnd() {
      this.$nextTick(() => {
        const container = this.$el.querySelector(".comment-container");
        container.scrollTop = container.scrollHeight;
      });
    },
    scrollTo() {
      this.$nextTick(() => {
        const currentHeight = this.$refs.commentContainer.scrollHeight;
        const difference = currentHeight - this.totalCommentHeight;
        const container = this.$el.querySelector(".comment-container");
        container.scrollTop = difference;
      });
    },
    async isValidMessage(message) {
      return await this.ChatDao_IsValidMessage(message);
    },
    toggleShowComments() {
      this.$refs.comment.removeFadeInAnimation();
      this.isShowComments = !this.isShowComments;
      this.scrollToEnd();
    },
  },
};
</script>

<style lang="scss" scoped>
.comment-list {
  bottom: 0;
  left: 0;
  padding: 0;
  position: fixed;
  width: 100%;
}
.comment-container {
  background-color: transparent;
  box-sizing: border-box;
  max-height: 50vh;
  overflow-y: auto;
  padding: 10px;
}
@media screen and (max-width: 960px) {
  .comment-container.host {
    bottom: 110px;
    position: relative;
  }
}
.comment-visible-icon {
  bottom: 95px;
  cursor: pointer;
  position: fixed;
  right: 15px;
  z-index: 100;
}
.comment-icon-text {
  font-size: 8px;
}
.scrollable {
  height: 90vh;
  overflow-y: auto;
}
.typer {
  align-items: center;
  background-color: #2d2d2d;
  border-top: 2px solid rgb(231, 64, 89);
  bottom: 0;
  box-shadow: 0 -5px 10px -5px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  display: flex;
  height: 4.9rem;
  width: 100%;
}
.typer input[type="text"] {
  background-color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  height: 32px;
  left: 20px;
  outline: none;
  padding: 4px 12px;
  position: absolute;
  width: calc(100% - 120px);
}
.send-comment-btn {
  position: absolute;
  right: 20px;
}
</style>
