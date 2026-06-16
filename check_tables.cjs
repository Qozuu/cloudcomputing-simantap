const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('c:/Users/USER/cloudcomputing-simantap/.env', 'utf8');
const lines = envFile.split('\n');
const env = {};
lines.forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '').replace(/'/g, '');
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspectTable(tableName) {
  console.log(`\n--- Inspecting table: ${tableName} ---`);
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
      console.log(`Error querying ${tableName}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`Sample row from ${tableName}:`, JSON.stringify(data[0], null, 2));
    } else {
      console.log(`Table ${tableName} is empty or no rows returned.`);
      // Query column names from public schema or perform a dummy insert/select
      const { data: cols, error: colErr } = await supabase.from(tableName).select('*').limit(0);
      console.log(`Fields for ${tableName}:`, colErr ? colErr.message : 'Successfully queried empty table');
    }
  } catch (err) {
    console.error(`Exception for ${tableName}:`, err.message);
  }
}

async function run() {
  const tables = ['users', 'visitor', 'incident', 'unit', 'tower', 'absensi', 'tagihan', 'informasi', 'pengeluaran'];
  for (const table of tables) {
    await inspectTable(table);
  }
}

run();
