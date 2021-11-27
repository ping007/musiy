<template>
  <div>
    <div v-if="artist" class="artist-detail ma-auto">
      <v-row justify="space-between" align="center" class="py-5 mx-0">
        <v-col cols="3" class="py-0">
          <v-row align="center" justify="center">
            <v-avatar size="64px">
              <img v-if="artist.imageId" :src="imgUrl" alt="artist image" />
              <img
                v-else
                :src="'/images/no_image.png'"
                class="no-profile-image"
                alt="artist no image"
              />
            </v-avatar>
          </v-row>
        </v-col>
        <v-col cols="5" class="py-0">
          <v-row class="mx-1 headline">
            <span v-text="artist.username"></span>
          </v-row>
        </v-col>
        <v-col cols="4" class="py-0" />
      </v-row>
      <v-row class="ma-0">
        <v-col>
          <v-row class="mx-1 title">
            <span v-text="artist.description"></span>
          </v-row>
          <v-row justify="space-between" class="pl-1 py-3">
            <v-col cols="3">
              <v-btn
                outlined
                fab
                :color="artist.homepageUrl ? 'teal darken-2' : 'grey lighten-2'"
                @click="toOuterWebSite(artist.homepageUrl)"
              >
                <v-icon
                  :color="
                    artist.homepageUrl ? 'teal darken-2' : 'grey lighten-2'
                  "
                >
                  mdi-home
                </v-icon>
              </v-btn>
            </v-col>
            <v-col cols="3">
              <v-btn
                outlined
                fab
                :color="artist.blogUrl ? 'lime darken-2' : 'grey lighten-2'"
                @click="toOuterWebSite(artist.blogUrl)"
              >
                <v-icon
                  :color="artist.blogUrl ? 'lime darken-2' : 'grey lighten-2'"
                >
                  mdi-blogger
                </v-icon>
              </v-btn>
            </v-col>
            <v-col cols="3">
              <v-btn
                outlined
                fab
                :color="artist.facebookUrl ? 'blue darken-2' : 'grey lighten-2'"
                @click="
                  toOuterWebSite(`https://facebook.com/${artist.facebookUrl}`)
                "
              >
                <v-icon
                  :color="
                    artist.facebookUrl ? 'blue darken-2' : 'grey lighten-2'
                  "
                >
                  mdi-facebook
                </v-icon>
              </v-btn>
            </v-col>
            <v-col cols="3">
              <v-btn
                outlined
                fab
                :color="artist.twitterUrl ? 'blue darken-1' : 'grey lighten-2'"
                @click="
                  toOuterWebSite(`https://twitter.com/${artist.twitterUrl}`)
                "
              >
                <v-icon
                  :color="
                    artist.twitterUrl ? 'blue darken-1' : 'grey lighten-2'
                  "
                >
                  mdi-twitter
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row align="center" class="mb-5 mx-4">
        <v-btn
          outlined
          color="rgb(231, 64, 89)"
          block
          rounded
          @click="toProfileSetting"
          v-text="'プロフィール編集'"
        />
      </v-row>
      <v-row align="center" class="mx-4 mb-5 pb-5">
        <v-btn
          block
          outlined
          rounded
          color="rgb(231, 64, 89)"
          @click="editSupportPlan"
        >
          <span v-text="'応援プラン編集'"></span>
        </v-btn>
      </v-row>
      <v-divider />
      <div class="artist-my-profile">
        <v-tabs v-model="openTab" color="rgb(231, 64, 89)" fixed-tabs>
          <v-tab :key="'feeds'" :href="`#tab-feeds`">
            <span class="tab-title" v-text="'投稿'"></span>
          </v-tab>
          <v-tab :key="'movies'" :href="`#tab-movies`">
            <span class="tab-title" v-text="'動画'"></span>
          </v-tab>
          <v-tab :key="'musics'" :href="`#tab-musics`">
            <span class="tab-title" v-text="'音楽'"></span>
          </v-tab>
          <!-- <v-tab :key="'schedules'" :href="`#tab-schedules`">
          <span class="tab-title" v-text="'Schedules'"></span>
          </v-tab>-->
          <v-tab :key="'broadcasts'" :href="`#tab-broadcasts`">
            <span class="tab-title" v-text="'配信'"></span>
          </v-tab>
          <v-tab-item :key="'feeds'" :value="'tab-feeds'">
            <v-divider />
            <v-row class="pt-5 my-5 mx-5" align="center" justify="center">
              <v-btn
                class="mb-5"
                outlined
                color="rgb(231, 64, 89)"
                block
                rounded
                @click="toCreateFeedPage"
                v-text="'新規投稿'"
              />
              <ArtistFeedList
                :cache-key-prefix="cacheKeys.artistProfileFeedsCacheKeyPrefix"
                :artist-user-id="artist.userId"
                :feeds="feeds"
                :is-content-loaded="isFeedsLoaded"
                :is-show-all-mode="true"
                @select-movie="selectMovie"
                @select-music="selectMusic"
              />
            </v-row>
          </v-tab-item>
          <v-tab-item :key="'movies'" :value="'tab-movies'">
            <v-divider />
            <v-row class="pt-5 my-5 mx-5" align="center" justify="center">
              <v-btn
                class="mb-5"
                outlined
                color="rgb(231, 64, 89)"
                block
                rounded
                @click="toUploadFilePage('movie')"
                v-text="'動画アップロード'"
              />
              <MovieList
                :cache-key-prefix="cacheKeys.artistProfileMoviesCacheKeyPrefix"
                :artist-user-id="artist.userId"
                :movies="movies"
                :is-content-loaded="isMoviesLoaded"
                :is-show-all-mode="true"
                @select-item="selectMovie"
              />
            </v-row>
          </v-tab-item>
          <v-tab-item :key="'musics'" :value="'tab-musics'">
            <v-divider />
            <v-row class="pt-5 my-5 mx-5" align="center" justify="center">
              <v-btn
                class="mb-5"
                outlined
                color="rgb(231, 64, 89)"
                block
                rounded
                @click="toUploadFilePage('music')"
                v-text="'楽曲アップロード'"
              />
              <span>
                <MusicList
                  :cache-key-prefix="
                    cacheKeys.artistProfileMusicsCacheKeyPrefix
                  "
                  :artist-user-id="artist.userId"
                  :musics="musics"
                  :is-content-loaded="isMusicsLoaded"
                  :is-artist="true"
                  :is-show-all-mode="true"
                  @select-item="selectMusic"
                />
              </span>
            </v-row>
          </v-tab-item>
          <v-tab-item :key="'broadcasts'" :value="'tab-broadcasts'">
            <v-divider />
            <v-row class="pt-5 my-5 mx-5" align="center" justify="center">
              <v-btn
                class="mb-5"
                outlined
                color="rgb(231, 64, 89)"
                block
                rounded
                @click="toCreateTicketPage"
                v-text="'配信チケット新規作成'"
              />
              <BroadcastVerticalList
                :cache-key-prefix="
                  cacheKeys.artistProfileBroadcastsCacheKeyPrefix
                "
                :artist-user-id="artist.userId"
                :broadcasts="broadcasts"
                :is-content-loaded="isBroadcastsLoaded"
                :is-show-all-mode="true"
                @select-broadcast="selectTicket"
              />
            </v-row>
          </v-tab-item>
        </v-tabs>
      </div>
    </div>
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
    <MoviePlayerDialog
      :is-show="isShowMoviePlayerDialog"
      :movie="movie"
      :is-purcahsed="true"
      :is-editable="true"
      @to-edit="toMovieEdit"
      @showplayer="$emit('showplayer')"
      @close="closeMoviePlayer"
    />
    <MusicPlayerDialog
      :is-show="isShowPlayerDialog"
      :music="music"
      :musics="selectedMusics"
      :is-editable="true"
      @to-edit="toMusicEdit"
      @showplayer="$emit('showplayer')"
      @close="close"
    />
    <TickteDetailDialog
      :is-show="isShowBroadcastDetailDialog"
      :broadcast="broadcast"
      :is-editable="true"
      @broadcast-cancelled="broadcastCancelled"
      @close="closeBroadcastDetailDialog"
    />
  </div>
