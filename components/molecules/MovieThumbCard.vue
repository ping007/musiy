<template>
  <v-card
    v-if="movie.movieId"
    class="movie-thumb-card ma-0"
    @click="$emit('click', movie)"
  >
    <v-img
      :src="posterUrl"
      :aspect-ratio="4 / 3"
      :eager="true"
      lazy-src="/images/no_image.png"
      class="white--text align-end movie-thumb-card-img"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      alt="movie image"
    >
      <div class="default-font-family movie-title px-4">
        <span v-text="movie.title"></span>
      </div>
      <div class="default-font-family movie-description px-4 pb-2">
        <span v-text="movie.description"></span>
      </div>
      <template v-slot:placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular indeterminate color="grey lighten-5" />
        </v-row>
      </template>
      <div class="music-icon-wrapper">
        <div class="music-icon">
          <v-icon size="64px" color="rgba(255,255,255,0.7)">
            mdi-play-circle
          </v-icon>
        </div>
      </div>
    </v-img>
  </v-card>
</template>

<script>
import { Cloudinary } from "~/constant";
export default {
  props: ["movie"],
  data() {
    return {
      cloudinary: Cloudinary,
    };
  },
  computed: {
    posterUrl() {
      return this.movie.movieId
        ? `https://res.cloudinary.com/${this.cloudinary.cloudName}/video/upload/${this.movie.movieId}.jpg`
        : "";
    },
  },
};
</script>

<style lang="scss" scoped>
@media screen and (max-width: 960px) {
  .movie-title {
    font-size: 1.1rem;
  }
  .movie-description {
    font-size: 0.9rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .movie-thumb-card {
    min-width: 90vw;
    min-height: 50vw;
    max-width: 90vw;
    max-height: 50vw;
    border-radius: 10px !important;
  }
  .movie-thumb-card-img {
    min-width: 90vw;
    min-height: 50vw;
    max-width: 90vw;
    max-height: 50vw;
  }
}
@media screen and (min-width: 961px) {
  .movie-thumb-card {
    min-width: 55vw;
    min-height: 30vw;
    max-width: 55vw;
    max-height: 30vw;
    border-radius: 20px !important;
  }
  .movie-thumb-card-img {
    min-width: 55vw;
    min-height: 30vw;
    max-width: 55vw;
    max-height: 30vw;
  }
}
.music-icon-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
}
.music-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.movie-favorite-wrapper {
  position: absolute;
  font-size: 20px;
  top: 0.5rem;
  left: 0.7rem;
}
</style>
