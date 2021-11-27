<template>
  <div>
    <v-container class="artists-createfeed" :fluid="true">
      <v-form ref="form">
        <v-row class="mx-1 mb-5">
          <span
            class="title"
            v-text="mode === 'create' ? '新規投稿' : '投稿を編集'"
          ></span>
        </v-row>
        <v-row class="mx-1">
          <v-text-field
            v-model="title"
            :rules="[rules.required]"
            label="タイトル"
            @change="hasChanges = true"
          />
        </v-row>
        <v-row class="mx-1">
          <v-textarea
            v-model="feedContent"
            label="本文"
            @change="hasChanges = true"
          />
        </v-row>
        <v-row class="mx-1">
          <ContentAllowSelect
            :rules="[rules.required]"
            :plans="plans"
            @change="hasChanges = true"
            @allow-type="
              (data) => {
                allowType = data;
              }
            "
            @plan-selected="
              (data) => {
                selectedPlan = data;
              }
            "
          />
        </v-row>
        <v-row>
          <UploadImageFile
            :image-id="imageObject.imageId"
            @uploaded="setImageObj"
          />
        </v-row>
        <v-row>
          <UploadMusicFile
            :music-id="musicObject.musicId"
            @uploaded="setMusicObj"
          />
        </v-row>
        <v-row>
          <UploadMovieFile
            :movie-id="movieObject.movieId"
            @uploaded="setMovieObj"
          />
        </v-row>
        <v-row class="mx-1 py-5 my-5">
          <v-btn
            v-if="mode === 'create'"
            block
            dark
            class="msy-color-red"
            large
            @click="execSave"
            v-text="'投稿する'"
          />
          <v-btn
            v-if="mode === 'edit'"
            block
            dark
            class="msy-color-red"
            large
            @click="execEditSave"
            v-text="'変更を保存する'"
          />
        </v-row>
      </v-form>
    </v-container>
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
import UploadMovieFile from "~/components/molecules/UploadMovieFile";
import UploadMusicFile from "~/components/molecules/UploadMusicFile";
import UploadImageFile from "~/components/molecules/UploadImageFile";
import ContentAllowSelect from "~/components/molecules/ContentAllowSelect";
import { ValidateRules, ContentAllowType } from "~/constant.js";
import FeedsDao from "~/mixins/dao/FeedsDao";
import PlansDao from "~/mixins/dao/PlansDao";
import AllowedContentsDao from "~/mixins/dao/AllowedContentsDao";
import NotificationsService from "~/mixins/service/NotificationsService";
export default {
  layout: "artist",
  components: {
    ContentAllowSelect,
    UploadMovieFile,
    UploadMusicFile,
    UploadImageFile,
    PreventUnload,
  },
  mixins: [FeedsDao, PlansDao, AllowedContentsDao, NotificationsService],
  data() {
    return {
      mode: "create",
      rules: ValidateRules,
      contentAllowType: ContentAllowType,
      hasChanges: false,
      feedId: undefined,
      title: undefined,
      feedContent: undefined,
      selectedPlan: undefined,
      movieObject: undefined,
      musicObject: undefined,
      imageObject: undefined,
      allowType: ContentAllowType.All,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      plans: [],
    };
  },
  async created() {
    const mode = this.$route.params.mode;
    const feedData = this.$route.params.data;
    if (mode && mode === "edit" && feedData) {
      this.mode = mode;
      this.setEditData(feedData);
    } else {
      this.initFeed();
    }
    await this.loadPlans();
  },
  methods: {
    initFeed() {
      this.title = "";
      this.feedContent = "";
      this.feedContentPrice = 0;
      this.allowType = this.contentAllowType.All;
      this.movieObject = {};
      this.musicObject = {};
      this.imageObject = {};
    },
    setEditData(feedData) {
      this.feedId = feedData.feedId;
      this.title = feedData.title;
      this.feedContent = feedData.feedContent;
      this.feedContentPrice = feedData.feedContentPrice;
      this.allowType = parseInt(feedData.allowType);
      this.movieObject = { movieId: feedData.movieId };
      this.musicObject = { musicId: feedData.musicId };
      this.imageObject = { imageId: feedData.imageId };
    },
    async loadPlans() {
      const user = this.$store.state.user.user;
      if (user) {
        const artistUserId = user.userId;
        this.plans = await this.PlansDao_SelectPlansByUserId(artistUserId);
      }
    },
    setMovieObj(movieObject) {
      this.movieObject = movieObject;
      this.hasChanges = true;
    },
    setMusicObj(musicObject) {
      if (musicObject.fileExtension !== "mp3") {
        this.isShowErrorSnackbar = true;
        this.errorStr =
          "申し訳ありませんがFeedにはMP3以外のフォーマットの音楽ファイルは投稿できません";
      } else {
        this.musicObject = musicObject;
        this.hasChanges = true;
      }
    },
    setImageObj(imageObject) {
      this.imageObject = imageObject;
      this.hasChanges = true;
    },
    toArtistMainPage() {
      const user = this.$store.state.user.user;
      this.$router.push({
        name: "artists-main",
        params: { artistId: user.userId },
        query: { tab: "tab-feeds" },
      });
    },
    async execSave() {
      if (this.$refs.form.validate()) {
        await this.saveFeed();
      } else {
        this.isShowErrorSnackbar = true;
        this.errorStr = "入力値が不正です。確認してください";
      }
    },
    async execEditSave() {
      if (this.$refs.form.validate()) {
        await this.saveFeedHist();
        await this.saveFeed();
      } else {
        this.isShowErrorSnackbar = true;
        this.errorStr = "入力値が不正です。確認してください";
      }
    },
    async saveFeedHist() {
      try {
        const sqlResult = await this.FeedsDao_MoveToFeedsHist(this.feedId);
      } catch (error) {
        console.error(error);
        this.isShowErrorSnackbar = true;
        this.errorStr = "Feedの更新に失敗しました";
      }
    },
    async saveFeed() {
      const user = this.$store.state.user.user;
      let feedId = this.$uuid.v4();
      if (this.feedId) {
        feedId = this.feedId;
      }
      const userId = user.userId;
      const movieId = this.movieObject.movieId ? this.movieObject.movieId : "";
      const musicId = this.musicObject.musicId ? this.musicObject.musicId : "";
      const imageId = this.imageObject.imageId ? this.imageObject.imageId : "";
      const title = this.title;
      const feedContent = this.feedContent;
      const allowType = this.allowType;
      const feedAllowPlanId = this.selectedPlan
        ? this.selectedPlan.planId
        : undefined;
      const feedAllowPlanName = this.selectedPlan
        ? this.selectedPlan.planName
        : undefined;
      const feedAllowPlanPrice = this.selectedPlan
        ? parseInt(this.selectedPlan.planPrice)
        : 0;
      const crUserId = user.userId;
      const upUserId = user.userId;
      const isShow = true;
      try {
        const sqlResult = await this.FeedsDao_UpsertFeed(
          feedId,
          userId,
          movieId,
          musicId,
          imageId,
          title,
          feedContent,
          allowType,
          crUserId,
          upUserId,
          isShow
        );
        if (feedAllowPlanId) {
          const sqlResult2 = await this.AllowedContentsDao_UpsertAllowedContent(
            feedId,
            feedAllowPlanId,
            feedAllowPlanName,
            feedAllowPlanPrice
          );
        }
        this.NotificationsService_addNewFeedNotification(user, title, imageId);
        this.hasChanges = false;
        this.isShowSuccessSnackbar = true;
        this.successStr =
          this.mode === "create"
            ? "Feedの投稿が完了しました。メインページへ戻ります"
            : "Feedの更新が完了しました。メインページへ戻ります";
        setTimeout(() => {
          this.toArtistMainPage();
        }, 3000);
      } catch (error) {
        console.error(error);
        this.isShowErrorSnackbar = true;
        this.errorStr =
          this.mode === "create"
            ? "Feedの投稿に失敗しました"
            : "Feedの更新に失敗しました";
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
.artists-createfeed {
  margin-bottom: 64px;
}
</style>
