/** Chọn/đổi hồ sơ bé trong Khu phụ huynh (nhiều con dùng chung tài khoản bố mẹ).
 * Chọn bé nào → nạp bé đó từ DB (báo cáo + nhiệm vụ bên dưới theo bé đó) và bé đó
 * sẽ chơi khi thoát khu phụ huynh. Có thể XOÁ hồ sơ (dọn hồ sơ thừa/lặp).
 * Lưu bé hiện tại (kiểu QUẢN LÝ — không đè gameplay) trước khi đổi. */
import { useEffect, useState } from 'react';
import { useGame } from '../game/store';
import { Panel } from '../ui/kit';
import { sfx } from '../ui/sfx';
import { supabaseConfigured } from '../cloud/supabase';
import { useSession } from '../cloud/auth';
import { listChildren, pushManagement, pullChild, deleteChild, type ChildRow } from '../cloud/sync';

export function ChildSwitcher() {
  const { session } = useSession();
  const childId = useGame((s) => s.childId);
  const beginAddChild = useGame((s) => s.beginAddChild);
  const [rows, setRows] = useState<ChildRow[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;
    listChildren(session.user.id)
      .then(setRows)
      .catch(() => setRows([]));
  }, [session]);

  // Không cấu hình Supabase (dev) hoặc chưa có hồ sơ nào → ẩn (1 bé ngầm).
  if (!supabaseConfigured || !session || !rows || rows.length === 0) return null;

  const select = async (row: ChildRow) => {
    if (row.id === childId || busy) return;
    setBusy(true);
    sfx.bell();
    try {
      await pushManagement(session.user.id).catch(() => {}); // lưu bé hiện tại (không đè gameplay)
      await pullChild(row.id, session.user.id); // nạp bé mới (fresh), giữ nguyên phase 'parent'
      setRows(await listChildren(session.user.id)); // làm mới tên/lớp
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row: ChildRow) => {
    if (busy) return;
    if (!confirm(`Xoá hẳn hồ sơ “${row.ten_tiem || 'Tiệm của bé'}” khỏi tài khoản? Không hoàn tác.`)) return;
    setBusy(true);
    sfx.tap();
    try {
      await deleteChild(row.id, session.user.id);
      if (row.id === childId) useGame.setState({ childId: '', started: false, managing: false }); // vừa xoá bé đang chọn
      setRows(await listChildren(session.user.id));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 4 }}>👶 Hồ sơ bé</h3>
      <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 12 }}>
        Chọn bé để xem tiến bộ & giao nhiệm vụ riêng. Bé đang chọn cũng là bé sẽ chơi khi thoát khu này.
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map((c) => {
          const active = c.id === childId;
          return (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => select(c)}
                disabled={busy}
                aria-pressed={active}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 999,
                  background: active ? 'var(--sage)' : 'var(--bg-sunk)',
                  color: active ? 'var(--ink)' : 'var(--text)',
                  boxShadow: active ? '0 0 0 2px var(--sage-dark)' : 'none',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  opacity: busy && !active ? 0.6 : 1,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 18 }}>🧁</span>
                <span style={{ flex: 1, minWidth: 0 }}>{c.ten_tiem || 'Tiệm của bé'}</span>
                <span style={{ fontSize: 13, opacity: 0.75 }}>Lớp {c.lop ?? 3}</span>
                {active && <span>✓</span>}
              </button>
              <button
                onClick={() => remove(c)}
                disabled={busy}
                aria-label={`Xoá hồ sơ ${c.ten_tiem || 'bé'}`}
                title="Xoá hồ sơ bé"
                style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(74,59,50,0.10)', color: 'var(--text)', fontSize: 15 }}
              >
                🗑
              </button>
            </div>
          );
        })}
        <button
          onClick={() => { sfx.tap(); beginAddChild(); }}
          disabled={busy}
          style={{
            padding: '10px 14px',
            borderRadius: 999,
            background: 'var(--bg-sunk)',
            color: 'var(--text)',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            border: '2px dashed rgba(74,59,50,0.22)',
          }}
        >
          ➕ Thêm bé
        </button>
      </div>
    </Panel>
  );
}
