<template>
  <div class="game">
    <div
      class="game__overlay"
      :class="[
        heroOnWater && !isGameOver && `game__overlay--hit hit`,
        isGameOver && `game__overlay--gameover`,
      ]"
    >
      <h1
        v-if="isGameOver"
        class="game__gameover"
      >{{ $t('gameplay.gameover') }}</h1>
      <button
        class="button"
        type="button"
        v-if="isGameOver"
        @click.prevent.stop="reload()"
      >{{ $t('gameplay.gameovebutton') }}</button>
    </div>
    <div class="game__scales">
      <Scale
        face="health"
        :progress="health"
      />
      <Scale
        face="endurance"
        :progress="endurance"
      />
      <Scale
        face="power"
        :progress="power"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import Scale from '@/components/Layout/Scale.vue';

export default {
  name: 'Game',

  components: {
    Scale,
  },

  computed: {
    ...mapGetters({
      health: 'hero/health',
      endurance: 'hero/endurance',
      power: 'hero/power',
      heroOnWater: 'hero/heroOnWater',

      isGameOver: 'layout/isGameOver',
    }),
  },

  methods: {
    ...mapActions({
      setGameOver: 'layout/setGameOver',
    }),

    reload() {
      // window.location.reload();
      this.$eventHub.$emit('reload');
    },
  },

  watch: {
    health(value) {
      if (value < 0) this.setGameOver(true);
    },
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/_main.scss";

.game {
  &,
  &__overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    @include size(100%, 100%);

    &--hit {
      background: $colors__primary-light--transparent;
    }

    &--gameover {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      background: $colors__primary-light--transparent2;

      h1 {
        margin-top: $gutter * 2;
        color: $colors__white;
        @include text($font-size--large * 2);
      }

      .button {
        margin-bottom: 0;
      }
    }
  }

  &__scales {
    position: absolute;
    bottom: $gutter / 2;
    left: $gutter / 2;
    width: $gutter * 8;
  }
}
</style>
