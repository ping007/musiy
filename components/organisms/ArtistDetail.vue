<template>
  <div v-if="artist_" v-scroll.self="scroll" class="artist-wrapper">
    <div v-show="isLoadingMask" class="loading-mask">
      <Loading v-model="loadingValue" />
    </div>
    <v-row class="ma-0">
      <v-img
        v-if="artist_.imageId"
        :src="imgUrl(artist_.imageId)"
        width="100%"
        height="auto"
        alt="artist image"
        class="artist-image"
        gradient="to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 60%, rgba(25,25,25,.3) 100%"
      />
      <v-img
        v-else
        class="artist-image"
        gradient="to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 60%, rgba(25,25,25,.3) 100%"
        :src="'/images/no_image.png'"
        alt="artist no image"
      />
    </v-row>
    <v-row class="artist-profile ma-0">
      <div class="artist-profile-child">
        <v-row justify="center" no-gutters>
          <v-col cols="10">
            <span
              id="artist-name"
              class="default-font-family msy-color-text-red"
              v-text="artist_.username"
            ></span>
          </v-col>
          <v-col cols="10">
            <p
              id="artist-description"
              class="
                msy-color-text-white
                default-font-family
                artist-profile-text-decoration
              "
            >
              <span v-text="artist_.description"></span>
            </p>
          </v-col>
        </v-row>
        <v-row justify="center" class="mb-3" no-gutters>
          <v-col v-if="isSupported" cols="7">
            <v-row
              v-show="!showSupportedPlanPanel"
              class="ma-4"
              justify="center"
              align="center"
              no-gutters
            >
              <v-btn
                class="supported-plan-btn"
                color="rgba(231, 64, 89, 1)"
                block
                outlined
                @click="showSupportedPlanPanel = !showSupportedPlanPanel"
                v-text="`${supportedPlan.planName}で応援中`"
              />
            </v-row>
            <v-row
              v-show="showSupportedPlanPanel"
              class="ma-4"
              justify="center"
              align="center"
              no-gutters
            >
              <v-btn
                outlined
                block
                color="rgba(231, 64, 89, 1)"
                @click="showSupportedPlanPanel = !showSupportedPlanPanel"
                v-text="'閉じる'"
              />
            </v-row>
          </v-col>
          <v-col v-else cols="6">
            <div v-if="plans === undefined" class="text-center">
              <v-progress-circular
                indeterminate
                :size="24"
                :width="3"
                :rotate="360"
                color="rgb(231, 64, 89)"
              />
            </div>
            <div v-else class="block-center">
              <v-btn
                v-if="hasPlans"
                class="msy-color-red donation-btn"
                outlined
                rounded
                @click="selectSupport"
              >
                <v-icon small>mdi-currency-jpy</v-icon>
                <span v-text="'応援する'"></span>
              </v-btn>
              <div v-else class="block-center"></div>
            </div>
          </v-col>
          <v-col v-show="!isFollowing" cols="4" class="block-center">
            <v-btn
              class="follow-btn"
              color="rgb(231, 64, 89)"
              outlined
              dense
              rounded
              @click="updateFollow"
            >
              <v-icon left>mdi-account-plus</v-icon>
              <span v-text="'フォロー'"></span>
            </v-btn>
          </v-col>
          <v-col v-show="isFollowing" cols="4" class="block-center">
            <v-btn
              class="follow-btn"
              color="rgb(231, 64, 89)"
              outlined
              dense
              rounded
              @click="updateFollow"
            >
              <v-icon left>mdi-account-remove</v-icon>
              <span v-text="'フォロー解除'"></span>
            </v-btn>
          </v-col>
        </v-row>
        <v-row class="ma-4" justify="center" align="center">
          <v-dialog
            v-if="isSupported"
            v-model="showSupportedPlanPanel"
            transition="scroll-y-reverse-transition"
          >
            <v-card class="support-plan-panel">
              <div
                v-if="
                  supportedPlan.planImageId && supportedPlan.planImageId !== ''
                "
                class="support-plan-img"
              >
                <v-img
                  :src="imgUrl(supportedPlan.planImageId)"
                  lazy-src="/images/no_image.png"
                  class="support-plan-img-inner"
                >
                  <template v-slot:placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="grey lighten-5"
                      />
                    </v-row>
                  </template>
                </v-img>
                <h2
                  class="support-plan-name"
                  v-text="supportedPlan.planName"
                ></h2>
              </div>
              <div v-else class="support-plan-img">
                <v-img
                  class="support-plan-img-inner"
                  src="/images/no_image.png"
                />
                <h2
                  class="support-plan-name"
                  v-text="supportedPlan.planName"
                ></h2>
              </div>
              <v-row class="ma-4">
                <v-col cols="9">
                  <p v-text="supportedPlan.planDescription"></p>
                </v-col>
                <v-col cols="3">
                  <div class="support-plan-price">
                    <p v-text="supportedPlan.planPrice + 'P'"></p>
                  </div>
                </v-col>
              </v-row>
              <v-row class="pb-5" justify="center" align="center" no-gutters>
                <v-btn
                  v-if="hasPlans"
                  class="donation-btn"
                  outlined
                  rounded
                  color="rgb(231, 64, 89)"
                  dense
                  @click="selectSupport"
                >
                  <v-icon small>mdi-currency-jpy</v-icon>
                  <span v-text="'応援プランを変更する'"></span>
                </v-btn>
              </v-row>
            </v-card>
          </v-dialog>
        </v-row>
        <v-row justify="center" align="center" no-gutters>
          <v-col cols="9">
            <v-row class="sns-btns">
              <v-col cols="3" class="block-center py-1">
                <v-btn
                  small
                  outlined
                  fab
                  :color="
                    artist_.homepageUrl ? 'teal darken-2' : 'grey lighten-2'
                  "
                  @click="toOuterWebSite(artist_.homepageUrl)"
                >
                  <v-icon
                    :color="
                      artist_.homepageUrl ? 'teal darken-2' : 'grey lighten-2'
                    "
                  >
                    mdi-home
                  </v-icon>
                </v-btn>
              </v-col>
              <v-col cols="3" class="block-center py-1">
                <v-btn
                  small
                  outlined
                  fab
                  :color="artist_.blogUrl ? 'lime darken-2' : 'grey lighten-2'"
                  @click="toOuterWebSite(artist_.blogUrl)"
                >
                  <v-icon
                    :color="
                      artist_.blogUrl ? 'lime darken-2' : 'grey lighten-2'
                    "
                  >
                    mdi-blogger
                  </v-icon>
                </v-btn>
              </v-col>
              <v-col cols="3" class="block-center py-1">
                <v-btn
                  small
                  outlined
                  fab
                  :color="
                    artist_.facebookUrl ? 'blue darken-2' : 'grey lighten-2'
                  "
                  @click="
                    toOuterWebSite(
                      `https://facebook.com/${artist_.facebookUrl}`
                    )
                  "
                >
                  <v-icon
                    :color="
                      artist_.facebookUrl ? 'blue darken-2' : 'grey lighten-2'
                    "
                  >
                    mdi-facebook
                  </v-icon>
                </v-btn>
              </v-col>
              <v-col cols="3" class="block-center py-1">
                <v-btn
                  small
                  outlined
                  fab
                  :color="
                    artist_.twitterUrl ? 'blue darken-1' : 'grey lighten-2'
                  "
                  @click="
                    toOuterWebSite(`https://twitter.com/${artist_.twitterUrl}`)
                  "
                >
                  <v-icon
                    :color="
                      artist_.twitterUrl ? 'blue darken-1' : 'grey lighten-2'
                    "
                  >
                    mdi-twitter
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
    </v-row>
    <v-spacer class="vertical-space" />
    <div class="artist-detail">
      <v-tabs
        v-model="selectedTab_"
        color="rgb(231, 64, 89)"
        fixed-tabs
        @change="changeSelectedTab($event.replace('tab-', ''))"
      >
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
        <v-tabs-items v-model="selectedTab_">
          <v-tab-item :key="'feeds'" :value="'tab-feeds'">
            <v-divider />
            <ArtistFeedList
              :cache-key-prefix="cacheKeys.artistDetailFeedsCacheKeyPrefix"
              :artist-user-id="artist_.userId"
              :feeds="feeds"
              :is-following="isFollowing"
              :supported-plan="supportedPlan"
              :is-content-loaded="isFeedsLoaded"
              @select-movie="selectMovie"
              @select-music="selectMusic"
              @to-follow="updateFollow"
              @to-support="selectSupport"
            />
          </v-tab-item>
          <v-tab-item :key="'movies'" :value="'tab-movies'">
            <v-divider />
            <MovieList
              :cache-key-prefix="cacheKeys.artistDetailMoviesCacheKeyPrefix"
              :artist-user-id="artist_.userId"
              :movies="movies"
              :is-content-loaded="isMoviesLoaded"
              :is-following="isFollowing"
              :supported-plan="supportedPlan"
              @select-item="selectMovie"
              @to-follow="updateFollow"
              @to-support="selectSupport"
            />
          </v-tab-item>
          <v-tab-item :key="'musics'" :value="'tab-musics'">
            <v-divider />
            <MusicList
              :cache-key-prefix="cacheKeys.artistDetailMusicsCacheKeyPrefix"
              :artist-user-id="artist_.userId"
              :musics="musics"
              :is-content-loaded="isMusicsLoaded"
              :is-following="isFollowing"
              :supported-plan="supportedPlan"
              @select-item="selectMusic"
              @to-follow="updateFollow"
              @to-support="selectSupport"
            />
          </v-tab-item>
          <!-- <v-tab-item :key="'schedules'" :value="'tab-schedules'">
            <v-divider />
            <ArtistScheduleList :opened="scheduleListOpened" @list-open="scheduleListOpened = true" />
          </v-tab-item>-->
          <v-tab-item :key="'broadcasts'" :value="'tab-broadcasts'">
            <v-divider />
            <BroadcastVerticalList
              :cache-key-prefix="cacheKeys.artistDetailBroadcastsCacheKeyPrefix"
              :artist-user-id="artist_.userId"
              :broadcasts="broadcasts"
              :is-content-loaded="isBroadcastsLoaded"
              :is-following="isFollowing"
              :supported-plan="supportedPlan"
              @select-broadcast="selectTicket"
              @to-follow="updateFollow"
              @to-support="selectSupport"
            />
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
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
      :is-purcahsed="false"
      :is-editable="false"
      @close="closeMoviePlayer"
    />
    <MusicPlayerDialog
      :is-show="isShowPlayerDialog"
      :music="music"
      :musics="selectedMusics"
      @close="close"
    />
    <TickteDetailDialog
      :is-show="isShowBroadcastDetailDialog"
      :broadcast="broadcast"
      @close="closeBroadcastDetailDialog"
    />
    <FeedDialog
      :is-show="isShowFeedDialog"
      :feed="feed"
      :supported-plan="supportedPlan"
      @close="closeFeedDialog"
      @select-movie="selectMovie"
      @select-music="selectMusic"
      @to-follow="updateFollow"
      @to-support="selectSupport"
    />
  </div>
