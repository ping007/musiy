export default {
  methods: {
    async MoviesDao_SelectPlayLaterMoviesByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_play_later_movies_by_user_id"
        )({ userId });
        console.log("SQL Result:", result);
        let movies = [];
        if (result && result.data && result.data.rows.length > 0) {
          movies = result.data.rows;
          console.log("movies:", movies);
        }
        return movies;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MoviesDao_SelectTop100PlayMovies() {
      try {
        const user = this.$store.state.user.user;
        let userId = "";
        if (user) {
          userId = user.userId;
        }
        const result = await this.$functions.httpsCallable(
          "select_top_100_play_movies"
        )({ userId });
        console.log("SQL Result:", result);
        let movies = [];
        if (result && result.data && result.data.rows.length > 0) {
          movies = result.data.rows;
          console.log("movies:", movies);
        }
        return movies;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MoviesDao_SelectTop100NewMovies() {
      try {
        const user = this.$store.state.user.user;
        let userId = "";
        if (user) {
          userId = user.userId;
        }
        const result = await this.$functions.httpsCallable(
          "select_top_100_new_movies"
        )({ userId });
        console.log("SQL Result:", result);
        let movies = [];
        if (result && result.data && result.data.rows.length > 0) {
          movies = result.data.rows;
          console.log("movies:", movies);
        }
        return movies;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MoviesDao_SelectMovieByMovieId(movieId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_movie_by_movie_id"
        )({
          movieId,
        });
        console.log("SQL Result:", result);
        let movie = {};
        if (result && result.data && result.data.rows.length > 0) {
          const movies = result.data.rows;
          movie = movies[0];
          console.log("movie:", movie);
        }
        return movie;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MoviesDao_SelectMovieByMovieIds(movieIds) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_movie_by_movie_ids"
        )({
          movieIds,
        });
        console.log("SQL Result:", result);
        let movies = [];
        if (result && result.data && result.data.rows.length > 0) {
          movies = result.data.rows;
          console.log("movie:", movies);
        }
        return movies;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MoviesDao_SelectPurchasedMoviesByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_purchased_movies_by_user_id"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        let movies = [];
        if (result && result.data && result.data.rows.length > 0) {
          movies = result.data.rows;
          console.log("movies:", movies);
        }
        return movies;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MoviesDao_SelectMoviesByUserId(userId) {
      try {
        const result = await this.$functions.httpsCallable(
          "select_movies_by_user_id"
        )({
          userId,
        });
        console.log("SQL Result:", result);
        let movies = [];
        if (result && result.data && result.data.rows.length > 0) {
          movies = result.data.rows;
          console.log("movies:", movies);
        }
        return movies;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MoviesDao_UpsertMovie(
      movieId,
      userId,
      title,
      description,
      genre,
      price,
      copyrightType,
      startSeconds,
      allowType,
      isShow,
      crUserId,
      upUserId
    ) {
      try {
        const sqlResult = await this.$functions.httpsCallable("upsert_movie")({
          movieId,
          userId,
          title,
          description,
          genre,
          price,
          copyrightType,
          startSeconds,
          allowType,
          isShow,
          crUserId,
          upUserId,
        });
        console.log("SQL Result:", sqlResult);
        return sqlResult;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async MoviesDao_UpdateMoviePlayCounts(movieId) {
      try {
        const result = await this.$functions.httpsCallable(
          "update_movie_play_counts"
        )({
          movieId,
        });
        console.log("SQL Result:", result);
        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
