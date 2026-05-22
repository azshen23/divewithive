import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
const RECORD_PERCENT = import.meta.env.VITE_MIXPANEL_RECORD_PERCENT
  ? Number(import.meta.env.VITE_MIXPANEL_RECORD_PERCENT)
  : 100;

// Initialize Mixpanel if a token is provided
if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    track_pageview: true,
    persistence: 'localStorage',
    ignore_dnt: true, // Bypass browser's Do Not Track header so tracking works for all users (and in your local browser)
    record_sessions_percent: RECORD_PERCENT,
    record_mask_all_text: false, // The site only shows public content, so unmask text for better usability testing in replays
    record_mask_all_inputs: true, // Keep any potential inputs masked for privacy
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
