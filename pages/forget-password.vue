<template>
  <div>
    <Loading v-model="loadingValue" />
    <v-container fluid>
      <v-form ref="form">
        <v-row class="py-5 px-2" align="center" justify="center">
          <div>
            <span
              class="msy-color-text-red"
              v-text="
                '登録されているメールアドレスにパスワード再設定メールを送信します。'
              "
            ></span>
          </div>
        </v-row>
        <v-row>
          <v-col class="pb-0 px-6">
            <v-text-field
              v-model="email"
              type="email"
              :rules="[rules.required, rules.email]"
              label="メールアドレス"
              prepend-inner-icon="mdi-account"
              clearable
              filled
              dense
              rounded
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
            @click="execReset"
            v-text="'パスワード再設定メールを送信する'"
          />
        </v-col>
      </v-row>
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
    </v-container>
  </div>
</template>

<script>
import { ValidateRules } from "~/constant.js";
import Loading from "~/components/molecules/Loading";
export default {
  components: {
    Loading,
  },
  layout: "noHeader",
  data() {
    return {
      rules: ValidateRules,
      email: "",
      loadingValue: 0,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
    };
  },
  created() {
    this.loadingValue = 100;
  },
  methods: {
    async execReset() {
      const firebaseUser = null;
      this.loadingValue = 0;
      if (this.$refs.form.validate()) {
        try {
          this.loadingValue = 30;
          await this.$firebase.auth().sendPasswordResetEmail(this.email);
          this.loadingValue = 99;
          this.isShowSuccessSnackbar = true;
          this.successStr =
            "パスワードのリセットメールを送信しました。メールをご確認ください";
          this.$store.commit("user/setUser", null);
          setTimeout(() => {
            this.loadingValue = 100;
            this.$router.push({
              name: "login",
            });
          }, 3000);
        } catch (error) {
          if (error.code === "auth/user-not-found") {
            this.errorStr = "アカウントが存在しません";
          } else if (error.code === "auth/wrong-password") {
            this.errorStr = "メールアドレスまたはパスワードが間違っています";
          } else {
            this.errorStr = "認証通信中にエラーが発生しました";
          }
          console.error(error);
          this.isShowErrorSnackbar = true;
          this.loadingValue = 100;
        }
      } else {
        this.errorStr = "入力内容が不正です。確認してください。";
        this.isShowErrorSnackbar = true;
        this.loadingValue = 100;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
