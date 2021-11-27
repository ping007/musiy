<template>
  <v-container
    v-touch:swipe.right="()=>{if (!this.$ua.isFromPc()) backToMain()}"
    pa-0
    :fluid="true"
  >
    <v-row v-if="$ua.isFromPc()" class="my-4">
      <v-btn @click="backToMain">
        <v-icon left>
          mdi-arrow-left
        </v-icon>Back
      </v-btn>
    </v-row>
    <ArtistDetail :artist="artist_" :tab="tab_" :is-loading-mask="isLoadingMask" @showplayer="showPlayer=true" @closeplayer="showPlayer=false" />
  </v-container>
</template>

<script>
import ArtistDetail from "~/components/organisms/ArtistDetail";
import ArtistsDao from "~/mixins/dao/ArtistsDao";

export default {
  components: {
    ArtistDetail
  },
  mixins: [ArtistsDao],
  data () {
    return {
      artist_: undefined,
      tab_: "",
      showPlayer: false,
      isLoadingMask: false,
    };
  },
  async created () {
    const artist = this.$route.params.artist;
    const params = this.$store.state.notificationContent;

    if (this.$route.query.artist_id !== undefined && this.$route.query.artist_id !== "") {
      if (this.$route.query.feed_id ||
        this.$route.query.music_id ||
        this.$route.query.movie_id ||
        this.$route.query.broadcast_id) {
        this.isLoadingMask = true;
      }
      const res = await this.selectArtist(this.$route.query.artist_id);
      if (!res) {
        this.$router.push({ name: "fans-main" });
      }
    } else if (params && params.artist) {
      this.artist_ = params.artist;
      this.tab_ = params.tab ? params.tab : "feeds";
      this.$store.commit("setNotificationContent", undefined);
    } else if (artist !== undefined) {
      this.artist_ = this.$route.params.artist;
      this.tab_ = this.$route.params.tab ? this.$route.params.tab : "feeds";
    } else {
      this.$router.push({ name: "fans-main" });
    }
  },
  beforeRouteLeave (to, from, next) {
    if (this.showPlayer) {
      const answer = window.confirm(
        "プレイヤーが開いています。ページを移動してよろしいですか？"
      );
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  methods: {
    changeDetailArtist (artist) {
      this.artistId_ = artist.artistId;
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },
    backToMain () {
      this.$router.push({ name: "fans-main" });
    },
    async selectArtist(artistId) {
      const sqlResults = await this.ArtistsDao_SelectArtistByUserId(artistId);
      if (sqlResults[0]) {
        this.tab_ = "feeds";
        this.artist_ = sqlResults[0];
        return true;
      }
      return false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
