<template>
  <div class="music-list-wrapper">
    <v-container v-if="musics" class="music-list">
      <v-row v-if="musics.length > 0" dense>
        <v-col
          v-for="music in musics"
          v-show="isArtist || music.isShow"
          :key="music.musicId"
          class="py-2 music-card-wrapper"
          cols="6"
          sm="6"
          md="4"
          lg="4"
        >
          <div
            v-if="judgeShowMusic(music) || isShowAllMode"
            class="music-card"
            @click="$emit('select-item', { music, musics })"
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
                  class="
                    msy-color-text-blue-gray
                    default-font
                    font-weight-light
                  "
                  v-text="music.title"
                ></span>
              </div>
            </v-row>
            <v-row>
              <div class="music-artist-name">
                <span
                  class="
                    msy-color-text-blue-gray
                    default-font
                    font-weight-light
                  "
                  v-text="music.artistName"
                ></span>
              </div>
            </v-row>
          </div>
          <div
            v-else-if="
              parseInt(music.allowType) ===
                contentAllowType.FollowersOrSupporters
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
                  class="
                    msy-color-text-blue-gray
                    default-font
                    font-weight-light
                  "
                  v-text="music.title"
                ></span>
              </div>
            </v-row>
            <v-row>
              <div class="music-artist-name">
                <span
                  class="
                    msy-color-text-blue-gray
                    default-font
                    font-weight-light
                  "
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
                  class="
                    msy-color-text-blue-gray
                    default-font
                    font-weight-light
                  "
                  v-text="music.title"
                ></span>
              </div>
            </v-row>
            <v-row>
              <div class="music-artist-name">
                <span
                  class="
                    msy-color-text-blue-gray
                    default-font
                    font-weight-light
                  "
                  v-text="music.artistName"
                ></span>
              </div>
            </v-row>
          </div>
        </v-col>
      </v-row>
      <v-row v-else class="py-5" justify="center" align="center">
        <v-col class="msy-color-text-red">
          <v-row class="py-5" justify="center" align="center">
            <v-icon color="rgb(231, 64, 89)" size="72px">
              mdi-music-note-off
            </v-icon>
          </v-row>
          <v-row class="py-5" justify="center" align="center">
            <span v-text="'コンテンツはありません'"></span>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else class="music-list">
      <v-row dense justify="center" align="center" class="my-5">
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
import { Cloudinary, ContentAllowType } from "~/constant";
import MusicNeedFollowCard from "~/components/molecules/MusicNeedFollowCard";
import MusicNeedSupportCard from "~/components/molecules/MusicNeedSupportCard";
import AllowedContentsService from "~/mixins/service/AllowedContentsService";
import LocalStorageService from "~/mixins/service/LocalStorageService";
export default {
  name: "MusicList",
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
    likes: {
      type: Array,
      default: undefined,
    },
    isFollowing: {
      type: Boolean,
      default: false,
    },
    isArtist: {
      type: Boolean,
      default: false,
    },
    supportedPlan: {
      type: Object,
      default: undefined,
    },
    isShowAllMode: {
      type: Boolean,
      default: false,
    },
    cacheKeyPrefix: String,
    artistUserId: String,
  },
  data() {
    return {
      cloudinary: Cloudinary,
      contentAllowType: ContentAllowType,
    };
  },
  computed: {
    isFavorite() {
      return function (id) {
        return this.likes && this.likes.includes(id);
      };
    },
  },
  watch: {
    musics(newValue, oldValue) {
      this.LocalStorageService_StoreToLocalStorageByUser(
        this.cacheKeyPrefix,
        this.artistUserId,
        newValue,
        this.toCacheModels
      );
    },
  },
  created() {
    // This storage process is executed when this component is called by ArtistMyProfile,
    // because ArtistMyProfile creates this component on selecting movie tab and watch prop can't inspect initializing target prop on creating component.
    this.LocalStorageService_StoreToLocalStorageByUser(
      this.cacheKeyPrefix,
      this.artistUserId,
      this.musics,
      this.toCacheModels
    );
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
@media screen and (max-width: 960px) {
  .music-list-wrapper {
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .music-list {
    width: 100%;
    padding: 0 24px;
  }
  .music-card {
    width: 40vw;
    margin: 8px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .music-image-wrapper {
    position: relative;
    width: 40vw;
    height: 40vw;
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
    z-index: 1;
  }
  .music-image {
    width: 40vw;
    height: 40vw;
    object-fit: cover;
  }
  .music-title {
    font-size: 1.2rem;
    display: flex;
    width: 40vw;
    padding-left: 1px;
    white-space: nowrap;
    overflow: hidden;
  }
  .music-artist-name {
    font-size: 0.8rem;
    display: flex;
    width: 40vw;
    padding-left: 1px;
    align-items: center;
  }
}
@media screen and (min-width: 960px) {
  .music-list-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .music-list {
    width: 100%;
    padding: 0 24px;
  }
  .music-card-wrapper {
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 4vh;
  }
  .music-card {
    width: 15vw;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .music-image-wrapper {
    position: relative;
    width: 15vw;
    height: 15vw;
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
    z-index: 1;
  }
  .music-image {
    width: 15vw;
    height: 15vw;
    object-fit: cover;
  }
  .music-title {
    font-size: 1.2rem;
    display: flex;
    width: 15vw;
    padding-left: 1px;
    white-space: nowrap;
    overflow: hidden;
  }
  .music-artist-name {
    font-size: 0.8rem;
    display: flex;
    width: 15vw;
    padding-left: 1px;
    align-items: center;
  }
}
</style>
