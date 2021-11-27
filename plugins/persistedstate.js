import createPersistedState from "vuex-persistedstate";

export default ({ store }) => {
  createPersistedState({
    key: "musiy-app",
    paths: ["user.user", "user.isArtist"]
  })(store);
};
