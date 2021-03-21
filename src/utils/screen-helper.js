import { DESIGN } from '@/utils/constants';

// Модуль экранный помощник
const ScreenHelper = (() => {
  /* eslint-disable no-unused-vars */
  const NAME = 'ScreenHelper';

  const DESKTOP = DESIGN.BREAKPOINTS.desktop;

  const isDesktop = () => {
    return window.matchMedia(`(min-width: ${DESKTOP}px)`).matches;
  };

  const isChromeOrYandex = () => {
    const ua = navigator.userAgent;
    // !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    return (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) || ua.search(/YaBrowser/) > 0;
  };

  return {
    isDesktop,
    isChromeOrYandex,
  };
})();

export default ScreenHelper;
