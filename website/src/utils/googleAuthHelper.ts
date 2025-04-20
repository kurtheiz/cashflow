/**
 * Google Authentication Helper
 * 
 * This utility provides helper functions for Google authentication
 * and helps diagnose common issues with Google Sign-In.
 */

// Check if FedCM is enabled in the browser
export const checkFedCMSupport = (): boolean => {
  // There's no direct API to check if FedCM is enabled
  // We can only infer from errors or browser detection
  
  // Check if we're in a Chrome browser that supports FedCM
  const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
  const chromeVersion = isChrome 
    ? parseInt(navigator.userAgent.match(/Chrome\/([0-9]+)/)![1], 10) 
    : 0;
  
  // FedCM is available in Chrome 108+
  return isChrome && chromeVersion >= 108;
};

// Check if the current origin is valid for Google Sign-In
export const checkOrigin = (): { origin: string; isLocalhost: boolean } => {
  const origin = window.location.origin;
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
  
  return { origin, isLocalhost };
};

// Log Google authentication diagnostic information
export const logAuthDiagnostics = (): void => {
  const { origin, isLocalhost } = checkOrigin();
  const fedcmSupport = checkFedCMSupport();
  
  console.info('=== Google Auth Diagnostics ===');
  console.info(`Current origin: ${origin}`);
  console.info(`Is localhost: ${isLocalhost}`);
  console.info(`Browser supports FedCM: ${fedcmSupport}`);
  console.info('===============================');
  
  if (isLocalhost) {
    console.info('Tip: Make sure your Google Cloud Console project has the following JavaScript origins:');
    console.info('- http://localhost:5173');
    console.info('- http://127.0.0.1:5173');
  }
};

// Initialize Google authentication diagnostics
export const initGoogleAuthDiagnostics = (): void => {
  // Run diagnostics when the page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      logAuthDiagnostics();
    }, 1000);
  });
};

export default {
  checkFedCMSupport,
  checkOrigin,
  logAuthDiagnostics,
  initGoogleAuthDiagnostics
};
