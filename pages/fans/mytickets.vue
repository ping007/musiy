<template>
  <div>
    <v-container class="mytickets" fluid>
      <v-tabs color="rgb(231, 64, 89)" fixed-tabs>
        <v-tab :key="'mytickets'" :href="`#tab-mytickets`">
          <span class="tab-title" v-text="'購入済み'"></span>
        </v-tab>
        <v-tab :key="'mytickets-past'" :href="`#tab-mytickets-past`">
          <span class="tab-title" v-text="'視聴済み'"></span>
        </v-tab>
        <v-tab-item :key="'mytickets'" :value="'tab-mytickets'">
          <BroadcastVerticalList
            :broadcasts="broadcasts"
            :is-content-loaded="isBroadcastsLoaded"
            :is-show-all-mode="true"
            @select-broadcast="selectTicket"
          />
        </v-tab-item>
        <v-tab-item :key="'mytickets-past'" :value="'tab-mytickets-past'">
          <BroadcastVerticalList
            :broadcasts="broadcastsWatched"
            :is-content-loaded="isBroadcastsWatchedLoaded"
            :is-show-all-mode="true"
            @select-broadcast="selectTicket"
          />
        </v-tab-item>
      </v-tabs>
    </v-container>
    <TickteDetailDialog
      :is-show="showTicketDetail"
      :broadcast="selectedTicket"
      @close="close"
    />
    <v-snackbar
      v-model="isShowErrorSnackbar"
      top
      :multi-line="true"
      :color="'error'"
      :timeout="3000"
    >
      <span v-text="errorStr"></span>
    </v-snackbar>
  </div>
</template>
<script>
import BroadcastVerticalList from "~/components/organisms/BroadcastVerticalList";
import TickteDetailDialog from "~/components/organisms/BroadcastDetailDialog";
import BroadcastsDao from "~/mixins/dao/BroadcastsDao";
export default {
  components: {
    BroadcastVerticalList,
    TickteDetailDialog,
  },
  mixins: [BroadcastsDao],
  data() {
    return {
      selectedTicket: undefined,
      showTicketDetail: false,
      broadcasts: [],
      broadcastsWatched: [],
      isBroadcastsLoaded: false,
      isBroadcastsWatchedLoaded: false,
      isShowErrorSnackbar: false,
      errorStr: "",
    };
  },
  async created() {
    this.$nuxt.$emit("updateActiveBtn", 4);
    await this.loadBroadcasts();
    await this.loadBroadcastsWatched();
    const keeped = sessionStorage.getItem("broadcast");
    if (keeped) {
      this.selectedTicket = JSON.parse(keeped);
      this.showTicketDetail = true;
    }
  },
  methods: {
    async loadBroadcasts() {
      try {
        const isWatched = false;
        this.broadcasts = await this.BroadcastsDao_SelectTicketsByUserId(
          isWatched
        );
      } catch (error) {
        this.isShowErrorSnackbar = true;
        this.errorStr = "チケット一覧の取得に失敗しました。";
      } finally {
        this.isBroadcastsLoaded = true;
      }
    },
    async loadBroadcastsWatched() {
      try {
        const isWatched = true;
        this.broadcastsWatched = await this.BroadcastsDao_SelectTicketsByUserId(
          isWatched
        );
      } catch (error) {
        this.isShowErrorSnackbar = true;
        this.errorStr = "チケット一覧の取得に失敗しました。";
      } finally {
        this.isBroadcastsWatchedLoaded = true;
      }
    },
    selectTicket(broadcast) {
      this.selectedTicket = broadcast;
      this.showTicketDetail = true;
    },
    close() {
      this.showTicketDetail = false;
      this.selectedTicket = undefined;
    },
  },
};
</script>

<style lang="scss" scoped>
.mytickets {
  padding: 0 0 56px;
}
</style>
