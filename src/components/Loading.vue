<template>
  <div class="loading-container" v-if="isLoading">Carregando...</div>
</template>

<script>
export default {
  props: {
    isLoading: Boolean,
  },
};
</script>

<style scoped>
.loading-container {
  width: 100%;
  height: 80px;
  background: #fff;
  text-align: center;
}
</style>
