<template>
  <div>
    <v-dialog
      v-if="movie_"
      v-model="isShowPlayerDialog"
      persistent
      fullscreen
      hide-overlay
      transition="scroll-y-reverse-transition"
    >
      <v-card class="dialog-content">
        <div>
          <v-row class="title-area-wrapper">
            <v-card-title class="player-header headline" primary-title>
              <v-row align="center" justify="center">
                <v-col cols="4" class="py-2">
                  <v-btn text @click="close">
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
                <v-col cols="8" class="px-0 pb-2 pt-3 artist-info">
                  <v-btn text :href="'/fans/detail?artist_id=' + movie_.userId">
                    <v-avatar size="36px">
                      <img
                        v-if="movie_.artistImageId"
                        :src="artistImgUrl"
                        :alt="movie_.artistName"
                      />
                      <img
                        v-else
                        :src="'/images/no_image.png'"
                        class="no-profile-image"
                        alt="artist no image"
                      />
                    </v-avatar>
                    <span
                      class="
                        player-header-artist-name
                        default-font-family
                        font-weight-bold
                        pl-2
                      "
                      v-text="movie_.artistName"
                    ></span>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-title>
          </v-row>
          <v-row class="header-buffer-area" />
          <v-row align="center" justify="center">
            <video
              id="target"
              ref="video_elem"
              class="width-adjust"
              playsinline
              preload="true"
              type="video/mp4"
              :src="mp4Url"
              controlslist="nodownload"
              :poster="posterUrl"
              @ended="videoEnded"
              @loadedmetadata="setTotalTime"
            ></video>
          </v-row>
          <v-row
            v-if="isEditable"
            class="overlay-buttons-wrapper"
            align="center"
            justify="center"
          >
            <v-row class="overlay-buttons" align="center" justify="center">
              <v-spacer />
              <v-btn
                dark
                class="my-3 mr-4 msy-color-red"
                @click="toMovieEditPage"
              >
                <v-icon>mdi-file-video</v-icon>この動画を編集する
              </v-btn>
            </v-row>
          </v-row>

          <v-row class="py-2 pr-2 pl-8 width-adjust">
            <v-col cols="12" class="px-0">
              <div
                class="
                  player-header-movie-title
                  default-font-family
                  font-weight-bold
                "
                v-text="movie_.title"
              ></div>
              <div class="font-decoration">
                <span v-text="movie_.playCounts + ' views'"></span>
                <span v-text="'・'"></span>
                <span v-text="convertDateFormat(movie_.crDatetime)"></span>
              </div>
            </v-col>
            <v-col cols="5" class="most-right-on-screen block-right px-0">
              <div v-if="!isLikedUpdating" class="mr-1">
                <v-btn icon>
                  <v-icon
                    v-if="isLikeds"
                    :color="'rgb(231, 64, 89)'"
                    large
                    @click="setIsLiked(movie)"
                  >
                    mdi-heart
                  </v-icon>
                  <v-icon
                    v-else
                    :color="'msy-color-text-blue-gray'"
                    large
                    @click="setIsLiked(movie)"
                  >
                    mdi-heart-outline
                  </v-icon>
                </v-btn>
                <span
                  :class="
                    isLikeds ? 'msy-color-text-red' : 'msy-color-text-blue-gray'
                  "
                  v-text="likedCounts"
                ></span>
              </div>
              <div v-else>
                <v-progress-circular
                  class="mr-2"
                  indeterminate
                  :color="'rgb(231, 64, 89)'"
                />
              </div>
              <span>
                <SocialShareButton
                  :url="
                    getLocationOrigin() +
                    '/ogp?artist_id=' +
                    movie_.userId +
                    '&movie_id=' +
                    movie_.movieId
                  "
                  :title="movie_.title + ' ' + movie_.artistName"
                  :description="movie_.description"
                  :quote="movie_.artistName"
                />
              </span>
              <div class="mr-0">
                <ContentMenus
                  :items="conetentItems"
                  @sendreport="toSendReportPage"
                />
              </div>
            </v-col>
          </v-row>
          <v-row
            v-if="isShowButtons"
            align="center"
            justify="center"
            class="pt-0 pb-4 px-8 display-block"
          >
            <div class="mb-2">
              <v-btn
                class="purchase-button"
                outlined
                rounded
                width="100%"
                color="white"
                @click="toPurchasePage"
              >
                この動画を購入する
                <span
                  v-text="movie_.price ? '¥' + movie_.price : '¥' + 0"
                ></span>
              </v-btn>
            </div>
            <div>
              <v-btn
                outlined
                rounded
                width="100%"
                color="rgb(231, 64, 89)"
                @click="addPlayLater"
                v-text="'あとで観る'"
              />
            </div>
          </v-row>
          <v-row align="center" justify="start" class="px-8 display-block">
            <div class="movie-description">
              <span
                class="default-font default-font-size"
                v-text="movie_.description"
              ></span>
            </div>
          </v-row>
          <v-row class="px-8 display-block">
            <span
              class="music-detail-title bold"
              v-text="'収録楽曲詳細'"
            ></span>
          </v-row>
          <v-row
            v-if="musicDetails.length > 0"
            align="center"
            justify="start"
            class="px-8 display-block"
          >
            <v-col v-if="isLoadedMusicDetail" class="music-detail py-1">
              <v-row v-for="detail in musicDetails" :key="detail.musicDetailId">
                <v-col class="py-1">
                  <v-row class="music-detail-title">
                    <span v-text="detail.musicDetailTitle"></span>
                  </v-row>
                  <v-row class="music-detail-description">
                    <span v-text="detail.musicDetailDescription"></span>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
            <v-col v-else>
              <v-progress-circular
                class="mr-2"
                indeterminate
                :color="'rgb(231, 64, 89)'"
              />
            </v-col>
          </v-row>
          <div align="center" justify="center">
            <EvaluationActions
              v-if="!movie_.notForSale || movie_.notForSale === false"
              ref="EvaluationActions"
              :content="movie"
              :content-id="movie_.movieId"
              @refreshLikesEvent="refreshLikes(movie)"
            />
          </div>

          <v-row class="movie-progress-bar" align="center">
            <v-progress-linear v-model="progressValue" query />
          </v-row>
          <v-row class="movie-timer">
            <v-col class="text-center">
              <span
                class="default-font default-font-size"
                v-text="currentTimeStr + '/' + totalTimeStr"
              ></span>
            </v-col>
          </v-row>
          <v-spacer class="movie-controller-height" />
          <v-row class="controls" align="center">
            <div class="ma-1">
              <v-btn
                :disabled="!hasPrevious || !isPurcahsed"
                outlined
                fab
                color="darkgrey"
                @click="previousMovie"
              >
                <v-icon>mdi-skip-previous</v-icon>
              </v-btn>
            </div>
            <div class="ma-1">
              <v-btn
                :disabled="currentTime < 10 || !isPurcahsed"
                outlined
                fab
                color="darkgrey"
                @click="backMovie"
              >
                <v-icon>mdi-skip-backward</v-icon>
              </v-btn>
            </div>
            <div v-if="!playing" class="ma-1">
              <v-btn outlined fab color="darkgrey" @click="startMovie">
                <v-icon>mdi-play</v-icon>
              </v-btn>
            </div>
            <div v-if="playing" class="ma-1">
              <v-btn outlined fab color="darkgrey" @click="pauseMovie">
                <v-icon>mdi-pause</v-icon>
              </v-btn>
            </div>
            <div class="ma-1">
              <v-btn
                :disabled="totalTime - currentTime < 10 || !isPurcahsed"
                outlined
                fab
                color="darkgrey"
                @click="forwardMovie"
              >
                <v-icon>mdi-skip-forward</v-icon>
              </v-btn>
            </div>
            <div class="ma-1">
              <v-btn
                :disabled="!hasNext || !isPurcahsed"
                outlined
                fab
                color="darkgrey"
                @click="nextMovie"
              >
                <v-icon>mdi-skip-next</v-icon>
              </v-btn>
            </div>
          </v-row>
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
import ContentMenus from "~/components/atoms/ContentMenus";
import EvaluationActions from "~/components/molecules/EvaluationActions";
import { Cloudinary } from "~/constant";
import MoviesDao from "~/mixins/dao/MoviesDao";
import MusicDetailsDao from "~/mixins/dao/MusicDetailsDao";
import PlayLaterDao from "~/mixins/dao/PlayLaterDao";
import SocialShareButton from "~/components/molecules/SocialShareButton";

