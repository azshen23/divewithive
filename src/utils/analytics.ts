import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

// Initialize Mixpanel if a token is provided
if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    track_pageview: true,
    persistence: 'localStorage',
    ignore_dnt: true, // Bypass browser's Do Not Track header so tracking works for all users (and in your local browser)
  });
}

/**
 * Safely track custom events in Mixpanel
 */
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (MIXPANEL_TOKEN) {
    mixpanel.track(eventName, properties);
  }
};
