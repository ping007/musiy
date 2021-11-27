<template>
  <div class="edit-music-file">
    <v-tabs
      v-model="tab"
      color="rgba(231, 64, 89, 1)"
      fixed-tabs
      icons-and-text
      class="mb-4"
    >
      <v-tab :key="'movie'" :disabled="selectedTabName !== 'movie'">
        動画ファイル編集
        <v-icon>mdi-movie</v-icon>
      </v-tab>
      <v-tab :key="'music'" :disabled="selectedTabName !== 'music'">
        音楽ファイル編集
        <v-icon>mdi-music</v-icon>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item :key="'movie'">
        <v-container class="mx-0">
          <v-row class="mx-0">
            <UploadMovieFile
              :movie-file-name="movieFileName"
              @uploaded="setMovieObj"
            />
          </v-row>
        </v-container>
      </v-tab-item>
      <v-tab-item v-if="music" :key="'music'">
        <v-row class="title-area-wrapper">
          <v-card-title class="header headline" primary-title>
            <v-row class="mx-0" align="center" justify="start">
              <v-col cols="3">
                <v-avatar size="64px">
                  <img :src="artistImgUrl" :alt="music.artistName" />
                </v-avatar>
              </v-col>
              <v-col class="mt-2" cols="7">
                <v-row>
                  <span class="header-music-title" v-text="music.title"></span>
                </v-row>
                <v-row>
                  <span
                    class="header-artist-name"
                    v-text="music.artistName"
                  ></span>
                </v-row>
              </v-col>
            </v-row>
          </v-card-title>
        </v-row>
        <v-row
          v-if="music && music.imageId"
          class="mx-0"
          align="center"
          justify="center"
        >
          <v-img :src="imgUrl" alt="music image" max-width="100%" />
        </v-row>
        <v-row v-else class="ma-0" align="center" justify="center">
          <v-img
            :src="'/images/no_image.png'"
            alt="music image"
            max-width="100%"
          />
        </v-row>
        <v-tabs
          v-model="musicTab"
          class="mt-8"
          color="rgb(231, 64, 89)"
          fixed-tabs
        >
          <v-tab :key="'editing'" :href="`#tab-editing`">
            <span class="tab-title" v-text="'楽曲情報変更'"></span>
          </v-tab>
          <v-tab :key="'mixing'" :href="`#tab-mixing`">
            <span class="tab-title" v-text="'ミキシング'"></span>
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="musicTab">
          <v-tab-item :key="'editing'" :value="'tab-editing'" class="mx-3">
            <v-container class="mx-0">
              <v-row class="mx-0">
                <UploadMusicFile
                  :music-file-name="musicFileName"
                  @uploaded="setMusicObj"
                />
              </v-row>
              <v-row class="mx-0">
                <span
                  v-text="'楽曲のサムネイル画像を追加・変更できます'"
                ></span>
              </v-row>
              <v-row class="mx-0">
                <UploadImageFile
                  :image-id="music.imageId"
                  @uploaded="setImageObj"
                />
              </v-row>
            </v-container>
          </v-tab-item>
          <v-tab-item :key="'mixing'" :value="'tab-mixing'">
            <v-row v-show="musicLoaded" class="mx-1">
              <v-col cols="12">
                <v-divider />
              </v-col>
              <v-col cols="12">
                <v-row class="text-left" align="center" justify="start">
                  <div class="effect-title" v-text="'Fade In'"></div>
                </v-row>
                <v-row class="text-center" align="center" justify="center">
                  <div class="my-2" v-text="'Fade In 秒数'"></div>
                </v-row>
                <v-row class="text-center" align="center" justify="center">
                  <v-col cols="4">
                    <v-btn
                      :disabled="fadeInSec === 0"
                      outlined
                      fab
                      small
                      color="rgba(231, 64, 89, 1)"
                      @click="changeFadeInSec(-1)"
                    >
                      <v-icon> mdi-minus </v-icon>
                    </v-btn>
                  </v-col>
                  <v-col cols="4">
                    <v-progress-circular
                      :rotate="90"
                      :size="80"
                      :width="8"
                      :value="fadeInSec * 10"
                      :color="fadeIn ? 'rgb(231, 64, 89)' : 'grey'"
                    >
                      {{ fadeInSec }}
                    </v-progress-circular>
                  </v-col>
                  <v-col cols="4">
                    <v-btn
                      :disabled="fadeInSec === 10"
                      outlined
                      fab
                      small
                      color="rgba(231, 64, 89, 1)"
                      @click="changeFadeInSec(1)"
                    >
                      <v-icon> mdi-plus </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <v-divider />
              </v-col>
              <v-col cols="12">
                <v-row class="text-left" align="center" justify="start">
                  <div class="effect-title" v-text="'Fade Out'"></div>
                </v-row>
                <v-row class="text-center" align="center" justify="center">
                  <div class="my-2" v-text="'Fade Out 秒数'"></div>
                </v-row>
                <v-row class="text-center" align="center" justify="center">
                  <v-col cols="4">
                    <v-btn
                      :disabled="fadeOutSec === 0"
                      outlined
                      fab
                      small
                      color="rgb(231, 64, 89)"
                      @click="changeFadeOutSec(-1)"
                    >
                      <v-icon> mdi-minus </v-icon>
                    </v-btn>
                  </v-col>
                  <v-col cols="4">
                    <v-progress-circular
                      :rotate="90"
                      :size="80"
                      :width="8"
                      :value="fadeOutSec * 10"
                      :color="fadeOut ? 'rgb(231, 64, 89)' : 'grey'"
                    >
                      {{ fadeOutSec }}
                    </v-progress-circular>
                  </v-col>
                  <v-col cols="4">
                    <v-btn
                      :disabled="fadeOutSec === 10"
                      outlined
                      fab
                      small
                      color="rgb(231, 64, 89)"
                      @click="changeFadeOutSec(1)"
                    >
                      <v-icon> mdi-plus </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <v-divider />
              </v-col>
              <v-col cols="12">
                <v-row class="text-left" align="center" justify="start">
                  <div class="effect-title" v-text="'Natural Reverb'"></div>
                </v-row>
                <v-row>
                  <v-container id="reverbTypes">
                    <v-overflow-btn
                      v-model="reverbType"
                      class="my-2"
                      :items="reverbTypes"
                      label="タイプを選択"
                      target="#reverbTypes"
                      @change="changeReverbType"
                    />
                  </v-container>
                </v-row>
                <v-row
                  v-show="reverbType"
                  class="text-center"
                  align="center"
                  justify="center"
                >
                  <div class="my-2" v-text="'Reverb Gain Level'"></div>
                </v-row>
                <v-row
                  v-show="reverbType"
                  class="text-center"
                  align="center"
                  justify="center"
                >
                  <v-col cols="4">
                    <v-btn
                      :disabled="naturalReverbGainLevel === 0"
                      outlined
                      fab
                      small
                      color="rgba(231, 64, 89, 1)"
                      @click="changeNaturalReverbGain(-1)"
                    >
                      <v-icon> mdi-minus </v-icon>
                    </v-btn>
                  </v-col>
                  <v-col cols="4">
                    <v-progress-circular
                      :rotate="90"
                      :size="80"
                      :width="8"
                      :value="naturalReverbGainLevel * 10"
                      :color="naturalReverb ? 'rgb(231, 64, 89)' : 'grey'"
                    >
                      {{ naturalReverbGainLevel }}
                    </v-progress-circular>
                  </v-col>
                  <v-col cols="4">
                    <v-btn
                      :disabled="naturalReverbGainLevel === 10"
                      outlined
                      fab
                      small
                      color="rgb(231, 64, 89)"
                      @click="changeNaturalReverbGain(1)"
                    >
                      <v-icon> mdi-plus </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <v-divider />
              </v-col>
              <v-col cols="12">
                <v-row class="text-left" align="center" justify="start">
                  <div class="effect-title" v-text="'Digital Reverb'"></div>
                </v-row>
                <v-row class="text-center" align="center" justify="center">
                  <div class="my-2" v-text="'Reverb Gain Level'"></div>
                </v-row>
                <v-row class="text-center" align="center" justify="center">
                  <v-col cols="4">
                    <v-btn
                      :disabled="digitalReverbGainLevel === 0"
                      outlined
                      fab
                      small
                      color="rgb(231, 64, 89)"
                      @click="changeDigitalReverbGain(-1)"
                    >
                      <v-icon> mdi-minus </v-icon>
                    </v-btn>
                  </v-col>
                  <v-col cols="4">
                    <v-progress-circular
                      :rotate="90"
                      :size="80"
                      :width="8"
                      :value="digitalReverbGainLevel * 10"
                      :color="digitalReverb ? 'rgb(231, 64, 89)' : 'grey'"
                    >
                      {{ digitalReverbGainLevel }}
                    </v-progress-circular>
                  </v-col>
                  <v-col cols="4">
                    <v-btn
                      :disabled="digitalReverbGainLevel === 10"
                      outlined
                      fab
                      small
                      color="rgba(231, 64, 89, 1)"
                      @click="changeDigitalReverbGain(1)"
                    >
                      <v-icon> mdi-plus </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <v-divider />
              </v-col>
              <v-col cols="12">
                <v-row align="center" justify="center">
                  <a
                    class="no-text-decoration"
                    download="recorded.webm"
                    :href="editedDataUrl"
                  >
                    <v-btn
                      :disabled="!editedDataUrl"
                      rounded
                      large
                      width="100%"
                      class="ma-0 msy-color-red msy-color-text-white"
                      color="rgb(231, 64, 89)"
                      v-text="'編集結果をダウンロードする'"
                    />
                  </a>
                </v-row>
              </v-col>
            </v-row>
            <v-row v-show="musicLoaded" class="mx-0">
              <v-row class="music-progress-bar" align="center">
                <v-progress-linear
                  v-model="progressValue"
                  color="#e74059"
                  query
                />
              </v-row>
              <v-row class="music-timer" align="center">
                <v-col class="text-center">
                  <span
                    class="default-font default-font-size"
                    v-text="currentTimeStr + '/' + totalTimeStr"
                  ></span>
                </v-col>
              </v-row>
              <v-spacer class="music-controller-height" />
              <v-row class="controls" align="center">
                <div v-if="!playing" class="ma-1">
                  <v-btn outlined fab color="darkgrey" @click="startMusic">
                    <v-icon>mdi-play</v-icon>
                  </v-btn>
                </div>
                <div v-if="playing" class="ma-1">
                  <v-btn outlined fab color="darkgrey" @click="stopMusic">
                    <v-icon>mdi-stop</v-icon>
                  </v-btn>
                </div>
              </v-row>
            </v-row>
          </v-tab-item>
        </v-tabs-items>
      </v-tab-item>
    </v-tabs-items>
    <div
      v-show="musicTab !== 'tab-mixing'"
      class="my-12 mx-0 music-detail-edit-area"
      align="center"
      justify="center"
    >
      <v-form ref="form">
        <div>
          <ContentDetailInfoForm
            :title="title"
            :description="description"
            :genre="genre"
            :price="price"
            :start-seconds="startSeconds"
            :music-details="musicDetails"
            :is-arrow-zero-price="isArrowZeroPrice"
            @changed="hasChanges = true"
            @update:title="title = $event"
            @update:description="description = $event"
            @update:genre="genre = $event"
            @update:price="price = parseInt($event)"
            @update:start-seconds="startSeconds = parseInt($event)"
            @update:music-details="musicDetails = $event"
            @update:deleted-music-details="deletedMusicDetails = $event"
          />
        </div>
        <v-row class="mx-1">
          <ContentAllowSelect
            ref="contentAllowSelect"
            :rules="[rules.required]"
            :plans="plans"
            :selected-allow-type="selectedAllowType"
            :selected-plan-id-already="selectedPlanId"
            @change="hasChanges = true"
            @allow-type="
              (data) => {
                selectedAllowType = data;
                selectedPlan =
                  selectedAllowType !== contentAllowType.Supporters
                    ? undefined
                    : selectedPlan;
              }
            "
            @plan-selected="
              (data) => {
                selectedPlan = data;
              }
            "
          />
        </v-row>
        <v-row class="mx-1">
          <v-checkbox
            v-model="sendMailCheck"
            :label="`プラン対象者に通知のメールを送る`"
          />
        </v-row>
      </v-form>
      <v-row class="mx-3">
        <v-switch
          v-model="isShow"
          inset
          color="rgb(231, 64, 89)"
          :label="'公開する'"
          @change="hasChanges = true"
        />
      </v-row>
      <v-row class="mx-1 my-4" justify="center" align="center">
        <v-btn
          v-if="!isUpdating"
          rounded
          large
          width="100%"
          class="ma-0 msy-color-red msy-color-text-white"
          color="rgb(231, 64, 89)"
          @click="execSave"
          v-text="'更新する'"
        />
        <v-progress-circular
          v-if="isUpdating"
          indeterminate
          :size="24"
          :width="3"
          :rotate="360"
          color="rgb(231, 64, 89)"
        />
      </v-row>
    </div>
    <audio
      v-if="music"
      v-show="musicLoaded"
      ref="audio_elem"
      :width="'100%'"
      preload="true"
      :src="musicUrl"
      @loadedmetadata="setTotalTime"
    ></audio>
    <Loading v-model="loadingValue" />
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
import YsdMediaProcessor from "ysd-media-processor";
import Loading from "~/components/molecules/Loading";
import UploadMovieFile from "~/components/molecules/UploadMovieFile";
import UploadMusicFile from "~/components/molecules/UploadMusicFile";
import UploadImageFile from "~/components/molecules/UploadImageFile";
import ContentAllowSelect from "~/components/molecules/ContentAllowSelect";
import ContentDetailInfoForm from "~/components/molecules/ContentDetailInfoForm";
import MoviesDao from "~/mixins/dao/MoviesDao";
import MusicsDao from "~/mixins/dao/MusicsDao";
import MusicDetailsDao from "~/mixins/dao/MusicDetailsDao";
import PlansDao from "~/mixins/dao/PlansDao";
import AllowedContentsDao from "~/mixins/dao/AllowedContentsDao";
import NotificationsService from "~/mixins/service/NotificationsService";
import {
  ValidateRules,
  Cloudinary,
  ContentAllowType,
  CacheKeys,
} from "~/constant";
import axios from "~/plugins/axios";
import SupportersDao from "~/mixins/dao/SupportersDao";
import LocalStorageService from "~/mixins/service/LocalStorageService";

