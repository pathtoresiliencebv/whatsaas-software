'use client';

import Script from 'next/script';

declare global {
  interface Window {
    FB?: {
      init: (options: Record<string, unknown>) => void;
      getLoginStatus: (callback: (response: FacebookLoginStatusResponse) => void) => void;
      AppEvents?: {
        logPageView: () => void;
      };
    };
    fbAsyncInit?: () => void;
    checkLoginState?: () => void;
    statusChangeCallback?: (response: FacebookLoginStatusResponse) => void;
  }
}

type FacebookLoginStatusResponse = {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: string | number;
    signedRequest: string;
    userID: string;
  };
};

const facebookAppId = process.env.NEXT_PUBLIC_META_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const facebookApiVersion = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || 'v21.0';

export function FacebookSDK() {
  if (!facebookAppId) {
    return null;
  }

  return (
    <>
      <div id="fb-root" />
      <Script id="facebook-sdk-init" strategy="afterInteractive">
        {`
          window.fbAsyncInit = function() {
            FB.init({
              appId: '${facebookAppId}',
              cookie: true,
              xfbml: true,
              version: '${facebookApiVersion}'
            });

            FB.AppEvents.logPageView();
            FB.getLoginStatus(function(response) {
              window.statusChangeCallback(response);
            });
          };

          window.statusChangeCallback = function(response) {
            window.dispatchEvent(new CustomEvent('facebook-login-status', {
              detail: response
            }));
          };

          window.checkLoginState = function() {
            FB.getLoginStatus(function(response) {
              window.statusChangeCallback(response);
            });
          };
        `}
      </Script>
      <Script
        id="facebook-jssdk"
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
      />
    </>
  );
}
