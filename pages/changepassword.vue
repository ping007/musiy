<template>
  <div>
    <Loading v-model="loadingValue" />
    <v-container fluid>
      <v-form ref="form">
        <v-row>
          <v-col>
            <v-text-field
              v-model="oldPassword"
              :append-icon="oldPasswordShow ? 'mdi-eye' : 'mdi-eye-off'"
              :type="oldPasswordShow ? 'text' : 'password'"
              :rules="[rules.required, rules.minLengthPassword]"
              label="現在のパスワード"
              @click:append="oldPasswordShow = !oldPasswordShow"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="newPassword"
              :append-icon="newPasswordShow ? 'mdi-eye' : 'mdi-eye-off'"
              :type="newPasswordShow ? 'text' : 'password'"
              :rules="[rules.required, rules.minLengthPassword]"
              label="新しいパスワード"
              @click:append="newPasswordShow = !newPasswordShow"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="confirmPassword"
              :append-icon="confirmPasswordShow ? 'mdi-eye' : 'mdi-eye-off'"
              :type="confirmPasswordShow ? 'text' : 'password'"
              :rules="[rules.required, rules.minLengthPassword, passCheck]"
              label="新しいパスワード（再入力）"
              @keydown.enter="passKeyDownTrigger"
              @click:append="confirmPasswordShow = !confirmPasswordShow"
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
            @click="execChange"
            v-text="'変更する'"
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
  data() {
    return {
      rules: ValidateRules,
      isInvalidOldPassword: false,
      isInvalidNewPassword: false,
      isInvalidConfirmPassword: false,
      loadingValue: 0,
      oldPassword: "",
      oldPasswordShow: false,
      newPassword: "",
      newPasswordShow: false,
      confirmPassword: "",
      confirmPasswordShow: false,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      passCheck: (value) => {
        return (
          value === this.newPassword || "確認用パスワードが一致していません"
        );
      },
    };
  },
  created() {
    this.loadingValue = 100;
  },
  methods: {
    async execChange() {
      this.loadingValue = 0;
      let firebaseUser = null;
      if (this.$refs.form.validate()) {
        try {
          const user = this.$store.state.user.user;
          this.loadingValue = 30;
          const result = await this.$firebase
            .auth()
            .signInWithEmailAndPassword(user.email, this.oldPassword);
          firebaseUser = result.user;
          this.loadingValue = 60;
          if (firebaseUser) {
            console.log(firebaseUser);
            await firebaseUser.updatePassword(this.newPassword);
            this.loadingValue = 99;
            this.isShowSuccessSnackbar = true;
            this.successStr = "パスワードの変更が完了しました。";
            this.$store.commit("user/setUser", null);
            setTimeout(() => {
              this.loadingValue = 100;
              this.$router.push({
                name: "login",
              });
            }, 3000);
          } else {
            this.errorStr = "アカウントが存在しません";
            this.isShowErrorSnackbar = true;
            this.loadingValue = 100;
          }
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
