-- Migration: Add badge column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT 'Exótica';
