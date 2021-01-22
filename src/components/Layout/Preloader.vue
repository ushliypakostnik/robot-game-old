<template>
  <div class="preloader">
    <div
      v-if="!isLoaded"
      class="preloader__gate"
    >
      <div class="preloader__progress">
        <div :style="{ width: `${progress}%` }" />
      </div>
    </div>
    <slot />
  </div>
</template>

<script>
import { Loader } from 'resource-loader';

export default {
  name: 'Preloader',

  data() {
    return {
      isLoaded: false,
      progress: 0,
    };
  },

  mounted() {
    const loader = new Loader();

    loader.add([]);

    loader.onProgress.add((loader) => {
      this.progress = loader.progress;
    });

    loader.onComplete.add((loader, resources) => {
      this.progress = 100;
      this.isLoaded = true;

      console.log(resources);
    });

    loader.onError.add((loader) => {
      console.log('onError', loader);
    });

    loader.load();
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/_main.scss";

$progress__width: 200px;
$progress__height: 40px;

.preloader {
  &__gate {
    background: $colors__black;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fafafa;
  }

  &__progress {
    padding: $border-width;
    border: $border-width solid $colors__border;
    @include size($progress__width, $progress__height);

    > div {
      background: $colors__primary;
      height: 100%;
    }
  }
}
</style>
