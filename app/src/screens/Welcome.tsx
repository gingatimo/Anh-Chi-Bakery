/** Onboarding — tách rõ vai trò:
 *   BỐ MẸ: đăng nhập/tạo tài khoản → đặt PIN + cấu hình thời gian (lần đầu) → chọn lớp cho bé.
 *   CON: đặt tên tiệm + chọn màu tạp dề → chơi.
 * LẦN SAU: `started` đã lưu → Game vào thẳng Hub, không hỏi đăng nhập.
 * Nhiều con: sau khi bố mẹ đăng nhập → màn CHỌN HỒ SƠ BÉ (thêm bé mới nếu cần).
 */
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';
import { useGame } from '../game/store';
import { SESSION_LABEL, type SessionPreset } from '../game/days';
import { MapChar } from '../ui/MapChar';
import { BigButton, SpeechBubble } from '../ui/kit';
import { sfx } from '../ui/sfx';
import { supabaseConfigured } from '../cloud/supabase';
import { useSession, signUp, signIn } from '../cloud/auth';
import { pushSnapshot, listChildren, activateChild, type ChildRow } from '../cloud/sync';

const APRONS = ['#EBA7A0', '#A9C6A0', '#9CC7D6', '#F3A46E', '#F2CE85'];
const SESSIONS: SessionPreset[] = ['ngan', 'vua', 'dai'];
const REST_OPTS = [20, 30, 45];

const field: React.CSSProperties = {
  width: '100%',
  fontSize: 17,
  fontFamily: 'var(--font-body)',
  padding: '11px 14px',
  borderRadius: 12,
  border: '3px solid rgba(74,59,50,0.16)',
  background: 'var(--paper)',
  color: 'var(--text)',
  marginBottom: 10,
};
const errText = (e: unknown) => (e instanceof Error ? e.message : 'Có lỗi, thử lại nhé.');

function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100%', display: 'grid', placeItems: 'center', padding: 24 }}>
      <motion.div
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lift)', padding: '24px 28px 28px', maxWidth: 470, width: '100%', textAlign: 'center' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Opt<T extends string | number>({ value, options, labelOf, descOf, onPick }: { value: T; options: T[]; labelOf: (o: T) => string; descOf?: (o: T) => string; onPick: (o: T) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={String(o)}
            onClick={() => { sfx.tap(); onPick(o); }}
            style={{ flex: 1, padding: '9px 6px', borderRadius: 12, background: on ? 'var(--sage)' : 'var(--bg-sunk)', color: on ? 'var(--ink)' : 'var(--text)', boxShadow: on ? '0 0 0 2px var(--sage-dark)' : 'none', fontWeight: 700, fontFamily: 'var(--font-display)', minHeight: 44 }}
          >
            {labelOf(o)}
            {descOf && <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.85 }}>{descOf(o)}</div>}
          </button>
        );
      })}
    </div>
  );
}

const rowLabel: React.CSSProperties = { textAlign: 'left', fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)', fontSize: 15 };

/** BỐ MẸ đăng nhập / tạo tài khoản (bắt buộc lần đầu khi có Supabase). */
function ParentAuth() {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    if (!email.trim() || pw.length < 6) { setMsg('Nhập email và mật khẩu (≥ 6 ký tự).'); return; }
    setBusy(true); setMsg(null);
    try {
      if (mode === 'register') {
        const d = await signUp(email.trim(), pw);
        if (!d.session) setMsg('Đã gửi email xác nhận. Mở email để kích hoạt rồi đăng nhập nhé.');
      } else {
        await signIn(email.trim(), pw);
      }
    } catch (e) {
      setMsg(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <MapChar mood="greet" width={128} />
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0 16px' }}>
        <SpeechBubble tail="down">Chào bố mẹ! Đăng nhập một lần để bắt đầu cho bé nhé.</SpeechBubble>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {(['register', 'login'] as const).map((m) => (
          <button key={m} onClick={() => { sfx.tap(); setMode(m); setMsg(null); }} style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-display)', background: mode === m ? 'var(--sage)' : 'var(--bg-sunk)', color: mode === m ? 'var(--ink)' : 'var(--text)', boxShadow: mode === m ? '0 0 0 2px var(--sage-dark)' : 'none' }}>
            {m === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>
        ))}
      </div>
      <input style={field} type="email" inputMode="email" autoComplete="email" placeholder="Email của bố mẹ" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input style={field} type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} placeholder="Mật khẩu (≥ 6 ký tự)" value={pw} onChange={(e) => setPw(e.target.value)} />
      <BigButton wide tone="peach" disabled={busy} onClick={submit}>
        {busy ? 'Đang xử lý…' : mode === 'register' ? 'Tạo tài khoản →' : 'Đăng nhập →'}
      </BigButton>
      {msg && <p style={{ color: 'var(--rose-dark)', fontWeight: 600, marginTop: 10 }}>{msg}</p>}
      <p style={{ color: 'var(--text-soft)', fontSize: 13, marginTop: 14 }}>Thiết lập một lần thôi — lần sau bé mở app là chơi ngay.</p>
    </Shell>
  );
}

