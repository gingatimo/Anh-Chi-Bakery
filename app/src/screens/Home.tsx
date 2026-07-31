/** Home — board danh sách bé (sau khi phụ huynh đăng nhập). Bé chọn card tiệm của
 * mình (nhập PIN nếu có) để vào chơi; ⚙ mở Khu phụ huynh (tab các bé); ➕ thêm bé.
 * Bé "Thoát" trong game sẽ quay về đây để bé khác chọn. */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../game/store';
import { MapChar } from '../ui/MapChar';
import { BigButton, IconButton, SpeechBubble } from '../ui/kit';
import { sfx } from '../ui/sfx';
import { useSession } from '../cloud/auth';
import { listChildren, pullChild, type ChildRow } from '../cloud/sync';
import { CreateChild } from './Welcome';

type SaveHint = { childPin?: string | null; avatar?: { apron?: string } };

export function Home() {
  const { session } = useSession();
  const goto = useGame((s) => s.goto);
  const beginAddChild = useGame((s) => s.beginAddChild);
  const addingChild = useGame((s) => s.addingChild);
  const [rows, setRows] = useState<ChildRow[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;
    listChildren(session.user.id)
      .then(setRows)
      .catch(() => setRows([]));
  }, [session]);

  if (!session) return null; // Home chỉ dùng khi đã đăng nhập (dev không Supabase đi lối khác)
  if (addingChild) return <CreateChild session={session} />;
  if (rows === null)
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', color: 'var(--text-soft)' }}>Đang tải hồ sơ các bé…</div>
    );
  if (rows.length === 0) return <CreateChild session={session} />;

  const enter = async (row: ChildRow) => {
    if (busy) return;
    setBusy(true);
    sfx.bell();
    try {
      await pullChild(row.id, session.user.id); // nạp bé (childUnlocked=false)
      goto('hub'); // Game router → ChildLock nếu có PIN, else Hub
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="scroll" style={{ minHeight: '100dvh', padding: '16px 16px 40px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, flex: 1 }}>Tiệm của các bé</h1>
          <IconButton label="Khu phụ huynh" onClick={() => { sfx.tap(); goto('parent'); }}>
            ⚙️
          </IconButton>
        </header>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0 18px' }}>
          <SpeechBubble tail="down">Bé nào chơi hôm nay nào?</SpeechBubble>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {rows.map((c) => {
            const hint = (c.save_state ?? {}) as SaveHint;
            const locked = !!hint.childPin;
            const apron = hint.avatar?.apron ?? '#EBA7A0';
            return (
              <motion.button
                key={c.id}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={busy}
                onClick={() => enter(c)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 18px',
                  borderRadius: 20,
                  background: 'var(--bg-panel)',
                  boxShadow: 'var(--shadow)',
                  textAlign: 'left',
                  opacity: busy ? 0.7 : 1,
                }}
              >
                <span style={{ width: 46, height: 46, borderRadius: '50%', background: apron, boxShadow: 'var(--shadow-soft)', display: 'grid', placeItems: 'center', fontSize: 24 }}>🧁</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)' }}>{c.ten_tiem || 'Tiệm của bé'}</span>
                  <span style={{ color: 'var(--text-soft)', fontSize: 14 }}>
                    Lớp {c.lop ?? 3}
                    {locked && ' · 🔒 có mã'}
                  </span>
                </span>
                <span style={{ color: 'var(--peach)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Chơi →</span>
              </motion.button>
            );
          })}
        </div>

        <div style={{ marginTop: 16 }}>
          <BigButton wide tone="sky" onClick={() => { sfx.tap(); beginAddChild(); }}>
            ➕ Thêm bé mới
          </BigButton>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
          <MapChar mood="greet" width={150} />
        </div>
      </div>
    </div>
  );
}
