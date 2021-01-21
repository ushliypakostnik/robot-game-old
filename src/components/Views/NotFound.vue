<template>
  <Layout class="page404">
    <div class="container">
      <h1>404</h1>
      <h3>{{ $t('page404.text') }}</h3>
    </div>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout/Layout.vue';

export default {
  name: 'NotFound',

  components: {
    Layout,
  },
};
</script>

<style lang="scss" scoped>
  @import "@/styles/_stylebase.scss";

  .page404 {
    h1 {
      color: $colors__primary;
      margin: 0;
      @include text($font-size--large, $font-weight__sans__bold);
    }

    h3 {
      margin: 0;
      @include text($font-size--normal, $font-weight__sans__bold);
    }
  }
</style>
