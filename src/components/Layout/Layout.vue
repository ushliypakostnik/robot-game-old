<template>
  <div
    v-if="isDesktop && isChrome"
    class="layout"
  >
    <Preloader>
      <div
        v-if="pause"
        class="layout__blocker"
      >
        <div class="layout__instructions">
          <h1>{{ $t('layout.text0') }}</h1>
          <h4>{{ $t('layout.text1') }}</h4>
          <h4>{{ $t('layout.text2') }}</h4>
          <h4>{{ $t('layout.text3') }}</h4>
          <h4>{{ $t('layout.text4') }}</h4>
          <h4>{{ $t('layout.text5') }}</h4>
          <h4>{{ $t('layout.text6') }}</h4>
          <button
            class="button"
            type="button"
            @click.prevent.stop="changePause(false)"
          >{{ $t('layout.startbutton') }}</button>
          <div class="switch__wrapper">
            <LangSwitch />
          </div>
        </div>
      </div>
      <Scene />
    </Preloader>
  </div>
  <Gate
    v-else-if="!isDesktop"
    face="gadgets"
  />
  <Gate
    v-else
    face="chrome"
  />
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import ScreenHelper from '@/utils/screen-helper';

import Preloader from '@/components/Layout/Preloader.vue';
import Scene from '@/components/Three/Scene/Scene.vue';
import Gate from '@/components/Layout/Gate.vue';
import LangSwitch from '@/components/Layout/LangSwitch.vue';

const { mapGetters } = createNamespacedHelpers('utilities');

export default {
  name: 'Layout',

  components: {
    Preloader,
    Scene,
    Gate,
    LangSwitch,
  },

  data() {
    return {
      isDesktop: null,
      isChrome: ScreenHelper.isChrome(),
    };
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize, false);
  },

  mounted() {
    window.addEventListener('resize', this.onWindowResize, false);
    this.onWindowResize();
  },

  computed: {
    ...mapGetters({
      pause: 'pause',
    }),
  },

  methods: {
    changePause(pause) {
      this.$store.dispatch('utilities/changePause', pause);
    },

    onWindowResize() {
      if (ScreenHelper.isDesktop()) {
        this.isDesktop = true;
      } else this.isDesktop = false;
    },
  },
};
</script>

<style lang="scss">
@import "@/styles/_main.scss";

.layout {
  height: 100vh;

  &__blocker {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: $colors__gate;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__instructions {
    text-align: center;
    color: $colors__white;
  }
}

.button {
  margin-top: $gutter * 1.5;
  margin-bottom: $gutter * 1.5;
}

h3,
h4 {
  margin: 0;
}
</style>
