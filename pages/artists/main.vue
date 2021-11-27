<template>
  <div v-if="artistId_">
    <ArtistMyProfile
      :artist-id="artistId_"
      :child-open-tab="openTab_"
      @showplayer="showPlayer = true"
      @closeplayer="showPlayer = false"
    />
    <Dialog
      ref="beforeRouteLeaveConfirm"
      mode="confirm"
      title="ページ移動の確認"
      @ok="next_()"
      @cancel="next_(false)"
    >
      <p
        v-text="'プレイヤーが開いています。ページを移動してよろしいですか？ '"
      ></p>
    </Dialog>
  </div>
</template>

<script>
import ArtistMyProfile from "~/components/organisms/ArtistMyProfile";
import Dialog from "~/components/molecules/Dialog";
export default {
  layout: "artist",
  components: {
    ArtistMyProfile,
    Dialog,
  },
  data() {
    return {
      artistId_: undefined,
      openTab_: undefined,
      showPlayer: false,
      next_: undefined,
    };
  },
  created() {
    const artistId = this.$store.state.user.user.userId;
    if (artistId !== undefined) {
      this.artistId_ = artistId;
    } else {
      this.$router.push({ name: "fans-main" });
    }
    const openTab = this.$route.query.tab;
    if (openTab !== undefined) {
      this.openTab_ = openTab;
    } else {
      this.openTab_ = "tab-feeds";
    }
  },
  mounted() {
    // iOS Safariのみブラウザバックした時にキャッシュを読んでしまう問題に対応するために強制的にリロードする
    window.addEventListener("popstate", function (e) {
      window.location.reload();
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.showPlayer) {
      this.next_ = next;
      this.$refs.beforeRouteLeaveConfirm.open();
    } else {
      next();
    }
  },
};
</script>

<style lang="scss" scoped>
</style>
