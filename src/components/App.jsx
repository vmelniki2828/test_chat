import { useEffect } from 'react';

const BASE_URL = 'http://159.65.126.33:3000';

export const App = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${BASE_URL}/packs/js/sdk.js`;
    script.async = true;
    script.onload = () => {
      window.chatwootSDK?.run({
        websiteToken: 'DcDn84YZWMBt99kzCH4vT1wJ',
        baseUrl: BASE_URL
      });
    };
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 40,
        color: '#010101'
      }}
    />
  );
};
