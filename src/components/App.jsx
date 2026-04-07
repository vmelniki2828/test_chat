import { useEffect } from 'react';

const BASE_URL = 'http://159.65.126.33:3000';
const SDK_SRC = `${BASE_URL}/packs/js/sdk.js`;

export const App = () => {
  useEffect(() => {
    if (document.querySelector(`script[src="${SDK_SRC}"]`)) return;

    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => {
      window.chatwootSDK.run({
        websiteToken: 'sVF7PMYGJzzzWBtbBxPZYu9v',
        baseUrl: BASE_URL
      });
    };
    document.head.appendChild(script);
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