</template>

<script>
import { Cloudinary } from "~/constant";
import ArtistFeedList from "~/components/organisms/ArtistFeedList";
import ArtistScheduleList from "~/components/organisms/ArtistScheduleList";
import MoviePlayerDialog from "~/components/organisms/MoviePlayerDialog";
import MusicPlayerDialog from "~/components/organisms/MusicPlayerDialog";
import TickteDetailDialog from "~/components/organisms/BroadcastDetailDialog";
import FeedDialog from "~/components/organisms/FeedDialog";
import MusicList from "~/components/organisms/MusicList";
import BroadcastVerticalList from "~/components/organisms/BroadcastVerticalList";
import MovieList from "~/components/organisms/MovieList";
import FeedsDao from "~/mixins/dao/FeedsDao";
import FollowsDao from "~/mixins/dao/FollowsDao";
import MoviesDao from "~/mixins/dao/MoviesDao";
import MusicsDao from "~/mixins/dao/MusicsDao";
import PlansDao from "~/mixins/dao/PlansDao";
import BroadcastsDao from "~/mixins/dao/BroadcastsDao";
import NotificationsService from "~/mixins/service/NotificationsService";
import LocalStorageService from "~/mixins/service/LocalStorageService";
import { CacheKeys } from "~/constant.js";
import Loading from "~/components/molecules/Loading";
export default {
  components: {
    ArtistFeedList,
    // ArtistScheduleList,
    BroadcastVerticalList,
    MoviePlayerDialog,
    MusicPlayerDialog,
    TickteDetailDialog,
    MusicList,
    MovieList,
    FeedDialog,
    Loading,
  },
  mixins: [
    FeedsDao,
    FollowsDao,
    MoviesDao,
    MusicsDao,
    PlansDao,
    BroadcastsDao,
    NotificationsService,
    LocalStorageService,
  ],
  props: ["artist", "tab", "isLoadingMask"],
  data() {
    return {
      cloudinary: Cloudinary,
      feeds: undefined,
      scheduleListOpened: false,
      artist_: undefined,
      selectedTab_: "",
      musics: undefined,
      music: undefined,
      selectedMusics: undefined,
      movies: undefined,
      topMovie: undefined,
      movie: undefined,
      broadcasts: undefined,
      broadcast: undefined,
      isShowMoviePlayerDialog: false,
      isShowPlayerDialog: false,
      isShowBroadcastDetailDialog: false,
      isFollowing: false,
      plans: undefined,
      supportedPlan: undefined,
      showSupportedPlanPanel: false,
      isBroadcastsLoaded: false,
      isMusicsLoaded: false,
      isMoviesLoaded: false,
      isFeedsLoaded: false,
      isShowSuccessSnackbar: false,
      successStr: "",
      isShowErrorSnackbar: false,
      errorStr: "",
      isScroll: undefined,
      feed: undefined,
      isShowFeedDialog: false,
      cacheKeys: CacheKeys,
      loadingValue: 0,
    };
  },
  computed: {
    hasPlans() {
      return this.plans && this.plans.length > 0;
    },
    isSupported() {
      return this.supportedPlan !== undefined && this.supportedPlan.isEnable;
    },
  },
  watch: {
    async artist(newValue, oldValue) {
      this.scheduleListOpened = false;
      this.artist_ = newValue;
      this.loadingValue = 0;
      this.loadingValue = 99;
      await this.loadData();
      const movieId =
        this.$route.query.movie_id !== undefined
          ? this.$route.query.movie_id
          : "";
      if (movieId) {
        this.tab = "movies";
        await this.loadMovies(this.artist_.userId);
      }
      const musicId =
        this.$route.query.music_id !== undefined
          ? this.$route.query.music_id
          : "";
      if (musicId) {
        this.tab = "musics";
        await this.loadMusics(this.artist_.userId);
      }
      const broadcastId =
        this.$route.query.broadcast_id !== undefined
          ? this.$route.query.broadcast_id
          : "";
      if (broadcastId) {
        this.tab = "broadcasts";
        await this.loadBroadcasts(this.artist_.userId);
      }

      const feedId =
        this.$route.query.feed_id !== undefined
          ? this.$route.query.feed_id
          : "";
      if (feedId) {
        this.tab = "feeds";
        await this.loadFeeds(this.artist_.userId);
      }

      this.selectedTab_ = `tab-${this.tab}`;

      if (movieId && this.movies.length > 0) {
        this.movie = this.movies.find((data) => {
          return data.movieId === movieId;
        });
        if (this.movie) {
          this.selectMovie(this.movie);
          this.isLoadingMask = false;
          return;
        }
      }

      if (musicId && this.musics.length > 0) {
        this.music = this.musics.find((data) => {
          return data.musicId === musicId;
        });
        if (this.music) {
          this.selectedMusics = this.musics;
          this.showPlayer();
          this.isLoadingMask = false;
          return;
        }
      }
      if (broadcastId && this.broadcasts.length > 0) {
        this.broadcast = this.broadcasts.find((data) => {
          return data.broadcastId === broadcastId;
        });
        if (this.broadcast) {
          this.selectTicket(this.broadcast);
          this.isLoadingMask = false;
          return;
        }
      }

      if (feedId && this.feeds.length > 0) {
        this.feed = this.feeds.find((data) => {
          return data.feedId === feedId;
        });
        if (this.feed) {
          this.selectFeed(this.feed);
          this.isLoadingMask = false;
          return;
        }
      }

      this.tab = "feeds";
      await this.loadFeeds(this.artist_.userId);
      this.isLoadingMask = false;
      this.selectedTab_ = `tab-${this.tab}`;
    },
  },
  async created() {
    this.artist_ = Object.assign({}, this.artist);
    if (!this.tab) {
      this.tab = "feeds";
    }
    this.selectedTab_ = `tab-${this.tab}`;
    await this.loadData();
    await this.changeSelectedTab(this.tab);
  },
  methods: {
    async loadData() {
      const loadAll = [];
      loadAll.push(this.loadSupportedPlan());
      loadAll.push(this.loadFollows());
      loadAll.push(this.loadPlans(this.artist_.userId));
      await Promise.all(loadAll);
    },
    async changeSelectedTab(tabName) {
      if (tabName === "feeds" && !(this.feeds && this.feeds.length > 0)) {
        await this.loadFeeds(this.artist_.userId);
      } else if (
        tabName === "movies" &&
        !(this.movies && this.movies.length > 0)
      ) {
        await this.loadMovies(this.artist_.userId);
      } else if (
        tabName === "musics" &&
        !(this.musics && this.musics.length > 0)
      ) {
        await this.loadMusics(this.artist_.userId);
      } else if (
        tabName === "broadcasts" &&
        !(this.broadcasts && this.broadcasts.length > 0)
      ) {
        await this.loadBroadcasts(this.artist_.userId);
      }
    },
    async updateFollow() {
      if (this.isFollowing) {
        const result = confirm(
          "本当に" + this.artist_.username + "さんのフォローを解除しますか？"
        );
        if (!result) {
          return;
        }
      }
      try {
        const user = this.$store.state.user.user;
        if (user) {
          const followFromUserId = user.userId;
          const followToUserId = this.artist_.userId;
          const result = await this.FollowsDao_UpsertFollow(
            followFromUserId,
            followToUserId,
            !this.isFollowing
          );
          this.isFollowing = !this.isFollowing;
          console.log(result);
          this.isShowSuccessSnackbar = true;
          if (this.isFollowing) {
            this.successStr = this.artist_.username + "さんをフォローしました";
            this.NotificationsService_addFollowingNotification(
              followFromUserId,
              followToUserId
            );
          } else {
            this.successStr =
              this.artist_.username + "さんのフォローを解除しました";
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    async loadSupportedPlan() {
      const user = this.$store.state.user.user;
      if (user) {
        const artistUserId = this.artist_.userId;
        const supporterUserId = user.userId;
        this.supportedPlan = await this.PlansDao_SelectPlanBySupporterUserId(
          artistUserId,
          supporterUserId
        );
      }
    },
    async loadFollows() {
      const user = this.$store.state.user.user;
      if (user) {
        const followFromUserId = user.userId;
        const followToUserId = this.artist_.userId;
        const follows = await this.FollowsDao_SelectFollowsByFollowFromUserId(
          followFromUserId
        );
        const result = follows.find((elem) => {
          return elem.followToUserId === followToUserId;
        });
        this.isFollowing = result && result.isFollowing === true;
      }
    },
    async loadFeeds(userId) {
      if (!this.feeds || this.feeds.length <= 0) {
        this.feeds = this.LocalStorageService_FetchFromLocalStorageByUser(
          this.cacheKeys.artistDetailFeedsCacheKeyPrefix,
          this.artist_.userId
        );
        this.isFeedsLoaded = true;
        this.feeds = await this.FeedsDao_SelectFeedsByUserId(userId);
      }
    },
    async loadMovies(userId) {
      this.movies = this.LocalStorageService_FetchFromLocalStorageByUser(
        this.cacheKeys.artistDetailMoviesCacheKeyPrefix,
        this.artist_.userId
      );
      this.isMoviesLoaded = true;
      const sqlResult = await this.MoviesDao_SelectMoviesByUserId(userId);
      this.movies = sqlResult;
    },
    async loadMusics(userId) {
      this.musics = this.LocalStorageService_FetchFromLocalStorageByUser(
        this.cacheKeys.artistDetailMusicsCacheKeyPrefix,
        this.artist_.userId
      );
      this.isMusicsLoaded = true;
      const sqlResult = await this.MusicsDao_SelectMusicsByUserId(userId);
      this.musics = sqlResult;
    },
    async loadBroadcasts(userId) {
      this.broadcasts = this.LocalStorageService_FetchFromLocalStorageByUser(
        this.cacheKeys.artistDetailBroadcastsCacheKeyPrefix,
        this.artist_.userId
      );
      this.isBroadcastsLoaded = true;
      const sqlResult = await this.BroadcastsDao_SelectBroadcastsByUserId(
        userId
      );
      this.broadcasts = sqlResult;
    },
    async loadPlans(userId) {
      const plansData = await this.PlansDao_SelectPlansByUserId(userId);
      this.plans = plansData;
    },
    imgUrl(imageId) {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${imageId}`;
    },
    selectMovie(movie) {
      this.movie = movie;
      this.showMoviePlayer();
    },
    selectTicket(broadcast) {
      this.broadcast = broadcast;
      this.isShowBroadcastDetailDialog = true;
    },
    selectFeed(feed) {
      this.feed = feed;
      this.isShowFeedDialog = true;
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
    closeFeedDialog() {
      this.feed = undefined;
      this.isShowFeedDialog = false;
    },
    selectSupport() {
      this.$router.push({
        name: "fans-supportplans",
        params: {
          plans: this.plans,
          supportedPlan: this.supportedPlan,
        },
      });
    },
    toOuterWebSite(url) {
      if (url) {
        window.open(url, "_blank");
      }
    },
    scroll() {
      this.$store.commit("setImageUrl", this.imgUrl(this.artist_.imageId));
      this.$store.commit("setName", this.artist_.username);
    },
  },
};
</script>

<style scoped>
.artist-image {
  min-height: 50vh;
}
.artist-detail {
  padding: 0 0 56px;
}
.artist-profile {
  position: relative;
}
.artist-profile-child {
  width: 100%;
  position: absolute;
  bottom: -24px;
  left: 0px;
}
.artist-profile-text-decoration {
  text-shadow: 0px 0px 10px rgba(0, 0, 0, 1);
}
#artist-name {
  font-size: 1.5rem !important;
  font-weight: 600 !important;
  text-shadow: 3px 1px 2px rgba(0, 0, 0, 0.9);
}
#artist-description {
  font-size: 0.9rem;
  margin-bottom: 8px;
}
.donation-btn {
  color: white;
}
.follow-btn {
  background-color: white;
}
.sns-btns {
  background-color: white;
  box-shadow: 1px 0px 10px 1px #ccc;
}
.vertical-space {
  height: 32px;
}
.support-plan-panel {
  width: 90vw;
  border-radius: 12px;
}
.support-plan-img {
  position: relative;
}
.support-plan-img-inner {
  max-height: 30vh;
  object-fit: contain;
  border-radius: 12px 12px 0 0;
}
.supported-plan-btn {
  font-size: 0.8rem;
}
.support-plan-name {
  position: absolute;
  z-index: 10;
  height: 100%;
  color: #ffffff;
  width: 100%;
  top: 0;
  left: 0;
  text-shadow: 0px 0px 10px rgba(0, 0, 0, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.25);
}
.support-plan-price {
  border-radius: 12px;
  height: 24px;
  width: 56px;
  background: linear-gradient(
    135deg,
    rgba(231, 64, 89, 1) 0%,
    rgba(189, 100, 153, 1) 100%
  );
  color: #ffffff;
  text-align: center;
}
.tab-title {
  font-size: 1rem;
}
.loading-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: white;
  padding: 0px;
  top: 0px;
  left: 0px;
  z-index: 500;
}
@media screen and (min-width: 960px) {
  .artist-wrapper {
    width: 40vw;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
