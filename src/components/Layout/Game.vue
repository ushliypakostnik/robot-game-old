<template>
  <div class="game">
    <div
      class="game__overlay"
      :class="[
        isHeroOnWater && !isNotDamaged && !isGameOver && `game__overlay--damage damage`,
        isGameOver && `game__overlay--gameover`,
      ]"
    >
      <h1
        v-if="isGameOver"
        class="game__gameover"
      >{{ $t('layout.gameover') }}</h1>
      <button
        class="button"
        type="button"
        v-if="isGameOver"
        @click.prevent.stop="reload()"
      >{{ $t('layout.gameovebutton') }}</button>
    </div>

    <div class="game__things">
      <div class="game__thing game__thing--daffodils">
        <div class="game__thing-circle" />{{ flower(daffodil) }}
      </div>
      <div class="game__thing game__thing--anemones">
        <div class="game__thing-circle" />{{ flower(anemone) }}
      </div>
      <div class="game__thing game__thing--crocuses">
        <div class="game__thing-circle" />{{ flower(crocus) }}
      </div>
      <div class="game__thing game__thing--tulips">
        <div class="game__thing-circle" />{{ flower(tulip) }}
      </div>
    </div>

    <div class="game__scales">
      <Scale
        face="health"
        :progress="health"
        :not="isNotDamaged && !isGameOver"
      />
      <Scale
        face="endurance"
        :progress="endurance"
        :lock="isHeroTired && !isGameOver"
        :not="isNotTired && !isGameOver"
      />
      <Scale
        face="power"
        :progress="power"
      />
    </div>
    <div class="game__ammo">
      {{ ammo }}/{{ ammoMagazine }}
    </div>

    <div
      v-if="!isGameOver"
      class="game__messages"
    >
      <div
        v-for="message, index in messages"
        :key="index"
        class="game__message-wrapper"
      >
        <!-- Подобрать предмет / поверженого врага (в дальнейшем)? -->
        <div
          v-if="message[1] === 1"
          class="game__message"
        >{{ $t(`messages.message${message[1]}`) }} {{ $t(`things.${message[2]}.name`) }}</div>

        <!-- Нумерованные сообщения о режимах, применении предметов, конце действия эффектов  -->
        <div
          v-if="message[1] === 2"
          class="game__message game__message--small"
        >
          {{message[0]}}: <span v-html="$t(`messages.message2.${message[2]}`)" />
          <span v-if="message[3]"> {{ $t(`things.${message[3]}.name`) }}</span>
        </div>

        <!-- Стартовое сообщение - реплика подруги -->
        <div
          v-if="message[1] === 3 && message[2] === 'start'"
          class="game__message game__message--xsmall"
        >
          <div v-html="$t(`messages.message3.${message[2]}`)" />
        </div>

        <!-- Предупреждение об утоплении!!! -->
        <div
          v-if="message[1] === 4 && message[2] === 'ocean'"
          class="game__message game__message--small game__message--warning blink"
        >
          <div v-html="$t(`messages.message4.${message[2]}`)" />
        </div>

        <!-- Нумерованные сообщения связанные с врагами  -->
        <div
          v-if="message[1] === 5"
          class="game__message game__message--small"
        >
          {{message[0]}}: <span v-html="$t(`messages.message5.${message[2]}`)" />
          <span v-if="message[3]"> {{ $t(`enemies.${message[3]}.declination`) }}</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import { DESIGN } from '@/utils/constants';

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
      ammo: 'hero/ammo',

      anemone: 'hero/anemone',
      crocus: 'hero/crocus',
      daffodil: 'hero/daffodil',
      tulip: 'hero/tulip',

      isHeroOnWater: 'hero/isHeroOnWater',
      isHeroTired: 'hero/isHeroTired',
      isNotDamaged: 'hero/isNotDamaged',
      isNotTired: 'hero/isNotTired',

      messages: 'layout/messages',
      isGameOver: 'layout/isGameOver',
    }),

    ammoMagazine() {
      const magazine = Math.floor((this.ammo - 1) / DESIGN.HERO.scales.ammo.magazine) + 1;
      return magazine < 10 ? '0' + magazine : magazine;
    },
  },

  methods: {
    ...mapActions({
      setHeroTired: 'hero/setHeroTired',
      setScale: 'hero/setScale',

      setGameOver: 'layout/setGameOver',
    }),

    reload() {
      window.location.reload();
    },

    flower(value) {
      return value < 10 ? '0' + value : value;
    },
  },

  watch: {
    health(value) {
      if (value < 0) this.setGameOver(true);
    },

    endurance(value) {
      if (value < 0) this.setHeroTired(true);
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

    &--damage {
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

  &__ammo {
    position: absolute;
    bottom: 0;
    right: $gutter / 2;
    color: $colors__white;
    @include text($font-size--large);
  }

  &__messages {
    max-width: 50%;
    position: absolute;
    top: $gutter / 2;
    right: $gutter / 2;
    text-align: right;
  }

  &__message {
    color: $colors__white;
    text-shadow: 2px 2px 5px $colors__shadows;
    margin-bottom: $gutter / 2;
    @include text($font-size--normal);

    &--small {
      @include text($font-size--small);
    }

    &--xsmall {
      @include text($font-size--xsmall);
    }

    &--warning {
      color: $colors__primary--light;
    }
  }

  &__things {
    position: absolute;
    top: $gutter / 2;
    left: $gutter * 3;
    display: flex;
  }

  &__thing {
    display: flex;
    align-items: center;
    color: $colors__white;
    margin-right: $gutter;
    text-shadow: 1px 2px 3px $colors__shadows;
    @include text($font-size--small);

    &-circle {
      margin-right: $gutter / 4;
      border-radius: 50%;
      transform: translateY($gutter * -0.05);
      @include size($gutter, $gutter);
    }

    &--anemones {
      .game__thing-circle {
        background: $colors__anemone;
      }
    }

    &--crocuses {
      .game__thing-circle {
        background: $colors__crocus;
      }
    }

    &--daffodils {
      .game__thing-circle {
        background: $colors__daffodil;
      }
    }

    &--tulips {
      .game__thing-circle {
        background: $colors__tulip;
      }
    }
  }
}
</style>
