/** Quản lý nhiệm vụ (Khu phụ huynh, sau PIN). Ba mẹ: giao nhiệm vụ (chọn mẫu hoặc
 * tự tạo), và DUYỆT khi bé hoàn thành → thưởng xu. Nhiệm vụ lặp lại mỗi ngày
 * (reset 04:00 theo gameDay). Việc thật ngoài đời do người lớn xác nhận. */
import { useState } from 'react';
import { useGame, gameDay } from '../game/store';
import { TASK_TEMPLATES, TASK_EMOJIS } from '../game/taskTemplates';
import { approveTaskReward, unapproveTaskReward } from '../cloud/sync';
import { notifyApproval } from '../cloud/realtime';
import { useSession } from '../cloud/auth';
import { Panel, BigButton } from '../ui/kit';
import { sfx } from '../ui/sfx';

const XU_OPTIONS = [5, 10, 15, 20];

export function TaskManager() {
  const tasks = useGame((s) => s.tasks);
  const shopName = useGame((s) => s.shopName);
  const childId = useGame((s) => s.childId);
  const approvedToday = useGame((s) => s.approvedToday);
  const toggleTaskDone = useGame((s) => s.toggleTaskDone);
  const removeTask = useGame((s) => s.removeTask);
  const { session } = useSession();
  const [adding, setAdding] = useState(false);
  const today = gameDay();
  const pendingCount = tasks.filter((t) => !approvedToday.includes(t.id) && t.raisedDay === today).length;

  return (
    <Panel style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 4 }}>
        🎯 Nhiệm vụ · <span style={{ color: 'var(--peach-dark, #C67C43)' }}>{shopName}</span>
        {pendingCount > 0 && <span style={{ color: 'var(--rose-dark)' }}> · {pendingCount} chờ duyệt</span>}
      </h3>
      <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 14 }}>
        Giao việc thật cho bé. Bé làm xong sẽ “báo đã làm”, bố mẹ bấm <strong style={{ color: 'var(--text)' }}>Duyệt</strong> để thưởng xu.
        Nhiệm vụ tự làm mới mỗi ngày.
      </p>

      {tasks.length === 0 && (
        <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 12 }}>Chưa giao nhiệm vụ nào — thêm bên dưới nhé.</p>
      )}

      <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
        {tasks.map((t) => {
          const done = approvedToday.includes(t.id);
          const raised = !done && t.raisedDay === today;
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px 8px 12px',
                borderRadius: 14,
                background: raised ? 'var(--butter)' : 'var(--bg-sunk)',
                color: raised ? 'var(--ink)' : 'var(--text)',
                boxShadow: raised ? '0 0 0 2px var(--butter-dark, rgba(0,0,0,0.06))' : 'none',
              }}
            >
              <span style={{ fontSize: 26, lineHeight: 1 }}>{t.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 15 }}>{t.title}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  {t.xu} xu{raised && ' · bé báo đã làm!'}
                  {done && ' · đã duyệt hôm nay'}
                </div>
              </div>
              <button
                onClick={() => {
                  sfx.coin();
                  const approved = toggleTaskDone(t.id); // đổi LOCAL (approvedToday + rewardXu)
                  const uid = session?.user.id;
                  if (uid && childId) {
                    // ghi LEDGER riêng (atomic) — KHÔNG đụng save_state của máy bé (Finding 1)
                    void (approved
                      ? approveTaskReward(childId, uid, t.id, t.xu, today)
                      : unapproveTaskReward(childId, uid, t.id, today));
                  }
                  notifyApproval(); // báo sống cho máy bé (broadcast)
                }}
                style={{
                  padding: '9px 12px',
                  borderRadius: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  whiteSpace: 'nowrap',
                  background: done ? 'var(--sage)' : 'var(--peach)',
                  color: 'var(--ink)',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                {done ? '✓ Đã duyệt' : `Duyệt +${t.xu}`}
              </button>
              <button
                onClick={() => {
                  sfx.tap();
                  removeTask(t.id);
                }}
                aria-label={`Xoá nhiệm vụ ${t.title}`}
                title="Xoá nhiệm vụ"
                style={{ padding: '9px 10px', borderRadius: 11, background: 'rgba(74,59,50,0.10)', color: 'var(--text)', fontSize: 15 }}
              >
                🗑
              </button>
            </div>
          );
        })}
      </div>

      {!adding ? (
        <BigButton wide tone="sky" onClick={() => { sfx.tap(); setAdding(true); }}>
          ➕ Thêm nhiệm vụ
        </BigButton>
      ) : (
        <AddTaskForm onClose={() => setAdding(false)} />
      )}
    </Panel>
  );
}

