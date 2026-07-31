/**
 * supabase.ts — client Supabase, CHỈ tạo khi có env (VITE_SUPABASE_URL +
 * VITE_SUPABASE_ANON_KEY). Chưa cấu hình → `null` → app vẫn chạy LOCAL-FIRST
 * (thiết kế 9.3, 9.9). Chỉ dùng ANON key ở frontend, KHÔNG bao giờ service_role.
 */
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anon);

/** Schema riêng của app "play" — phân vùng khỏi store trong cùng 1 database (xem
 *  supabase/migrations). Đổi 1 chỗ này nếu sau này tách sang project riêng. */
export const DB_SCHEMA = 'play';

export const supabase = supabaseConfigured
  ? createClient(url as string, anon as string, {
      db: { schema: DB_SCHEMA }, // .from('child_profiles') → play.child_profiles
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