</template>

<script>
import ArtistFeedList from "~/components/organisms/ArtistFeedList";
// import ArtistScheduleList from "~/components/organisms/ArtistScheduleList";
import MoviePlayerDialog from "~/components/organisms/MoviePlayerDialog";
import MusicPlayerDialog from "~/components/organisms/MusicPlayerDialog";
import TickteDetailDialog from "~/components/organisms/BroadcastDetailDialog";
import MovieList from "~/components/organisms/MovieList";
import MusicList from "~/components/organisms/MusicList";
import BroadcastVerticalList from "~/components/organisms/BroadcastVerticalList";
import FeedsDao from "~/mixins/dao/FeedsDao";
import MoviesDao from "~/mixins/dao/MoviesDao";
import MusicsDao from "~/mixins/dao/MusicsDao";
import BroadcastsDao from "~/mixins/dao/BroadcastsDao";
import { Cloudinary } from "~/constant";
import LocalStorageService from "~/mixins/service/LocalStorageService";
import { CacheKeys } from "~/constant.js";
import EmptyValUtils from "~/mixins/util/EmptyValUtils";
export default {
  components: {
    ArtistFeedList,
    // ArtistScheduleList,
    MoviePlayerDialog,
    MusicPlayerDialog,
    TickteDetailDialog,
    MovieList,
    MusicList,
    BroadcastVerticalList,
  },
  mixins: [FeedsDao, MoviesDao, MusicsDao, BroadcastsDao, LocalStorageService],
  props: ["artistId", "childOpenTab"],
  data() {
    return {
      feeds: [],
      scheduleListOpened: false,
      movies: undefined,
      movie: undefined,
      musics: undefined,
      selectedMusics: undefined,
      music: undefined,
      broadcasts: undefined,
      broadcast: undefined,
      artist: undefined,
      isShowMoviePlayerDialog: false,
      isShowPlayerDialog: false,
      isShowBroadcastDetailDialog: false,
      isBroadcastsLoaded: false,
      isMusicsLoaded: false,
      isMoviesLoaded: false,
      isFeedsLoaded: false,
      cloudinary: Cloudinary,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      isShowFeedDialog: false,
      cacheKeys: CacheKeys,
      openTab: this.childOpenTab,
    };
  },
  computed: {
    imgUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${this.artist.imageId}`;
    },
  },
  watch: {
    artistId(newValue, oldValue) {
      this.scheduleListOpened = false;
    },
  },
  async created() {
    const user = this.$store.state.user.user;
    if (user && user.isArtist) {
      this.artist = user;
      this.loadCache();
      await this.loadAll();
      const keeped = sessionStorage.getItem("broadcast");
      if (keeped) {
        this.broadcast = JSON.parse(keeped);
        this.isShowBroadcastDetailDialog = true;
      }
    } else {
      this.$router.push({
        name: "fans-main",
      });
    }
  },
  methods: {
    loadCache() {
      this.feeds = this.LocalStorageService_FetchFromLocalStorageByUser(
        this.cacheKeys.artistProfileFeedsCacheKeyPrefix,
        this.artist.userId
      );
      this.isFeedsLoaded = true;
      const test = this.LocalStorageService_FetchFromLocalStorageByUser(
        this.cacheKeys.artistProfileMoviesCacheKeyPrefix,
        this.artist.userId
      );
      this.movies = test;
      if (this.isNotUndefinedAndNotNull(this.movies)) {
        this.movie = this.movies[0];
      }
      this.isMoviesLoaded = true;
      this.musics = this.LocalStorageService_FetchFromLocalStorageByUser(
        this.cacheKeys.artistProfileMusicsCacheKeyPrefix,
        this.artist.userId
      );
      if (this.isNotUndefinedAndNotNull(this.music)) {
        this.music = this.musics[0];
      }
      this.isMusicsLoaded = true;
      this.broadcasts = this.LocalStorageService_FetchFromLocalStorageByUser(
        this.cacheKeys.artistProfileBroadcastsCacheKeyPrefix,
        this.artist.userId
      );
      this.isBroadcastsLoaded = true;
    },
    async loadAll() {
      try {
        await this.loadFeeds();
        await this.loadMovies();
        await this.loadMusics();
        await this.loadBroadcasts();
      } catch (error) {
        console.error(error);
      }
    },
    async loadFeeds() {
      this.feeds = await this.FeedsDao_SelectFeedsByUserId(this.artist.userId);
    },
    async loadMovies() {
      this.movies = await this.MoviesDao_SelectMoviesByUserId(
        this.artist.userId
      );
      this.movie = this.movies[0];
    },
    async loadMusics() {
      this.musics = await this.MusicsDao_SelectMusicsByArtistUserId(
        this.artist.userId
      );
      this.music = this.musics[0];
    },
    async loadBroadcasts() {
      this.broadcasts = undefined;
      this.broadcasts =
        await this.BroadcastsDao_SelectFullStatementOfBroadcasts();
    },
    selectMovie(movie) {
      this.movie = movie;
      this.showMoviePlayer();
    },
    showMoviePlayer() {
      this.isShowMoviePlayerDialog = true;
      this.$emit("showplayer");
    },
    selectMusic(musicData) {
      this.music = musicData.music;
      this.selectedMusics = musicData.musics;
      this.showPlayer();
    },
    showPlayer() {
      this.isShowPlayerDialog = true;
      this.$emit("showplayer");
    },
    selectTicket(broadcast) {
      this.broadcast = broadcast;
      this.isShowBroadcastDetailDialog = true;
    },
    toProfileSetting() {
      this.$router.push({
        name: "artists-profile",
      });
    },
    toUploadFilePage(tabName) {
      this.$router.push({
        name: "artists-uploadfile",
        params: { selectedTab: tabName },
      });
    },
    toCreateFeedPage() {
      this.$router.push({ name: "artists-createfeed" });
    },
    toCreateTicketPage() {
      this.$router.push({ name: "artists-createticket" });
    },
    toOuterWebSite(url) {
      if (url) {
        window.open(url, "_blank");
      }
    },
    editSupportPlan() {
      this.$router.push({ name: "artists-createplan" });
    },
    toMusicEdit() {
      this.$router.push({
        name: "artists-editcontentfile",
        params: { selectedTab: "music", content: this.music },
      });
    },
    toMovieEdit() {
      this.$router.push({
        name: "artists-editcontentfile",
        params: { selectedTab: "movie", content: this.movie },
      });
    },
    close() {
      this.isShowPlayerDialog = false;
      this.music = undefined;
      this.$emit("closeplayer");
    },
    closeMoviePlayer() {
      this.isShowMoviePlayerDialog = false;
      this.movie = undefined;
      this.$emit("closeplayer");
    },
    closeBroadcastDetailDialog() {
      this.broadcast = undefined;
      this.isShowBroadcastDetailDialog = false;
    },
    async broadcastCancelled() {
      try {
        await this.loadBroadcasts();
        this.isShowSuccessSnackbar = true;
        this.successStr = "配信がキャンセルされました";
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.artist-my-profile {
  padding: 0 0 56px;
}
.no-profile-image {
  object-fit: cover;
}
.tab-title {
  font-size: 1rem;
}
@media screen and (min-width: 960px) {
  .artist-detail {
    width: 50vw;
  }
}
</style>
