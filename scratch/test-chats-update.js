const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bhezumawqhwzbawpjpia.supabase.co',
  'sb_publishable_mRXSUSVL2c9OOVw1Z72IzA_U1DhfvXC'
);

async function test() {
  const { data, error } = await supabase
    .from('chats')
    .insert([{ title: 'Test Chat' }])
    .select();
    
  console.log('Insert Error:', error);
  if (data && data[0]) {
    const chatId = data[0].id;
    console.log('Chat inserted with id:', chatId);
    
    // Try updating selected_doc_ids
    const updateRes = await supabase
      .from('chats')
      .update({ selected_doc_ids: ['test-doc-id'] })
      .eq('id', chatId)
      .select();
      
    console.log('Update Error:', updateRes.error);
    console.log('Updated Data:', updateRes.data);
    
    // Delete the chat
    await supabase.from('chats').delete().eq('id', chatId);
  }
}

test();
