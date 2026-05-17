const https = require('https');

const options = {
  hostname: 'bhezumawqhwzbawpjpia.supabase.co',
  path: '/rest/v1/?apikey=sb_publishable_mRXSUSVL2c9OOVw1Z72IzA_U1DhfvXC',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const spec = JSON.parse(data);
    if (spec && spec.definitions) {
      console.log('Tables:', Object.keys(spec.definitions));
      if (spec.definitions.chats) {
        console.log('Chats columns:', Object.keys(spec.definitions.chats.properties));
      }
    } else if (spec && spec.components && spec.components.schemas) {
      console.log('Tables (OAS3):', Object.keys(spec.components.schemas));
      if (spec.components.schemas.chats) {
        console.log('Chats columns:', Object.keys(spec.components.schemas.chats.properties));
      }
    } else {
      console.log('Keys:', Object.keys(spec));
    }
  });
});

req.end();
