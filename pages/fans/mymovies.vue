<template>
  <v-container class="mymovies" :fluid="true">
    <v-tabs color="rgb(231, 64, 89)" fixed-tabs>
      <v-tab :key="'mymovie'" :href="`#tab-mymovie`">
        <span class="tab-title" v-text="'購入済み'"></span>
      </v-tab>
      <v-tab :key="'playlater'" :href="`#tab-playlater`">
        <span class="tab-title" v-text="'あとで観る'"></span>
      </v-tab>
      <v-tab-item :key="'mymovie'" :value="'tab-mymovie'">
        <MovieList
          :movies="movies"
          :is-show-all-mode="true"
          @select-item="selectMovie"
        />
      </v-tab-item>
      <v-tab-item :key="'playlater'" :value="'tab-playlater'">
        <MovieList
          :movies="playLaterMovies"
          :is-show-all-mode="true"
          @select-item="selectMovie"
        />
      </v-tab-item>
    </v-tabs>
    <MoviePlayerDialog
      :is-show="isShowPlayerDialog"
      :movie="movie"
      :is-purcahsed="true"
      @close="isShowPlayerDialog = false"
    />
  </v-container>
</template>

<script>
import MovieList from "~/components/organisms/MovieList";
import MoviePlayerDialog from "~/components/organisms/MoviePlayerDialog";
import MoviesDao from "~/mixins/dao/MoviesDao";
export default {
  components: {
    MovieList,
    MoviePlayerDialog,
  },
  mixins: [MoviesDao],
  data() {
    return {
      artist: undefined,
      movies: undefined,
      playLaterMovies: undefined,
      movie: undefined,
      isShowPlayerDialog: false,
    };
  },
  async created() {
    this.$nuxt.$emit("updateActiveBtn", 2);
    await this.loadMovies();
  },
  methods: {
    selectMovie(movie) {
      this.movie = movie;
      this.showPlayer();
    },
    async loadMovies() {
      const results = [];
      const user = this.$store.state.user.user;
      results.push(this.MoviesDao_SelectPurchasedMoviesByUserId(user.userId));
      results.push(this.MoviesDao_SelectPlayLaterMoviesByUserId(user.userId));
      const sqlResults = await Promise.all(results);
      this.movies = sqlResults[0];
      this.playLaterMovies = sqlResults[1];
    },
    showPlayer() {
      this.isShowPlayerDialog = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.mymovies {
  padding: 0 0 56px;
}
</style>
