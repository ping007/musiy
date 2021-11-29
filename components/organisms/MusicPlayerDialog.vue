<template>
  <div>
    <v-dialog
      v-if="music_"
      v-model="isShowMusicPlayerDialog"
      persistent
      fullscreen
      hide-overlay
      transition="scroll-y-reverse-transition"
    >
      <v-card tile class="dialog-content">
        <div class="dialog-wrapper">
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
                  <v-btn text :href="'/fans/detail?artist_id=' + music_.userId">
                    <v-avatar size="36px">
                      <img
                        v-if="music_.artistImageId"
                        :src="artistImgUrl"
                        :alt="music_.artistName"
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
                      v-text="music_.artistName"
                    ></span>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-title>
          </v-row>
          <v-row
            v-if="music_.imageId"
            align="center"
            justify="center"
            class="margin-header"
          >
            <v-img :src="imgUrl" alt="music image" width="100%" />
          </v-row>
          <v-row
            v-else
            class="mx-0 margin-header"
            align="center"
            justify="center"
          >
            <v-img
              :src="'/images/no_image.png'"
              alt="music image"
              width="100%"
            />
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
                class="my-3 mr-4 msy-color-red"
                dark
                @click="toMusicEditPage"
              >
                <v-icon>mdi-file-music</v-icon>この曲を編集する
              </v-btn>
            </v-row>
          </v-row>

          <v-row class="ma-0 py-2 pr-2 pl-8">
            <v-col cols="12" class="px-0">
              <div
                class="
                  player-header-music-title
                  default-font-family
                  font-weight-bold
                "
                v-text="music_.title"
              ></div>
              <div class="font-decoration">
                <span v-text="music_.playCounts + ' views'"></span>
                <span>・</span>
                <span v-text="convertDateFormat(music_.crDatetime)"></span>
              </div>
            </v-col>
            <v-col cols="5" class="most-right-on-screen block-right px-0">
              <div v-if="!isLikedUpdating" class="mr-1">
                <v-btn icon>
                  <v-icon
                    v-if="isLikeds"
                    :color="'rgb(231, 64, 89)'"
                    large
                    @click="setIsLiked(music_)"
                  >
                    mdi-heart
                  </v-icon>
                  <v-icon
                    v-else
                    :color="'msy-color-text-blue-gray'"
                    large
                    @click="setIsLiked(music_)"
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
                      music_.userId +
                      '&music_id=' +
                      music_.musicId
                  "
                  :title="music_.title + ' ' + music_.artistName"
                  :description="music_.description"
                  :quote="music_.artistName"
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
            class="ma-0 pt-0 pb-4 px-8 display-block"
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
                この曲を購入する
                <span v-text="'¥' + music_.price"></span>
              </v-btn>
            </div>
            <div>
              <v-btn
                v-if="!isPlayLater"
                outlined
                rounded
                width="100%"
                color="rgb(231, 64, 89) !important"
                @click="addPlayLater"
                v-text="'あとで聴く'"
              />
              <v-btn
                v-if="isPlayLater"
                outlined
                rounded
                width="100%"
                color="rgb(231, 64, 89) !important"
                @click="removePlayLater"
                v-text="'&quot;あとで聴く&quot;から外す'"
              />
            </div>
          </v-row>
          <v-row align="center" justify="start" class="px-8 display-block">
            <div class="music-description">
              <span
                class="default-font default-font-size"
                v-text="music_.description"
              ></span>
            </div>
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
                  <v-row>
                    <span v-text="detail.musicDetailTitle"></span>
                  </v-row>
                  <v-row>
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
          <EvaluationActions
            v-if="!music_.notForSale || music_.notForSale === false"
            ref="EvaluationActions"
            :content="music_"
            :content-id="music_.musicId"
            @refreshLikesEvent="refreshLikes(music_)"
          />
          <v-row align="center" justify="center">
            <audio
              ref="audio_elem"
              :width="'100%'"
              preload="true"
              :src="musicUrl"
              @ended="audioEnded"
              @loadedmetadata="setTotalTime"
            ></audio>
          </v-row>
          <v-row class="music-progress-bar" align="center">
            <v-progress-linear v-model="progressValue" color="#e74059" query />
          </v-row>
          <v-row class="music-timer" align="center">
            <v-col @click="changeRepeatStatus">
              <v-icon v-if="isNoRepeat" color="grey lighten-1">
                mdi-repeat-off
              </v-icon>
              <v-icon v-if="isRepeatOnce" color="grey darken-1">
                mdi-repeat-once
              </v-icon>
              <v-icon v-if="isRepeatAll" color="grey darken-1">
                mdi-repeat
              </v-icon>
            </v-col>
            <v-col class="text-center">
              <span
                class="default-font default-font-size"
                v-text="currentTimeStr + '/' + totalTimeStr"
              ></span>
            </v-col>
            <v-col />
          </v-row>
          <v-spacer class="music-controller-height" />
          <v-row class="controls" align="center">
            <!-- 再生開始時に音が途切れるのを防止するため、先にページ読み込み時に音源を一瞬自動再生しているが-->
            <!-- Chromeだとscriptからの自動再生が禁止されるため、以下のiframeを利用して回避する -->
            <iframe
              :src="require('~/static/musics/silence.mp3')"
              allow="autoplay"
              style="display: none"
            ></iframe>
            <div class="ma-1">
              <v-btn
                :disabled="!hasPrevious || !isPurcahsed"
                outlined
                fab
                color="darkgrey"
                @click="previousMusic"
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
                @click="backMusic"
              >
                <v-icon>mdi-skip-backward</v-icon>
              </v-btn>
            </div>
            <div v-if="!playing" class="ma-1">
              <v-btn outlined fab color="darkgrey" @click="startMusic">
                <v-icon>mdi-play</v-icon>
              </v-btn>
            </div>
            <div v-if="playing" class="ma-1">
              <v-btn outlined fab color="darkgrey" @click="pauseMusic">
                <v-icon>mdi-pause</v-icon>
              </v-btn>
            </div>
            <div class="ma-1">
              <v-btn
                :disabled="totalTime - currentTime < 10 || !isPurcahsed"
                outlined
                fab
                color="darkgrey"
                @click="forwardMusic"
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
                @click="nextMusic"
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
  </div>