function AddTaskForm({ onClose }: { onClose: () => void }) {
  const addTask = useGame((s) => s.addTask);
  const [tab, setTab] = useState<'mau' | 'tu'>('mau');
  const [justAdded, setJustAdded] = useState<string | null>(null);

  // form "tự tạo"
  const [emoji, setEmoji] = useState('⭐');
  const [title, setTitle] = useState('');
  const [xu, setXu] = useState(10);

  const flash = (label: string) => {
    setJustAdded(label);
    window.setTimeout(() => setJustAdded((v) => (v === label ? null : v)), 1200);
  };

  return (
    <div style={{ background: 'var(--bg-sunk)', borderRadius: 14, padding: 12, marginTop: 4 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['mau', 'tu'] as const).map((k) => (
          <button
            key={k}
            onClick={() => { sfx.tap(); setTab(k); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 11,
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              background: tab === k ? 'var(--sage)' : 'var(--bg-panel)',
              color: tab === k ? 'var(--ink)' : 'var(--text)',
              boxShadow: tab === k ? '0 0 0 2px var(--sage-dark)' : 'none',
            }}
          >
            {k === 'mau' ? 'Chọn từ mẫu' : 'Tự tạo'}
          </button>
        ))}
        <button onClick={() => { sfx.tap(); onClose(); }} aria-label="Đóng" style={{ padding: '8px 12px', borderRadius: 11, background: 'var(--bg-panel)', color: 'var(--text)', fontWeight: 700 }}>
          Xong
        </button>
      </div>

      {tab === 'mau' ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {TASK_TEMPLATES.map((g) => (
            <div key={g.group}>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14, marginBottom: 6, color: 'var(--text-soft)' }}>{g.group}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {g.items.map((it) => {
                  const key = g.group + it.title;
                  const added = justAdded === key;
                  return (
                    <button
                      key={it.title}
                      onClick={() => { sfx.coin(); addTask(it.title, it.emoji, it.xu); flash(key); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        borderRadius: 999,
                        background: added ? 'var(--sage)' : 'var(--bg-panel)',
                        color: added ? 'var(--ink)' : 'var(--text)',
                        border: '2px solid rgba(74,59,50,0.10)',
                        fontWeight: 600,
                        fontSize: 14,
                        boxShadow: 'var(--shadow-soft)',
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{it.emoji}</span>
                      {it.title}
                      <span style={{ color: 'var(--peach-dark, #C67C43)', fontWeight: 800 }}>{added ? '✓' : `+${it.xu}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Chọn biểu tượng</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {TASK_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => { sfx.tap(); setEmoji(e); }}
                style={{ width: 42, height: 42, borderRadius: 11, fontSize: 22, background: emoji === e ? 'var(--sage)' : 'var(--bg-panel)', boxShadow: emoji === e ? '0 0 0 2px var(--sage-dark)' : 'var(--shadow-soft)' }}
              >
                {e}
              </button>
            ))}
          </div>

          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Tên nhiệm vụ</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={40}
            placeholder="VD: Tự gấp chăn màn"
            style={{ width: '100%', fontSize: 16, fontFamily: 'var(--font-body)', padding: '10px 12px', borderRadius: 11, border: '3px solid rgba(74,59,50,0.16)', background: 'var(--paper)', color: 'var(--text)', marginBottom: 12 }}
          />

          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Thưởng xu</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {XU_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => { sfx.tap(); setXu(n); }}
                style={{ flex: 1, padding: '9px 0', borderRadius: 11, fontWeight: 700, fontFamily: 'var(--font-display)', background: xu === n ? 'var(--sage)' : 'var(--bg-panel)', color: xu === n ? 'var(--ink)' : 'var(--text)', boxShadow: xu === n ? '0 0 0 2px var(--sage-dark)' : 'var(--shadow-soft)' }}
              >
                {n} xu
              </button>
            ))}
          </div>

          <BigButton
            wide
            tone="peach"
            disabled={!title.trim()}
            onClick={() => { sfx.coin(); addTask(title, emoji, xu); setTitle(''); flash('custom'); }}
          >
            {justAdded === 'custom' ? '✓ Đã thêm!' : '➕ Thêm nhiệm vụ này'}
          </BigButton>
        </div>
      )}
    </div>
  );
}
