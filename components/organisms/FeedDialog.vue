<template>
  <div class="feed-dialog-wrapper">
    <v-dialog
      v-if="feed_"
      v-model="isShowFeedDialog"
      persistent
      fullscreen
      hide-overlay
      transition="scroll-y-reverse-transition"
    >
      <v-card tile class="dialog-content">
        <div>
          <v-row class="title-area-wrapper">
            <v-card-title
              class="headline broadcast-headline"
              primary-title
              style="width: 100%"
            >
              <v-row align="center" justify="center">
                <v-col cols="1" class="py-2">
                  <v-btn text @click="closeFeedDetail">
                    <v-icon
                      dark
                      class="close-icon px-0"
                      color="rgb(231, 64, 89)"
                    >
                      mdi-play
                    </v-icon>
                    <span class="caption msy-color-text-red">戻る</span>
                  </v-btn>
                </v-col>
                <v-col cols="10" class="py-2">
                  <span
                    class="feed-title default-font-family font-weight-bold"
                    v-text="feed_.title"
                  ></span>
                </v-col>
              </v-row>
            </v-card-title>
          </v-row>
          <v-row class="header-buffer-area" />
          <v-row
            v-if="judgeShowFeed(feed_)"
            v-show="feed_.isShow"
            :key="feed_.feedId"
            align="center"
            justify="center"
          >
            <v-list-item>
              <v-list-item-content class="px-4">
                <v-list-item-title
                  class="feed-title"
                  color="#2d2d2d"
                  v-text="feed_.title"
                />
                <div class="display-flex">
                  <viewer-counter :content-id="feed_.feedId" />
                  <span class="font-decoration">・</span>
                  <v-list-item-subtitle
                    color="#2d2d2d"
                    v-text="getJPDatetime(feed_.crDatetime)"
                  />
                </div>
              </v-list-item-content>
              <SocialShareButton
                :url="
                  getLocationOrigin() +
                  '/ogp?artist_id=' +
                  feed_.userId +
                  '&feed_id=' +
                  feed_.feedId
                "
                :title="feed_.title"
              />
              <ContentMenus
                :items="contentItems(feed_)"
                @deletefeed="deleteFeed(feed_)"
                @editfeed="toEditFeedPage(feed_)"
                @sendreport="toSendReportPage(feed_)"
              />
            </v-list-item>
            <v-row v-if="feed_.movieId" class="movie-list px-0 mx-0 mt-4">
              <v-row align="center" justify="center">
                <div>
                  <MovieThumbCard
                    :movie="createMovieObj(feed_)"
                    @click="selectMovie"
                  />
                </div>
              </v-row>
            </v-row>
            <v-row v-if="feed_.musicId" class="px-0 mx-0 mt-4">
              <v-row align="center" justify="center">
                <div>
                  <MusicThumbCard
                    :music="createMusicObj(feed_)"
                    @click="selectMusic"
                  />
                </div>
              </v-row>
            </v-row>
            <v-row
              v-if="feed_.imageId && !feed_.musicId"
              class="px-0 mx-0 mt-4"
            >
              <v-row align="center" justify="center">
                <v-img
                  v-if="feed_.imageId"
                  :src="
                    feed_.imageId
                      ? imgUrl(feed_.imageId)
                      : '/images/no_image.png'
                  "
                  :width="'100%'"
                  class="feed-image-wrapper"
                >
                  <template v-slot:placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="grey lighten-5"
                      />
                    </v-row>
                  </template>
                </v-img>
              </v-row>
            </v-row>
            <v-row class="px-8 ma-0 msy-color-text-blue-gray" align="center">
              <v-col class="pa-0">
                <div v-if="!isLikedUpdating" class="block-right">
                  <v-btn icon>
                    <v-icon
                      v-if="isLikeds[index]"
                      :color="'rgb(231, 64, 89)'"
                      class="mr-2"
                      large
                      @click="setIsLiked(feed_, index)"
                      >mdi-heart</v-icon
                    >
                    <v-icon
                      v-else
                      :color="'msy-color-text-blue-gray'"
                      class="mr-2"
                      large
                      @click="setIsLiked(feed_, index)"
                      >mdi-heart-outline</v-icon
                    >
                  </v-btn>
                  <span
                    :class="
                      isLikeds[index]
                        ? 'msy-color-text-red'
                        : 'msy-color-text-blue-gray'
                    "
                    v-text="
                      likedCounts[index] === undefined
                        ? '0'
                        : likedCounts[index]
                    "
                  ></span>
                </div>
                <div v-else>
                  <v-progress-circular
                    class="mr-2"
                    indeterminate
                    :color="'rgb(231, 64, 89)'"
                  />
                </div>
              </v-col>
            </v-row>
            <v-card-text class="feed-content px-8 default-font">{{
              parseFeedText(feed_.feedContent)
            }}</v-card-text>
            <EvaluationActions
              v-if="feed_.isShow"
              ref="EvaluationActions"
              :content="feed_"
              :content-id="feed_.feedId"
              @refreshLikesEvent="refreshLikes(index)"
            />
          </v-row>
          <v-row
            v-else-if="
              parseInt(feed_.allowType) ===
              contentAllowType.FollowersOrSupporters
            "
            v-show="feed_.isShow"
            :key="feed_.feedId"
            align="center"
            justify="center"
          >
            <v-list-item>
              <v-list-item-content class="px-4">
                <v-list-item-title
                  class="feed-title"
                  color="#2d2d2d"
                  v-text="feed_.title"
                />
                <v-list-item-subtitle
                  color="#2d2d2d"
                  v-text="getJPDatetime(feed_.crDatetime)"
                />
              </v-list-item-content>
            </v-list-item>
            <v-col>
              <v-row class="py-5" align="center" justify="center">
                <v-icon color="rgb(231, 64, 89)" size="72px">
                  mdi-heart
                </v-icon>
              </v-row>
              <v-row class="py-5" align="center" justify="center">
                <span
                  class="msy-color-text-red"
                  v-text="'フォロワー・応援者限定コンテンツ'"
                ></span>
              </v-row>
              <v-row class="py-2" align="center" justify="center">
                <v-btn
                  color="rgb(231, 64, 89)"
                  outlined
                  dense
                  rounded
                  @click="$emit('to-follow')"
                >
                  <v-icon left>mdi-account-plus</v-icon>
                  <span v-text="'フォロー'"></span>
                </v-btn>
              </v-row>
              <v-row class="py-2" align="center" justify="center">
                <v-btn
                  class="msy-color-red donation-btn"
                  outlined
                  rounded
                  dark
                  @click="$emit('to-support')"
                >
                  <v-icon small>mdi-currency-jpy</v-icon>
                  <span v-text="'応援する'"></span>
                </v-btn>
              </v-row>
            </v-col>
          </v-row>

          <v-row
            v-else-if="
              parseInt(feed_.allowType) === contentAllowType.Supporters &&
              !judgeAllowedFeed(feed_)
            "
            v-show="feed_.isShow"
            :key="feed_.feedId"
            align="center"
            justify="center"
          >
            <v-list-item>
              <v-list-item-content class="px-4">
                <v-list-item-title
                  class="feed-title"
                  color="#2d2d2d"
                  v-text="feed_.title"
                />
                <v-list-item-subtitle
                  color="#2d2d2d"
                  v-text="getJPDatetime(feed_.crDatetime)"
                />
              </v-list-item-content>
            </v-list-item>
            <v-col>
              <v-row class="py-5" align="center" justify="center">
                <v-icon color="rgb(231, 64, 89)" size="72px"> mdi-gift </v-icon>
              </v-row>
              <v-row class="py-5" align="center" justify="center">
                <span
                  class="msy-color-text-red"
                  v-text="'応援者限定コンテンツ'"
                ></span>
              </v-row>
              <v-row class="py-2" align="center" justify="center">
                <span
                  class="msy-color-text-red"
                  v-text="
                    '応援プラン：' +
                    feed_.planName +
                    '(' +
                    feed_.planPrice +
                    'P)以上限定'
                  "
                ></span>
              </v-row>
              <v-row class="py-2" align="center" justify="center">
                <v-btn
                  class="msy-color-red donation-btn"
                  outlined
                  rounded
                  dark
                  @click="$emit('to-support')"
                >
                  <v-icon small>mdi-currency-jpy</v-icon>
                  <span v-text="'応援する'"></span>
                </v-btn>
              </v-row>
            </v-col>
          </v-row>
          <v-container v-if="isFeedStatusLoaded && !feed_.isShow">
            <v-row class="py-5" justify="center" align="center">
              <v-col class="msy-color-text-red">
                <v-row class="py-5" justify="center" align="center">
                  <v-icon color="rgb(231, 64, 89)" size="72px">
                    mdi-message-bulleted-off
                  </v-icon>
                </v-row>
                <v-row class="py-5" justify="center" align="center">
                  <span v-text="'投稿がありません'"></span>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </div>
      </v-card>
    </v-dialog>
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
  </div>
