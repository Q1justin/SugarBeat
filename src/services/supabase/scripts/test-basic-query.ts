import { supabase } from './supabase-node';

const run = async () => {
  console.log('Starting basic Supabase test...');
  
  try {
    console.log('Making simple query...');
    const { data, error } = await supabase
      .from('food_entries')
      .select()
      .limit(1);
      
    if (error) {
      console.error('Query error:', error);
      return;
    }
    
    console.log('Query succeeded!');
    console.log('Data:', data);
  } catch (err) {
    console.error('Error:', err);
  }
};

console.log('Test script starting...');
run().catch(err => console.error('Unhandled error:', err));
