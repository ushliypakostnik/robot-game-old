import { DESIGN } from '@/utils/constants';

// Модуль экранный помощник
const ScreenHelper = (() => {
  /* eslint-disable no-unused-vars */
  const NAME = 'ScreenHelper';

  const DESKTOP = DESIGN.BREAKPOINTS.desktop;

  const isDesktop = () => {
    return window.matchMedia(`(min-width: ${DESKTOP}px)`).matches;
  };

  const isChrome = () => {
    return !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  };

  return {
    isDesktop,
    isChrome,
  };
})();

export default ScreenHelper;
