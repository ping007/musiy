<template>
  <div class="artist-feed-list-wrapper">
    <div v-if="feeds" class="artist-feed-list">
      <div v-if="feeds.length > 0" class="artist-feed-list-container">
        <v-row
          v-for="(feed, index) in feeds"
          v-show="feed.isShow"
          :key="feed.feedId"
          class="my-2"
          justify="center"
          align="center"
        >
          <v-card
            v-if="judgeShowFeed(feed) || isShowAllMode"
            class="mx-0 artist-feed-list-card"
          >
            <v-list-item>
              <v-list-item-content class="px-4">
                <v-list-item-title
                  class="feed-title"
                  color="#2d2d2d"
                  v-text="feed.title"
                />
                <div class="display-flex">
                  <viewer-counter :content-id="feed.feedId" />
                  <span class="font-decoration">・</span>
                  <v-list-item-subtitle
                    color="#2d2d2d"
                    v-text="getJPDatetime(feed.crDatetime)"
                  />
                </div>
              </v-list-item-content>
              <SocialShareButton
                :url="
                  getLocationOrigin() +
                  '/ogp?artist_id=' +
                  feed.userId +
                  '&feed_id=' +
                  feed.feedId
                "
                :title="feed.title"
              />
              <ContentMenus
                :items="contentItems(feed)"
                @deletefeed="deleteFeed(feed)"
                @editfeed="toEditFeedPage(feed)"
                @sendreport="toSendReportPage(feed)"
              />
            </v-list-item>

            <v-row v-if="feed.movieId" class="movie-list px-0 mx-0 mt-4">
              <v-row class="pb-4 block-center mx-0">
                <div>
                  <MovieThumbCard
                    :movie="createMovieObj(feed)"
                    @click="selectMovie"
                  />
                </div>
              </v-row>
            </v-row>
            <v-row v-if="feed.musicId" class="mx-0">
              <v-row class="pb-4 block-center mx-0">
                <div>
                  <MusicThumbCard
                    :music="createMusicObj(feed)"
                    @click="selectMusic"
                  />
                </div>
              </v-row>
            </v-row>
            <v-row v-if="feed.imageId && !feed.musicId" class="mx-0 image-row">
              <v-row class="pb-4 block-center mx-0">
                <v-img
                  v-if="feed.imageId"
                  :src="imgUrl(feed.imageId)"
                  class="feed-image-wrapper"
                  lazy-src="/images/no_image.png"
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
                      @click="setIsLiked(feed, index)"
                    >
                      mdi-heart
                    </v-icon>
                    <v-icon
                      v-else
                      :color="'msy-color-text-blue-gray'"
                      class="mr-2"
                      large
                      @click="setIsLiked(feed, index)"
                    >
                      mdi-heart-outline
                    </v-icon>
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
                <div v-else class="block-right">
                  <v-progress-circular
                    class="mr-2"
                    indeterminate
                    :color="'rgb(231, 64, 89)'"
                  />
                </div>
              </v-col>
            </v-row>
            <v-card-text class="feed-content px-8 default-font">{{
              parseFeedText(feed.feedContent)
            }}</v-card-text>
            <EvaluationActions
              v-if="feed.isShow"
              ref="EvaluationActions"
              :content="feed"
              :content-id="feed.feedId"
              @refreshLikesEvent="refreshLikes(index)"
            />
          </v-card>
          <v-card
            v-else-if="
              parseInt(feed.allowType) ===
              contentAllowType.FollowersOrSupporters
            "
            min-height="320"
            min-width="90vw"
            max-width="90vw"
            class="mx-0"
          >
            <v-list-item>
              <v-list-item-content class="px-4">
                <v-list-item-title
                  class="feed-title"
                  color="#2d2d2d"
                  v-text="feed.title"
                />
                <v-list-item-subtitle
                  color="#2d2d2d"
                  v-text="getJPDatetime(feed.crDatetime)"
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
                >
                </span>
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
          </v-card>
          <v-card
            v-else-if="
              parseInt(feed.allowType) === contentAllowType.Supporters &&
              !judgeAllowedFeed(feed)
            "
            min-height="320"
            min-width="90vw"
            max-width="90vw"
            class="mx-0"
          >
            <v-list-item>
              <v-list-item-content class="px-4">
                <v-list-item-title
                  class="feed-title"
                  color="#2d2d2d"
                  v-text="feed.title"
                />
                <v-list-item-subtitle
                  color="#2d2d2d"
                  v-text="getJPDatetime(feed.crDatetime)"
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
                    feed.planName +
                    '(' +
                    feed.planPrice +
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
          </v-card>
        </v-row>
      </div>
      <div
        v-else-if="feeds.length === 0 && isContentLoaded"
        class="artist-feed-list-container"
      >
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
      </div>
    </div>
    <div v-else-if="!feeds && !isContentLoaded" class="artist-feed-list">
      <v-row justify="center" align="center" class="mx-0 my-5">
        <v-progress-circular
          class="ma-4"
          indeterminate
          :size="24"
          :width="5"
          :rotate="360"
          color="rgb(231, 64, 89)"
        />
        <span class="msy-color-text-red" v-text="'読み込み中'"></span>
      </v-row>
    </div>
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
import ContentMenus from "~/components/atoms/ContentMenus";
import EvaluationActions from "~/components/molecules/EvaluationActions";
import MovieThumbCard from "~/components/molecules/MovieThumbCard";
import MusicThumbCard from "~/components/molecules/MusicThumbCard";
import ViewerCounter from "~/components/molecules/ViewerCounter.vue";
import { Cloudinary, ContentAllowType } from "~/constant";
import MoviesDao from "~/mixins/dao/MoviesDao";
import MusicsDao from "~/mixins/dao/MusicsDao";
import FeedsDao from "~/mixins/dao/FeedsDao";
import AllowedContentsService from "~/mixins/service/AllowedContentsService";
import SupportPlansService from "~/mixins/service/SupportPlansService";
import SocialShareButton from "~/components/molecules/SocialShareButton";
import LocalStorageService from "~/mixins/service/LocalStorageService";

