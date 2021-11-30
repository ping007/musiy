<template>
  <v-app v-show="isLoaded">
    <div v-scroll.self="onScroll" class="decoration-line"></div>
    <v-app-bar
      id="app-bar"
      flat
      :class="appBarStyle"
      :clipped-left="clipped"
      fixed
      app
      color="#2d2d2d"
    >
      <v-row>
        <v-col>
          <router-link to="/fans/main" class="app-bar-link">
            <img class="app-bar-logo-img" :src="appBarLogo" />
          </router-link>
        </v-col>
        <v-col>
          <div v-show="isDetail && isScroll" id="avater" class="block-center">
            <v-avatar class="artist-avater" size="36">
              <img
                v-if="$store.state.artistImageUrl.indexOf('images') > 0"
                class="artist-avater-image"
                :src="$store.state.artistImageUrl"
              />
              <img
                v-else
                :src="'/images/no_image.png'"
                class="no-profile-image"
                alt="artist no image"
              />
            </v-avatar>
            <p class="mb-0 ml-2">{{ $store.state.artistName }}</p>
          </div>
          <div class="app-bar-notification-wrapper">
            <v-menu
              :content-class="'app-bar-notification-list-wrapper'"
              bottom
              left
            >
              <template v-slot:activator="{ on, attrs }">
                <v-badge
                  v-model="hasNewNotifications"
                  class="app-bar-notification-badge"
                  color="rgb(231, 64, 89)"
                  :content="newNotificationsCount"
                  overlap
                >
                  <v-btn
                    class="app-bar-notification-button"
                    icon
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon :color="appBarNotification">mdi-bell</v-icon>
                  </v-btn>
                </v-badge>
              </template>
              <v-list class="notifications-list">
                <div
                  v-for="(notification, i) in notifications"
                  :key="notification.notificationId"
                >
                  <v-list-item
                    class="notifications-list-item"
                    @click="onClickNotification(notification)"
                  >
                    <v-badge
                      bordered
                      left
                      dot
                      overlap
                      color="rgb(231, 64, 89)"
                      :value="notification.isConfirmed === false"
                    >
                      <div class="block-center">
                        <div>
                          <v-avatar class="artist-avater" size="36">
                            <v-img
                              v-if="hasArtistImageId(notification)"
                              :src="getArtistImageUrl(notification)"
                              class="artist-avater-image"
                            />
                            <v-img
                              v-else
                              :src="'/images/no_image.png'"
                              class="no-profile-image"
                              alt="artist no image"
                            />
                          </v-avatar>
                        </div>
                        <div class="mx-4 app-bar-notification-message">
                          {{ notification.message }}
                        </div>
                        <div>
                          <v-img
                            v-if="hasThumbnail(notification)"
                            contain
                            max-width="60px"
                            :src="getThumbnailUrl(notification)"
                          />
                          <v-icon
                            v-else
                            color="rgb(231, 64, 89)"
                            class="mx-3"
                            size="36px"
                          >
                            {{ getIcon(notification.notificationType) }}
                          </v-icon>
                        </div>
                      </div>
                    </v-badge>
                  </v-list-item>
                  <v-divider v-if="i < notifications.length - 1" />
                </div>
              </v-list>
            </v-menu>
          </div>
          <v-dialog v-model="menuDialog">
            <template v-slot:activator="{ on }">
              <v-spacer />
              <v-btn
                class="app-bar-search-button"
                :style="appBarSearch"
                icon
                v-on="on"
              >
                <v-icon color="#ffffff">mdi-magnify</v-icon>
              </v-btn>
            </template>
            <v-card class="search-dialog">
              <v-card-title class="headline grey lighten-2" primary-title>
                Search Musics
              </v-card-title>
              <v-container class="px-5">
                <v-row class="px-2">
                  <v-text-field dense outlined rounded label="フリーワード" />
                </v-row>
                <v-row class="px-2">
                  <v-autocomplete
                    v-model="selectedGenres"
                    :disabled="isUpdating"
                    :items="genres"
                    filled
                    chips
                    label="ジャンル選択"
                    item-text="name"
                    item-value="genreId"
                    multiple
                    dense
                    rounded
                  >
                    <template v-slot:selection="data">
                      <v-chip
                        v-bind="data.attrs"
                        :input-value="data.selected"
                        close
                        @click="data.select"
                        @click:close="remove(data.item)"
                      >
                        {{ data.item.name }}
                      </v-chip>
                    </template>
                    <template v-slot:item="data">
                      <template>
                        <v-list-item-content>
                          <v-list-item-title>{{
                            data.item.name
                          }}</v-list-item-title>
                        </v-list-item-content>
                      </template>
                    </template>
                  </v-autocomplete>
                </v-row>
                <v-row class="px-2" />
              </v-container>
              <v-divider />
              <v-card-actions>
                <v-spacer />
                <v-btn dark class="msy-color-red" block @click="menuDialog = false">
                  検索
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-btn
            class="app-bar-menu-button"
            icon
            @click.stop="rightDrawer = !rightDrawer"
          >
            <img class="app-bar-menu-img" src="/images/menu_piano.png" />
          </v-btn>
        </v-col>
      </v-row>
    </v-app-bar>
    <v-content :class="!isUserLoggedIn && 'parent-content'">
      <v-container id="mainContent" :key="resetKey">
        <nuxt />
      </v-container>
    </v-content>
    <v-navigation-drawer
      v-model="rightDrawer"
      touchless
      :right="right"
      temporary
      fixed
    >
      <v-list>
        <v-list-item @click="toProfileSetting">
          <v-list-item-action>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-action>
          <v-list-item-title>プロフィール設定</v-list-item-title>
        </v-list-item>
        <v-list-item @click="toBuyPoints">
          <v-list-item-action>
            <v-icon>mdi-star</v-icon>
          </v-list-item-action>
          <v-list-item-title>ポイント購入</v-list-item-title>
        </v-list-item>
        <v-list-item @click="toChangePassword">
          <v-list-item-action>
            <v-icon>mdi-lock</v-icon>
          </v-list-item-action>
          <v-list-item-title>パスワード変更</v-list-item-title>
        </v-list-item>
        <v-list-item @click="toChangePurchaseInfo">
          <v-list-item-action>
            <v-icon>mdi-credit-card</v-icon>
          </v-list-item-action>
          <v-list-item-title>決済情報登録</v-list-item-title>
        </v-list-item>
        <v-list-item @click="toHelpWebPage">
          <v-list-item-action>
            <v-icon>mdi-help-circle-outline</v-icon>
          </v-list-item-action>
          <v-list-item-title>使い方ガイド</v-list-item-title>
        </v-list-item>
        <v-list-item @click="toContactWebPage">
          <v-list-item-action>
            <v-icon>mdi-contacts</v-icon>
          </v-list-item-action>
          <v-list-item-title>お問い合わせ</v-list-item-title>
        </v-list-item>
        <v-list-item @click="toArtistPage">
          <v-list-item-action>
            <v-icon>mdi-music</v-icon>
          </v-list-item-action>
          <v-list-item-title>アーティストログイン</v-list-item-title>
        </v-list-item>
        <v-list-item @click="execLogout">
          <v-list-item-action>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-action>
          <v-list-item-title>ログアウト</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- <v-footer :fixed="fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>-->
    <v-bottom-navigation
      app
      class="bottom-navigation"
      :value="activeBtn"
      grow
      dark
      color="#ffffff"
      background-color="#2d2d2d"
      active-class="msy-color-red"
    >
      <v-btn @click="toMainPage">
        <span>Home</span>
        <v-icon>mdi-home-outline</v-icon>
      </v-btn>

      <v-btn @click="toMyArtistsPage">
        <span>My Artists</span>
        <v-icon>mdi-heart-outline</v-icon>
      </v-btn>
      <v-btn @click="toMyMoviePage">
        <span>My Movies</span>
        <v-icon>mdi-play-box-outline</v-icon>
      </v-btn>
      <v-btn @click="toMyMusicPage">
        <span>My Musics</span>
        <v-icon>mdi-music</v-icon>
      </v-btn>
      <v-btn @click="toMyTicketPage">
        <span>My Tickets</span>
        <v-icon>mdi-ticket</v-icon>
      </v-btn>

      <!-- <v-btn @click="toMapPage">
        <span>Nearby</span>
        <v-icon>mdi-map-marker</v-icon>
      </v-btn>-->
    </v-bottom-navigation>
    <ArtistRegisterDialog
      :is-show="isShowRegisterDialog"
      @error="isShowRegisterDialog = false"
      @close="isShowRegisterDialog = false"
    />
  </v-app>
