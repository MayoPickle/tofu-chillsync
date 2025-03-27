import { load } from '@fingerprintjs/fingerprintjs';

const STORAGE_KEY = 'chillsync_visitor_id';

// Load FingerprintJS
const fpPromise = load();

// Get a visitor ID
export const getVisitorId = async () => {
  // First check if we already have a visitor ID in localStorage
  const storedId = localStorage.getItem(STORAGE_KEY);
  if (storedId) {
    return storedId;
  }

  try {
    // Generate a new fingerprint
    const fp = await fpPromise;
    const result = await fp.get();
    const visitorId = result.visitorId;

    // Store it for future visits
    localStorage.setItem(STORAGE_KEY, visitorId);
    return visitorId;
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    // Fallback to a random ID if fingerprinting fails
    const fallbackId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem(STORAGE_KEY, fallbackId);
    return fallbackId;
  }
};

// Get a display-friendly version of the visitor ID (first 6 chars)
export const getShortVisitorId = async () => {
  const visitorId = await getVisitorId();
  return visitorId.substring(0, 6);
}; 