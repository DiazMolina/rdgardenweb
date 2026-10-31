-- Migration: Add care_instructions, shipping_info, and faq to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS care_instructions TEXT,
ADD COLUMN IF NOT EXISTS shipping_info TEXT,
ADD COLUMN IF NOT EXISTS faq TEXT;
