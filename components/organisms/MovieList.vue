<template>
  <div>
    <v-container v-if="movies" class="movie-list px-0 mx-0 mt-4">
      <div
        v-if="movies.length > 0"
        class="movie-list-row"
        :class="{ horizontal: isHorizontal }"
      >
        <v-row
          v-for="movie in movies"
          v-show="movie.isShow"
          :key="movie.movieId"
          class="pb-4 block-center"
        >
          <div
            v-if="judgeShowMovie(movie) || isShowAllMode"
            class="mx-5"
            @click="$emit('select-item', movie)"
          >
            <MovieThumbCard :movie="movie" />
          </div>
          <div
            v-else-if="
              parseInt(movie.allowType) ===
              contentAllowType.FollowersOrSupporters
            "
          >
            <v-card
              min-height="50vw"
              width="90vw"
              max-width="90vw"
              class="ma-0"
            >
              <v-list-item>
                <v-list-item-content class="px-4">
                  <v-list-item-title
                    class="movie-title"
                    color="#2d2d2d"
                    v-text="movie.title"
                  />
                </v-list-item-content>
              </v-list-item>
              <v-col>
                <v-row class="py-5" align="center" justify="center">
                  <v-icon color="rgb(231, 64, 89)" size="72px">
                    mdi-heart
                  </v-icon>
                </v-row>
                <v-row class="py-5" align="center" justify="center">
                  <span
                    class="msy-color-text-red"
                    v-text="'フォロワー・応援者限定コンテンツ'"
                  >
                  </span>
                </v-row>
                <v-row class="py-2" align="center" justify="center">
                  <v-btn
                    color="rgb(231, 64, 89)"
                    outlined
                    dense
                    rounded
                    @click="$emit('to-follow')"
                  >
                    <v-icon left>mdi-account-plus</v-icon>
                    <span v-text="'フォロー'"></span>
                  </v-btn>
                </v-row>
                <v-row class="py-2" align="center" justify="center">
                  <v-btn
                    class="msy-color-red donation-btn"
                    outlined
                    rounded
                    dark
                    @click="$emit('to-support')"
                  >
                    <v-icon small>mdi-currency-jpy</v-icon>
                    <span v-text="'応援する'"></span>
                  </v-btn>
                </v-row>
              </v-col>
            </v-card>
          </div>
          <div
            v-else-if="
              parseInt(movie.allowType) === contentAllowType.Supporters &&
              !judgeAllowedMovie(movie)
            "
          >
            <v-card
              min-height="50vw"
              width="90vw"
              max-width="90vw"
              class="ma-0"
            >
              <v-list-item>
                <v-list-item-content class="px-4">
                  <v-list-item-title
                    class="movie-title"
                    color="#2d2d2d"
                    v-text="movie.title"
                  />
                </v-list-item-content>
              </v-list-item>
              <v-col>
                <v-row class="py-5" align="center" justify="center">
                  <v-icon color="rgb(231, 64, 89)" size="72px">
                    mdi-gift
                  </v-icon>
                </v-row>
                <v-row class="py-5" align="center" justify="center">
                  <span
                    class="msy-color-text-red"
                    v-text="'応援者限定コンテンツ'"
                  ></span>
                </v-row>
                <v-row class="py-2" align="center" justify="center">
                  <span
                    class="msy-color-text-red"
                    v-text="
                      '応援プラン：' +
                      movie.planName +
                      '(' +
                      movie.planPrice +
                      'P)以上限定'
                    "
                  ></span>
                </v-row>
                <v-row class="py-2" align="center" justify="center">
                  <v-btn
                    class="msy-color-red donation-btn"
                    outlined
                    rounded
                    dark
                    @click="$emit('to-support')"
                  >
                    <v-icon small>mdi-currency-jpy</v-icon>
                    <span v-text="'応援する'"></span>
                  </v-btn>
                </v-row>
              </v-col>
            </v-card>
          </div>
        </v-row>
      </div>
      <div v-else>
        <v-row class="py-5" justify="center" align="center">
          <v-col class="msy-color-text-red">
            <v-row class="py-5" justify="center" align="center">
              <v-icon color="rgb(231, 64, 89)" size="72px">
                mdi-video-off
              </v-icon>
            </v-row>
            <v-row class="py-5" justify="center" align="center">
              <span v-text="'コンテンツはありません'"></span>
            </v-row>
          </v-col>
        </v-row>
      </div>
    </v-container>
    <v-container v-else class="movie-list">
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
  </div>
