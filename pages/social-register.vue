<template>
  <div>
    <Loading v-model="loadingValue" />
    <v-container :fluid="true">
      <v-row class="pt-5 pb-10 logo" align="center" justify="center">
        <v-img src="/images/logo_icon.png" max-width="180" />
      </v-row>
      <v-row class="pt-5 px-8" align="center" justify="center">
        <h1 class="msy-color-text-red default-font-family">
          さあMusiyへ登録しましょう！
        </h1>
      </v-row>
      <v-row class="pb-10 px-8" align="center" justify="center">
        <h4 class="msy-color-text-red default-font-family">
          登録にかかる時間は数分です
        </h4>
      </v-row>
      <v-row>
        <v-col>
          <v-row align="center" justify="center">
            <v-checkbox v-model="isConfirmTermAndPolicy" />
            <div class="ml-5">
              <TitleText
                link
                small
                @click="$router.push({ name: 'privacy-policy' })"
                v-text="'個人情報の取り扱い'"
              />
              <TitleText small v-text="'と'" />
              <br />
              <br />
              <TitleText
                link
                small
                @click="$router.push({ name: 'terms-of-service' })"
                v-text="'利用規約'"
              />
              <TitleText small v-text="'に同意する'" />
            </div>
          </v-row>
        </v-col>
      </v-row>
      <v-form ref="form">
        <v-row>
          <v-col>
            <v-text-field
              v-model="username"
              type="text"
              :rules="[rules.required]"
              label="ニックネーム"
            />
          </v-col>
        </v-row>
      </v-form>
      <v-row class="py-5">
        <v-col class="text-center">
          <v-btn
            block
            large
            dark
            class="msy-color-red"
            @click="social_register('twitter')"
            v-text="'Twitterで登録する'"
          />
        </v-col>
        <v-col class="text-center">
          <v-btn
            block
            large
            dark
            class="msy-color-red"
            @click="social_register('facebook')"
            v-text="'Facebookで登録する'"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-center mt-5 pt-5" cols="12">
          <TitleText
            small
            link
            @click="$router.back()"
            v-text="'前の画面に戻る'"
          />
        </v-col>
      </v-row>
    </v-container>
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
import { ValidateRules } from "~/constant.js";
import TitleText from "~/components/atoms/TitleText";
import Loading from "~/components/molecules/Loading";
import UsersDao from "~/mixins/dao/UsersDao";
import LoginService from "~/mixins/service/LoginService";
export default {
  layout: "noHeader",
  components: {
    Loading,
    TitleText,
  },
  mixins: [UsersDao, LoginService],
  data() {
    return {
      loadingValue: 0,
      rules: ValidateRules,
      username: "",
      email: "",
      password: "",
      passwordShow: false,
      isConfirmTermAndPolicy: false,
      isShowErrorSnackbar: false,
      errorStr: "",
    };
  },
  mounted() {
    this.loadingValue = 100;
  },
  methods: {
    async social_register(socialType) {
      this.loadingValue = 10;
      if (!this.$refs.form.validate() || !this.isConfirmTermAndPolicy) {
        this.loadingValue = 100;
        this.isShowErrorSnackbar = true;
        this.errorStr = this.isConfirmTermAndPolicy
          ? "入力値が不正です。確認してください"
          : "チェックボックスがチェックされていません";
        return;
      }
      const provider = this.LoginService_SocialProvider(socialType);
      const message = await this.register(provider);
      if (message) {
        this.loadingValue = 100;
        this.isShowErrorSnackbar = true;
        this.errorStr = message;
      }
    },
    async register(provider) {
      this.loadingValue = 30;
      try {
        const result = await this.$firebase.auth().signInWithPopup(provider);
        const user = result.user;
        if (!user.email) {
          console.info("not_found_email");
          return this.LoginService_ErrorMessage({ code: "not_found_email" });
        }
        this.loadingValue = 50;
        await user.updateProfile({
          displayName: this.username,
        });
        this.loadingValue = 60;
        const userId = user.uid;
        const username = this.username;
        const email = user.email;
        const imageId = "";
        const crUserId = user.uid;
        const upUserId = user.uid;
        const isArtist = false;
        const sqlResult = await this.UsersDao_UpsertUser(
          userId,
          username,
          email,
          imageId,
          crUserId,
          upUserId,
          isArtist
        );
        console.log("SQL result:", sqlResult);
        const fb_user = this.$firebase.auth().currentUser;
        return await this.LoginService_AfterFirebaseAuth(fb_user);
      } catch (error) {
        console.error(error);
        return this.LoginService_ErrorMessage(error);
      }
    },
    passKeyDownTrigger() {
      if (event.keyCode === 13) {
        this.login();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
