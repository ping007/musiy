<template>
  <div>
    <v-container class="fans-profile" fluid>
      <v-row class="py-5">
        <UploadImageFile
          :image-id="user.imageId"
          :is-avatar="true"
          @uploaded="setImageObj"
        />
      </v-row>
      <v-form ref="form">
        <v-row class="py-5 mx-1">
          <v-text-field
            v-model="user.email"
            type="email"
            disabled
            label="登録メールアドレス"
          />
        </v-row>
        <v-row class="py-5 mx-1">
          <v-text-field
            v-model="user.description"
            type="text"
            :rules="[rules.maxLength(user.description, 100)]"
            label="自己紹介文（100文字以内）"
            counter="100"
            @change="hasChanges = true"
          />
        </v-row>
        <v-row class="py-5 mx-1">
          <v-text-field
            v-model="user.username"
            type="text"
            :rules="[rules.required]"
            label="ニックネーム"
            @change="hasChanges = true"
          />
        </v-row>
        <v-row class="py-5 mx-1">
          <GenreSelectBox
            v-model="genres"
            :rules="[rules.required]"
            :label="'好きなジャンル'"
            @change="hasChanges = true"
          />
        </v-row>
      </v-form>
      <v-row class="py-5 mx-1" align="center" justify="center">
        <v-btn
          large
          dark
          class="msy-color-red"
          block
          @click="saveProfile"
          v-text="'保存する'"
        />
      </v-row>
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
import { ValidateRules } from "~/constant.js";
import UploadImageFile from "~/components/molecules/UploadImageFile";
import UsersDao from "~/mixins/dao/UsersDao";
import GenreSelectBox from "~/components/atoms/GenreSelectBox";
export default {
  components: {
    UploadImageFile,
    GenreSelectBox,
    PreventUnload,
  },
  mixins: [UsersDao],
  data() {
    return {
      hasChanges: false,
      rules: ValidateRules,
      imageObject: {},
      user: undefined,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      isFirst: false,
    };
  },
  computed: {
    genres: {
      get() {
        return this.user.genres ? this.user.genres.split(",") : [];
      },
      set(value) {
        this.user.genres = value.toString();
      },
    },
  },
  created() {
    const user = this.$store.state.user.user;
    const isFirst = this.$route.params.isFirst;
    if (user) {
      this.user = user;
      this.isFirst = isFirst !== undefined && isFirst !== false;
    } else {
      this.toLogin();
    }
  },
  methods: {
    setImageObj(imageObject) {
      this.imageObject = imageObject;
    },
    async saveProfile() {
      let imageId = this.user.imageId;
      if (this.imageObject.imageId) {
        imageId = this.imageObject.imageId;
      }
      try {
        if (this.$refs.form.validate()) {
          await this.UsersDao_UpsertUser(
            this.user.userId,
            this.user.username,
            this.user.email,
            imageId,
            this.user.crUserId,
            this.user.userId,
            this.user.isArtist,
            this.user.genres,
            this.user.description,
            this.user.homepageUrl,
            this.user.blogUrl,
            this.user.facebookUrl,
            this.user.twitterUrl
          );
          this.$store.commit("user/setUser", this.user);
          this.hasChanges = false;
          const updatedUser = await this.UsersDao_SelectUserByUserId(
            this.user.userId
          );
          this.$store.commit("user/setUser", updatedUser);
          if (this.isFirst) {
            this.isShowSuccessSnackbar = true;
            this.successStr = "保存しました。メイン画面に遷移します。";
            setTimeout(() => {
              if (this.$route.query.redirect) {
                window.location.href = this.$route.query.redirect;
              } else {
                this.$router.push({
                  name: "fans-main",
                });
              }
            }, 3000);
          } else {
            this.isShowSuccessSnackbar = true;
            this.successStr = "保存しました";
          }
        } else {
          this.isShowErrorSnackbar = true;
          this.errorStr = "入力値が不正です。確認してください";
        }
      } catch (error) {
        this.isShowErrorSnackbar = true;
        this.errorStr = "保存に失敗しました";
      }
    },
    toLogin() {
      this.$router.push({
        name: "login",
      });
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
.fans-profile {
  padding-bottom: 56px;
}
</style>
