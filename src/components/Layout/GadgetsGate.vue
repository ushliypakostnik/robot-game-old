<template>
  <div class="gadgets-gate">
    <h3>{{ $t('layout.gadgetstext') }}</h3>
  </div>
</template>

<script>
export default {
  name: 'GadgetsGate',
};
</script>

<style lang="scss" scoped>
@import "@/styles/_main.scss";

.gadgets-gate {
  display: flex;
  justify-content: center;
  align-items: center;
  background: $colors__black;
  color: $colors__white;
  padding-left: 10vw;
  padding-right: 10vw;
  width: 100vw;
  height: 100vh;
}

h3 {
  text-align: center;
}
</style>
