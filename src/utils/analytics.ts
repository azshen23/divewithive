import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

// Initialize Mixpanel if a token is provided
if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    track_pageview: true,
    persistence: 'localStorage',
  });
}

/**
 * Safely track custom events in Mixpanel
 */
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (MIXPANEL_TOKEN) {
    mixpanel.track(eventName, properties);
  } else {
    // Log to console in development environment to help verify tracking is working
    if (import.meta.env.DEV) {
      console.log(`[Analytics Bypass] Event: ${eventName}`, properties);
    }
  }
};
