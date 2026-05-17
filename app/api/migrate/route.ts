import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Add columns if they don't exist
    await db.run(sql`
      ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_annual_price_id TEXT
    `);
    await db.run(sql`
      ALTER TABLE plans ADD COLUMN IF NOT EXISTS amount_annual INTEGER DEFAULT 0
    `);

    // Update Starter plan
    await db.run(sql`
      UPDATE plans SET stripe_annual_price_id = 'price_1TY86QIyQVlmif50AUh7VXBx', amount_annual = 23300 WHERE stripe_product_id = 'prod_UWoLl8kgx8XT1T'
    `);

    // Update Pro plan
    await db.run(sql`
      UPDATE plans SET stripe_annual_price_id = 'price_1TY86RIyQVlmif50FA9Rn2ug', amount_annual = 63500 WHERE stripe_product_id = 'prod_UWoMbr9waS4oUI'
    `);

    // Update Enterprise plan
    await db.run(sql`
      UPDATE plans SET stripe_annual_price_id = 'price_1TY86SIyQVlmif50nki3l5bk', amount_annual = 160000 WHERE stripe_product_id = 'prod_UWoMFU8TaqQmB4'
    `);

    return NextResponse.json({ success: true, message: 'Migration completed' });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
