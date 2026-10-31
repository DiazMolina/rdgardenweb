-- Migration: Add sizes array to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}';
