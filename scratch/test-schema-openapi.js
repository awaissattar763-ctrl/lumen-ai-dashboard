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
    if (spec && spec.definitions && spec.definitions.chats) {
      console.log('Chats table columns:', Object.keys(spec.definitions.chats.properties));
    } else {
      console.log('Chats definition not found or error');
    }
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
