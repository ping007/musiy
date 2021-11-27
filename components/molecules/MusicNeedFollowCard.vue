<template>
  <div>
    <v-col class="music-need-follow-card-wrapper">
      <v-row class="py-0" align="center" justify="center">
        <v-icon color="rgb(231, 64, 89)" size="36px"> mdi-heart </v-icon>
      </v-row>
      <v-row class="py-1" align="center" justify="center">
        <span
          class="msy-color-text-red warn-text"
          v-text="'フォロワー・応援者限定コンテンツ'"
        >
        </span>
      </v-row>
      <v-row class="py-1" align="center" justify="center">
        <v-btn
          color="rgb(231, 64, 89)"
          outlined
          dense
          rounded
          x-small
          @click="$emit('to-follow')"
        >
          <v-icon left>mdi-account-plus</v-icon>
          <span v-text="'フォロー'"></span>
        </v-btn>
      </v-row>
      <v-row class="py-1" align="center" justify="center">
        <v-btn
          class="msy-color-red donation-btn"
          outlined
          rounded
          dark
          x-small
          @click="$emit('to-support')"
        >
          <v-icon small>mdi-currency-jpy</v-icon>
          <span v-text="'応援する'"></span>
        </v-btn>
      </v-row>
    </v-col>
  </div>
</template>

<script>
export default {
  props: {
    music: {
      type: Object,
      default: undefined,
    },
  },
};
</script>

<style lang="scss" scoped>
@media screen and (max-width: 960px) {
  .music-need-follow-card-wrapper {
    position: relative;
    width: 40vw;
    height: 40vw;
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
    border-radius: 7px;
    box-shadow: 2px 4px 4px gray;
  }
  .warn-text {
    font-size: 0.6rem;
    width: 30vw;
    text-align: center;
  }
}
@media screen and (min-width: 960px) {
  .music-need-follow-card-wrapper {
    position: relative;
    width: 20vw;
    height: 15vw;
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    text-align: center;
    vertical-align: middle;
    overflow: hidden;
    border-radius: 7px;
    box-shadow: 2px 4px 4px gray;
  }
  .warn-text {
    font-size: 0.6rem;
    width: 30vw;
    text-align: center;
  }
}
</style>
