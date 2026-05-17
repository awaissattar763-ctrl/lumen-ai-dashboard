const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bhezumawqhwzbawpjpia.supabase.co',
  'sb_publishable_mRXSUSVL2c9OOVw1Z72IzA_U1DhfvXC'
);

async function test() {
  const { data, error } = await supabase.from('messages').select('*').limit(1);
  console.log('messages error:', error);
  if (data && data.length > 0) {
    console.log('messages columns:', Object.keys(data[0]));
  }
}
test();
