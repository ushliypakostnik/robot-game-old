<template>
  <div class="scale">
    <div
      class="scale__progress"
      :class="`scale__progress--${face}`"
      :style="{ width: progress + '%' }"
    />
  </div>
</template>

<script>
export default {
  name: 'Scale',

  props: {
    face: {
      type: String,
      default: null,
      required: true,
    },
    progress: {
      type: Number,
      default: null,
      required: true,
    },
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/_main.scss";

.scale {
  width: 100%;
  background: transparent;
  padding: ($gutter / 10);
  border: ($border-width / 2) solid $colors__border;

  &:not(:last-child) {
    margin-bottom: $gutter / 4;
  }

  &__progress {
    height: $gutter / 4;

    &--health {
      background: $colors__primary--light;
    }

    &--endurance {
      background: $colors__triade1--light;
    }

    &--power {
      background: $colors__tetrade--light;
    }
  }
}
</style>
