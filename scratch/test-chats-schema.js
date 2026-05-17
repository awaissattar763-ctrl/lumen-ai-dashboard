const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bhezumawqhwzbawpjpia.supabase.co',
  'sb_publishable_mRXSUSVL2c9OOVw1Z72IzA_U1DhfvXC'
);

async function test() {
  const { data, error } = await supabase.from('chats').select('*').limit(1);
  console.log('Error:', error);
  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  }
}
test();
