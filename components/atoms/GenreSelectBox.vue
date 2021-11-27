<template>
  <v-select
    :rules="rules!== undefined?rules:[]"
    :value="value"
    item-text="label"
    item-value="val"
    :items="musicGenreItems"
    :label="label"
    multiple
    @change="$emit('change',$event)"
    @input="$emit('input',$event)"
  />
</template>

<script>
import { MusicGenreItems } from "~/constant.js";
export default {
  props: ["label", "value", "rules"],
  data () {
    return {
      musicGenreItems: MusicGenreItems
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