</template>

<script>
/* eslint-disable indent */
import { mapGetters } from "vuex";
import { Cloudinary } from "~/constant";
import ArtistRegisterDialog from "~/components/organisms/ArtistRegisterDialog";
import NotificationsDao from "~/mixins/dao/NotificationsDao";
export default {
  components: {
    ArtistRegisterDialog,
  },
  mixins: [NotificationsDao],
  data() {
    return {
      cloudinary: Cloudinary,
      isLoaded: false,
      clipped: false,
      drawer: false,
      fixed: false,
      right: true,
      rightDrawer: false,
      menuDialog: false,
      isShowRegisterDialog: false,
      title: "MUSIY",
      selectedGenres: [],
      notifications: [],
      genres: [
        { genreId: 0, name: "JAZZ" },
        { genreId: 1, name: "CLASSIC" },
        { genreId: 2, name: "POPS" },
        { genreId: 3, name: "DANCE" },
      ],
      isUpdating: false,
      activeBtn: 0,
      isDetail: window.location.pathname.indexOf("detail") > 0, // detailページの場合app-barを透過させる
      isScroll: false,
      resetKey: 0,
    };
  },
  computed: {
    ...mapGetters("user", ["isUserLoggedIn"]),
    hasNewNotifications() {
      return this.newNotificationsCount > 0;
    },
    newNotificationsCount() {
      const result = this.notifications.filter((notification) => {
        return notification.isConfirmed === false;
      });
      return result.length;
    },
    appBarStyle() {
      return { "app-bar-white": this.isDetail };
    },
    appBarLogo() {
      const logoColor = this.isDetail ? "_dark" : "";
      return `/images/logo_word${logoColor}.png`;
    },
    appBarSearch() {
      return this.isDetail ? "display: none;" : "";
    },
    appBarNotification() {
      return this.isDetail ? "#2d2d2d" : "#ffffff";
    },
  },
  watch: {
    isUpdating(val) {
      if (val) {
        setTimeout(() => (this.isUpdating = false), 3000);
      }
    },
    $route(to, from) {
      this.isDetail = window.location.pathname.indexOf("detail") > 0;
    },
  },
  created() {
    this.setListener();
  },
  async mounted() {
    const user = this.$store.state.user.user;
    if (user) {
      this.isLoaded = true;
      this.isArtist = user.isArtist;
      this.notifications =
        await this.NotificationsDao_SelectNotificationsByUserId(user.userId);
    }
  },
  methods: {
    setListener() {
      this.$nuxt.$on("updateActiveBtn", this.setActiveBtn);
    },
    setActiveBtn(index) {
      this.activeBtn = index || 0;
    },
    getIcon(notificationType) {
      let icon = "";
      switch (notificationType) {
        case "0":
          icon = "mdi-account";
          break;
        case "1":
          icon = "mdi-music-note";
          break;
        case "2":
          icon = "mdi-video";
          break;
        case "3":
          icon = "mdi-message-bulleted";
          break;
        case "4":
          icon = "mdi-account-star";
          break;
        case "5":
          icon = "mdi-cast-connected";
          break;
        case "6":
          icon = "mdi-cast-connected";
          break;
      }
      return icon;
    },
    hasThumbnail(notification) {
      if (!notification.contentUri) {
        return false;
      }
      const p = JSON.parse(notification.contentUri);
      return p && p.params && p.params.notifyImg;
    },
    hasArtistImageId(notification) {
      if (!notification.contentUri) {
        return false;
      }
      const p = JSON.parse(notification.contentUri);
      return p && p.params && p.params.artist && p.params.artist.imageId;
    },
    getThumbnailUrl(notification) {
      const imageId = JSON.parse(notification.contentUri).params.notifyImg;
      return this.getImgUrl(imageId);
    },
    getArtistImageUrl(notification) {
      return this.getImgUrl(notification.imageId);
    },
    getImgUrl(imageId) {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${imageId}`;
    },
    remove(item) {
      const index = this.selectedGenres.indexOf(item.genreId);
      if (index >= 0) {
        this.selectedGenres.splice(index, 1);
      }
    },
    execLogout() {
      this.$store.commit("user/setUser", null);
      this.toLogin();
    },
    async onClickNotification(notification) {
      notification.isConfirmed = true;
      await this.NotificationsDao_UpsertNotification(
        notification.notificationId,
        notification.actionFromUserId,
        notification.actionToUserId,
        notification.notificationType,
        notification.isConfirmed,
        notification.message,
        notification.contentUri
      );
      if (notification.contentUri && notification.contentUri !== "") {
        const contentUri = JSON.parse(notification.contentUri);
        if (this.$route.name !== contentUri.name) {
          this.$router.push(contentUri);
        } else {
          const contentParams = contentUri.params;
          this.$store.commit("setNotificationContent", contentParams);
          this.resetKey++;
        }
      }
    },
    toArtistPage() {
      if (this.isArtist) {
        const user = this.$store.state.user.user;
        this.$router.push({
          name: "artists-main",
          params: { artistId: user.userId },
        });
      } else {
        this.isShowRegisterDialog = true;
      }
    },

    toMainPage() {
      this.$router.push({
        name: "fans-main",
      });
    },
    toMyArtistsPage() {
      this.$router.push({
        name: "fans-myartists",
      });
    },
    toMyMoviePage() {
      this.$router.push({
        name: "fans-mymovies",
      });
    },
    toMyMusicPage() {
      this.$router.push({
        name: "fans-mymusics",
      });
    },
    toMyTicketPage() {
      this.$router.push({
        name: "fans-mytickets",
      });
    },
    toMapPage() {
      this.$router.push({
        name: "fans-map",
      });
    },
    toProfileSetting() {
      this.$router.push({
        name: "fans-profile",
      });
    },
    toBuyPoints() {
      this.$router.push({
        name: "fans-buypoints",
      });
    },
    toChangePassword() {
      this.$router.push({
        name: "changepassword",
      });
    },
    toChangePurchaseInfo() {
      this.$router.push({
        name: "changepurchaseinfo",
      });
    },
    toLogin() {
      this.$router.push({
        name: "login",
      });
    },
    toHelpWebPage() {
      const url = "https://musiy.net/manual/";
      window.open(url, "_blank");
    },
    toContactWebPage() {
      const url = "https://musiy.net/contact/";
      window.open(url, "_blank");
    },
    onScroll(e) {
      this.isScroll = e.target.scrollingElement.scrollTop > 240;
    },
  },
};
</script>
<style>
html {
  touch-action: manipulation;
}
</style>
<style scoped lang="scss">
.parent-content {
  align-items: center;
}
.v-bottom-navigation span,
.v-bottom-navigation i {
  color: #ffffff !important;
}
.v-btn--active {
  height: 100% !important;
}
.app-bar-link {
  margin-left: 13px;
}
.app-bar-search-button {
  position: fixed;
  top: 4px;
  right: 78px;
}
.app-bar-notification-wrapper {
  position: fixed;
  right: 50px;
  top: 4px;
}
.app-bar-notification-badge {
  margin-top: 12px;
  margin-right: 4px;
}
.app-bar-notification-button {
  margin-top: -12px;
  margin-right: -8px;
}
.app-bar-notification-list-wrapper {
  top: 50px !important;
  left: 32px !important;
  min-width: 80vw !important;
}
.app-bar-notification-message {
  line-height: 1.3rem;
}
.notifications-list {
  padding: 2px;
  height: 80vh;
  overflow-y: scroll;
}
.notifications-list-item {
  font-size: 0.9rem;
  margin: 16px 0px;
}
.app-bar-menu-button {
  position: fixed;
  right: 10px;
  top: 4px;
}
.app-bar-menu-img {
  width: 22px;
  height: auto;
}
.search-dialog {
  height: 80vh;
}
.search-content {
  height: 75%;
}
#mainContent {
  padding: 0px !important;
}
.decoration-line {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 999;
  background: rgb(231, 64, 89);
  background: linear-gradient(
    135deg,
    rgba(231, 64, 89, 1) 0%,
    rgba(189, 100, 153, 1) 100%
  ) !important;
}
.bottom-navigation {
  align-items: center;
}
.app-bar-logo-img {
  left: 200px;
  margin-top: 10px !important;
  width: 50px;
  height: auto;
}
.app-bar-white {
  background-color: white !important;
}
#avater {
  margin-left: 20px !important;
}
#avater p {
  font-size: 20px !important;
}
.artist-avater {
  top: 1px;
}
.artist-avater-image {
  object-fit: cover;
}
.artist-name {
  margin-right: 8px;
}
.no-profile-image {
  object-fit: cover;
}
</style>
