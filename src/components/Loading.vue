<template>
  <div class="loading-container" v-if="isLoading">
    <LoadingIcon class="loading-icon" />
  </div>
</template>

<script>
import LoadingIcon from './Icons/Loading.vue';

export default {
  props: {
    isLoading: Boolean,
  },

  components: {
    LoadingIcon,
  },
};
</script>

<style scoped>
@keyframes routing {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-container {
  width: 100%;
  text-align: center;
}

.loading-icon {
  height: 50px;
  margin-bottom: 10px;
  fill: #ddd;
  animation: routing 2s linear infinite;
}
</style>
