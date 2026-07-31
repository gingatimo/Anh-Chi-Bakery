/** Quên mã PIN phụ huynh → xác minh bằng MẬT KHẨU tài khoản (chứng minh là bố mẹ) →
 * đặt mã PIN mới. An toàn hơn "gửi PIN qua email" mà không cần backend gửi mail. */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../game/store';
import { MapChar } from '../ui/MapChar';
import { IconButton, BigButton } from '../ui/kit';
import { PinPad } from '../ui/PinPad';
import { reauthWithPassword } from '../cloud/auth';
import { sfx } from '../ui/sfx';

const field: React.CSSProperties = {
  width: '100%',
  fontSize: 17,
  fontFamily: 'var(--font-body)',
  padding: '11px 14px',
  borderRadius: 12,
  border: '3px solid rgba(74,59,50,0.16)',
  background: 'var(--paper)',
  color: 'var(--text)',
  marginBottom: 12,
};

export function PinRecover({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const setParentPin = useGame((s) => s.setParentPin);
  const [step, setStep] = useState<'pw' | 'new'>('pw');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function verify() {
    if (!pw) return;
    setBusy(true);
    setErr(null);
    const ok = await reauthWithPassword(pw);
    setBusy(false);
    if (ok) {
      sfx.pop();
      setStep('new');
    } else {
      sfx.soft();
      setErr('Mật khẩu không đúng. Thử lại nhé.');
    }
  }

  function onNewPin(code: string) {
    setParentPin(code);
    sfx.coin();
    onDone();
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', top: 14, left: 14 }}>
        <IconButton label="Quay lại" onClick={() => { sfx.tap(); onCancel(); }}>←</IconButton>
      </div>
      <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lift)', padding: '24px 26px 28px', maxWidth: 380, width: '100%', textAlign: 'center' }}>
        <MapChar mood="idle" width={96} />
        {step === 'pw' ? (
          <>
            <h2 style={{ fontSize: 22, margin: '6px 0 4px' }}>Quên mã PIN?</h2>
            <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>
              Nhập <b style={{ color: 'var(--text)' }}>mật khẩu tài khoản bố mẹ</b> để đặt lại mã PIN.
            </p>
            <input
              style={field}
              type="password"
              autoComplete="current-password"
              placeholder="Mật khẩu tài khoản"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verify()}
            />
            <BigButton wide tone="peach" disabled={busy} onClick={verify}>
              {busy ? 'Đang kiểm tra…' : 'Xác minh →'}
            </BigButton>
            {err && <p style={{ color: 'var(--rose-dark)', fontWeight: 600, marginTop: 10 }}>{err}</p>}
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 22, margin: '6px 0 4px' }}>Đặt mã PIN mới</h2>
            <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16 }}>Nhập 4 số làm mã mới cho khu phụ huynh.</p>
            <div style={{ display: 'grid', placeItems: 'center' }}>
              <PinPad onComplete={onNewPin} />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
