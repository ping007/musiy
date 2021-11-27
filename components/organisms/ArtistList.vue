<template>
  <div>
    <div v-if="artists" class="artist-list">
      <div
        v-for="artist in artists"
        :key="artist.artistId"
        @click="$emit('select-item', artist)"
      >
        <div class="artist-card">
          <v-row>
            <div class="artist-image-wrapper">
              <img
                v-if="artist.imageId"
                class="artist-image artist-image-border"
                :src="imgUrl(artist.imageId)"
                alt="artist image"
              />
              <v-img
                v-else
                class="artist-image artist-image-border"
                :src="'/images/no_image.png'"
                alt="artist no image"
              />
            </div>
          </v-row>
          <v-row>
            <div class="artist-name">
              <span v-text="artist.username"></span>
            </div>
          </v-row>
        </div>
      </div>
    </div>
    <div v-else>
      <v-row justify="center" align="center" class="my-5">
        <v-progress-circular
          indeterminate
          :size="48"
          :width="5"
          :rotate="360"
          color="rgb(231, 64, 89)"
        />
      </v-row>
    </div>
  </div>
</template>

<script>
import { Cloudinary } from "~/constant";
import LocalStorageService from "~/mixins/service/LocalStorageService";
export default {
  name: "ArtistList",
  mixins: [LocalStorageService],
  props: ["cacheKey", "artists", "genre"],
  data() {
    return { cloudinary: Cloudinary };
  },
  watch: {
    artists(newValue, oldValue) {
      this.LocalStorageService_StoreToLocalStorage(
        this.cacheKey,
        newValue,
        this.toCacheModels
      );
    },
  },
  methods: {
    imgUrl(imageId) {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${imageId}`;
    },
    toCacheModels(artists) {
      return this.artists.map((artist) => {
        return {
          artistId: artist.artistId,
          imageId: artist.imageId,
          username: artist.username,
        };
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.artist-image-border {
  border: 4px solid #9fadaa;
}
.artist-image-border-active {
  border: 7px solid rgb(231, 64, 89);
}
.artist-name span {
  color: #2d2d2d !important;
  font-family: "Hiragino Kaku Gothic Pro", HiraKakuProN-W3, Meiryo, Roboto !important;
  font-weight: 600;
  letter-spacing: 1px;
}
@media screen and (max-width: 960px) {
  .artist-list {
    display: flex;
    width: 100%;
    overflow-x: scroll;
    padding-left: 12px;
  }
  .artist-card {
    width: 30vw;
    margin: 8px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }
  .artist-image-wrapper {
    width: 30vw;
    height: 30vw;
    display: inline-flex;
    justify-content: center;
    line-height: normal;
    position: relative;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
  }
  .artist-image {
    border-radius: 50%;
    width: 30vw;
    height: 30vw;
    background-position: center center;
    object-fit: cover;
  }
  .artist-name {
    padding-top: 16px;
    font-size: 0.8rem;
    display: flex;
    width: 30vw;
    padding-left: 1px;
    justify-content: center;
    align-items: center;
  }
}
@media screen and (min-width: 960px) {
  .artist-list {
    display: flex;
    width: 100%;
    overflow-x: scroll;
    padding-left: 12px;
  }
  .artist-card {
    width: 10vw;
    margin: 8px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }
  .artist-image-wrapper {
    width: 10vw;
    height: 10vw;
    display: inline-flex;
    justify-content: center;
    line-height: normal;
    position: relative;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
  }
  .artist-image {
    border-radius: 50%;
    width: 10vw;
    height: 10vw;
    background-position: center center;
    object-fit: cover;
  }
  .artist-name {
    padding-top: 16px;
    font-size: 1rem;
    display: flex;
    width: 15vw;
    padding-left: 1px;
    justify-content: center;
    align-items: center;
  }
}
</style>
