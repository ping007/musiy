<template>
  <div>
    <v-container v-if="isLoaded" class="fans-main" fluid>
      <div v-if="!isShowAll">
        <v-tabs
          color="rgb(231, 64, 89)"
          show-arrows
          @change="
            selectedGenre = $event.replace('tab-', '');
            changeSelectedGenreArtists();
          "
        >
          <v-tab :key="'top'" :href="`#tab-top`">
            <span class="tab-title" v-text="'Top'"></span>
          </v-tab>
          <v-tab
            v-for="musicGenreItem in myMusicGenreItems"
            :key="musicGenreItem.val"
            :href="'#tab-' + musicGenreItem.val"
          >
            <span class="tab-title" v-text="musicGenreItem.label"></span>
          </v-tab>

          <v-tab-item :key="'top'" :value="'tab-top'">
            <v-divider />
            <div class="mt-4"></div>
            <v-list subheader>
              <v-subheader>
                <div class="content-title">新着アーティスト</div>
              </v-subheader>
              <ArtistList
                :cache-key="cacheKeys.newArtistUsersCacheKey"
                :artists="newArtists"
                @select-item="goDetail"
              />
            </v-list>
            <v-list subheader>
              <v-subheader>
                <div class="content-title">新着配信</div>
                <hr class="content-line" />
                <a
                  class="content-button"
                  @click="onClickViewMoreBroadcasts('新着配信', newBroadcasts)"
                >
                  全て見る
                </a>
              </v-subheader>
              <BroadcastVerticalList
                :cache-key-prefix="cacheKeys.top100NewBroadcastsCacheKey"
                :broadcasts="sliceContentsArray(newBroadcasts)"
                :is-content-loaded="isLoaded"
                :is-show-all-mode="true"
                @select-broadcast="selectBroadcast"
              />
            </v-list>
            <v-list subheader>
              <v-subheader>
                <div class="content-title">人気の動画</div>
                <hr class="content-line" />
                <a
                  class="content-button"
                  @click="onClickViewMoreMovies('人気の動画', top100Movies)"
                >
                  全て見る
                </a>
              </v-subheader>
              <MovieList
                :is-horizontal="true"
                :cache-key-prefix="cacheKeys.top100PlayMoviesCacheKey"
                :movies="sliceContentsArray(top100Movies)"
                :is-show-all-mode="true"
                @select-item="selectMovie($event, top100Movies)"
                @to-follow="toArtistPage"
                @to-support="toArtistPage"
              />
            </v-list>
            <v-list subheader>
              <v-subheader>
                <div class="content-title">新着動画</div>
                <hr class="content-line" />
                <a
                  class="content-button"
                  @click="onClickViewMoreMovies('新着動画', newMovies)"
                >
                  全て見る
                </a>
              </v-subheader>
              <MovieList
                :is-horizontal="true"
                :cache-key-prefix="cacheKeys.top100NewMoviesCacheKey"
                :movies="sliceContentsArray(newMovies)"
                :is-show-all-mode="true"
                @select-item="selectMovie($event, newMovies)"
                @to-follow="toArtistPage"
                @to-support="toArtistPage"
              />
            </v-list>
            <v-list subheader>
              <v-subheader>
                <div class="content-title">人気の楽曲</div>
                <hr class="content-line" />
                <a
                  class="content-button"
                  @click="onClickViewMore('人気の楽曲', top100Musics)"
                >
                  全て見る
                </a>
              </v-subheader>
              <MusicVerticalList
                :cache-key="cacheKeys.top100PlayMusicsCacheKey"
                :musics="top100Musics"
                :likes="userLikes"
                :is-show-all-mode="true"
                @select-item="selectMusic"
                @to-follow="toArtistPage"
                @to-support="toArtistPage"
              />
            </v-list>
            <v-list subheader>
              <v-subheader>
                <div class="content-title">新着楽曲</div>
                <hr class="content-line" />
                <a
                  class="content-button"
                  @click="onClickViewMore('新着楽曲', newMusics)"
                >
                  全て見る
                </a>
              </v-subheader>
              <MusicVerticalList
                :cache-key="cacheKeys.top100NewMusicsCacheKey"
                :musics="newMusics"
                :likes="userLikes"
                :is-show-all-mode="true"
                @select-item="selectMusic"
                @to-follow="toArtistPage"
                @to-support="toArtistPage"
              />
            </v-list>
          </v-tab-item>
          <v-tab-item
            v-for="musicGenreItem in myMusicGenreItems"
            :key="musicGenreItem.val"
            :value="'tab-' + musicGenreItem.val"
          >
            <v-divider />
            <v-list subheader>
              <v-subheader>新着アーティスト</v-subheader>
              <ArtistList
                :artists="selectedGenreArtists"
                @select-item="goDetail"
              />
            </v-list>
            <v-divider />
            <v-list subheader>
              <v-subheader>
                <div class="content-title">人気の楽曲</div>
                <hr class="content-line" />
                <a
                  class="content-button"
                  @click="
                    onClickViewMore(
                      '人気の楽曲',
                      getGenreFilteredMusic(musicGenreItem.val, top100Musics)
                    )
                  "
                >
                  全て見る
                </a>
              </v-subheader>
              <MusicVerticalList
                :musics="
                  getGenreFilteredMusic(musicGenreItem.val, top100Musics)
                "
                :likes="userLikes"
                @select-item="selectMusic"
                @to-follow="toArtistPage"
                @to-support="toArtistPage"
              />
            </v-list>
            <v-list subheader>
              <v-subheader>
                <div class="content-title">新着楽曲</div>
                <hr class="content-line" />
                <a
                  class="content-button"
                  @click="
                    onClickViewMore(
                      '新着楽曲',
                      getGenreFilteredMusic(musicGenreItem.val, newMusics)
                    )
                  "
                >
                  全て見る
                </a>
              </v-subheader>
              <MusicVerticalList
                :musics="getGenreFilteredMusic(musicGenreItem.val, newMusics)"
                :likes="userLikes"
                @select-item="selectMusic"
                @to-follow="toArtistPage"
                @to-support="toArtistPage"
              />
            </v-list>
          </v-tab-item>
        </v-tabs>
      </div>
    </v-container>
    <v-container v-else class="my-5">
      <v-row justify="center" align="center" class="my-5">
        <v-progress-circular
          indeterminate
          :size="48"
          :width="5"
          :rotate="360"
          color="rgb(231, 64, 89)"
        />
      </v-row>
    </v-container>
    <div v-if="isShowAll" class="show-all-musics-dialog">
      <v-dialog
        v-if="showAllMusics || showAllMovies || showAllBroadcasts"
        v-model="isShowAll"
        persistent
        fullscreen
        hide-overlay
        transition="scroll-y-reverse-transition"
      >
        <v-card tile class="dialog-content">
          <div>
            <v-row
              class="headline"
              primary-title
              align="center"
              justify="center"
            >
              <v-col cols="2" class="py-2 px-0">
                <v-btn class="px-0" text @click="closeShowAll">
                  <v-icon dark class="close-icon px-0" color="rgb(231, 64, 89)">
                    mdi-play
                  </v-icon>
                  <span class="caption msy-color-text-red">戻る</span>
                </v-btn>
              </v-col>
              <v-col cols="8" class="pl-3 pb-2 pt-3">
                <span
                  class="default-font-family font-weight-bold show-all-title"
                  v-text="showAllTitle"
                ></span>
              </v-col>
            </v-row>

            <v-row v-if="showAllMusics">
              <MusicList
                :musics="showAllMusics"
                :likes="userLikes"
                @select-item="selectMusic"
                @to-follow="toArtistPage"
                @to-support="toArtistPage"
              />
            </v-row>
            <v-row v-else-if="showAllMovies" align="center" justify="center">
              <MovieList
                :movies="showAllMovies"
                @select-item="selectMovie($event, showAllMovies)"
                @to-follow="toArtistPage"
                @to-support="toArtistPage"
              />
            </v-row>
            <v-row
              v-else-if="showAllBroadcasts"
              align="center"
              justify="center"
            >
              <BroadcastList
                :broadcasts="showAllBroadcasts"
                :is-content-loaded="isLoaded"
                @select-broadcast="selectBroadcast"
                @select-item="selectBroadcast"
                @to-follow="toArtistPage"
                @to-support="toArtistPage"
              />
            </v-row>
          </div>
        </v-card>
      </v-dialog>
    </div>
    <MusicPlayerDialog
      :is-show="isShowPlayerDialog"
      :music="music"
      :musics="selectedMusics"
      @close="close"
    />
    <MoviePlayerDialog
      :is-show="isShowMoviePlayerDialog"
      :movie="movie"
      :movies="selectedMovies"
      :is-purcahsed="false"
      :is-editable="false"
      @close="closeMoviePlayer"
    />
    <BroadcastDetailDialog
      :is-show="isShowBroadcastDetailDialog"
      :broadcast="broadcast"
      @close="closeBroadcastDetailDialog"
    />
  </div>
