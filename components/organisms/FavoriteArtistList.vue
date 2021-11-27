<template>
  <div>
    <v-list v-if="artists" class="pa-0">
      <div v-if="artists.length > 0">
        <v-list-item
          v-for="artist in artists"
          :key="artist.userId"
          class="pa-0 favorite-artist-item"
          @click="$emit('select-item', artist)"
        >
          <v-card class="artist-card py-2" tile>
            <v-row class="mx-0" align="center">
              <v-col cols="5" class="artist-avatar pr-7">
                <v-avatar size="120px" rounded class="new-artist">
                  <v-img :src="imgUrl(artist.imageId)" alt="artist image" />
                </v-avatar>
              </v-col>
              <v-col class="px-2" cols="6">
                <v-row align="center" justify="start">
                  <v-chip
                    v-if="isNew(artist)"
                    class="mr-4"
                    color="rgb(231, 64, 89)"
                    small
                    text-color="white"
                  >
                    NEW
                  </v-chip>
                  <div class="pb-0">
                    <span
                      class="default-font-family msy-color-text-black artist-name-font"
                      v-text="artist.username"
                    ></span>
                  </div>
                </v-row>
                <v-row align="center" justify="start">
                  <div class="pb-6">
                    <span
                      class="default-font-family msy-color-text-blue-gray"
                      v-text="''"
                    ></span>
                  </div>
                </v-row>
                <v-row align="center" justify="start">
                  <v-chip
                    v-if="artist.isFollowing"
                    class="ma-0 default-font-family supported"
                    color="red"
                    text-color="white"
                    pill
                    small
                    v-text="'フォロー中'"
                  />
                  <v-chip
                    v-if="artist.isSupported"
                    class="ma-0 default-font-family supported"
                    color="red"
                    text-color="white"
                    pill
                    small
                    v-text="'応援中'"
                  />
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-list-item>
      </div>
      <div v-else>
        <v-row class="py-5 mx-0" justify="center" align="center">
          <v-col class="msy-color-text-red">
            <v-row class="py-5" justify="center" align="center">
              <v-icon color="rgb(231, 64, 89)" size="72px">
                mdi-account-off
              </v-icon>
            </v-row>
            <v-row class="py-5" justify="center" align="center">
              <span v-text="'アーティストがいません'"></span>
            </v-row>
          </v-col>
        </v-row>
      </div>
    </v-list>
    <div v-else>
      <v-row justify="center" align="center" class="my-5 mx-0 pa-0">
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
export default {
  name: "FavoriteArtistList",
  props: {
    artists: {
      type: Array,
      default: undefined,
    },
  },
  data() {
    return {
      cloudinary: Cloudinary,
    };
  },
  methods: {
    imgUrl(imageId) {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${imageId}`;
    },
    isNew(artist) {
      let result = false;
      // 1日以内に登録されたものはNEW
      if (artist.followsUpDatetime) {
        result = this.$moment(artist.followsUpDatetime)
          .add(9, "h")
          .isBetween(this.$moment().subtract(1, "d"), this.$moment());
      } else if (artist.supportCrDatetime) {
        result = this.$moment(artist.supportCrDatetime)
          .add(9, "h")
          .isBetween(this.$moment().subtract(1, "d"), this.$moment());
      }
      return result;
    },
  },
};
</script>

<style lang="scss" scoped>
.artist-card {
  box-shadow: none !important;
  width: 100%;
}
.artist-name-font {
  font-size: 1.1rem !important;
  font-weight: 600 !important;
}
.artist-avatar {
  display: flex;
  justify-content: flex-end;
}
.new-artist {
  border: 5px solid !important;
  border-color: rgb(231, 64, 89) !important;
}
.exist-artist {
  border: 2px solid !important;
  border-color: #9fadaa !important;
}
.v-badge__badge {
  border-color: rgba(231, 64, 89, 0) !important;
}
.v-badge__badge::after {
  border-color: rgba(0, 0, 0, 0) !important;
}
.v-list-item {
  color: white !important;
  outline-color: white !important;
}
span.v-chip.supported {
  display: flex;
  justify-content: center;
  width: 100px;
  color: white !important;
  border-color: rgba(0, 0, 0, 0) !important;
  background: rgb(231, 64, 89) !important;
  background: linear-gradient(
    135deg,
    rgba(231, 64, 89, 1) 0%,
    rgba(189, 100, 153, 1) 100%
  ) !important;
}
span.v-chip.no-support {
  display: flex;
  justify-content: center;
  width: 100px;
  color: rgb(231, 64, 89) !important;
  border-color: rgb(231, 64, 89) !important;
  background: white !important;
}
</style>
