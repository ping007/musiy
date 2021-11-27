<template>
  <v-menu bottom left>
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon large color="#9fadaa">
          mdi-dots-vertical
        </v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item v-for="(item, i) in items" :key="i" @click="onClickMenu(item.value)">
        <v-list-item-action v-if="item.icon">
          <v-icon>
            {{ item.icon }}
          </v-icon>
        </v-list-item-action>
        <v-list-item-title>
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  props: ["items"],
  data () {
    return {};
  },
  methods: {
    onClickMenu (val) {
      this.$emit(val);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
