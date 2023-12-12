import * as React from "react";
import { HolyProgress } from "./HolyProgress";
import { DEFAULTS } from "./constants";

export type HolyLoaderProps = {
  /**
   * Specifies the color of the top-loading bar.
   * Default: "#59a2ff" (a shade of blue)
   */
  color?: string;

  /**
   * Sets the initial position of the top-loading bar as a percentage of the total width.
   * Default: 0.08 (8% of the total width)
   */
  initialPosition?: number;

  /**
   * Determines the delay speed for the incremental movement of the top-loading bar, in milliseconds.
   * Default: 200 milliseconds
   */
  trickleSpeed?: number;

  /**
   * Defines the height of the top-loading bar in pixels.
   * Default: 4 pixels
   */
  height?: number;

  /**
   * Enables or disables the automatic incremental movement of the top-loading bar.
   * Default: true (enabled)
   */
  trickle?: boolean;

  /**
   * Specifies the easing function to use for the loading animation. Accepts any valid CSS easing string.
   * Default: "ease"
   */
  easing?: string;

  /**
   * Sets the animation speed of the top-loading bar in milliseconds.
   * Default: 200 milliseconds
   */
  speed?: number;

  /**
   * Defines the z-index property of the top-loading bar, controlling its stacking order.
   * Default: 2147483647
   */
  zIndex?: number;
};

/**
 * Converts a given URL to an absolute URL based on the current window location.
 * If the input URL is already absolute, it remains unchanged.
 *
 * @param {string} url - The URL to be converted. Can be an absolute or relative URL.
 * @returns {string} The absolute URL derived from the given URL and the current window location.
 */
export const toAbsoluteURL = (url: string): string => {
  return new URL(url, window.location.href).href;
};

/**
 * Determines if two URLs refer to the same page, differing only by the anchor.
 *
 * @param {string} currentUrl The current URL.
 * @param {string} newUrl The new URL to compare with the current URL.
 * @returns {boolean} True if the URLs refer to the same page (excluding the anchor), false otherwise.
 */
export const isSamePageAnchor = (
  currentUrl: string,
  newUrl: string
): boolean => {
  const current = new URL(toAbsoluteURL(currentUrl));
  const next = new URL(toAbsoluteURL(newUrl));
  return current.href.split("#")[0] === next.href.split("#")[0];
};

/**
 * Determines if two URLs have the same origin.
 *
 * @param {string} currentUrl The current URL.
 * @param {string} newUrl The new URL to compare with the current URL.
 * @returns {boolean} True if the URLs have the same origin, false otherwise.
 */
export const isSameOrigin = (currentUrl: string, newUrl: string): boolean => {
  const current = new URL(toAbsoluteURL(currentUrl));
  const next = new URL(toAbsoluteURL(newUrl));
  return current.origin === next.origin;
};

/**
 * HolyLoader is a React component that provides a customizable top-loading progress bar.
 * It uses the NProgress library for progress display and offers various props for customization.
 *
 * @param {HolyLoaderProps} props The properties for configuring the HolyLoader.
 * @returns {JSX.Element} The styles element to be rendered.
 */
const HolyLoader = ({
  color = DEFAULTS.color,
  initialPosition = DEFAULTS.initialPosition,
  trickleSpeed = DEFAULTS.trickleSpeed,
  height = DEFAULTS.height,
  trickle = DEFAULTS.trickle,
  easing = DEFAULTS.easing,
  speed = DEFAULTS.speed,
  zIndex = DEFAULTS.zIndex,
}: HolyLoaderProps) => {
  React.useEffect(() => {
    const holyProgress = new HolyProgress({
      color,
      height,
      trickleSpeed,
      trickle,
      initialPosition,
      easing,
      speed,
      zIndex,
    });

    /**
     * Handles click events on anchor tags, starting the NProgress bar for page navigation.
     * It checks for various conditions to decide whether to start the progress bar or not.
     *
     * @param {MouseEvent} event The mouse event triggered by clicking an anchor tag.
     */
    const handleClick = (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement;
        const anchor = target.closest("a");
        if (
          !anchor ||
          anchor.target === "_blank" ||
          event.ctrlKey ||
          event.metaKey ||
          // Skip if URL points to a different domain
          !isSameOrigin(window.location.href, anchor.href) ||
          // Skip if URL is a same-page anchor (href="#", href="#top", etc.).
          isSamePageAnchor(window.location.href, anchor.href) ||
          // Skip if URL uses a non-http/https protocol (mailto:, tel:, etc.).
          !toAbsoluteURL(anchor.href).startsWith("http")
        ) {
          return;
        }

        holyProgress.start();
        overridePushState();
      } catch (error) {
        holyProgress.start();
        holyProgress.done();
      }
    };

    /**
     * Overrides the history.pushState function to stop the NProgress bar
     * when navigating to a new page without a full page reload.
     */
    const overridePushState = () => {
      const originalPushState = history.pushState;
      history.pushState = (...args) => {
        holyProgress.done();
        document.documentElement.classList.remove("nprogress-busy");
        originalPushState.apply(history, args);
      };
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return <></>;
};

export default HolyLoader;
