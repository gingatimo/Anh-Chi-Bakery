/** Tài khoản & Sao lưu đám mây — nằm trong Cổng phụ huynh (sau PIN). Tài khoản của
 * BỐ MẸ; bé không cần đăng nhập (thiết kế 9.9). Chưa cấu hình Supabase → báo rõ,
 * app vẫn chơi local-first. */
import { useState } from 'react';
import { Panel, BigButton } from '../ui/kit';
import { sfx } from '../ui/sfx';
import { supabaseConfigured } from '../cloud/supabase';
import { useSession, signUp, signIn, signOut } from '../cloud/auth';
import { pushSnapshot, pullSnapshot, syncOnAuth } from '../cloud/sync';

type Msg = { kind: 'ok' | 'err' | 'info'; text: string } | null;
const errText = (e: unknown) => (e instanceof Error ? e.message : 'Có lỗi, thử lại nhé.');

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontSize: 17,
  fontFamily: 'var(--font-body)',
  padding: '10px 14px',
  borderRadius: 12,
  border: '3px solid rgba(74,59,50,0.16)',
  background: 'var(--paper)',
  color: 'var(--text)',
  marginBottom: 10,
};

function MsgLine({ msg }: { msg: Msg }) {
  if (!msg) return null;
  const color = msg.kind === 'err' ? 'var(--rose-dark)' : msg.kind === 'ok' ? 'var(--sage-dark)' : 'var(--text-soft)';
  return <p style={{ color, fontWeight: 600, marginTop: 10 }}>{msg.text}</p>;
}

export function AccountSection() {
  const { session, ready } = useSession();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  if (!supabaseConfigured) {
    return (
      <Panel style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 6 }}>☁️ Sao lưu đám mây</h3>
        <p style={{ color: 'var(--text-soft)', fontSize: 14, lineHeight: 1.5 }}>
          Chưa cấu hình Supabase nên tính năng tài khoản đang tắt — bé vẫn chơi và lưu bình thường trên máy này.
          Để bật sao lưu & chơi trên nhiều máy: tạo project Supabase, chạy <code>supabase/schema.sql</code>, rồi đặt
          hai biến <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> (xem README).
        </p>
      </Panel>
    );
  }
  if (!ready) {
    return (
      <Panel style={{ marginBottom: 16 }}>
        <p style={{ color: 'var(--text-soft)' }}>Đang tải tài khoản…</p>
      </Panel>
    );
  }

  // ── đã đăng nhập ──
  if (session) {
    const uid = session.user.id;
    const run = async (fn: () => Promise<void>) => {
      setBusy(true);
      setMsg(null);
      try {
        await fn();
      } catch (e) {
        setMsg({ kind: 'err', text: errText(e) });
      } finally {
        setBusy(false);
      }
    };
    return (
      <Panel style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 4 }}>☁️ Tài khoản & Sao lưu</h3>
        <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 14 }}>
          Đã đăng nhập: <strong style={{ color: 'var(--text)' }}>{session.user.email}</strong>
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <BigButton tone="sage" disabled={busy} onClick={() => run(async () => { await pushSnapshot(uid); sfx.coin(); setMsg({ kind: 'ok', text: 'Đã sao lưu lên đám mây!' }); })}>
            ☁️ Đồng bộ lên
          </BigButton>
          <BigButton tone="sky" disabled={busy} onClick={() => run(async () => { const ok = await pullSnapshot(uid); setMsg(ok ? { kind: 'ok', text: 'Đã tải dữ liệu về máy này!' } : { kind: 'info', text: 'Trên đám mây chưa có bản lưu nào.' }); })}>
            ⬇️ Tải về
          </BigButton>
          <BigButton tone="rose" disabled={busy} onClick={() => run(async () => { await signOut(); setMsg({ kind: 'info', text: 'Đã đăng xuất.' }); })}>
            Đăng xuất
          </BigButton>
        </div>
        <MsgLine msg={msg} />
      </Panel>
    );
  }

  // ── chưa đăng nhập: form ──
  async function submit() {
    if (!email.trim() || pw.length < 6) {
      setMsg({ kind: 'err', text: 'Nhập email và mật khẩu (≥ 6 ký tự) nhé.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'register') {
        const data = await signUp(email.trim(), pw);
        if (data.session) {
          await pushSnapshot(data.session.user.id);
          sfx.coin();
          setMsg({ kind: 'ok', text: 'Tạo tài khoản xong — đã sao lưu tiến trình của bé!' });
        } else {
          setMsg({ kind: 'info', text: 'Đã gửi email xác nhận. Mở email để kích hoạt rồi đăng nhập nhé.' });
        }
      } else {
        const data = await signIn(email.trim(), pw);
        const res = await syncOnAuth(data.session!.user.id);
        sfx.coin();
        setMsg({ kind: 'ok', text: res === 'pulled' ? 'Đăng nhập xong — đã tải dữ liệu về!' : 'Đăng nhập xong — đã sao lưu lên!' });
      }
    } catch (e) {
      setMsg({ kind: 'err', text: errText(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 4 }}>☁️ Tài khoản & Sao lưu</h3>
      <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 14 }}>
        Tài khoản của bố mẹ để <strong style={{ color: 'var(--text)' }}>sao lưu và chơi trên nhiều máy</strong>. Bé không cần tài khoản.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {(['register', 'login'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { sfx.tap(); setMode(m); setMsg(null); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 12,
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              background: mode === m ? 'var(--sage)' : 'var(--bg-sunk)',
              color: mode === m ? 'var(--ink)' : 'var(--text)',
              boxShadow: mode === m ? '0 0 0 2px var(--sage-dark)' : 'none',
            }}
          >
            {m === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>
        ))}
      </div>

      <input style={inputStyle} type="email" inputMode="email" autoComplete="email" placeholder="Email của bố mẹ" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input style={inputStyle} type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} placeholder="Mật khẩu (≥ 6 ký tự)" value={pw} onChange={(e) => setPw(e.target.value)} />

      <BigButton wide tone="peach" disabled={busy} onClick={submit}>
        {busy ? 'Đang xử lý…' : mode === 'register' ? 'Tạo tài khoản & sao lưu' : 'Đăng nhập'}
      </BigButton>
      <MsgLine msg={msg} />
    </Panel>
  );
}
