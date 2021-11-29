<template>
  <v-container pa-0 fluid>
    <v-row class="mx-2 title">
      <span v-text="'My Movies'"></span>
    </v-row>
    <MovieList
      :movies="movies"
      :is-show-all-mode="true"
      @select-item="selectMovie"
    />
    <MoviePlayerDialog
      :is-show="isShowPlayerDialog"
      :movie="movie"
      :is-purcahsed="true"
      :is-editable="true"
      @to-edit="toMovieEdit"
      @close="closeMoviePlayer"
    />
  </v-container>
</template>

<script>
import MovieList from "~/components/organisms/MovieList";
import MoviePlayerDialog from "~/components/organisms/MoviePlayerDialog";
import MoviesDao from "~/mixins/dao/MoviesDao";
export default {
  layout: "artist",
  components: {
    MovieList,
    MoviePlayerDialog,
  },
  mixins: [MoviesDao],
  data() {
    return {
      movies: undefined,
      movie: undefined,
      isShowPlayerDialog: false,
    };
  },
  async created() {
    const user = this.$store.state.user.user;
    if (user) {
      await this.loadMovies(user.userId);
    } else {
      this.$router.push({ name: "fans-main" });
    }
  },
  methods: {
    selectMovie(movie) {
      this.movie = movie;
      this.showPlayer();
    },
    async loadMovies(userId) {
      const sqlResult = await this.MoviesDao_SelectMoviesByUserId(userId);
      this.movies = sqlResult;
    },
    showPlayer() {
      this.isShowPlayerDialog = true;
    },
    toMovieEdit() {
      this.isShowPlayerDialog = false;
      this.$router.push({
        name: "artists-editcontentfile",
        params: { selectedTab: "movie", content: this.movie },
      });
      this.movie = undefined;
    },
    closeMoviePlayer() {
      this.isShowPlayerDialog = false;
      this.movie = undefined;
      this.$emit("closeplayer");
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