export default {
  components: {
    ContentMenus,
    EvaluationActions,
    SocialShareButton,
  },
  mixins: [PlayLaterDao, MoviesDao, MusicDetailsDao],
  props: ["isShow", "movie", "movies", "isPurcahsed", "isEditable"],
  data() {
    return {
      isShowPlayerDialog: this.isShow,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      isMuted: false,
      videoElem: null,
      repeatStatus: 0,
      currentTime: 0,
      totalTime: 0,
      interval: undefined,
      cloudinary: Cloudinary,
      movie_: undefined,
      playing: false,
      conetentItems: [
        { value: "sendreport", icon: "mdi-bullhorn", title: "違反を報告" },
      ],
      isLikeds: false,
      likedCounts: 0,
      isLikedUpdating: false,
      musicDetails: [],
      isLoadedMusicDetail: false,
    };
  },
  computed: {
    isShowButtons() {
      return (
        !this.isPurcahsed &&
        (!this.movie_.notForSale || this.movie_.notForSale === false)
      );
    },
    isNoRepeat() {
      return this.repeatStatus === 0;
    },
    isRepeatOnce() {
      return this.repeatStatus === 1;
    },
    isRepeatAll() {
      return this.repeatStatus === 2;
    },
    posterUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/video/upload/${this.movie_.movieId}.jpg`;
    },
    mp4Url() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/video/upload/${this.movie_.movieId}.mp4${this.playingSectionParams}`;
    },
    artistImgUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${this.movie_.artistImageId}`;
    },
    playingSectionParams() {
      const secStr = String(parseInt(this.movie_.startSeconds) + 45);
      return this.isPurcahsed ? "" : `#t=${this.movie_.startSeconds},${secStr}`;
    },
    hasPrevious() {
      let result = false;
      if (this.playing && this.currentTime >= 1) {
        result = true;
      } else if (this.movies) {
        const idx = this.movies.findIndex((elem) => {
          return elem.movieId === this.movie_.movieId;
        });
        result = this.movies[idx - 1] !== undefined;
      }
      return result;
    },
    hasNext() {
      let result = false;
      if (this.movies) {
        const idx = this.movies.findIndex((elem) => {
          return elem.movieId === this.movie_.movieId;
        });
        result = this.movies[idx + 1] !== undefined;
      }
      return result;
    },
    progressValue: {
      get() {
        let totalTime = 45;
        if (this.isPurcahsed) {
          totalTime = this.totalTime;
        }
        return this.totalTime > 0
          ? this.orgFloor((this.currentTime / totalTime) * 100, 10)
          : 0;
      },
      set(value) {},
    },
    currentTimeStr() {
      let result = "00:00";
      if (this.currentTime > 0) {
        let sec = "0" + Math.floor(this.currentTime % 60); // 秒数
        let min = "0" + Math.floor(this.currentTime / 60); // 分数
        sec = sec.substr(sec.length - 2, 2);
        min = min.substr(min.length - 2, 2);
        result = min + ":" + sec;
      }
      return result;
    },
    totalTimeStr() {
      let result = "00:00";
      let totalTime = 45;
      if (this.isPurcahsed) {
        totalTime = this.totalTime;
      }
      if (totalTime > 0) {
        let sec = "0" + Math.floor(totalTime % 60); // 秒数
        let min = "0" + Math.floor(totalTime / 60); // 分数
        sec = sec.substr(sec.length - 2, 2);
        min = min.substr(min.length - 2, 2);
        result = min + ":" + sec;
      }
      return result;
    },
  },
  watch: {
    isLikeds(newVal, oldVal) {},
    likedCounts(newVal, oldVal) {
      console.log("likedCounts");
      console.log(this.likedCounts);
    },
    async isShow(newValue, oldValue) {
      if (this.playing) {
        this.stopMovie();
      }
      this.movie_ = undefined;
      this.videoElem = null;
      this.setTotalTime();
      if (this.movie) {
        if (!this.movie_ || this.movie_.movieId !== this.movie.movieId) {
          this.movie_ = this.movie;
        }
        this.isShowPlayerDialog = newValue;
        this.$emit("showplayer");
        await this.loadMusicDetails();
      }
    },
  },
  methods: {
    /**
     * 任意の桁で切り捨てする関数
     * @param {number} value 切り捨てする数値
     * @param {number} base どの桁で切り捨てするか（10→10の位、0.1→小数第１位）
     * @return {number} 切り捨てした値
     */
    orgFloor(value, base) {
      return Math.floor(value * base) / base;
    },
    changeRepeatStatus() {
      if (this.repeatStatus < 2) {
        this.repeatStatus++;
      } else {
        this.repeatStatus = 0;
      }
    },
    async addPlayLater() {
      const user = this.$store.state.user.user;
      const sqlResult = await this.PlayLaterDao_UpsertPlayLater(
        user.userId,
        this.movie_.movieId
      );
      console.log("SQL result:", sqlResult);
      this.isShowSuccessSnackbar = true;
      this.successStr = "「あとで観る」に追加しました";
      this.close();
    },
    toPurchasePage() {
      this.movie_.imageUrl = this.posterUrl;
      this.$router.push({
        name: "fans-purchase",
        params: {
          content: this.movie_,
          isMovie: true,
          isMusic: false,
          isPoint: false,
          isPlan: false,
          isTicket: false,
        },
      });
    },
    toMovieEditPage() {
      this.$emit("to-edit");
    },
    toSendReportPage() {
      this.$router.push({
        name: "sendreport",
        params: { contentType: "movie", contentId: this.movie_.movieId },
      });
    },
    setTotalTime() {
      if (!this.videoElem) {
        this.videoElem = this.$refs.video_elem;
      }
      if (this.videoElem) {
        this.videoElem.preload = true;
        this.totalTime = this.videoElem.duration;
        console.log(this.totalTime);
      }
    },
    startMovie() {
      if (!this.videoElem) {
        this.videoElem = this.$refs.video_elem;
        this.videoElem.preload = true;
      }
      this.videoElem.play();
      this.playing = true;
      this.interval = setInterval(() => {
        if (this.videoElem && this.movie_) {
          if (!this.isPurcahsed) {
            this.currentTime =
              this.videoElem.currentTime - parseInt(this.movie_.startSeconds);
          } else {
            this.currentTime = this.videoElem.currentTime;
          }
          if (this.currentTime < 0) {
            this.currentTime = 0;
          }
          if (!this.isPurcahsed && this.currentTime >= 45) {
            this.videoEnded();
          }
        }
      }, 10);
      if (this.currentTime < 1) {
        this.MoviesDao_UpdateMoviePlayCounts(this.movie_.movieId);
      }
    },
    videoEnded() {
      if (this.isNoRepeat) {
        this.stopMovie();
      } else if (this.isRepeatOnce) {
        this.stopMovie();
        this.$nextTick(() => {
          this.startMovie();
        });
      } else if (this.isRepeatAll) {
        if (this.hasNext) {
          this.nextMovie();
        } else {
          if (this.movies) {
            this.movie_ = this.movies[0];
          } else {
            this.stopMovie();
          }
          this.$nextTick(() => {
            this.startMovie();
          });
        }
      }
    },
    pauseMovie() {
      if (this.videoElem) {
        this.videoElem.pause();
        this.playing = false;
        clearInterval(this.interval);
      }
    },
    previousMovie() {
      if (this.playing) {
        if (this.currentTime < 1) {
          this.stopMovie();
          this.setPreviousMovie();
        } else {
          this.stopMovie();
          this.startMovie();
        }
      } else {
        this.setPreviousMovie();
      }
    },
    nextMovie() {
      this.playing = false;
      this.setNextMovie();
    },
    backMovie() {
      this.currentTime = this.currentTime - 10;
      this.videoElem.currentTime = this.currentTime;
    },
    forwardMovie() {
      this.currentTime = this.currentTime + 10;
      this.videoElem.currentTime = this.currentTime;
    },
    stopMovie() {
      if (this.videoElem) {
        this.videoElem.pause();
        this.videoElem.load();
        this.playing = false;
        clearInterval(this.interval);
        this.currentTime = 0;
      }
    },
    close() {
      if (this.playing) {
        this.stopMovie();
      }
      this.isShowPlayerDialog = false;
      this.movie_ = undefined;
      this.videoElem = null;
      this.$emit("close");
    },
    async changeFullccreen() {
      if (this.$screenfull.isEnabled) {
        const element = document.getElementById("target");
        await this.$screenfull.request(element);
      } else {
        this.isShowErrorSnackbar = true;
        this.errorStr = "フルスクリーン未対応です";
      }
    },
    changeMuted() {
      this.isMuted = !this.isMuted;
      this.videoElem.muted = this.isMuted;
    },
    async setIsLiked(content) {
      this.isLikedUpdating = true;
      await this.$refs.EvaluationActions.setIsLiked(content);
      this.isLikedUpdating = false;
    },
    refreshLikes() {
      const evaActs = this.$refs.EvaluationActions;
      if (evaActs.evaluationIsLiked) {
        this.isLikeds = evaActs.evaluationIsLiked.isLiked;
      }
      if (evaActs.evaluationsLikes) {
        this.likedCounts = evaActs.evaluationsLikes.length;
      }
    },
    convertDateFormat(date) {
      return this.$moment(date).format("YYYY/MM/DD");
    },
    getLocationOrigin() {
      return location.origin;
    },
    async loadMusicDetails() {
      this.isLoadedMusicDetail = false;
      const contentId = this.movie_.movieId;
      this.musicDetails =
        await this.MusicDetailsDao_SelectMusicDetailsByParentContentId(
          contentId
        );
      if (!this.musicDetails) {
        this.musicDetails = [];
      }
      this.musicDetails = this.musicDetails.reverse();
      this.isLoadedMusicDetail = true;
    },
  },
};
</script>

