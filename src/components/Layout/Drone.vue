<template>
  <div class="drone">
    <div class="drone__block drone--daffodil">
      <div class="drone__circle" />
      <div class="drone__text">
        {{ $t(`things.daffodil.name`) }}
        {{ $t(`things.daffodil.text`) }}
      </div>
    </div>
    <div class="drone__block drone--anemone">
      <div class="drone__circle" />
      <div class="drone__text">
        {{ $t(`things.anemone.name`) }}
        {{ $t(`things.anemone.text`) }}
      </div>
    </div>
    <div class="drone__block drone--crocus">
      <div class="drone__circle" />
      <div class="drone__text">
        {{ $t(`things.crocus.name`) }}
        {{ $t(`things.crocus.text`) }}
      </div>
    </div>
    <div class="drone__block drone--tulip">
      <div class="drone__circle" />
      <div class="drone__text">
        {{ $t(`things.tulip.name`) }}
        {{ $t(`things.tulip.text`) }}
      </div>
    </div>
    <div class="drone__block drone--bottle">
      <div class="drone__circle" />
      <div class="drone__text">
        {{ $t(`things.bottle.name`) }}
        {{ $t(`things.bottle.text`) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Drone',
};
</script>

<style lang="scss" scoped>
@import "@/styles/_main.scss";

.drone {
  position: absolute;
  left: 0;
  bottom: 0;
  min-width: 30vw;
  max-width: 30vw;
  position: absolute;
  bottom: $gutter / 2;
  left: $gutter / 2;
  pointer-events: none;

  &__block {
    display: flex;
    align-items: center;
    margin-bottom: $gutter / 2;
  }

  &__circle {
    min-width: $gutter * 2;
    margin-right: $gutter;
    border-radius: 50%;
    @include size($gutter * 2, $gutter * 2);
  }

  &--anemone {
    .drone__circle {
      background: $colors__anemone;
    }
  }

  &--crocus {
    .drone__circle {
      background: $colors__crocus;
    }
  }

  &--daffodil {
    .drone__circle {
      background: $colors__daffodil;
    }
  }

  &--tulip {
    .drone__circle {
      background: $colors__tulip;
    }
  }

  &--bottle {
    .drone__circle {
      background: $colors__primary;
    }
  }

  &__text {
    color: $colors__white;
    text-shadow: 2px 2px 5px $colors__shadows;
    @include text($font-size--xsmall);
  }
}
</style>
