<template>
  <div>
    <template v-for="(comment, index) in comments">
      <div v-if="!comment.isDeleted" :key="index" class="comment fade-in">
        <div style="margin-top: 5px"></div>
        <div class="content">
          <v-row>
            <v-col class="py-0" cols="3" align-self="center">
              <v-avatar v-if="comment.userImageId" class="" size="40px">
                <v-img :src="imgUrl(comment.userImageId)" alt="artist image" />
              </v-avatar>
              <v-avatar v-if="!comment.userImageId" class="" size="40px">
                <v-img :src="'/images/no_image.png'" alt="artist image" />
              </v-avatar>
            </v-col>
            <v-col class="py-0" cols="9">
              <v-row>
                <v-col class="py-1" cols="9">
                  <div
                    class="comment-username"
                    v-text="comment.username ? comment.username : 'no name'"
                  ></div>
                </v-col>
                <v-col class="col right py-1" cols="3">
                  <template v-if="isMineComment(comment) && comment.deletable">
                    <div class="comment-delete" @click="deleteComment(comment)">
                      <v-icon color="rgb(231, 64, 89)" small> mdi-delete </v-icon>
                    </div>
                  </template>
                </v-col>
              </v-row>
              <v-row>
                <v-col class="py-1" cols="12">
                  <div class="comment-content">{{ comment.content }}</div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { Cloudinary } from "~/constant.js";
import NoLoginStreamingTestMode from "~/no-login-streaming-test/no-login-streaming-test-mode.js";
export default {
  props: ["roomId", "comments"],
  data() {
    return {
      cloudinary: Cloudinary,
    };
  },
  computed: {
    isMineComment() {
      return function (comment) {
        if (NoLoginStreamingTestMode.enabled) {
          return comment.deletable;
        } else {
          return comment.userId === this.$store.state.user.user.userId;
        }
      };
    },
  },
  methods: {
    imgUrl(imageId) {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${imageId}`;
    },
    deleteComment(comment) {
      if (
        !confirm(`コメント「${comment.content}」を削除してもよろしいですか？`)
      ) {
        return;
      }
      if (NoLoginStreamingTestMode.enabled) {
        return;
      }
      // this.$firestore.collection("broadcast_comments").doc(this.roomId).collection("comment").doc(id).delete();
      this.$firestore
        .collection("broadcast_comments")
        .doc(this.roomId)
        .collection("comment")
        .doc(comment.id)
        .update({
          isDeleted: true,
        });
    },
    removeFadeInAnimation() {
      this.$el.querySelectorAll(".comment").forEach((elm) => {
        elm.classList.remove("fade-in");
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.content {
  background-color: rgba(170, 170, 170, 0.56);
  border-radius: 10px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);
  color: #ffffff;
  display: inline-block;
  padding: 0 8px;
  word-wrap: break-word;
}
.col {
  &.right {
    text-align: right;
  }
}
@media screen and (min-width: 960px) {
  .content {
    width: 30%;
  }
}
@media screen and (max-width: 960px) {
  .content {
    width: 60%;
  }
}
.comment {
  margin-bottom: 3px;
  text-align: left;
}
.comment-username {
  color: #222;
  font-size: 0.8rem;
}
.comment-content {
  color: #000;
  font-size: 1rem;
}
@media (max-width: 480px) {
  .comment-username {
    font-size: 0.48rem;
  }
  .comment-content {
    font-size: 0.6rem;
  }
}
.comment-delete {
  cursor: pointer;
  font-size: 0.8rem;
}
.fade-in {
  animation: fade-in 1s ease-in-out;
}
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
