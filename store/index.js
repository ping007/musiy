export const state = () => ({
  artistImageUrl: "",
  artistName: "",
  notificationContent: undefined,
});

export const mutations = {
  setImageUrl (state, imageUrl) {
    state.artistImageUrl = imageUrl;
  },
  setName (state, name) {
    state.artistName = name;
  },
  setNotificationContent (state, content) {
    state.notificationContent = content;
  }
};
