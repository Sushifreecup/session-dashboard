import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SessionSnapshot = {
  id: string;
  user_id: string;
  snapshot_type: string;
  captured_at: string;
};

export type Cookie = {
  id: string;
  snapshot_id: string;
  domain: string;
  name: string;
  value: string;
  path: string;
  secure: boolean;
  http_only: boolean;
  same_site: string;
  expiration_date: number | null;
};
