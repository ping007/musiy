<template>
  <v-container pa-0 :fluid="true">
    <v-row class="mx-2 title">
      <span v-text="'My Musics'"></span>
    </v-row>
    <MusicList
      :musics="musics"
      :is-show-all-mode="true"
      @select-item="selectMusic"
    />
    <MusicPlayerDialog
      :is-show="isShowPlayerDialog"
      :music="music"
      :musics="selectedMusics"
      :is-editable="true"
      @to-edit="toMusicEdit"
      @close="close"
    />
  </v-container>
</template>

<script>
import MusicList from "~/components/organisms/MusicList";
import MusicPlayerDialog from "~/components/organisms/MusicPlayerDialog";
import MusicsDao from "~/mixins/dao/MusicsDao";
export default {
  layout: "artist",
  components: {
    MusicList,
    MusicPlayerDialog,
  },
  mixins: [MusicsDao],
  data() {
    return {
      musics: undefined,
      music: undefined,
      selectedMusics: undefined,
      isShowPlayerDialog: false,
    };
  },
  created() {
    const user = this.$store.state.user.user;
    if (user) {
      this.loadMusics(user.userId);
    } else {
      this.$router.push({ name: "fans-main" });
    }
  },
  methods: {
    selectMusic(musicData) {
      this.music = musicData.music;
      this.selectedMusics = musicData.musics;
      this.showPlayer();
    },
    async loadMusics(userId) {
      const sqlResult = await this.MusicsDao_SelectMusicsByUserId(userId);
      this.musics = sqlResult;
    },
    showPlayer() {
      this.isShowPlayerDialog = true;
    },
    close() {
      this.isShowPlayerDialog = false;
      this.music = undefined;
      this.$emit("closeplayer");
    },
    toMusicEdit() {
      this.isShowPlayerDialog = false;
      this.$router.push({
        name: "artists-editcontentfile",
        params: { selectedTab: "music", content: this.music },
      });
      this.music = undefined;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
