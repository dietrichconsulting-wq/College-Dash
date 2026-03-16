import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const API_KEY = process.env.NOTION_API_KEY;
const PROFILES_DB = process.env.NOTION_PROFILES_DB_ID;
const NOTION_VERSION = '2022-06-28';

async function main() {
  if (!API_KEY || !PROFILES_DB) {
    console.error('Set NOTION_API_KEY and NOTION_PROFILES_DB_ID in .env');
    process.exit(1);
  }

  console.log('Adding subscription fields to Profiles database...');

  const res = await fetch(`https://api.notion.com/v1/databases/${PROFILES_DB}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        Email:              { rich_text: {} },
        SubscriptionStatus: { select: { options: [
          { name: 'trial', color: 'yellow' },
          { name: 'active', color: 'green' },
          { name: 'cancelled', color: 'orange' },
          { name: 'expired', color: 'red' },
        ]}},
        SubscriptionEnd:      { date: {} },
        StripeCustomerID:     { rich_text: {} },
        StripeSubscriptionID: { rich_text: {} },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to update database: ${err.message}`);
  }

  console.log('Subscription fields added successfully.');
  console.log('\nAdd these to your .env file:');
  console.log('STRIPE_SECRET_KEY=sk_test_...');
  console.log('STRIPE_PUBLISHABLE_KEY=pk_test_...');
  console.log('STRIPE_WEBHOOK_SECRET=whsec_...');
  console.log('STRIPE_PRICE_ID=price_...');
  console.log('PROMO_CODE=Stairway Tester');
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
