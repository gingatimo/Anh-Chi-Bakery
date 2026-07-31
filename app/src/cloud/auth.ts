/**
 * auth.ts — đăng ký / đăng nhập tài khoản PHỤ HUYNH qua Supabase Auth.
 * Trẻ KHÔNG có tài khoản (thiết kế 9.4, 9.8). Chỉ email + mật khẩu của bố mẹ.
 */
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, ready };
}

export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error('Chưa cấu hình Supabase');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // link xác nhận email quay lại ĐÚNG site đang đăng ký (dev/prod), không phải
    // Site URL mặc định. URL này phải nằm trong Redirect URLs của project.
    options: { emailRedirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
  return data; // session có thể null nếu Supabase bật xác nhận email
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Chưa cấu hình Supabase');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
