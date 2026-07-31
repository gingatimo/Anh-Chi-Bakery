/** Tài khoản (Cổng phụ huynh, sau PIN). DB-first: dữ liệu của bé TỰ ĐỘNG lưu & đồng
 * bộ với đám mây (xem cloud/autosave.ts). Ở đây chỉ hiện tài khoản đang đăng nhập +
 * nút đồng bộ tay/đăng xuất. Đăng nhập/đăng ký nằm ở onboarding, không lặp lại đây.
 * Bé không cần tài khoản (thiết kế 9.9). */
import { useState } from 'react';
import { Panel, BigButton } from '../ui/kit';
import { sfx } from '../ui/sfx';
import { supabaseConfigured } from '../cloud/supabase';
import { useSession, signOut } from '../cloud/auth';
import { pushSnapshot } from '../cloud/sync';

type Msg = { kind: 'ok' | 'err' | 'info'; text: string } | null;
const errText = (e: unknown) => (e instanceof Error ? e.message : 'Có lỗi, thử lại nhé.');

function MsgLine({ msg }: { msg: Msg }) {
  if (!msg) return null;
  const color = msg.kind === 'err' ? 'var(--rose-dark)' : msg.kind === 'ok' ? 'var(--sage-dark)' : 'var(--text-soft)';
  return <p style={{ color, fontWeight: 600, marginTop: 10 }}>{msg.text}</p>;
}

export function AccountSection() {
  const { session, ready } = useSession();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  if (!supabaseConfigured) {
    return (
      <Panel style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 6 }}>☁️ Sao lưu đám mây</h3>
        <p style={{ color: 'var(--text-soft)', fontSize: 14, lineHeight: 1.5 }}>
          Chưa cấu hình Supabase nên tính năng tài khoản đang tắt — bé vẫn chơi và lưu bình thường trên máy này.
          Để bật: đặt hai biến <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> (xem README).
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

  // Bình thường vào được đây là đã đăng nhập (cổng game bắt buộc login). Nếu phiên
  // vừa hết thì báo nhẹ — app sẽ tự đưa về màn đăng nhập.
  if (!session) {
    return (
      <Panel style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 6 }}>☁️ Tài khoản</h3>
        <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Phiên đăng nhập đã hết. Quay lại màn hình chính để đăng nhập lại nhé.</p>
      </Panel>
    );
  }

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
      <h3 style={{ marginBottom: 4 }}>☁️ Tài khoản</h3>
      <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 14 }}>
        Đã đăng nhập: <strong style={{ color: 'var(--text)' }}>{session.user.email}</strong>
        <br />
        Tiến trình của bé <strong style={{ color: 'var(--text)' }}>tự động lưu & đồng bộ</strong> với đám mây — không cần bấm gì.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <BigButton tone="sage" disabled={busy} onClick={() => run(async () => { await pushSnapshot(uid); sfx.coin(); setMsg({ kind: 'ok', text: 'Đã đồng bộ ngay lên đám mây!' }); })}>
          ☁️ Đồng bộ ngay
        </BigButton>
        <BigButton tone="rose" disabled={busy} onClick={() => run(async () => { await signOut(); setMsg({ kind: 'info', text: 'Đã đăng xuất.' }); })}>
          Đăng xuất
        </BigButton>
      </div>
      <MsgLine msg={msg} />
    </Panel>
  );
}
