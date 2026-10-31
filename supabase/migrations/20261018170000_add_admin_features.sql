-- Migration: Add courier and tracking to orders, and images and is_published to products
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS courier TEXT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
