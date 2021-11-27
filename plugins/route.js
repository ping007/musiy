import firebase from "firebase";
export default ({ app, redirect, nuxtState }) => {
  app.router.beforeResolve((to, from, next) => {
    const requiresAuth = to.matched.some((record) => {
      return record.meta.requiresAuth;
    });
    const loginUser = app.store.state.user.user;
    // console.info("loginUser", loginUser);

    // ログイン必須かつ未ログイン時、ログイン画面へリダイレクト
    if (requiresAuth) {
      firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
          app.store.commit("user/setUser", null);
          window.location.href = "/login?redirect=" + encodeURIComponent(to.fullPath);
        }
      });
      if (!loginUser) {
        window.location.href = "/login?redirect=" + encodeURIComponent(to.fullPath);
      }
    }
    // ログイン時、ログイン画面からリダイレクト
    if (loginUser && to.path === "/login/") {
      if (
        loginUser.name === null ||
        loginUser.name === undefined ||
        loginUser.name === ""
      ) {
        // 初回登録時はプロフィール作成に飛ばす
        // window.location.href = "/profile?mode=edit"
      }
    }
    next(); // next() を常に呼び出すようにしてください!
  });
};
