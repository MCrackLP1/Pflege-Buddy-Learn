import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTopics() {
  const { data, error } = await supabase
    .from('topics')
    .select('slug, title')
    .limit(20);

  if (error) {
    console.error('Fehler:', error);
    return;
  }

  console.log('Topics in der Datenbank:');
  console.log(JSON.stringify(data, null, 2));
}

checkTopics();