/** Tạo hồ sơ một bé: BƯỚC 1 bố mẹ (PIN + thời gian nếu lần đầu + lớp) → BƯỚC 2 con (tên + tạp dề). */
function CreateChild({ session }: { session: Session | null }) {
  const startGame = useGame((s) => s.startGame);
  const setParentPin = useGame((s) => s.setParentPin);
  const setSession = useGame((s) => s.setSession);
  const setRest = useGame((s) => s.setRest);
  const setSessionsPerDay = useGame((s) => s.setSessionsPerDay);
  const settings = useGame((s) => s.settings);
  const addingChild = useGame((s) => s.addingChild);
  const needPinTime = settings.parentPin == null; // lần đầu trên máy này

  const [step, setStep] = useState<'parent' | 'child'>('parent');
  const [pin, setPin] = useState('');
  const [lop, setLop] = useState<3 | 4>(3);
  const [name, setName] = useState('Tiệm Bánh Anh Chi');
  const [apron, setApron] = useState(APRONS[0]);
  const [err, setErr] = useState<string | null>(null);

  function toChild() {
    if (needPinTime) {
      if (!/^\d{4}$/.test(pin)) { setErr('Đặt mã PIN gồm 4 chữ số cho khu bố mẹ.'); return; }
      setParentPin(pin);
    }
    setErr(null);
    sfx.tap();
    setStep('child');
  }

  async function begin() {
    sfx.bell();
    startGame(name, { apron, hair: '#4A3B32' }, lop);
    if (session) {
      try { await pushSnapshot(session.user.id); } catch { /* offline — đã lưu cục bộ */ }
    }
  }

  // BƯỚC 1 — BỐ MẸ
  if (step === 'parent') {
    return (
      <Shell>
        {addingChild && (
          <div style={{ textAlign: 'left', marginBottom: 6 }}>
            <button onClick={() => { sfx.tap(); useGame.setState({ addingChild: false }); }} style={{ color: 'var(--text-soft)', fontWeight: 600, fontSize: 14 }}>← Chọn bé khác</button>
          </div>
        )}
        <MapChar mood="idle" width={110} />
        <h2 style={{ fontSize: 22, margin: '4px 0 4px' }}>Bố mẹ thiết lập cho bé</h2>
        <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>Vài lựa chọn của bố mẹ, rồi tới lượt bé trang trí tiệm.</p>

        {needPinTime && (
          <>
            <div style={rowLabel}>Đặt mã PIN 4 số (mở khu phụ huynh)</div>
            <input style={{ ...field, letterSpacing: 8, textAlign: 'center', fontWeight: 700 }} type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />

            <div style={rowLabel}>Số lượt chơi mỗi ngày</div>
            <Opt value={settings.sessionsPerDay} options={[1, 2, 3]} labelOf={(n) => `${n} lượt`} onPick={setSessionsPerDay} />

            <div style={rowLabel}>Độ dài một buổi chơi</div>
            <Opt value={settings.session} options={SESSIONS} labelOf={(s) => SESSION_LABEL[s].name} descOf={(s) => SESSION_LABEL[s].desc} onPick={setSession} />

            <div style={rowLabel}>Thời gian nghỉ mắt</div>
            <Opt value={settings.restSeconds} options={REST_OPTS} labelOf={(n) => `${n} giây`} onPick={setRest} />
          </>
        )}

        <div style={rowLabel}>Bé học lớp mấy?</div>
        <Opt value={lop} options={[3, 4]} labelOf={(g) => `Lớp ${g}`} onPick={(g) => setLop(g)} />

        <BigButton wide tone="peach" onClick={toChild}>Tiếp — tới lượt bé →</BigButton>
        {err && <p style={{ color: 'var(--rose-dark)', fontWeight: 600, marginTop: 10 }}>{err}</p>}
      </Shell>
    );
  }

  // BƯỚC 2 — CON
  return (
    <Shell>
      <div style={{ textAlign: 'left', marginBottom: 6 }}>
        <button onClick={() => { sfx.tap(); setStep('parent'); }} style={{ color: 'var(--text-soft)', fontWeight: 600, fontSize: 14 }}>← Quay lại</button>
      </div>
      <MapChar mood="greet" width={140} />
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0 18px' }}>
        <SpeechBubble tail="down">Tới lượt bé! Đặt tên tiệm và chọn màu tạp dề nào!</SpeechBubble>
      </div>

      <label style={rowLabel}>Đặt tên tiệm</label>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} style={{ ...field, marginBottom: 20 }} />

      <div style={rowLabel}>Chọn màu tạp dề</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 26 }}>
        {APRONS.map((c) => (
          <motion.button key={c} whileHover={{ scale: 1.12, y: -2 }} whileTap={{ scale: 0.92 }} onClick={() => { sfx.tap(); setApron(c); }} aria-label={`Màu ${c}`} style={{ width: 46, height: 46, borderRadius: '50%', background: c, boxShadow: apron === c ? '0 0 0 4px var(--ink)' : 'var(--shadow-soft)' }} />
        ))}
      </div>

      <BigButton wide tone="peach" onClick={begin}>Cho bé chơi thôi! 🎀</BigButton>
    </Shell>
  );
}

