<template>
  <div class="layout">
    <div
      v-if="!start"
      class="blocker"
    >

      <div class="instructions">
        <h4>{{ $t('layout.text1') }}</h4>
        <h4>{{ $t('layout.text2') }}</h4>
        <h4>{{ $t('layout.text3') }}</h4>
        <h4>{{ $t('layout.text4') }}</h4>
        <h4>{{ $t('layout.text5') }}</h4>
        <h4>{{ $t('layout.text6') }}</h4>
        <button
          class="button"
          type="button"
          @click.prevent.stop="changeStart(true)"
        >{{ $t('layout.startbutton') }}</button>
      </div>

    </div>

    <slot />
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

const { mapGetters } = createNamespacedHelpers('utilities');

export default {
  name: 'Layout',

  computed: {
    ...mapGetters({
      start: 'start',
    }),
  },

  methods: {
    changeStart(start) {
      this.$store.dispatch('utilities/changeStart', start);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "@/styles/_stylebase.scss";

  .layout {
    height: 100vh;
  }

  .blocker {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: $colors__gate;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .instructions {
    text-align: center;
    color: $colors__white;
    cursor: pointer;
    @include text($font-size--large, $font-weight__sans__bold);
  }

  .button {
    background: transparent;
    color: $colors__white;
    padding: 10px 40px;
    border: $border-width solid $colors__border;
    box-shadow: none;
    text-transform: uppercase;
    @include text($font-size--normal, $font-weight__sans__bold);
  }

  h3, h4 {
    margin: 0;
  }
</style>