export default {
  components: {
    ContentMenus,
    EvaluationActions,
    MovieThumbCard,
    MusicThumbCard,
    ViewerCounter,
    SocialShareButton,
  },
  mixins: [
    MoviesDao,
    MusicsDao,
    FeedsDao,
    AllowedContentsService,
    SupportPlansService,
    LocalStorageService,
  ],
  props: {
    feeds: {
      type: Array,
      default: undefined,
    },
    isFollowing: {
      type: Boolean,
      default: false,
    },
    supportedPlan: {
      type: Object,
      default: undefined,
    },
    isShowAllMode: {
      type: Boolean,
      default: false,
    },
    isContentLoaded: {
      type: Boolean,
      default: false,
    },
    cacheKeyPrefix: String,
    artistUserId: String,
  },
  data() {
    return {
      cloudinary: Cloudinary,
      contentAllowType: ContentAllowType,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      isLikeds: [],
      likedCounts: [],
      isLikedUpdating: false,
    };
  },
  watch: {
    isLikeds: {
      handler(newVal, oldVal) {},
      deep: true,
    },
    likedCounts: {
      handler(newVal, oldVal) {},
      deep: true,
    },
    feeds(newValue, oldValue) {
      this.LocalStorageService_StoreToLocalStorageByUser(
        this.cacheKeyPrefix,
        this.artistUserId,
        newValue,
        this.toCacheModels
      );
    },
  },
  methods: {
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
    toCacheModels(feeds) {
      return this.feeds.map((feed) => {
        return {
          isShow: feed.isShow,
          feedId: feed.feedId,
          title: feed.title,
          crDatetime: feed.crDatetime,
          userId: feed.userId,
          movieId: feed.movieId,
          musicId: feed.musicId,
          imageId: feed.imageId,
          feedContent: feed.feedContent,
          allowType: feed.allowType,
          planName: feed.planName,
          planPrice: feed.planPrice,
        };
      });
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
    createMovieObj(feed) {
      const movie = {
        movieId: feed.movieId,
        artistName: feed.username,
        artistImageId: feed.userImageId,
        startSeconds: 0,
        title: feed.title,
        notForSale: true,
        description: "",
      };
      return movie;
    },
    createMusicObj(feed) {
      const music = {
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
      return music;
    },
    getJPDatetime(datetime) {
      return this.$moment(datetime).add(9, "h").format("YYYY/MM/DD HH:mm:ss");
    },
    judgeShowFeed(feed) {
      let result = false;
      if (this.supportedPlan) {
        result = this.AllowedContentsService_JudgeShowContent(
          feed,
          this.supportedPlan,
          this.isFollowing
        );
      } else if (
        parseInt(feed.allowType) === this.contentAllowType.FollowersOrSupporters
      ) {
        result = this.AllowedContentsService_JudgeShowContent(
          feed,
          this.supportedPlan,
          this.isFollowing
        );
      } else {
        result = parseInt(feed.allowType) === this.contentAllowType.All;
      }
      return result;
    },
    judgeFollowing(feed) {
      return this.AllowedContentsService_JudgeFollowing(feed, this.isFollowing);
    },
    judgeAllowedFeed(feed) {
      let result = false;
      if (this.supportedPlan) {
        result = this.AllowedContentsService_JudgeAllowedContent(
          feed,
          this.supportedPlan
        );
      } else {
        result = parseInt(feed.allowType) === this.contentAllowType.All;
      }
      return result;
    },
    judgeMyFeed(feed) {
      return this.AllowedContentsService_JudgeMyContent(feed);
    },
    deleteFeed(feed) {
      const result = confirm("Feedを削除すると戻せません。よろしいですか？");
      if (result) {
        this.execDelete(feed);
      }
    },
    async execDelete(feed) {
      await this.FeedsDao_MoveToFeedsHist(feed.feedId);
      feed.isShow = false;
      await this.FeedsDao_UpsertFeed(
        feed.feedId,
        feed.userId,
        feed.movieId,
        feed.musicId,
        feed.imageId,
        feed.title,
        feed.feedContent,
        feed.feedContentPrice,
        feed.allowType,
        feed.crUserId,
        feed.upUserId,
        feed.isShow
      );
      this.isShowSuccessSnackbar = true;
      this.successStr = `${feed.title}を削除しました`;
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
    selectMovie(movie) {
      this.$emit("select-movie", movie);
    },
    selectMusic(music) {
      this.$emit("select-music", { music, musics: [music] });
    },
    async setIsLiked(feed, index) {
      this.isLikedUpdating = true;
      await this.$refs.EvaluationActions[index].setIsLiked(feed);
      this.isLikedUpdating = false;
    },
    refreshLikes(index) {
      const evaActs = this.$refs.EvaluationActions[index];
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
.artist-feed-list-wrapper {
  width: 100%;
}
.artist-feed-list {
  width: 100%;
}
.artist-feed-list-container {
  width: 100%;
}
.feed-title {
  font-size: 1.2rem;
}
.feed-content {
  font-size: 1rem;
  line-height: 1.8rem;
  white-space: pre-wrap;
  text-align: justify;
}
.display-flex {
  display: flex;
}
.font-decoration {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
  white-space: nowrap;
}
@media screen and (max-width: 960px) {
  .artist-feed-list-card {
    min-width: 90vw;
    max-width: 90vw;
  }
  .feed-image-wrapper {
    width: 100%;
    min-height: 200px;
    max-width: 90vw;
    box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
      0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  }
}
@media screen and (min-width: 960px) {
  .image-row {
    overflow: hidden;
  }
  .artist-feed-list-card {
    width: 85%;
  }
  .feed-image-wrapper {
    max-width: 45vw;
    height: 100%;
    box-shadow: 0px 3px 1px -2px rgba(41, 37, 37, 0.2),
      0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  }
}
</style>
