<template>
  <div>
    <div v-if="musics_" class="music-list">
      <div
        v-for="music in musics_"
        v-show="music.isShow"
        :key="music.musicId"
        class="mx-auto"
      >
        <div
          v-if="judgeShowMusic(music) || isShowAllMode"
          class="music-card"
          @click="$emit('select-item', { music, musics: musics_ })"
        >
          <v-row>
            <div class="music-image-wrapper">
              <v-icon v-if="isFavorite(music.musicId)" class="music-favorite">
                mdi-heart
              </v-icon>
              <img
                v-if="music.imageId"
                class="music-image"
                :src="imgUrl(music.imageId)"
                alt="music image"
              />
              <img
                v-else
                class="music-image"
                :src="'/images/no_image.png'"
                alt="music image"
              />
            </div>
          </v-row>
          <v-row class="mt-2">
            <div class="music-title">
              <span
                class="msy-color-text-blue-gray default-font font-weight-light"
                v-text="music.title"
              ></span>
            </div>
          </v-row>
          <v-row>
            <div class="music-artist-name">
              <span
                class="msy-color-text-blue-gray default-font font-weight-light"
                v-text="music.artistName"
              ></span>
            </div>
          </v-row>
        </div>
        <div
          v-else-if="
            parseInt(music.allowType) === contentAllowType.FollowersOrSupporters
          "
          class="music-card"
        >
          <MusicNeedFollowCard
            :music="music"
            @to-follow="$emit('to-follow', music)"
            @to-support="$emit('to-support', music)"
          />
          <v-row class="mt-2">
            <div class="music-title">
              <span
                class="msy-color-text-blue-gray default-font font-weight-light"
                v-text="music.title"
              ></span>
            </div>
          </v-row>
          <v-row>
            <div class="music-artist-name">
              <span
                class="msy-color-text-blue-gray default-font font-weight-light"
                v-text="music.artistName"
              ></span>
            </div>
          </v-row>
        </div>
        <div
          v-else-if="
            parseInt(music.allowType) === contentAllowType.Supporters &&
              !judgeAllowedMusic(music)
          "
          class="music-card"
        >
          <MusicNeedSupportCard
            :music="music"
            @to-support="$emit('to-support', music)"
          />
          <v-row class="mt-2">
            <div class="music-title">
              <span
                class="msy-color-text-blue-gray default-font font-weight-light"
                v-text="music.title"
              ></span>
            </div>
          </v-row>
          <v-row>
            <div class="music-artist-name">
              <span
                class="msy-color-text-blue-gray default-font font-weight-light"
                v-text="music.artistName"
              ></span>
            </div>
          </v-row>
        </div>
      </div>
    </div>
    <div v-else class="music-list">
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
import { Cloudinary, ContentAllowType } from "~/constant";
import MusicNeedFollowCard from "~/components/molecules/MusicNeedFollowCard";
import MusicNeedSupportCard from "~/components/molecules/MusicNeedSupportCard";
import AllowedContentsService from "~/mixins/service/AllowedContentsService";
import LocalStorageService from "~/mixins/service/LocalStorageService";
export default {
  name: "MusicVerticalList",
  components: {
    MusicNeedFollowCard,
    MusicNeedSupportCard,
  },
  mixins: [AllowedContentsService, LocalStorageService],
  props: {
    musics: {
      type: Array,
      default: undefined,
    },
    genre: {
      type: String,
      default: "",
    },
    isFollowing: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Array,
      default: undefined,
    },
    supportedPlan: {
      type: Object,
      default: undefined,
    },
    isShowAllMode: {
      type: Boolean,
      default: false,
    },
    cacheKey: String,
  },
  data() {
    return {
      cloudinary: Cloudinary,
      contentAllowType: ContentAllowType,
    };
  },
  computed: {
    musics_() {
      return this.musics;
    },
    isFavorite() {
      return function (id) {
        return this.likes && this.likes.includes(id);
      };
    },
  },
  watch: {
    musics(newValue, oldValue) {
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
    toCacheModels(musics) {
      return this.musics.map((music) => {
        return {
          isShow: music.isShow,
          musicId: music.musicId,
          imageId: music.imageId,
          title: music.title,
          artistName: music.artistName,
          allowType: music.allowType,
        };
      });
    },
    judgeShowMusic(music) {
      let result = false;
      if (this.supportedPlan) {
        result = this.AllowedContentsService_JudgeShowContent(
          music,
          this.supportedPlan,
          this.isFollowing
        );
      } else {
        result = music.allowType === this.contentAllowType.All;
      }
      return result;
    },
    judgeFollowing(music) {
      return this.AllowedContentsService_JudgeFollowing(
        music,
        this.isFollowing
      );
    },
    judgeAllowedMusic(music) {
      let result = false;
      if (this.supportedPlan) {
        result = this.AllowedContentsService_JudgeAllowedContent(
          music,
          this.supportedPlan
        );
      } else if (
        parseInt(music.allowType) ===
        this.contentAllowType.FollowersOrSupporters
      ) {
        result = this.AllowedContentsService_JudgeShowContent(
          music,
          this.supportedPlan,
          this.isFollowing
        );
      } else {
        result = parseInt(music.allowType) === this.contentAllowType.All;
      }
      return result;
    },
    judgeMyMusic(music) {
      return this.AllowedContentsService_JudgeMyContent(music);
    },
  },
};
</script>

