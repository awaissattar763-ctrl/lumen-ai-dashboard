const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bhezumawqhwzbawpjpia.supabase.co',
  'sb_publishable_mRXSUSVL2c9OOVw1Z72IzA_U1DhfvXC'
);

async function test() {
  const { data, error } = await supabase.from('chat_documents').select('*').limit(1);
  console.log('chat_documents error:', error);
  if (data) console.log('data:', data);
}
test();
