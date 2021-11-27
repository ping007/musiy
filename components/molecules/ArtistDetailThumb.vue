<template>
  <v-container v-if="artist" @click="$emit('click')">
    <v-row>
      <v-col cols="6">
        <v-avatar width="100%" height="100%" tile>
          <v-img :src="artist.imageUrl" alt="artist image" />
        </v-avatar>
      </v-col>
      <v-col>
        <v-row class="caption">
          <span v-text="artist.name"></span>
        </v-row>
        <v-row class="body-1">
          <span v-text="artist.title"></span>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: ["artist"]
};
</script>

<style lang="scss" scoped>
</style>
