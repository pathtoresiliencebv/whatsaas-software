-- Add stripe annual price ID and amount columns to plans table
ALTER TABLE plans ADD COLUMN stripe_annual_price_id TEXT;
ALTER TABLE plans ADD COLUMN amount_annual INTEGER DEFAULT 0;

-- Update Starter plan with annual price ID and amount (€233 = 23300 cents, 12 months - 4 free = 8 months billed)
UPDATE plans SET stripe_annual_price_id = 'price_1TY86QIyQVlmif50AUh7VXBx', amount_annual = 23300 WHERE stripe_product_id = 'prod_UWoLl8kgx8XT1T';

-- Update Pro plan with annual price ID and amount (€635 = 63500 cents)
UPDATE plans SET stripe_annual_price_id = 'price_1TY86RIyQVlmif50FA9Rn2ug', amount_annual = 63500 WHERE stripe_product_id = 'prod_UWoMbr9waS4oUI';

-- Update Enterprise plan with annual price ID and amount (€1600 = 160000 cents)
UPDATE plans SET stripe_annual_price_id = 'price_1TY86SIyQVlmif50nki3l5bk', amount_annual = 160000 WHERE stripe_product_id = 'prod_UWoMFU8TaqQmB4';
