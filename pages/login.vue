<template>
  <div>
    <Loading v-model="loadingValue" zindex="100"/>
    <v-container :fluid="true">
      <v-row align="center" justify="center" class="logo">
        <v-img src="/images/logo_icon.png" max-width="180" />
      </v-row>
      <v-form ref="form">
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
        <v-row>
          <v-col class="px-6">
            <v-text-field
              v-model="password"
              :append-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
              :type="passwordShow ? 'text' : 'password'"
              :rules="[rules.required, rules.minLengthPassword]"
              label="パスワード"
              prepend-inner-icon="mdi-lock"
              clearable
              filled
              dense
              rounded
              @keydown.enter="passKeyDownTrigger"
              @click:append="passwordShow = !passwordShow"
            />
          </v-col>
        </v-row>
      </v-form>

      <v-row>
        <v-col class="text-center px-6">
          <v-btn
            block
            x-large
            depressed
            dark
            rounded
            class="msy-color-red"
            @click="login"
            v-text="'ログイン'"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-center px-6">
          <v-btn
            block
            class="color-facebook text-capitalize mb-3"
            @click="socialLogin('facebook')"
          >
            <v-icon left class="color-facebook__icon" size="22">
              mdi-facebook
            </v-icon>
            Facebookアカウントでログイン
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-center px-6">
          <v-btn
            block
            class="color-twitter text-capitalize mb-3"
            @click="socialLogin('twitter')"
          >
            <v-icon left class="color-twitter__icon" size="22">
              mdi-twitter
            </v-icon>
            Twitterアカウントでログイン
          </v-btn>
        </v-col>
      </v-row>
      <v-row class="mt-2 py-5" :align="'center'" :justify="'center'">
        <v-btn
          text
          class="msy-color-text-blue-gray default-font"
          @click="toForgetPassword"
          v-text="'パスワードを忘れた方はこちら'"
        />
      </v-row>

      <v-row class="pt-2 pb-5" :align="'center'" :justify="'center'">
        <v-btn
          text
          to="/register"
          class="msy-color-text-red"
          v-text="'新規会員登録'"
        />
      </v-row>
      <v-row class="pt-2 pb-5" :align="'center'" :justify="'center'">
        <v-btn
          text
          to="/social-register"
          class="msy-color-text-red"
          v-text="'ソーシャルアカウントで登録'"
        />
      </v-row>
      <v-row class="mt-2 law-info-link" :align="'center'" :justify="'center'">
        <TitleText
          link
          small
          @click="$router.push({ name: 'law' })"
          v-text="'特定商取引法に基づく表示'"
        />
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
import Loading from "~/components/molecules/Loading";
import TitleText from "~/components/atoms/TitleText";
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
      email: "",
      password: "",
      passwordShow: false,
      isInvalidPassword: false,
      isShowErrorSnackbar: false,
      errorStr: "",
    };
  },
  computed: {
    isFirstLogin() {
      return (
        !this.$store.state.user.user ||
        !this.$store.state.user.user.username ||
        !this.$store.state.user.user.genres
      );
    },
  },
  mounted() {
    const user = this.$store.state.user.user;
    if (user !== null) {
      this.toMainPage();
    }
    this.loadingValue = 100;
  },
  methods: {
    async socialLogin(socialType) {
      this.loadingValue = 40;
      const provider = this.LoginService_SocialProvider(socialType);
      const result = await this.LoginService_SignInWithProvider(provider);
      this.loadingValue = 80;
      if (result) {
        this.errorStr = result;
        this.isShowErrorSnackbar = true;
        this.loadingValue = 100;
      }
    },
    async login() {
      if (this.$refs.form.validate()) {
        this.loadingValue = 10;
        try {
          await this.$firebase
            .auth()
            .signInWithEmailAndPassword(this.email, this.password);
          this.loadingValue = 40;
          const user = this.$firebase.auth().currentUser;
          if (user !== null) {
            if (user.emailVerified) {
              const loginUser = await this.UsersDao_SelectUserByUserId(
                user.uid
              );
              this.$store.commit("user/setUser", loginUser);
              this.loadingValue = 80;
              this.UsersDao_UpdateUserLatestLoginDatetime(loginUser.userId);
              this.loadingValue = 99;
              if (this.isFirstLogin) {
                this.toEditProfilePage(this.$route.query.redirect);
              } else if (this.$route.query.redirect) {
                window.location.href = this.$route.query.redirect;
              } else {
                this.toMainPage();
              }
            } else {
              try {
                let redirect = "";
                if (this.$route.query.redirect) {
                  redirect = "?redirect=" + this.$route.query.redirect;
                }
                let url =
                  `${location.protocol}//${location.hostname}/login` + redirect;
                if (location.port !== "" && location.port !== "80") {
                  url =
                    `${location.protocol}//${location.hostname}:${location.port}/login` +
                    redirect;
                }
                const actionCodeSettings = {
                  url,
                };
                await user.sendEmailVerification(actionCodeSettings);
                this.errorStr =
                  "送信されたメールによる本人認証が完了していません。メールを確認して下さい。";
                this.isShowErrorSnackbar = true;
                this.loadingValue = 100;
              } catch (error) {
                console.error(error);
                this.errorStr = "アドレス認証メールの送信に失敗しました";
                this.isShowErrorSnackbar = true;
                this.loadingValue = 100;
              }
            }
          }
        } catch (error) {
          this.errorStr = this.LoginService_ErrorMessage(error);
          this.isShowErrorSnackbar = true;
          this.loadingValue = 100;
          console.error(error);
        }
      } else {
        this.isInvalidPassword = true;
        this.isShowErrorSnackbar = true;
        this.errorStr = "入力値が不正です。確認してください";
      }
    },
    toMainPage() {
      this.$router.push({
        name: "fans-main",
      });
    },
    toEditProfilePage(redirect) {
      this.$router.push({
        name: "fans-profile",
        query: { redirect },
        params: { isFirst: true },
      });
    },
    toForgetPassword() {
      this.$router.push({
        name: "forget-password",
      });
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
.logo {
  height: 40vh;
}
.v-btn:before {
  color: #ffffff !important;
}
.law-info-link {
  position: fixed;
  bottom: 12px;
  left: 12px;
  width: 240px;
}

@mixin social_button($brand-color: #999, $text-color: #fff) {
  background-color: $brand-color !important;
  border-color: $brand-color;
  color: $text-color;

  @at-root {
    #{&}__icon {
      position: absolute;
      left: 0;
    }
  }
}

.color-twitter {
  @include social_button(#1da1f2);
}
.color-facebook {
  @include social_button(#3b5998);
}
.color-google {
  @include social_button(#fff, #757575);
  @at-root {
    #{&}__icon > svg {
      position: absolute;
    }
  }
}
</style>
