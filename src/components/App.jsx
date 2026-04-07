export const App = () => {
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
    >
      <script>
  (function(d,t) {
    var BASE_URL="http://159.65.126.33:3000";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/packs/js/sdk.js";
    g.async = true;
    s.parentNode.insertBefore(g,s);
    g.onload=function(){
      window.chatwootSDK.run({
        websiteToken: 'DcDn84YZWMBt99kzCH4vT1wJ',
        baseUrl: BASE_URL
      })
    }
  })(document,"script");
</script>
    </div>
  );
};
