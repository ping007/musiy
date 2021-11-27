<template>
  <div>
    <v-dialog v-if="user" v-model="isPurchasePlanDialog" persistent>
      <v-card>
        <v-card-title class="headline msy-color-red" primary-title>
          <span
            class="msy-color-text-white"
            v-text="'アーティスト月額プラン選択'"
          ></span>
          <v-icon
            class="close-icon"
            @click="(isShowRegisterDialog = false), $emit('close')"
          >
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
</style>