/** Chọn hồ sơ bé (nhiều con dùng chung 1 tài khoản bố mẹ). */
function ChildPicker({ rows, err }: { rows: ChildRow[]; err: string | null }) {
  const beginAddChild = useGame((s) => s.beginAddChild);
  return (
    <Shell>
      <MapChar mood="greet" width={120} />
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0 16px' }}>
        <SpeechBubble tail="down">Bé nào chơi hôm nay nào?</SpeechBubble>
      </div>
      <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
        {rows.map((c) => (
          <motion.button key={c.id} whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { sfx.bell(); activateChild(c); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 16, background: 'var(--bg-sunk)', boxShadow: 'var(--shadow-soft)' }}>
            <span style={{ fontSize: 26 }}>🧁</span>
            <span style={{ flex: 1, textAlign: 'left' }}>
              <span style={{ display: 'block', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{c.ten_tiem || 'Tiệm của bé'}</span>
              <span style={{ color: 'var(--text-soft)', fontSize: 14 }}>Lớp {c.lop ?? 3}</span>
            </span>
            <span style={{ color: 'var(--peach)', fontWeight: 800 }}>Chơi →</span>
          </motion.button>
        ))}
      </div>
      <BigButton wide tone="sky" onClick={() => { sfx.tap(); beginAddChild(); }}>➕ Thêm bé mới</BigButton>
      {err && <p style={{ color: 'var(--rose-dark)', fontSize: 13, marginTop: 8 }}>{err}</p>}
    </Shell>
  );
}

/** Sau khi bố mẹ đăng nhập: tải danh sách con → chọn bé, hoặc tạo hồ sơ nếu chưa có. */
function ChildGate({ session }: { session: Session }) {
  const addingChild = useGame((s) => s.addingChild);
  const [rows, setRows] = useState<ChildRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listChildren(session.user.id)
      .then((r) => alive && setRows(r))
      .catch((e) => { if (alive) { setRows([]); setErr(e instanceof Error ? e.message : 'Lỗi tải hồ sơ các bé.'); } });
    return () => { alive = false; };
  }, [session.user.id]);

  if (rows === null) return <Shell><p style={{ color: 'var(--text-soft)' }}>Đang tải hồ sơ các bé…</p></Shell>;
  if (addingChild || rows.length === 0) return <CreateChild session={session} />;
  return <ChildPicker rows={rows} err={err} />;
}

export function Welcome() {
  const { session, ready } = useSession();
  if (supabaseConfigured && !ready) return <Shell><p style={{ color: 'var(--text-soft)' }}>Đang tải…</p></Shell>;
  if (supabaseConfigured && !session) return <ParentAuth />;
  if (session) return <ChildGate session={session} />;
  return <CreateChild session={null} />; // không cấu hình Supabase → local-first
}
