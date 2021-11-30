<template>
  <v-app v-show="isLoaded">
    <v-app-bar
      flat
      class="app-bar"
      :clipped-left="clipped"
      fixed
      app
    >
      <v-spacer />
      <v-toolbar-title
        class="app-title"
        @click="toArtistsMainPage"
        v-text="title"
      />
      <v-spacer />
      <v-btn
        class="app-bar-menu-button mr-1"
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon> mdi-menu </v-icon>
      </v-btn>
    </v-app-bar>
    <v-content :align="!isUserLoggedIn && 'center'">
      <v-container id="mainContent">
        <nuxt />
      </v-container>
    </v-content>
    <v-navigation-drawer v-model="rightDrawer" :right="right" temporary fixed>
      <v-list>
        <v-list-item @click="toProfileSetting">
          <v-list-item-action>
            <v-icon> mdi-cog </v-icon>
          </v-list-item-action>
          <v-list-item-title> プロフィール設定 </v-list-item-title>
        </v-list-item>
        <v-list-item @click="toBankTransferPage">
          <v-list-item-action>
            <v-icon> mdi-bank </v-icon>
          </v-list-item-action>
          <v-list-item-title> 振込申請 </v-list-item-title>
        </v-list-item>
        <v-list-item @click="toChangePassword">
          <v-list-item-action>
            <v-icon> mdi-lock </v-icon>
          </v-list-item-action>
          <v-list-item-title> パスワード変更 </v-list-item-title>
        </v-list-item>
        <v-list-item @click="toChangePurchaseInfo">
          <v-list-item-action>
            <v-icon> mdi-credit-card </v-icon>
          </v-list-item-action>
          <v-list-item-title> 決済情報登録 </v-list-item-title>
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
        <v-list-item @click="toFansMainPage">
          <v-list-item-action>
            <v-icon> mdi-logout </v-icon>
          </v-list-item-action>
          <v-list-item-title> アーティストログアウト </v-list-item-title>
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
      color="pink"
    >
      <v-btn @click="toArtistsMainPage">
        <span>Home</span>
        <v-icon> mdi-home </v-icon>
      </v-btn>

      <v-btn @click="toSupportersListPage">
        <span>Supporters</span>
        <v-icon> mdi-account-multiple </v-icon>
      </v-btn>

      <v-btn @click="toArtistMyMoviesPage">
        <span>My Movies</span>
        <v-icon> mdi-movie </v-icon>
      </v-btn>
      <v-btn @click="toArtistMyMusicsPage">
        <span>My Musics</span>
        <v-icon> mdi-music </v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      isLoaded: false,
      clipped: false,
      drawer: false,
      fixed: false,
      right: true,
      rightDrawer: false,
      menuDialog: false,
      title: "MUSIY",
      selectedGenres: [],
      genres: [
        { genreId: 0, name: "JAZZ" },
        { genreId: 1, name: "CLASSIC" },
        { genreId: 2, name: "POPS" },
        { genreId: 3, name: "DANCE" },
      ],
      isUpdating: false,
      activeBtn: 0,
    };
  },
  computed: {
    ...mapGetters("user", ["isUserLoggedIn"])
  },
  watch: {
    isUpdating(val) {
      if (val) {
        setTimeout(() => (this.isUpdating = false), 3000);
      }
    },
  },
  mounted() {
    const user = this.$store.state.user.user;
    if (user) {
      if (user.isArtist) {
        this.isLoaded = true;
      } else {
        this.$router.push({
          name: "fans-main",
        });
      }
    }
  },
  methods: {
    remove(item) {
      const index = this.selectedGenres.indexOf(item.genreId);
      if (index >= 0) {
        this.selectedGenres.splice(index, 1);
      }
    },
    execLogout() {
      this.toLogin();
    },
    toFansMainPage() {
      this.$router.push({
        name: "fans-main",
      });
    },
    toArtistsMainPage() {
      const user = this.$store.state.user.user;
      this.$router.push({
        name: "artists-main",
        params: { artistId: user.userId },
      });
    },
    toSupportersListPage() {
      this.$router.push({
        name: "artists-supporters",
      });
    },
    toArtistMyMoviesPage() {
      this.$router.push({
        name: "artists-mymovies",
      });
    },
    toArtistMyMusicsPage() {
      this.$router.push({
        name: "artists-mymusics",
      });
    },
    toProfileSetting() {
      this.$router.push({
        name: "artists-profile",
      });
    },
    toBankTransferPage() {
      this.$router.push({
        name: "artists-banktransfer",
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
    toHelpWebPage() {
      const url = "https://musiy.net/manual/";
      window.open(url, "_blank");
    },
    toContactWebPage() {
      const url = "https://musiy.net/contact/";
      window.open(url, "_blank");
    },
    toLogin() {
      this.$router.push({
        name: "login",
      });
    },
  },
};
</script>
<style>
html {
  touch-action: manipulation;
}
</style>
<style scoped>
.parent-content {
  align-items: center;
}
.app-bar {
  background-color: #ffffff !important;
}
.app-bar-search-button {
  position: fixed;
  right: 54px;
  top: 2px;
}
.app-bar-menu-button {
  position: fixed;
  right: 20px;
  top: 2px;
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
.bottom-navigation {
  align-items: center;
}
</style>
