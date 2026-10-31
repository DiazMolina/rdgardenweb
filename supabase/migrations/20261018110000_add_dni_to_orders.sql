-- Migration: Add customer_dni column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_dni TEXT;