<style lang="scss" scoped>
.music-list {
  display: flex;
  width: 100%;
  height: 30vh;
  overflow-x: scroll;
  padding-left: 12px;
}
@media screen and (max-width: 960px) {
  .music-card {
    width: 35vw;
    margin: 8px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .music-image-wrapper {
    position: relative;
    width: 35vw;
    height: 35vw;
    display: inline-flex;
    justify-content: center;
    position: relative;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
    border-radius: 7px;
    box-shadow: 2px 4px 4px gray;
  }
  .music-image-wrapper i {
    position: absolute;
    font-size: 20px;
    top: 0.5rem;
    left: 0.5rem;
    color: rgb(231, 64, 89);
    color: linear-gradient(
      135deg,
      rgba(231, 64, 89, 1) 0%,
      rgba(189, 100, 153, 1) 100%
    );
  }
  .music-image {
    width: 35vw;
    height: 35vw;
    object-fit: cover;
  }
  .music-title {
    font-size: 0.8rem;
    display: flex;
    width: 35vw;
    padding-left: 1px;
    white-space: nowrap;
    overflow: hidden;
  }
  .music-artist-name {
    font-size: 0.7rem;
    display: flex;
    width: 35vw;
    padding-left: 1px;
    align-items: center;
  }
}
@media screen and (min-width: 960px) {
  .music-card {
    width: 10vw;
    height: 10vw;
    margin: 8px 12px;
    align-items: center;
  }

  .music-image-wrapper {
    position: relative;
    width: 10vw;
    height: 10vw;
    display: inline-flex;
    justify-content: center;
    position: relative;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
    border-radius: 7px;
    box-shadow: 2px 4px 4px gray;
  }
  .music-image-wrapper i {
    position: absolute;
    font-size: 20px;
    top: 0.5rem;
    left: 0.5rem;
    color: rgb(231, 64, 89);
    color: linear-gradient(
      135deg,
      rgba(231, 64, 89, 1) 0%,
      rgba(189, 100, 153, 1) 100%
    );
  }
  .music-image {
    width: 10vw;
    height: 10vw;
    object-fit: cover;
  }
  .music-title {
    font-size: 1.2rem;
    display: flex;
    width: 10vw;
    padding-left: 1px;
    white-space: nowrap;
    overflow: hidden;
  }
  .music-artist-name {
    font-size: 0.8rem;
    display: flex;
    width: 10vw;
    padding-left: 1px;
    align-items: center;
  }
}
</style>