</template>

<script>
import SocialShareButton from "~/components/molecules/SocialShareButton";
import ViewerCounter from "~/components/molecules/ViewerCounter.vue";
import ContentMenus from "~/components/atoms/ContentMenus";
import MovieThumbCard from "~/components/molecules/MovieThumbCard";
import MusicThumbCard from "~/components/molecules/MusicThumbCard";
import EvaluationActions from "~/components/molecules/EvaluationActions";
import FeedsDao from "~/mixins/dao/FeedsDao";
import AllowedContentsService from "~/mixins/service/AllowedContentsService";
import { Cloudinary, ContentAllowType } from "~/constant";

export default {
  components: {
    SocialShareButton,
    ViewerCounter,
    ContentMenus,
    MovieThumbCard,
    MusicThumbCard,
    EvaluationActions,
  },
  mixins: [FeedsDao, AllowedContentsService],
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    feed: {
      type: Object,
      default: undefined,
    },
    supportedPlan: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      isShowFeedDialog: this.isShow,
      cloudinary: Cloudinary,
      contentAllowType: ContentAllowType,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      isLikeds: [],
      likedCounts: [],
      index: 0,
      isFeedStatusLoaded: false,
      feed_: undefined,
      isLikedUpdating: false,
    };
  },
  watch: {
    isShow(newValue, oldValue) {
      if (this.feed) {
        if (!this.feed_) {
          this.feed_ = this.feed;
        }
        this.isShowFeedDialog = newValue;
        this.isFeedStatusLoaded = true;
      }
    },
  },
  methods: {
    closeFeedDetail() {
      this.isShowFeedDialog = false;
      this.isFeedStatusLoaded = false;
      this.feed_ = undefined;
      this.$emit("close");
    },
    judgeShowFeed(feed) {
      let result = false;
      if (this.supportedPlan) {
        result = this.AllowedContentsService_JudgeShowContent(
          feed,
          this.supportedPlan
        );
      }
      return result;
    },
    judgeAllowedFeed(feed) {
      let result = false;
      if (this.supportedPlan) {
        result = this.AllowedContentsService_JudgeAllowedContent(
          feed,
          this.supportedPlan
        );
      }
      return result;
    },
    getJPDatetime(datetime) {
      return this.$moment(datetime).add(9, "h").format("YYYY/MM/DD HH:mm:ss");
    },
    contentItems(feed) {
      const result = [
        { value: "sendreport", icon: "mdi-bullhorn", title: "違反を報告" },
      ];
      const user = this.$store.state.user.user;
      if (user && feed.crUserId === user.userId) {
        result.push({
          value: "editfeed",
          icon: "mdi-pencil",
          title: "投稿を編集する",
        });
        result.push({
          value: "deletefeed",
          icon: "mdi-trash-can",
          title: "投稿を削除する",
        });
      }
      return result;
    },
    deleteFeed(feed) {
      const result = confirm("Feedを削除すると戻せません。よろしいですか？");
      if (result) {
        this.execDelete(feed);
      }
    },
    toSendReportPage(feed) {
      this.$router.push({
        name: "sendreport",
        params: { contentType: "feed", contentId: feed.feedId },
      });
    },
    toEditFeedPage(feed) {
      this.$router.push({
        name: "artists-createfeed",
        params: { mode: "edit", data: feed },
      });
    },
    parseFeedText(text) {
      let processText = text;
      const regex = /http(:\/\/[-_.!~*¥'()a-zA-Z0-9;/?:¥@&=+¥$,%#]+)/;
      const regex2 = /https(:\/\/[-_.!~*¥'()a-zA-Z0-9;/?:¥@&=+¥$,%#]+)/;
      let match;
      const matchObj = {};
      let count = 0;

      while (
        (match = regex.exec(processText)) != null ||
        (match = regex2.exec(processText)) != null
      ) {
        count += 1;
        matchObj[`[${count}]`] = match[0];
        processText = processText.replace(match[0], `[${count}]`);
      }

      const keys = Object.keys(matchObj);

      keys.forEach((key) => {
        processText = processText.replace(key, `,${matchObj[key]},`);
      });
      const textArray = processText.split(",");
      let result = "";
      textArray.forEach((text) => {
        if (text.match(regex) || text.match(regex2)) {
          result = result + `<a href=${text} target="_blank">${text}</a>`;
        } else {
          result = result + text;
        }
      });
      return result;
    },
    imgUrl(imageId) {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${imageId}`;
    },
    createMovieObj(feed) {
      return {
        movieId: feed.movieId,
        artistName: feed.username,
        artistImageId: feed.userImageId,
        startSeconds: 0,
        title: feed.title,
        notForSale: true,
        description: "",
      };
    },
    createMusicObj(feed) {
      return {
        musicId: feed.musicId,
        artistName: feed.username,
        artistImageId: feed.userImageId,
        startSeconds: 0,
        fileExtension: "mp3",
        imageId: feed.imageId ? feed.imageId : undefined,
        title: feed.title,
        notForSale: true,
        description: "",
        purchasedDatetime: null,
      };
    },
    selectMovie(movie) {
      this.$emit("select-movie", movie);
    },
    selectMusic(music) {
      this.$emit("select-music", { music, musics: [music] });
    },
    async setIsLiked(feed, index) {
      this.isLikedUpdating = true;
      await this.$refs.EvaluationActions.setIsLiked(feed);
      this.isLikedUpdating = false;
    },
    refreshLikes(index) {
      const evaActs = this.$refs.EvaluationActions;
      if (evaActs) {
        if (evaActs.evaluationIsLiked) {
          this.isLikeds.splice(index, 1, evaActs.evaluationIsLiked.isLiked);
        }
        if (evaActs.evaluationsLikes) {
          this.likedCounts.splice(index, 1, evaActs.evaluationsLikes.length);
        }
      }
    },
    getLocationOrigin() {
      return location.origin;
    },
  },
};
</script>

<style lang="scss" scoped>
.feed-dialog-wrapper {
  width: 100vw;
}
.dialog-content {
  overflow-x: hidden;
  border-radius: 0px !important;
}
.title-area-wrapper {
  position: fixed;
  width: 100%;
  background-color: white !important;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  z-index: 1;
}
.close-icon {
  transform: scale(-1, 1);
}
.feed-title {
  font-size: 1.2rem;
}
.display-block {
  display: block;
}

.feed-content {
  font-size: 1rem;
  line-height: 1.8rem;
  white-space: pre-wrap;
  text-align: justify;
}
.feed-image-wrapper {
  width: 100%;
  margin: 20px 0;
  min-height: 200px;
  max-width: 90vw;
  border-radius: 10px !important;
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
}
.display-flex {
  display: flex;
}
.font-decoration {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
  white-space: nowrap;
}
</style>
