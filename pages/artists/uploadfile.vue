<template>
  <div>
    <v-container class="artists-uploadfile" :fluid="true">
      <v-row class="mx-1 mb-5">
        <span class="title" v-text="'ファイルアップロード'"></span>
      </v-row>
      <v-tabs
        v-model="tab"
        color="rgba(231, 64, 89, 1)"
        fixed-tabs
        icons-and-text
      >
        <v-tab :key="'movie'">
          動画ファイル
          <v-icon>mdi-movie</v-icon>
        </v-tab>
        <v-tab :key="'music'">
          音楽ファイル
          <v-icon>mdi-music</v-icon>
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item :key="'movie'">
          <v-container>
            <v-row>
              <UploadMovieFile @uploaded="setMovieObj" />
            </v-row>
          </v-container>
        </v-tab-item>
        <v-tab-item :key="'music'">
          <v-container>
            <v-row>
              <UploadMusicFile @uploaded="setMusicObj" />
            </v-row>
            <v-row class="mx-1">
              <span v-text="'楽曲のサムネイル画像を追加できます'"></span>
            </v-row>
            <v-row>
              <UploadImageFile @uploaded="setImageObj" />
            </v-row>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
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
          />
        </div>
        <v-row class="mx-1">
          <ContentAllowSelect
            :rules="[rules.required]"
            :plans="plans"
            @change="hasChanges = true"
            @allow-type="
              (data) => {
                selectedAllowType = data;
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
      <v-row class="mx-1 py-5 my-5">
        <v-switch
          v-model="isShow"
          inset
          color="rgb(231, 64, 89)"
          :label="'登録と同時に公開する'"
          @change="hasChanges = true"
        />
      </v-row>
      <v-row class="mx-1 py-5 my-5">
        <v-btn
          block
          dark
          class="msy-color-red"
          large
          @click="execSave"
          v-text="'登録する'"
        />
      </v-row>
    </v-container>
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
    <PreventUnload :when="hasChanges" />
  </div>
</template>

<script>
import PreventUnload from "vue-prevent-unload";
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
import { ValidateRules, ContentAllowType, CacheKeys } from "~/constant.js";
import SupportersDao from "~/mixins/dao/SupportersDao";
import LocalStorageService from "~/mixins/service/LocalStorageService";

export default {
  layout: "artist",
  components: {
    Loading,
    ContentAllowSelect,
    ContentDetailInfoForm,
    UploadMovieFile,
    UploadMusicFile,
    UploadImageFile,
    PreventUnload,
  },
  mixins: [
    AllowedContentsDao,
    MoviesDao,
    MusicsDao,
    MusicDetailsDao,
    PlansDao,
    NotificationsService,
    SupportersDao,
    LocalStorageService,
  ],
  data() {
    return {
      tab: null,
      hasChanges: false,
      rules: ValidateRules,
      contentAllowType: ContentAllowType,
      title: undefined,
      description: undefined,
      genre: undefined,
      copyrightType: undefined,
      movieObject: undefined,
      musicObject: undefined,
      imageObject: undefined,
      musicDetails: undefined,
      composer: undefined,
      arranger: undefined,
      selectedPlan: undefined,
      selectedAllowType: ContentAllowType.All,
      price: 0,
      startSeconds: 0,
      isShow: false,
      plans: [],
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      loadingValue: 0,
      sendMailCheck: false,
      cacheKeys: CacheKeys,
    };
  },
  computed: {
    isArrowZeroPrice() {
      return this.selectedAllowType === ContentAllowType.Supporters;
    },
  },
  async created() {
    this.initMusic();
    if (this.$route.params.selectedTab === "movie") {
      this.tab = 0;
    } else if (this.$route.params.selectedTab === "music") {
      this.tab = 1;
    }
    await this.loadPlans();
    const user = this.$store.state.user.user;
    this.sendMailCheck = this.LocalStorageService_FetchFromLocalStorageByUser(
      this.cacheKeys.sendMailCheckUploadFileCacheKeyPrefix,
      user.userId
    );
    this.loadingValue = 100;
  },
  methods: {
    initMusic() {
      this.title = "";
      this.description = "";
      this.genre = "";
      this.copyrightType = "";
      this.movieObject = {};
      this.musicObject = {};
      this.imageObject = {};
      this.musicDetails = [];
      this.price = 0;
      this.startSeconds = 0;
      this.isShow = false;
    },
    async loadPlans() {
      const user = this.$store.state.user.user;
      if (user) {
        const artistUserId = user.userId;
        this.plans = await this.PlansDao_SelectPlansByUserId(artistUserId);
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
    setMovieObj(movieObject) {
      this.movieObject = movieObject;
      this.hasChanges = true;
    },
    setMusicObj(musicObject) {
      this.musicObject = musicObject;
      this.hasChanges = true;
      console.log(musicObject);
    },
    setImageObj(imageObject) {
      this.imageObject = imageObject;
      this.hasChanges = true;
    },
    async execSave() {
      const user = this.$store.state.user.user;
      this.LocalStorageService_StoreToLocalStorageByUser(
        this.cacheKeys.sendMailCheckUploadFileCacheKeyPrefix,
        user.userId,
        this.sendMailCheck
      );
      if (this.tab === 0) {
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
      } else if (this.musicObject.musicId) {
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
        this.NotificationsService_addNewMovieNotification(user, title);
        this.hasChanges = false;
        this.loadingValue = 100;
        this.isShowSuccessSnackbar = true;
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
        const sqlResult = await this.MusicsDao_UpsertMusic(
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
        await this.saveAllowedContent(musicId);
        this.loadingValue = 70;
        if (sendMailCheck && this.selectedPlan && this.selectedPlan.planId) {
          await this.SupportersDao_SendMailWhenContentUploadByPlanId(
            this.selectedPlan.planId,
            musicId,
            "music"
          );
        }
        this.NotificationsService_addNewMusicNotification(user, title, imageId);
        this.hasChanges = false;
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
        this.loadingValue = 100;
      }
    },
    async saveMusicDetails(parentContentId) {
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
        const sqlResult = await this.AllowedContentsDao_UpsertAllowedContent(
          contentId,
          allowPlanId,
          allowPlanName,
          allowPlanPrice
        );
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.hasChanges) {
      const answer = window.confirm(
        "保存されていないデータがあります。ページを移動してよろしいですか？"
      );
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
};
</script>

<style lang="scss" scoped>
.artists-uploadfile {
  margin-bottom: 64px;
}
</style>