<style lang="scss" scoped>
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
.artist-info {
  display: flex;
  justify-content: flex-end;
}
.player-header {
  width: 100%;
  z-index: 1;
  color: #2d2d2d;
  margin: 0;
  padding: 0 12px;
}
.overlay-buttons-wrapper {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
}
.overlay-buttons {
  position: absolute;
  bottom: 0px;
  background: rgba(0, 0, 0, 0.7);
  // background: rgba(182, 48, 142, 0.7);
  margin: 0;
  width: 100%;
}
.overlay-buttons.add-bottom-margin {
  bottom: 0px;
}
.purchase-button {
  background: rgb(231, 64, 89);
  background: linear-gradient(
    135deg,
    rgba(231, 64, 89, 1) 0%,
    rgba(189, 100, 153, 1) 100%
  );
}
.player-header-movie-title {
  font-size: 1.2rem;
}
.player-header-artist-name {
  font-size: 0.9rem;
}
.close-icon {
  transform: scale(-1, 1);
}
.header-buffer-area {
  background-color: #000;
  height: 56px;
}
.dialog-content {
  overflow-x: hidden;
  border-radius: 0px !important;
}
.movie-description {
  min-height: 10vh;
  max-height: 30vh;
  margin-bottom: 32px;
  white-space: pre-wrap;
  overflow-y: auto;
}
.controls {
  position: fixed;
  bottom: 0px;
  width: 100%;
  margin: 0 0 0 0;
  padding: 12px 0;
  background: #ededed;
  justify-content: space-evenly !important;
}
.movie-progress-bar {
  position: fixed;
  bottom: 137px;
  left: 0;
  width: 100%;
  margin: 0;
  justify-content: center;
}
.movie-timer {
  position: fixed;
  bottom: 88px;
  left: 0;
  width: 100%;
  margin: 0;
  background-color: white !important;
  justify-content: space-evenly !important;
}
.movie-controller-height {
  height: 141px;
}
.no-profile-image {
  object-fit: cover;
}
.font-decoration {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
  white-space: nowrap;
}
.music-detail-title {
  font-size: 12px;
}
.music-detail-description {
  font-size: 10px;
  white-space: pre-wrap;
}
@media screen and (max-width: 960px) {
  .display-block {
    display: block;
    margin: 0;
  }
  .width-adjust {
    width: 100vw;
    margin: 0;
  }
}
@media screen and (min-width: 960px) {
  .display-block {
    width: 50vw;
    margin-left: auto;
    margin-right: auto;
  }
  .width-adjust {
    width: 30vw;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