</template>

<script>
import ContentMenus from "~/components/atoms/ContentMenus";
import EvaluationActions from "~/components/molecules/EvaluationActions";
import { Cloudinary } from "~/constant";
import MusicsDao from "~/mixins/dao/MusicsDao";
import MusicDetailsDao from "~/mixins/dao/MusicDetailsDao";
import PlayLaterDao from "~/mixins/dao/PlayLaterDao";
import SocialShareButton from "~/components/molecules/SocialShareButton";

export default {
  components: {
    ContentMenus,
    EvaluationActions,
    SocialShareButton,
  },
  mixins: [MusicsDao, MusicDetailsDao, PlayLaterDao],
  props: ["isShow", "music", "musics", "isEditable"],
  data() {
    return {
      isShowMusicPlayerDialog: this.isShow,
      isShowSuccessSnackbar: false,
      successStr: "",
      audioElem: null,
      repeatStatus: 0,
      currentTime: 0,
      totalTime: 0,
      interval: undefined,
      cloudinary: Cloudinary,
      music_: undefined,
      playing: false,
      conetentItems: [
        { value: "sendreport", icon: "mdi-bullhorn", title: "違反を報告" },
      ],
      isLikeds: false,
      likedCounts: 0,
      isPlayLater: false,
      isLikedUpdating: false,
      musicDetails: [],
      isLoadedMusicDetail: false,
    };
  },
  computed: {
    isShowButtons() {
      return (
        !this.isPurcahsed &&
        (!this.music_.notForSale || this.music_.notForSale === false)
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
    musicUrl() {
      return this.music_
        ? `https://res.cloudinary.com/${this.cloudinary.cloudName}/video/upload/${this.music_.musicId}.${this.music_.fileExtension}${this.playingSectionParams}`
        : "";
    },
    playingSectionParams() {
      const secStr = String(parseInt(this.music_.startSeconds) + 45);
      return this.isPurcahsed ? "" : `#t=${this.music_.startSeconds},${secStr}`;
    },
    imgUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${this.music_.imageId}`;
    },
    artistImgUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${this.music_.artistImageId}`;
    },
    hasPrevious() {
      let result = false;
      if (this.playing && this.currentTime >= 1) {
        result = true;
      } else if (this.musics) {
        const idx = this.musics.findIndex((elem) => {
          return elem.musicId === this.music_.musicId;
        });
        result = this.musics[idx - 1] !== undefined;
      }
      return result;
    },
    hasNext() {
      let result = false;
      if (this.musics) {
        const idx = this.musics.findIndex((elem) => {
          return elem.musicId === this.music_.musicId;
        });
        result = this.musics[idx + 1] !== undefined;
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
      set(value) {
        let totalTime = 45;
        if (this.isPurcahsed) {
          totalTime = this.totalTime;
        }
        const time = this.orgFloor((value / 100) * totalTime, 10);
        this.currentTime = time;
        this.audioElem.currentTime = time;
      },
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
    isPurcahsed() {
      return this.music_ ? this.music_.purchasedDatetime !== null : false;
    },
  },
  watch: {
    async isShow(newValue, oldValue) {
      if (this.playing) {
        this.stopMusic();
      }
      this.music_ = undefined;
      this.audioElem = null;
      this.setTotalTime();
      if (this.music) {
        if (!this.music_) {
          this.music_ = this.music;
        }
        this.isShowMusicPlayerDialog = newValue;
        this.isPlayLater = this.checkIsPlayLater();
        this.$emit("showplayer");
        await this.loadMusicDetails();
      }
    },
    isLikeds(newVal, oldVal) {},
    likedCounts(newVal, oldVal) {
      console.log("likedCounts");
      console.log(this.likedCounts);
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
    startMusic() {
      if (!this.audioElem) {
        this.audioElem = this.$refs.audio_elem;
        this.audioElem.preload = true;
      }
      this.audioElem.play();
      this.playing = true;
      this.interval = setInterval(() => {
        if (this.audioElem && this.music_) {
          if (!this.isPurcahsed) {
            this.currentTime =
              this.audioElem.currentTime - parseInt(this.music_.startSeconds);
          } else {
            this.currentTime = this.audioElem.currentTime;
          }
          if (this.currentTime < 0) {
            this.currentTime = 0;
          }
          if (!this.isPurcahsed && this.currentTime >= 45) {
            this.audioEnded();
          }
        }
      }, 10);
      if (this.currentTime < 1) {
        this.MusicsDao_UpdateMusicPlayCounts(this.music_.musicId);
      }
    },
    audioEnded() {
      if (this.isNoRepeat) {
        this.stopMusic();
      } else if (this.isRepeatOnce) {
        this.stopMusic();
        this.$nextTick(() => {
          this.startMusic();
        });
      } else if (this.isRepeatAll) {
        if (this.hasNext) {
          this.nextMusic();
        } else {
          this.music_ = this.musics[0];
          this.$nextTick(() => {
            this.startMusic();
          });
        }
      }
    },
    pauseMusic() {
      if (this.audioElem) {
        this.audioElem.pause();
        this.playing = false;
        clearInterval(this.interval);
      }
    },
    previousMusic() {
      if (this.playing) {
        if (this.currentTime < 1) {
          this.stopMusic();
          this.setPreviousMusic();
        } else {
          this.stopMusic();
          this.startMusic();
        }
      } else {
        this.setPreviousMusic();
      }
    },
    nextMusic() {
      this.playing = false;
      this.setNextMusic();
    },
    backMusic() {
      this.currentTime = this.currentTime - 10;
      this.audioElem.currentTime = this.currentTime;
    },
    forwardMusic() {
      this.currentTime = this.currentTime + 10;
      this.audioElem.currentTime = this.currentTime;
    },
    stopMusic() {
      if (this.audioElem) {
        this.audioElem.pause();
        this.audioElem.load();
        this.playing = false;
        clearInterval(this.interval);
        this.currentTime = 0;
      }
    },
    setTotalTime() {
      if (!this.audioElem) {
        this.audioElem = this.$refs.audio_elem;
      }
      if (this.audioElem) {
        this.audioElem.preload = true;
        this.totalTime = this.isPurcahsed ? this.audioElem.duration : 45;
      }
    },
    setPreviousMusic() {
      this.audioElem = null;
      this.currentTime = 0;
      const idx = this.musics.findIndex((elem) => {
        return elem.musicId === this.music_.musicId;
      });
      this.music_ = this.musics[idx - 1];
      this.$nextTick(() => {
        this.startMusic();
      });
    },
    setNextMusic() {
      this.audioElem = null;
      this.currentTime = 0;
      const idx = this.musics.findIndex((elem) => {
        return elem.musicId === this.music_.musicId;
      });
      this.music_ = this.musics[idx + 1];
      this.$nextTick(() => {
        this.startMusic();
      });
    },
    toSendReportPage() {
      this.$router.push({
        name: "sendreport",
        params: { contentType: "music", contentId: this.music_.musicId },
      });
    },
    async checkIsPlayLater() {
      this.isPlayLater = await this.PlayLaterDao_ExistPlayLater(
        this.music_.musicId
      );
    },
    async addPlayLater() {
      const user = this.$store.state.user.user;
      const sqlResult = await this.PlayLaterDao_UpsertPlayLater(
        user.userId,
        this.music_.musicId
      );
      this.isShowSuccessSnackbar = true;
      this.successStr = "「あとで聴く」に追加しました";
      this.close();
    },
    async removePlayLater() {
      await this.PlayLaterDao_DeletePlayLater(this.music_.musicId);
      this.isShowSuccessSnackbar = true;
      this.successStr = "「あとで聴く」から外しました";
      this.$emit("hide-music", this.music);
      this.close();
    },
    close() {
      if (this.playing) {
        this.stopMusic();
      }
      this.isShowMusicPlayerDialog = false;
      this.music_ = undefined;
      this.audioElem = null;
      this.$emit("close");
    },
    toPurchasePage() {
      this.$router.push({
        name: "fans-purchase",
        params: {
          content: this.music_,
          isMovie: false,
          isMusic: true,
          isPoint: false,
          isPlan: false,
          isTicket: false,
        },
      });
    },
    toMusicEditPage() {
      this.$emit("to-edit");
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
      const contentId = this.music_.musicId;
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
.margin-header {
  margin-top: 56px;
}
.artist-info {
  display: flex;
  justify-content: flex-end;
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
.dialog-content {
  overflow-x: hidden;
}
@media screen and (min-width: 960px) {
  .dialog-wrapper {
    width: 50vw;
    margin-left: auto;
    margin-right: auto;
  }
}
.player-header-music-title {
  font-size: 1.2rem;
}
.player-header-artist-name {
  font-size: 0.9rem;
}
.close-icon {
  transform: scale(-1, 1);
}
.music-description {
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
.music-controller-height {
  height: 141px;
}
.music-progress-bar {
  position: fixed;
  bottom: 137px;
  left: 0;
  width: 100%;
  margin: 0;
  justify-content: center;
}
.music-timer {
  position: fixed;
  bottom: 88px;
  left: 0;
  width: 100%;
  margin: 0;
  background-color: white !important;
  justify-content: space-evenly !important;
}
.no-profile-image {
  object-fit: cover;
}
.font-decoration {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
  white-space: nowrap;
}
.display-block {
  display: block;
}
</style>