</template>

<script>
import { ContentAllowType } from "~/constant";
import MovieThumbCard from "~/components/molecules/MovieThumbCard";
import AllowedContentsService from "~/mixins/service/AllowedContentsService";
import LocalStorageService from "~/mixins/service/LocalStorageService";

export default {
  name: "MovieList",
  components: {
    MovieThumbCard,
  },
  mixins: [AllowedContentsService, LocalStorageService],
  props: {
    isHorizontal: {
      type: Boolean,
      default: false,
    },
    movies: {
      type: Array,
      default: undefined,
    },
    isFollowing: {
      type: Boolean,
      default: false,
    },
    isShowAllMode: {
      type: Boolean,
      default: false,
    },
    supportedPlan: {
      type: Object,
      default: undefined,
    },
    cacheKeyPrefix: String,
    artistUserId: String,
  },
  data() {
    return {
      contentAllowType: ContentAllowType,
    };
  },
  watch: {
    movies(newValue, oldValue) {
      this.storeToCache(newValue);
    },
  },
  created() {
    // This storage process is executed when this component is called by ArtistMyProfile,
    // because ArtistMyProfile creates this component on selecting movie tab and watch prop can't inspect initializing target prop on creating component.
    this.storeToCache(this.movies);
  },
  methods: {
    storeToCache(value) {
      if (this.cacheKeyPrefix && !this.artistUserId) {
        this.LocalStorageService_StoreToLocalStorage(
          this.cacheKeyPrefix,
          value,
          this.toCacheModels
        );
      } else if (this.cacheKeyPrefix && this.artistUserId) {
        this.LocalStorageService_StoreToLocalStorageByUser(
          this.cacheKeyPrefix,
          this.artistUserId,
          value,
          this.toCacheModels
        );
      }
    },
    toCacheModels(movies) {
      return this.movies.map((movie) => {
        return {
          isShow: movie.isShow,
          movieId: movie.movieId,
          allowType: movie.allowType,
          title: movie.title,
          planName: movie.planName,
          planPrice: movie.planPrice,
        };
      });
    },
    judgeShowMovie(movie) {
      let result = false;
      if (this.supportedPlan) {
        result = this.AllowedContentsService_JudgeShowContent(
          movie,
          this.supportedPlan,
          this.isFollowing
        );
      } else if (
        parseInt(movie.allowType) ===
        this.contentAllowType.FollowersOrSupporters
      ) {
        result = this.AllowedContentsService_JudgeShowContent(
          movie,
          this.supportedPlan,
          this.isFollowing
        );
      } else {
        result = parseInt(movie.allowType) === this.contentAllowType.All;
      }
      return result;
    },
    judgeFollowing(movie) {
      return this.AllowedContentsService_JudgeFollowing(
        movie,
        this.isFollowing
      );
    },
    judgeAllowedMovie(movie) {
      let result = false;
      if (this.supportedPlan) {
        result = this.AllowedContentsService_JudgeAllowedContent(
          movie,
          this.supportedPlan
        );
      } else {
        result = parseInt(movie.allowType) === this.contentAllowType.All;
      }
      return result;
    },
    judgeMyMovie(movie) {
      return this.AllowedContentsService_JudgeMyContent(movie);
    },
    // async loadSupportedPlan(artistUserId) {
    //   let supportedPlan;
    //   const user = this.$store.state.user.user;
    //   if (user) {
    //     const supporterUserId = user.userId;
    //     supportedPlan = await this.PlansDao_SelectPlanBySupporterUserId(
    //       artistUserId,
    //       supporterUserId
    //     );
    //   }
    //   return supportedPlan;
    // },
  },
};
</script>

<style lang="scss" scoped>
.movie-list {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.movie-list-row {
  width: 100%;
}
.horizontal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow-x: scroll;
}
</style>