export default {
  layout: "artistNoFooter",
  components: {
    Loading,
    UploadMovieFile,
    UploadMusicFile,
    UploadImageFile,
    ContentAllowSelect,
    ContentDetailInfoForm,
  },
  mixins: [
    MoviesDao,
    MusicsDao,
    MusicDetailsDao,
    PlansDao,
    AllowedContentsDao,
    NotificationsService,
    SupportersDao,
    LocalStorageService,
  ],
  data() {
    return {
      tab: null,
      selectedTabName: "movie",
      musicTab: "editing",
      movie: undefined,
      moviefile: undefined,
      music: undefined,
      musicfile: undefined,
      mediaProcessor: undefined,
      downloading: false,
      progressDownload: 0,
      volumeBox: undefined,
      convolverReverbBox: undefined,
      schroederReverbBox: undefined,
      movieLoaded: false,
      musicLoaded: false,
      audioElem: null,
      currentTime: 0,
      totalTime: 0,
      cloudinary: Cloudinary,
      playing: false,
      fadeInSec: 0,
      fadeOutSec: 0,
      naturalReverbGainLevel: 0,
      reverbTypes: undefined,
      reverbType: undefined,
      digitalReverbGainLevel: 0,
      editedDataUrl: undefined,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      loadingValue: 0,
      rules: ValidateRules,
      contentAllowType: ContentAllowType,
      hasChanges: false,
      movieObject: {},
      selectedAllowType: ContentAllowType.All,
      // for music
      musicObject: {},
      imageObject: {},
      imageId: "",
      startSeconds: 0,
      title: "",
      description: "",
      genre: undefined,
      price: 0,
      isShow: false,
      allowType: undefined,
      plans: [],
      movieFileName: "",
      musicFileName: "",
      fileExtension: "",
      selectedPlanId: undefined,
      selectedOldPlanId: undefined,
      // for music details
      musicDetails: [],
      deletedMusicDetails: [],
      copyrightType: undefined,
      isUpdating: false,
      sendMailCheck: false,
      cacheKeys: CacheKeys,
    };
  },
  computed: {
    movieUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/video/upload/${this.movie.movieId}.mp4`;
    },
    musicUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/video/upload/${this.music.musicId}.${this.music.fileExtension}`;
    },
    imgUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${this.music.imageId}`;
    },
    artistImgUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${this.music.artistImageId}`;
    },
    fadeIn() {
      return this.fadeInSec > 0;
    },
    fadeOut() {
      return this.fadeOutSec > 0;
    },
    naturalReverb() {
      return this.naturalReverbGainLevel > 0;
    },
    digitalReverb() {
      return this.digitalReverbGainLevel > 0;
    },
    progressValue: {
      get() {
        return this.totalTime > 0
          ? this.orgFloor((this.currentTime / this.totalTime) * 100, 10)
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
      if (this.totalTime > 0) {
        let sec = "0" + Math.floor(this.totalTime % 60); // 秒数
        let min = "0" + Math.floor(this.totalTime / 60); // 分数
        sec = sec.substr(sec.length - 2, 2);
        min = min.substr(min.length - 2, 2);
        result = min + ":" + sec;
      }
      return result;
    },
    isArrowZeroPrice() {
      return this.selectedAllowType === ContentAllowType.Supporters;
    },
  },
  async created() {
    try {
      if (this.$route.params.selectedTab === "movie") {
        this.tab = 0;
      } else if (this.$route.params.selectedTab === "music") {
        this.tab = 1;
      }
      this.selectedTabName = this.$route.params.selectedTab;
      if (this.selectedTabName && this.$route.params.content) {
        if (this.selectedTabName === "movie") {
          this.movie = this.$route.params.content;
        } else if (this.selectedTabName === "music") {
          this.music = this.$route.params.content;
        }
        this.prepareContentInfo();
        this.loadingValue = 0;
        await this.loadContentFile();
        this.loadingValue = 20;
        await this.loadPlans();
        this.loadingValue = 40;
        await this.loadSelectedPlan();
        this.loadingValue = 60;
        await this.loadMusiDetails();
        this.loadingValue = 80;
        if (this.selectedPlanId) {
          this.execSelectedPlan();
        }
        const user = this.$store.state.user.user;
        this.sendMailCheck =
          this.LocalStorageService_FetchFromLocalStorageByUser(
            this.cacheKeys.sendMailCheckEditContentFileCacheKeyPrefix,
            user.userId
          );
        this.loadingValue = 100;
      } else {
        this.$router.push({
          name: "artists-main",
        });
        this.loadingValue = 100;
      }
    } catch (error) {
      this.loadingValue = 100;
    }
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
    prepareContentInfo() {
      let content;
      if (this.selectedTabName === "movie") {
        content = this.movie;
      } else if (this.selectedTabName === "music") {
        content = this.music;
      }
      this.startSeconds = parseInt(content.startSeconds);
      this.title = content.title;
      this.description = content.description;
      this.genre = content.genre.split(",");
      this.price = parseInt(content.price);
      this.isShow = content.isShow;
      this.selectedAllowType = parseInt(content.allowType);

      if (this.selectedTabName === "movie") {
        this.movieFileName = `${this.movie.movieId}.mp4`;
        if (this.movie.movieId) {
          this.movieObject = {
            movieId: this.movie.movieId,
          };
        }
      } else if (this.selectedTabName === "music") {
        this.fileExtension = this.music.fileExtension;
        this.musicFileName = `${this.music.musicId}.${this.fileExtension}`;
        if (this.music.musicId) {
          this.musicObject = {
            musicId: this.music.musicId,
            fileExtension: this.fileExtension,
          };
        }
        this.imageObject = {
          imageId: this.music.imageId ? this.music.imageId : "",
        };
      }
    },
    async loadContentFile() {
      this.downloading = true;
      const config = {
        onDownloadProgress: (progressEvent) => {
          this.progressDownload = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        },
      };
      if (this.selectedTabName === "movie") {
        this.downloading = false;
        this.movieLoaded = true;
      } else if (this.selectedTabName === "music") {
        const res = await axios.get(
          this.musicUrl,
          {
            responseType: "arraybuffer",
          },
          config
        );
        if (res.status === 200 && res.data) {
          this.mediaProcessor = new YsdMediaProcessor();
          this.mediaProcessor.setArrayBuffer(res.data).then(() => {
            this.downloading = false;
            this.musicLoaded = true;
            this.volumeBox = this.mediaProcessor.getVolumeBox();
            this.convolverReverbBox =
              this.mediaProcessor.getConvolverReverbBox();
            this.reverbTypes = [];
            this.convolverReverbBox.getReverbTypes().forEach((reverbType) => {
              this.reverbTypes.push({ text: reverbType, value: reverbType });
            });
            this.schroederReverbBox =
              this.mediaProcessor.getSchroederReverbBox();
            if (window.MediaRecorder) {
              this.mediaProcessor.setOnRecordingFinishedCallback((dataUrl) => {
                this.editedDataUrl = dataUrl;
              });
            } else {
              this.isShowErrorSnackbar = true;
              this.errorStr =
                "申し訳ありませんがご利用のブラウザの制限により、編集結果を保存できないため本機能を利用できません。";
            }
          });
        }
      }
    },
    setTotalTime() {
      if (!this.audioElem) {
        this.audioElem = this.$refs.audio_elem;
      }
      if (this.audioElem) {
        this.audioElem.preload = true;
        this.totalTime = this.audioElem.duration;
        console.log("totalTime", this.totalTime);
      }
    },
    changeFadeInSec(val) {
      if (
        (this.fadeInSec === 0 && val === 1) ||
        (this.fadeInSec === 1 && val === -1)
      ) {
        this.mediaProcessor.toggleFadeIn();
      }
      if (this.fadeInSec + val >= 0 && this.fadeInSec + val <= 10) {
        this.fadeInSec = this.fadeInSec + val;
        if (this.volumeBox) {
          this.volumeBox.setFadeInDuration(Number(this.fadeInSec));
        }
      }
    },
    changeFadeOutSec(val) {
      if (
        (this.fadeOutSec === 0 && val === 1) ||
        (this.fadeOutSec === 1 && val === -1)
      ) {
        this.mediaProcessor.toggleFadeOut();
      }
      if (this.fadeOutSec + val >= 0 && this.fadeOutSec + val <= 10) {
        this.fadeOutSec = this.fadeOutSec + val;
        if (this.volumeBox) {
          this.volumeBox.setFadeOutStartTime(
            Number(this.totalTime - this.fadeOutSec)
          );
          this.volumeBox.setFadeOutDuration(Number(this.fadeOutSec));
        }
      }
    },
    changeReverbType() {
      if (this.convolverReverbBox) {
        this.convolverReverbBox.setReverbType(this.reverbType);
      }
    },
    changeNaturalReverbGain(val) {
      if (
        (this.naturalReverbGainLevel === 0 && val === 1) ||
        (this.naturalReverbGainLevel === 1 && val === -1)
      ) {
        this.mediaProcessor.toggleConvolverReverb();
      }
      if (
        this.naturalReverbGainLevel + val >= 0 &&
        this.naturalReverbGainLevel + val <= 10
      ) {
        this.naturalReverbGainLevel = this.naturalReverbGainLevel + val;
        if (this.convolverReverbBox) {
          this.convolverReverbBox.setOutputGain(
            Number(this.naturalReverbGainLevel)
          );
        }
      }
    },
    changeDigitalReverbGain(val) {
      if (
        (this.digitalReverbGainLevel === 0 && val === 1) ||
        (this.digitalReverbGainLevel === 1 && val === -1)
      ) {
        this.mediaProcessor.toggleSchroederReverb();
      }
      if (
        this.digitalReverbGainLevel + val >= 0 &&
        this.digitalReverbGainLevel + val <= 10
      ) {
        this.digitalReverbGainLevel = this.digitalReverbGainLevel + val;
        if (this.schroederReverbBox) {
          this.schroederReverbBox.setOutputGain(
            Number(this.digitalReverbGainLevel)
          );
        }
      }
    },
    startMusic() {
      if (this.mediaProcessor) {
        this.mediaProcessor.start();
        this.playing = true;
        this.mediaProcessor.setOnPlayTimeIncrementedCallback((playTime) => {
          this.currentTime = playTime;
        });
        this.mediaProcessor.setOnEndedCallback((playTime) => {
          this.mediaProcessor.stop();
          this.playing = false;
          this.currentTime = 0;
        });
      }
    },
    stopMusic() {
      if (this.mediaProcessor) {
        this.mediaProcessor.stop();
        this.playing = false;
        this.currentTime = 0;
      }
    },
    setMovieObj(movieObject) {
      this.movieObject = movieObject;
      this.hasChanges = true;
    },
    setMusicObj(musicObject) {
      this.musicObject = musicObject;
      this.hasChanges = true;
    },
    setImageObj(imageObject) {
      this.imageObject = imageObject;
      this.hasChanges = true;
    },
    async execSave() {
      const user = this.$store.state.user.user;
      this.LocalStorageService_StoreToLocalStorageByUser(
        this.cacheKeys.sendMailCheckEditContentFileCacheKeyPrefix,
        user.userId,
        this.sendMailCheck
      );
      if (this.selectedTabName === "movie") {
        if (this.movieObject.movieId) {
          if (this.$refs.form.validate()) {
            await this.saveMovie();
          } else {
            this.isShowErrorSnackbar = true;
            this.errorStr = "入力値が不正です。確認してください";
          }
        } else {
          this.isShowErrorSnackbar = true;
          this.errorStr = "動画が登録されていません";
        }
      } else if (this.selectedTabName === "music") {
        if (this.musicObject.musicId) {
          if (this.$refs.form.validate()) {
            await this.saveMusic();
          } else {
            this.isShowErrorSnackbar = true;
            this.errorStr = "入力値が不正です。確認してください";
          }
        } else {
          this.isShowErrorSnackbar = true;
          this.errorStr = "楽曲が登録されていません";
        }
      }
    },
    async saveMovie() {
      const user = this.$store.state.user.user;
      const movieId = this.movieObject.movieId;
      const userId = user.userId;
      const title = this.title;
      const description = this.description;
      const genre = this.genre && this.genre !== "" ? this.genre.join(",") : "";
      const price = this.price;
      const copyrightType = this.copyrightType;
      const startSeconds = this.startSeconds;
      const allowType = this.selectedAllowType;
      const isShow = this.isShow;
      const crUserId = user.userId;
      const upUserId = user.userId;
      const sendMailCheck = this.sendMailCheck;
      try {
        this.loadingValue = 0;
        await this.MoviesDao_UpsertMovie(
          movieId,
          userId,
          title,
          description,
          genre,
          price,
          copyrightType,
          startSeconds,
          allowType,
          isShow,
          crUserId,
          upUserId
        );
        this.loadingValue = 30;
        await this.saveMusicDetails(movieId);
        this.loadingValue = 50;
        await this.saveAllowedContent(movieId);
        this.loadingValue = 70;
        if (sendMailCheck && this.selectedPlan && this.selectedPlan.planId) {
          await this.SupportersDao_SendMailWhenContentUploadByPlanId(
            this.selectedPlan.planId,
            movieId,
            "movie"
          );
        }
        this.hasChanges = false;
        this.isShowSuccessSnackbar = true;
        this.loadingValue = 100;
        this.successStr =
          "動画情報の保存が完了しました。マイムービーページへ移動します";
        setTimeout(() => {
          this.toArtistMyMoviesPage();
        }, 2000);
      } catch (error) {
        console.error(error);
        this.isShowErrorSnackbar = true;
        this.errorStr = "動画の保存に失敗しました";
        this.loadingValue = 100;
      }
    },
    async saveMusic() {
      this.isUpdating = true;
      const user = this.$store.state.user.user;
      const musicId = this.musicObject.musicId;
      const fileExtension = this.musicObject.fileExtension;
      const userId = user.userId;
      const imageId = this.imageObject.imageId ? this.imageObject.imageId : "";
      const title = this.title;
      const description = this.description;
      const genre = this.genre && this.genre !== "" ? this.genre.join(",") : "";
      const price = this.price;
      const copyrightType = this.copyrightType;
      const startSeconds = this.startSeconds;
      const allowType = this.selectedAllowType;
      const isShow = this.isShow;
      const crUserId = user.userId;
      const upUserId = user.userId;
      const sendMailCheck = this.sendMailCheck;
      try {
        this.loadingValue = 0;
        await this.MusicsDao_UpsertMusic(
          musicId,
          userId,
          imageId,
          title,
          description,
          genre,
          price,
          copyrightType,
          startSeconds,
          fileExtension,
          allowType,
          isShow,
          crUserId,
          upUserId
        );
        this.loadingValue = 30;
        await this.saveMusicDetails(musicId);
        this.loadingValue = 50;
        await this.saveAllowedContents(musicId);
        this.loadingValue = 70;
        if (sendMailCheck && this.selectedPlan && this.selectedPlan.planId) {
          await this.SupportersDao_SendMailWhenContentUploadByPlanId(
            this.selectedPlan.planId,
            musicId,
            "music"
          );
        }
        this.hasChanges = false;
        this.isUpdating = false;
        this.loadingValue = 100;
        this.isShowSuccessSnackbar = true;
        this.successStr =
          "楽曲情報の保存が完了しました。マイミュージックページへ移動します";
        setTimeout(() => {
          this.toArtistMyMusicsPage();
        }, 2000);
      } catch (error) {
        console.error(error);
        this.isShowErrorSnackbar = true;
        this.errorStr = "楽曲の保存に失敗しました";
        this.isUpdating = false;
        this.loadingValue = 100;
      }
    },
    async saveMusicDetails(parentContentId) {
      if (this.deletedMusicDetails && this.deletedMusicDetails.length > 0) {
        this.deletedMusicDetails.forEach(async (deletedMusicDetail) => {
          if (deletedMusicDetail.musicDetailId) {
            await this.MusicDetailsDao_DeleteMusicDetail(
              deletedMusicDetail.musicDetailId
            );
          }
        });
      }
      const results = [];
      this.musicDetails.forEach((musicDetail) => {
        musicDetail.parentContentId = parentContentId;
        results.push(
          this.MusicDetailsDao_UpsertMusicDetail(
            musicDetail.musicDetailId,
            musicDetail.parentContentId,
            musicDetail.musicDetailTitle,
            musicDetail.musicDetailDescription,
            musicDetail.copyrightType,
            musicDetail.copyrightCode,
            musicDetail.composer,
            musicDetail.arranger,
            musicDetail.lyricist
          )
        );
      });
      return await Promise.all(results);
    },
    async saveAllowedContents(contentId) {
      if (this.selectedOldPlanId && !this.selectedPlan) {
        await this.AllowedContentsDao_DeleteAllowedContent(
          contentId,
          this.selectedOldPlanId
        );
      } else if (
        this.selectedPlan &&
        this.selectedPlan.planId !== this.selectedOldPlanId
      ) {
        await this.AllowedContentsDao_DeleteAllowedContent(
          contentId,
          this.selectedOldPlanId
        );
        this.saveAllowedContent(contentId);
      } else if (
        this.selectedPlan &&
        this.selectedPlan.planId &&
        !this.selectedOldPlanId
      ) {
        this.saveAllowedContent(contentId);
      }
    },
    async saveAllowedContent(contentId) {
      const allowPlanId = this.selectedPlan
        ? this.selectedPlan.planId
        : undefined;
      const allowPlanName = this.selectedPlan
        ? this.selectedPlan.planName
        : undefined;
      const allowPlanPrice = this.selectedPlan
        ? parseInt(this.selectedPlan.planPrice)
        : 0;
      if (allowPlanId) {
        await this.AllowedContentsDao_UpsertAllowedContent(
          contentId,
          allowPlanId,
          allowPlanName,
          allowPlanPrice
        );
      }
    },
    toArtistMyMoviesPage() {
      this.$router.push({
        name: "artists-mymovies",
      });
    },
    toArtistMyMusicsPage() {
      this.$router.push({
        name: "artists-mymusics",
      });
    },
    async loadPlans() {
      const user = this.$store.state.user.user;
      if (user) {
        const artistUserId = user.userId;
        this.plans = await this.PlansDao_SelectPlansByUserId(artistUserId);
      }
    },
    async loadSelectedPlan() {
      let contentId = "";
      if (this.selectedTabName === "movie") {
        contentId = this.movie.movieId;
      } else if (this.selectedTabName === "music") {
        contentId = this.music.musicId;
      }
      const selectedPlan =
        await this.AllowedContentsDao_SelectAllowedContentByContentId(
          contentId
        );
      this.selectedPlanId = selectedPlan.planId ? selectedPlan.planId : "";
      this.selectedOldPlanId = this.selectedPlanId;
    },
    execSelectedPlan() {
      this.$refs.contentAllowSelect.selectedPlan();
    },
    async loadMusiDetails() {
      let contentId = "";
      if (this.selectedTabName === "movie") {
        contentId = this.movie.movieId;
      } else if (this.selectedTabName === "music") {
        contentId = this.music.musicId;
      }
      this.musicDetails =
        await this.MusicDetailsDao_SelectMusicDetailsByParentContentId(
          contentId
        );
      console.log("this.musicDetails", this.musicDetails);
      if (!this.musicDetails) {
        this.musicDetails = [];
      }
      this.musicDetails = this.musicDetails.reverse();
    },
  },
};
</script>

<style lang="scss" scoped>
.title-area-wrapper {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
}
.header {
  position: absolute;
  width: 100%;
  z-index: 1;
  color: #ffffff;
  margin: 0;
  padding: 0 12px;
  text-shadow: 0 3px 4px rgba(0, 0, 0, 1);
  background: rgba(0, 0, 0, 0.3);
}
.header-music-title {
  font-size: 1.4rem;
}
.header-artist-name {
  font-size: 0.9rem;
}
.edit-music-file {
  touch-action: manipulation;
}
.effect-title {
  font-size: 1.2rem;
  margin-left: 8px;
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
.no-text-decoration {
  text-decoration: none;
}
.music-controller-height {
  height: 155px;
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
</style>
