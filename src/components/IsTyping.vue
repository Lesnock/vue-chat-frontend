<template>
  <div class="is-typing-container">
    <!-- <Ellipsis class="ellipsis-icon" /> -->
    {{name}} está digitando...
  </div>
</template>

<script>
export default {
  props: {
    name: String,
  },
};
</script>

<style scoped>
.is-typing-container {
  /* position: sticky; */
}
</style>
