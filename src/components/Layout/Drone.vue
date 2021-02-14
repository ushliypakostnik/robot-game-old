<template>
  <div class="drone">
    <div class="drone__things">
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

    <div class="drone__enemies">
      <div class="drone__block drone--horse">
        <div class="drone__text">
          {{ $t(`enemies.horse.name`) }}
          {{ $t(`enemies.horse.text`) }}
        </div>
        <div class="drone__circle" />
      </div>
      <div class="drone__block drone--parrot">
        <div class="drone__text">
          {{ $t(`enemies.parrot.name`) }}
          {{ $t(`enemies.parrot.text`) }}
        </div>
        <div class="drone__circle" />
      </div>
      <div class="drone__block drone--robot">
        <div class="drone__text">
          {{ $t(`enemies.robot.name`) }}
          {{ $t(`enemies.robot.text`) }}
        </div>
        <div class="drone__circle" />
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
  top: 0;
  bottom: 0;
  right: 0;
  pointer-events: none;
  @include size(100%, 100%);

  &__things,
  &__enemies {
    position: absolute;
  }

  &__things {
    min-width: 30vw;
    max-width: 30vw;
    bottom: $gutter / 2;
    left: $gutter / 2;

    .drone__circle {
      margin-right: $gutter;
    }
  }

  &__enemies {
    min-width: 35vw;
    max-width: 35vw;
    text-align: right;
    top: $gutter / 2;
    right: $gutter / 2;

    .drone__circle {
      margin-left: $gutter;
    }
  }

  &__block {
    display: flex;
    align-items: center;
    margin-bottom: $gutter / 2;
  }

  &__circle {
    $size: $gutter * 1.5;

    min-width: $size;
    border-radius: 50%;
    @include size($size, $size);
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

  &--horse {
    .drone__circle {
      background: $colors__analog--light;
    }
  }

  &--parrot {
    .drone__circle {
      background: $colors__triade1--light;
    }
  }

  &--robot {
    .drone__circle {
      background: $colors__robots;
    }
  }

  &__text {
    color: $colors__white;
    text-shadow: 2px 2px 5px $colors__shadows;
    @include text($font-size--xsmall);
  }
}
</style>
