<template>
  <commentList room-id="broadcast_id_xxxx" />
</template>

<script>
import CommentList from "../../components/organisms/CommentList.vue";
export default {
  name: "Main",
  components: {
    commentList: CommentList,
  },
};
</script>
