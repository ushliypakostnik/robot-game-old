<template>
  <div class="layout">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Layout',
};
</script>

<style lang="scss" scoped>
  @import "@/styles/_stylebase.scss";

  .layout {
    height: 100vh;
  }
</style>
