<template>
  <v-container class="myartists pa-0" :fluid="true">
    <v-row class="mx-0 px-0 title" justify="center" align="center">
      <v-col cols="12" class="block-center">
        <v-icon class="mr-2 msy-color-text-red"> mdi-heart </v-icon>
        <span
          class="default-font-family msy-color-text-red title-text-size"
          v-text="'My Artists'"
        ></span>
      </v-col>
    </v-row>
    <v-row class="mx-0 px-0">
      <v-divider />
    </v-row>
    <v-tabs color="rgb(231, 64, 89)" fixed-tabs>
      <v-tab :key="'following'" :href="`#tab-following`">
        <span class="tab-title" v-text="'フォロー中'"></span>
      </v-tab>
      <v-tab :key="'supporting'" :href="`#tab-supporting`">
        <span class="tab-title" v-text="'応援中'"></span>
      </v-tab>
      <v-tab-item :key="'following'" :value="'tab-following'">
        <v-row class="mx-0 px-0 pb-16">
          <v-col cols="12" class="pa-0">
            <FavoriteArtistList
              :artists="followingArtists"
              @select-item="goDetail"
            />
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item :key="'supporting'" :value="'tab-supporting'">
        <v-row class="mx-0 px-0 pb-16">
          <v-col cols="12" class="pa-0">
            <FavoriteArtistList
              :artists="supportingArtists"
              @select-item="goDetail"
            />
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script>
import FavoriteArtistList from "~/components/organisms/FavoriteArtistList";
import ArtistDao from "~/mixins/dao/ArtistsDao";
export default {
  components: {
    FavoriteArtistList,
  },
  mixins: [ArtistDao],
  data() {
    return {
      followingArtists: undefined,
      supportingArtists: undefined,
    };
  },
  async created() {
    this.$nuxt.$emit("updateActiveBtn", 1);
    await this.loadFavoriteArtist();
  },
  methods: {
    goDetail(artist) {
      this.$router.push({
        name: "fans-detail",
        params: { artist },
      });
    },
    async loadFavoriteArtist() {
      const results = [];
      const user = this.$store.state.user.user;
      results.push(this.ArtistsDao_SelectFollowingArtistByUserId(user.userId));
      results.push(this.ArtistsDao_SelectSupportingArtistByUserId(user.userId));
      const sqlResults = await Promise.all(results);
      this.followingArtists = sqlResults[0];
      this.supportingArtists = sqlResults[1];
    },
  },
};
</script>

<style lang="scss" scoped>
hr {
  border-color: rgb(231, 64, 89) !important;
}
.title-text-size {
  font-size: 1rem !important;
}
.pb-16 {
  padding-bottom: 56px;
}
</style>
