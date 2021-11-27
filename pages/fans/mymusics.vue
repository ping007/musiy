<template>
  <v-container class="mymusics" :fluid="true">
    <v-tabs color="rgb(231, 64, 89)" fixed-tabs>
      <v-tab :key="'mymusic'" :href="`#tab-mymusic`">
        <span class="tab-title" v-text="'購入済み'"></span>
      </v-tab>
      <v-tab :key="'playlater'" :href="`#tab-playlater`">
        <span class="tab-title" v-text="'あとで聴く'"></span>
      </v-tab>
      <v-tab-item :key="'mymusic'" :value="'tab-mymusic'">
        <MusicList
          :musics="musics"
          :is-show-all-mode="true"
          @select-item="selectMusic"
        />
      </v-tab-item>
      <v-tab-item :key="'playlater'" :value="'tab-playlater'">
        <MusicList
          :musics="playLaterMusics"
          :is-show-all-mode="true"
          @select-item="selectMusic"
        />
      </v-tab-item>
    </v-tabs>
    <MusicPlayerDialog
      :is-show="isShowPlayerDialog"
      :music="music"
      :musics="selectedMusics"
      @close="close"
      @hide-music="hideMusic"
    />
  </v-container>
</template>

<script>
import MusicList from "~/components/organisms/MusicList";
import MusicPlayerDialog from "~/components/organisms/MusicPlayerDialog";
import MusicsDao from "~/mixins/dao/MusicsDao";
export default {
  components: {
    MusicList,
    MusicPlayerDialog,
  },
  mixins: [MusicsDao],
  data() {
    return {
      artist: undefined,
      musics: undefined,
      playLaterMusics: undefined,
      music: undefined,
      selectedMusics: undefined,
      isShowPlayerDialog: false,
    };
  },
  async created() {
    this.$nuxt.$emit("updateActiveBtn", 3);
    await this.loadMusics();
  },
  methods: {
    selectMusic(musicData) {
      this.music = musicData.music;
      this.selectedMusics = musicData.musics;
      this.showPlayer();
    },
    async loadMusics(userId) {
      const results = [];
      const user = this.$store.state.user.user;
      results.push(this.MusicsDao_SelectPurchasedMusicsByUserId(user.userId));
      results.push(this.MusicsDao_SelectPlayLaterMusicsByUserId(user.userId));
      const sqlResults = await Promise.all(results);
      this.musics = sqlResults[0];
      this.playLaterMusics = sqlResults[1];
    },
    showPlayer() {
      this.isShowPlayerDialog = true;
    },
    close() {
      this.isShowPlayerDialog = false;
      this.music = undefined;
    },
    hideMusic(music) {
      music.isShow = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.mymusics {
  padding: 0 0 56px;
}
</style>
