-- Add stripe annual price ID column to plans table
ALTER TABLE plans ADD COLUMN stripe_annual_price_id TEXT;

-- Update Starter plan with annual price ID
UPDATE plans SET stripe_annual_price_id = 'price_1TY86QIyQVlmif50AUh7VXBx' WHERE stripe_product_id = 'prod_UWoLl8kgx8XT1T';

-- Update Pro plan with annual price ID
UPDATE plans SET stripe_annual_price_id = 'price_1TY86RIyQVlmif50FA9Rn2ug' WHERE stripe_product_id = 'prod_UWoMbr9waS4oUI';

-- Update Enterprise plan with annual price ID
UPDATE plans SET stripe_annual_price_id = 'price_1TY86SIyQVlmif50nki3l5bk' WHERE stripe_product_id = 'prod_UWoMFU8TaqQmB4';
