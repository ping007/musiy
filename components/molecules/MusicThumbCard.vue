<template>
  <v-card class="music-thumb-card" @click="$emit('click',music)">
    <div v-if="music.imageId">
      <v-img
        :src="imgUrl"
        lazy-src="/images/no_image.png"
        class="white--text align-end music-thumb-image-wrapper"
        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
        alt="music image"
      >
        <div class="music-title px-2">
          <span v-text="music.title"></span>
        </div>
        <div class="music-description px-4 pb-2">
          <span v-text="music.description"></span>
        </div>
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="grey lighten-5" />
          </v-row>
        </template>
      </v-img>
    </div>
    <div v-else>
      <v-img
        :src="'/images/no_image.png'"
        lazy-src="/images/no_image.png"
        class="white--text align-end music-thumb-image-wrapper"
        alt="music image"
      >
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="grey lighten-5" />
          </v-row>
        </template>
      </v-img>
    </div>
    <div class="music-icon-wrapper">
      <div class="music-icon">
        <v-icon size="64px" color="rgba(255,255,255,0.7)">
          mdi-play-circle
        </v-icon>
      </div>
    </div>
  </v-card>
</template>

<script>
import { Cloudinary } from "~/constant";
export default {
  props: ["music"],
  data () {
    return {
      cloudinary: Cloudinary
    };
  },
  computed: {
    imgUrl () {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${this.music.imageId}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.music-thumb-card {
  width: 100%;
  max-width: 90vw;
  border-radius: 10px !important;
}
.music-thumb-image-wrapper {
  border-radius: 10px;
}
.music-title {
  font-size: 1rem;
}
.music-description {
  font-size: 0.8rem;
  margin-right: 4px;
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
</style>
