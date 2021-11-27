<template>
  <div>
    <v-container class="artists-supporters">
      <v-row class="ml-1 title">
        <span v-text="'応援者一覧'"></span>
      </v-row>
    </v-container>
    <SupportersList :supporters="supporters" />
  </div>
</template>

<script>
import SupportersList from "~/components/organisms/SupportersList";
import SupportersDao from "~/mixins/dao/SupportersDao";
export default {
  layout: "artist",
  components: {
    SupportersList,
  },
  mixins: [SupportersDao],
  data() {
    return {
      supporters: [],
    };
  },
  mounted() {
    this.loadSupporters();
  },
  methods: {
    async loadSupporters() {
      const user = this.$store.state.user.user;
      if (user) {
        const artistUserId = user.userId;
        this.supporters = await this.SupportersDao_SelectSupportersByArtistUserId(
          artistUserId
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
