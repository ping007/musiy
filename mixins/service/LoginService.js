import UsersDao from "~/mixins/dao/UsersDao";

export default {
  mixins: [UsersDao],
  computed: {
    LoginService_IsFirstLogin() {
      return (
        !this.$store.state.user.user ||
        !this.$store.state.user.user.username ||
        !this.$store.state.user.user.genres
      );
    },
  },
  methods: {
    LoginService_SignInWithProvider(provider) {
      const that = this;
      return this.$firebase
        .auth()
        .signInWithPopup(provider)
        .then(async function(result) {
          const user = that.$firebase.auth().currentUser;
          if (!user) {
            return that.LoginService_ErrorMessage({
              code: "un_authed_user_with_fb",
            });
          }
          return await that.LoginService_AfterFirebaseAuth(user);
        })
        .catch(function(error) {
          return that
            .LoginService_DifferentCredential(error)
            .then((errorMessage) => {
              return errorMessage;
            });
        });
    },
    async LoginService_AfterFirebaseAuth(user) {
      const loginUser = await this.UsersDao_SelectUserByUserId(user.uid);
      if (!Object.keys(loginUser).length) {
        this.LoginService_ToSNSUserRegisterPage();
        return;
      }
      this.$store.commit("user/setUser", loginUser);
      await this.UsersDao_UpdateUserLatestLoginDatetime(loginUser.userId);
      if (this.LoginService_IsFirstLogin) {
        this.LoginService_ToEditProfilePage(this.$route.query.redirect);
      } else if (this.$route.query.redirect) {
        window.location.href = this.$route.query.redirect;
      } else {
        this.LoginService_ToMainPage();
      }
    },
    async LoginService_DifferentCredential(error) {
      if (error.code !== "auth/account-exists-with-different-credential") {
        console.info(error);
        return this.LoginService_ErrorMessage(error);
      }

      const that = this;
      const pendingCred = error.credential;
      const email = error.email;
      return await this.$firebase
        .auth()
        .fetchSignInMethodsForEmail(email)
        .then(async function(methods) {
          if (methods[0] === "password") {
            // パスワード認証の場合
            let password = await that.$dialog.prompt({
              title: "musiyのパスワードを入力",
              text: "パスワード",
              textField: {
                type: "password",
              },
            });
            if (!password) {
              password = "";
            }
            return that.$firebase
              .auth()
              .signInWithEmailAndPassword(email, password)
              .then(function(result) {
                return result.user.linkWithCredential(pendingCred);
              })
              .then(async function() {
                return await that.LoginService_AfterFirebaseAuth(
                  that.$firebase.auth().currentUser
                );
              })
              .catch(function(error) {
                console.info(error);
                return that.LoginService_ErrorMessage(error);
              });
          }
        });
    },
    LoginService_ErrorMessage(error) {
      if (
        error.code === "auth/user-not-found" ||
        error.code === "not_found_user_in_musiy" ||
        error.code === "un_authed_user_with_fb"
      ) {
        return "アカウントが存在しません";
      } else if (error.code === "not_found_email") {
        return "メールアドレスが存在しません";
      } else if (error.code === "auth/user-disabled") {
        return "無効なアカウントです";
      } else if (error.code === "auth/wrong-password") {
        return "メールアドレスまたはパスワードが間違っています";
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        return "ログイン方法に誤りがあります。別のログイン方法をお試しください";
      } else if (error.code === "auth/user-cancelled") {
        return "ログインが中断されました。";
      } else if (error.code === "auth/email-already-in-use") {
        return "このアカウントは既に存在しています";
      } else {
        return "認証通信中にエラーが発生しました";
      }
    },
    LoginService_SocialProvider(socialType) {
      if (socialType === "twitter") {
        return new this.$firebase.auth.TwitterAuthProvider();
      } else if (socialType === "facebook") {
        return new this.$firebase.auth.FacebookAuthProvider();
      } else {
        return new this.$firebase.auth.FacebookAuthProvider();
      }
    },
    LoginService_ToSNSUserRegisterPage() {
      this.$router.push({
        name: "social-register",
      });
    },
    LoginService_ToMainPage() {
      this.$router.push({
        name: "fans-main",
      });
    },
    LoginService_ToEditProfilePage(redirect) {
      this.$router.push({
        name: "fans-profile",
        query: { redirect },
        params: { isFirst: true },
      });
    },
  },
};
