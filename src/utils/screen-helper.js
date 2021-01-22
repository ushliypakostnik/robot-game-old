import { DESIGN } from '@/utils/constants';

// Модуль экранный помощник
const ScreenHelper = (() => {
  /* eslint-disable no-unused-vars */
  const NAME = 'ScreenHelper';

  const DESKTOP = DESIGN.BREAKPOINTS.desktop;

  const isDesktop = () => {
    return window.matchMedia(`(min-width: ${DESKTOP}px)`).matches;
  };

  return {
    isDesktop,
  };
})();

export default ScreenHelper;
