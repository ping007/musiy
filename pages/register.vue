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
      <v-row align="center" justify="center">
        <v-checkbox v-model="isConfirmTermAndPolicy">
          <template #label>
            <TitleText
              link
              small
              @click="$router.push({ name: 'privacy-policy' })"
              v-text="'個人情報の取り扱い'"
            />
            <TitleText small v-text="'と'" />
            <TitleText
              link
              small
              @click="$router.push({ name: 'terms-of-service' })"
              v-text="'利用規約'"
            />
            <TitleText small v-text="'に同意する'" />

          </template>
        </v-checkbox>
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
        <v-row>
          <v-col>
            <v-text-field
              v-model="email"
              type="email"
              :rules="[rules.required, rules.email]"
              label="メールアドレス"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="password"
              :append-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
              :type="passwordShow ? 'text' : 'password'"
              :rules="[rules.required, rules.minLengthPassword]"
              label="パスワード"
              @keydown.enter="passKeyDownTrigger"
              @click:append="passwordShow = !passwordShow"
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
            @click="register"
            v-text="'登録する'"
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
export default {
  layout: "noHeader",
  components: {
    Loading,
    TitleText,
  },
  mixins: [UsersDao],
  data() {
    return {
      loadingValue: 0,
      rules: ValidateRules,
      username: "",
      email: "",
      password: "",
      passwordShow: false,
      isConfirmTermAndPolicy: false,
      isInvalidPassword: false,
      isShowErrorSnackbar: false,
      errorStr: "",
    };
  },
  mounted() {
    this.loadingValue = 100;
  },
  methods: {
    async register() {
      if (this.$refs.form.validate() && this.isConfirmTermAndPolicy) {
        this.loadingValue = 30;
        try {
          const result = await this.$firebase
            .auth()
            .createUserWithEmailAndPassword(this.email, this.password);
          const user = result.user;
          this.loadingValue = 50;
          await user.updateProfile({
            displayName: this.username,
          });
          this.loadingValue = 60;
          const userId = user.uid;
          const username = this.username;
          const email = this.email;
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
          let url = `${location.protocol}//${location.hostname}/login`;
          if (location.port !== "" && location.port !== "80") {
            url = `${location.protocol}//${location.hostname}:${location.port}/login`;
          }
          const actionCodeSettings = {
            url,
          };
          await user.sendEmailVerification(actionCodeSettings);
          this.loadingValue = 100;
          this.$router.push({
            name: "register-confirmation",
            params: {
              username: this.username,
            },
          });
        } catch (error) {
          console.error(error);
          if (error.code === "auth/email-already-in-use") {
            this.errorStr =
              "このメールアドレスのアカウントが既に存在しています";
            this.isShowErrorSnackbar = true;
          }
          this.loadingValue = 100;
        }
      } else {
        this.isInvalidPassword = true;
        this.loadingValue = 100;
        this.isShowErrorSnackbar = true;
        this.errorStr = this.isConfirmTermAndPolicy
          ? "入力値が不正です。確認してください"
          : "チェックボックスがチェックされていません";
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