</template>

<script>
import ArtistList from "~/components/organisms/ArtistList";
import MovieList from "~/components/organisms/MovieList";
import BroadcastList from "~/components/organisms/BroadcastList";
import BroadcastVerticalList from "~/components/organisms/BroadcastVerticalList";
import MusicVerticalList from "~/components/organisms/MusicVerticalList";
import MusicList from "~/components/organisms/MusicList";
import MusicPlayerDialog from "~/components/organisms/MusicPlayerDialog";
import MoviePlayerDialog from "~/components/organisms/MoviePlayerDialog";
import BroadcastDetailDialog from "~/components/organisms/BroadcastDetailDialog";
import ArtistsDao from "~/mixins/dao/ArtistsDao";
import MusicsDao from "~/mixins/dao/MusicsDao";
import MoviesDao from "~/mixins/dao/MoviesDao";
import BroadcastsDao from "~/mixins/dao/BroadcastsDao";
import UsersDao from "~/mixins/dao/UsersDao";
import EvaluationsDao from "~/mixins/dao/EvaluationsDao";
import LocalStorageService from "~/mixins/service/LocalStorageService";
import { MusicGenreItems, CacheKeys } from "~/constant.js";

export default {
  components: {
    ArtistList,
    MovieList,
    BroadcastList,
    BroadcastVerticalList,
    MusicVerticalList,
    MusicList,
    MusicPlayerDialog,
    MoviePlayerDialog,
    BroadcastDetailDialog,
  },
  mixins: [
    ArtistsDao,
    MusicsDao,
    MoviesDao,
    BroadcastsDao,
    UsersDao,
    EvaluationsDao,
    LocalStorageService,
  ],
  data() {
    return {
      isLoaded: false,
      isShowAll: false,
      newArtists: undefined,
      top100Musics: undefined,
      newMusics: undefined,
      userLikes: undefined,
      top100Movies: undefined,
      newMovies: undefined,
      newBroadcasts: undefined,
      isBroadcastsLoaded: false,
      music: undefined,
      movie: undefined,
      broadcast: undefined,
      supportedPlan: undefined,
      selectedMusics: undefined,
      selectedMovies: undefined,
      showAllMusics: undefined,
      showAllMovies: undefined,
      showAllBroadcasts: undefined,
      isShowPlayerDialog: false,
      isShowMoviePlayerDialog: false,
      isShowBroadcastDetailDialog: false,
      myMusicGenreItems: [],
      artistsByGenre: {},
      showAllTitle: "",
      selectedGenre: "",
      selectedGenreArtists: [],
      cacheKeys: CacheKeys,
    };
  },
  watch: {
    userLikes(newValue, oldValue) {
      this.LocalStorageService_StoreToLocalStorage(
        this.cacheKeys.evaluationsIsLikedByUserIdCacheKey,
        newValue,
        null
      );
    },
  },
  async created() {
    this.$nuxt.$emit("updateActiveBtn", 0);
    const user = this.$store.state.user.user;
    if (user) {
      console.log(user.displayName);
      if (user.genres) {
        this.initMyMusicGenreItems(user.genres.split(","));
      }
      this.loadCache();
      await this.loadAll();
    }
  },
  mounted() {
    this.isLoaded = true;
  },
  methods: {
    sliceContentsArray(array) {
      let result = null;
      if (array && array.length > 5) {
        result = array.slice(0, 5);
      } else {
        result = array;
      }
      return result;
    },
    async changeSelectedGenreArtists() {
      this.selectedGenreArtists = [];
      if (this.artistsByGenre[this.selectedGenre]) {
        this.selectedGenreArtists = this.artistsByGenre[this.selectedGenre];
      } else {
        const result = await this.ArtistsDao_SelectArtistUsersByGenre(
          this.selectedGenre
        );
        this.artistsByGenre[this.selectedGenre] = result;
        this.selectedGenreArtists = result;
      }
    },
    getGenreFilteredMusic(genre, musics) {
      let result = musics;
      if (genre) {
        result = musics.filter((music) => {
          return music.genre.split(",").includes(genre);
        });
      }
      return result;
    },
    onClickViewMore(title, musics) {
      this.isShowAll = true;
      this.showAllTitle = title;
      this.showAllMusics = musics;
    },
    onClickViewMoreMovies(title, movies) {
      this.isShowAll = true;
      this.showAllTitle = title;
      this.showAllMovies = movies;
    },
    onClickViewMoreBroadcasts(title, broadcasts) {
      this.isShowAll = true;
      this.showAllTitle = title;
      this.showAllBroadcasts = broadcasts;
    },
    closeShowAll() {
      this.isShowAll = false;
      this.showAllTitle = "";
      this.showAllMusics = undefined;
      this.showAllMovies = undefined;
      this.showAllBroadcasts = undefined;
    },
    goDetail(artist) {
      this.$router.push({
        name: "fans-detail",
        params: { artist },
      });
    },
    selectMusic(musicData) {
      this.music = musicData.music;
      this.selectedMusics = musicData.musics;
      this.showPlayer();
    },
    selectMovie(movie, movies) {
      this.movie = movie;
      this.selectedMovies = movies;
      this.showMoviePlayer();
    },
    selectBroadcast(broadcast) {
      this.broadcast = broadcast;
      this.isShowBroadcastDetailDialog = true;
    },
    close() {
      this.isShowPlayerDialog = false;
      this.music = undefined;
    },
    closeMoviePlayer() {
      this.isShowMoviePlayerDialog = false;
      this.movie = undefined;
    },
    closeBroadcastDetailDialog() {
      this.isShowBroadcastDetailDialog = false;
      this.broadcast = undefined;
    },
    initMyMusicGenreItems(genres) {
      this.myMusicGenreItems = MusicGenreItems.filter((item) => {
        return genres.includes(item.val);
      });
    },
    loadCache() {
      this.newArtists = this.LocalStorageService_FetchFromLocalStorage(
        this.cacheKeys.newArtistUsersCacheKey
      );
      this.top100Musics = this.LocalStorageService_FetchFromLocalStorage(
        this.cacheKeys.top100PlayMusicsCacheKey
      );
      this.newMusics = this.LocalStorageService_FetchFromLocalStorage(
        this.cacheKeys.top100NewMusicsCacheKey
      );
      this.userLikes = this.LocalStorageService_FetchFromLocalStorage(
        this.cacheKeys.evaluationsIsLikedByUserIdCacheKey
      );
      this.top100Movies = this.LocalStorageService_FetchFromLocalStorage(
        this.cacheKeys.top100PlayMoviesCacheKey
      );
      this.newMovies = this.LocalStorageService_FetchFromLocalStorage(
        this.cacheKeys.top100NewMoviesCacheKey
      );
      this.newBroadcasts = this.LocalStorageService_FetchFromLocalStorage(
        this.cacheKeys.top100NewBroadcastsCacheKey
      );
    },
    async loadAll() {
      const results = [];
      results.push(this.ArtistsDao_SelectNewArtistUsers());
      results.push(this.MusicsDao_SelectTop100PlayMusics());
      results.push(this.MusicsDao_SelectTop100NewMusics());
      results.push(this.EvaluationsDao_SelectEvaluationsIsLikedByUserId());
      results.push(this.MoviesDao_SelectTop100PlayMovies());
      results.push(this.MoviesDao_SelectTop100NewMovies());
      results.push(this.BroadcastsDao_SelectTop100NewBroadcasts());
      const sqlResults = await Promise.all(results);
      this.newArtists = sqlResults[0];
      this.top100Musics = sqlResults[1];
      this.newMusics = sqlResults[2];
      this.userLikes = sqlResults[3];
      this.top100Movies = sqlResults[4];
      this.newMovies = sqlResults[5];
      this.newBroadcasts = sqlResults[6];
      this.userLikes = this.userLikes.map((x) => {
        return x.contentId;
      });
    },
    showPlayer() {
      this.isShowPlayerDialog = true;
    },
    showMoviePlayer() {
      this.isShowMoviePlayerDialog = true;
    },
    async toArtistPage(music) {
      if (music) {
        const artist = await this.UsersDao_SelectUserByUserId(music.userId);
        this.$router.push({
          name: "fans-detail",
          params: { artist },
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.show-all-musics-dialog {
  background-color: #ffffff !important;
}
.show-all-title {
  font-size: 22px;
}
.dialog-content {
  overflow-x: hidden;
}
.fans-main {
  padding: 0 0 56px;
}
.v-list .v-subheader {
  position: relative;
  padding-right: 0 !important;
}

.content-line {
  border: none;
  border-top: solid 1px rgb(231, 64, 89);
  margin-left: 32px;
  width: 100%;
}
@media screen and (max-width: 960px) {
  .content-title {
    white-space: nowrap;
    font-size: 1em !important;
  }
  .content-button {
    position: absolute;
    color: #ffffff;
    background: rgb(231, 64, 89);
    background: linear-gradient(
      135deg,
      rgba(231, 64, 89, 1) 0%,
      rgba(189, 100, 153, 1) 100%
    );
    width: auto;
    white-space: nowrap;
    right: 5%;
    padding: 5px 20px;
    border-radius: 20px;
    font-size: 0.8em;
  }
}
@media screen and (min-width: 960px) {
  .content-title {
    white-space: nowrap;
    font-size: 1.4em !important;
  }
  .content-button {
    position: absolute;
    color: #ffffff;
    background: rgb(231, 64, 89);
    background: linear-gradient(
      135deg,
      rgba(231, 64, 89, 1) 0%,
      rgba(189, 100, 153, 1) 100%
    );
    width: auto;
    white-space: nowrap;
    right: 5%;
    padding: 5px 20px;
    border-radius: 20px;
  }
}
.close-icon {
  transform: scale(-1, 1);
}
</style>
