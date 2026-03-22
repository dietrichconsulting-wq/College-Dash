import 'dotenv/config';

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
];

const optional = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'COLLEGE_SCORECARD_API_KEY',
  'ANTHROPIC_API_KEY',
  'PORT',
];

let hasError = false;

console.log('--- Required Variables ---');
for (const key of required) {
  const val = process.env[key];
  if (!val || val === 'secret_xxx' || val === '') {
    console.log(`  MISSING: ${key}`);
    hasError = true;
  } else {
    console.log(`  OK: ${key}`);
  }
}

console.log('\n--- Optional Variables ---');
for (const key of optional) {
  const val = process.env[key];
  if (!val || val === '') {
    console.log(`  NOT SET: ${key}`);
  } else {
    console.log(`  OK: ${key}`);
  }
}

if (hasError) {
  console.log('\nSome required variables are missing. Please update .env');
  process.exit(1);
} else {
  console.log('\nAll required variables are set.');
}
