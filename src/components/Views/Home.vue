<template>
  <Layout>
    <Scene />
  </Layout>
</template>

<script>
import Layout from '@/components/Layout/Layout.vue';
import Scene from '@/components/Elements/Scene.vue';

export default {
  name: 'Home',

  components: {
    Layout,
    Scene,
  },
};
</script>
