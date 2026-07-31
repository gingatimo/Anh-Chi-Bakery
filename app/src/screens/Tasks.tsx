/** S15 — Nhiệm vụ hằng ngày của BÉ (việc thật ngoài đời). Bé xem nhiệm vụ ba mẹ
 * giao, tự "báo đã làm" (✋) → ba mẹ duyệt ở Khu phụ huynh → nhận xu. Ở đây bé chỉ
 * xem + báo; người lớn mới xác nhận việc thật đã hoàn thành. Reset theo gameDay(). */
import { motion, useReducedMotion } from 'framer-motion';
import { useGame, gameDay, type Task } from '../game/store';
import { MapChar } from '../ui/MapChar';
import { IconButton, XuBadge, SpeechBubble } from '../ui/kit';
import { sfx } from '../ui/sfx';

type Status = 'done' | 'pending' | 'todo';
function statusOf(t: Task, today: string): Status {
  if (t.lastDone === today) return 'done';
  if (t.raisedDay === today) return 'pending';
  return 'todo';
}

export function Tasks() {
  const tasks = useGame((s) => s.tasks);
  const xu = useGame((s) => s.xu);
  const goto = useGame((s) => s.goto);
  const childRaiseTask = useGame((s) => s.childRaiseTask);
  const reduce = !!useReducedMotion();
  const today = gameDay();

  const done = tasks.filter((t) => t.lastDone === today);
  const earnedToday = done.reduce((n, t) => n + t.xu, 0);
  const allDone = tasks.length > 0 && done.length === tasks.length;

  return (
    <div className="scroll" style={{ minHeight: '100dvh', maxHeight: '100dvh', padding: '16px 16px 40px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <IconButton label="Quay lại tiệm" onClick={() => goto('hub')}>
            ←
          </IconButton>
          <h1 style={{ fontSize: 26, flex: 1 }}>Nhiệm vụ hôm nay</h1>
          <XuBadge xu={xu} />
        </header>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0 16px' }}>
          <SpeechBubble tail="down">
            {tasks.length === 0
              ? 'Chưa có nhiệm vụ nào — nhờ ba mẹ giao cho con nhé!'
              : allDone
              ? 'Giỏi quá! Con làm hết nhiệm vụ rồi 🎉'
              : 'Làm xong việc nào thì bấm “Con làm xong” để ba mẹ duyệt nhé!'}
          </SpeechBubble>
        </div>

        {tasks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 12px', marginBottom: 14, color: 'var(--text-soft)', fontWeight: 600 }}>
            <span>
              Đã xong{' '}
              <strong style={{ color: 'var(--text)' }}>
                {done.length}/{tasks.length}
              </strong>
            </span>
            {earnedToday > 0 && <span style={{ color: 'var(--sage-dark)' }}>· Hôm nay được +{earnedToday} xu 🪙</span>}
          </div>
        )}

        <div style={{ display: 'grid', gap: 12 }}>
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              t={t}
              status={statusOf(t, today)}
              onRaise={() => {
                sfx.pop();
                childRaiseTask(t.id);
              }}
            />
          ))}
        </div>

        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <MapChar mood="idle" width={150} />
          </div>
        )}

        {allDone && (
          <motion.div
            initial={reduce ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center', marginTop: 18 }}
          >
            <MapChar mood="greet" width={150} />
            <p style={{ color: 'var(--sage-dark)', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 4 }}>
              Dùng xu mua đồ trang trí & sticker cho tiệm nào!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ t, status, onRaise }: { t: Task; status: Status; onRaise: () => void }) {
  const bg = status === 'done' ? 'var(--sage)' : status === 'pending' ? 'var(--butter)' : 'var(--bg-panel)';
  const ink = status === 'todo' ? 'var(--text)' : 'var(--ink)';
  const tag = status === 'done' ? '✅ Đã xong' : status === 'pending' ? '⏳ Chờ ba mẹ duyệt' : null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 18,
        background: bg,
        color: ink,
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <span style={{ fontSize: 34, lineHeight: 1 }}>{t.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 17 }}>{t.title}</div>
        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 2 }}>
          Thưởng {t.xu} xu{tag && ` · ${tag}`}
        </div>
      </div>
      {status === 'todo' && (
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onRaise}
          style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--peach)', color: 'var(--ink)', fontWeight: 700, fontFamily: 'var(--font-display)', boxShadow: 'var(--shadow-soft)', whiteSpace: 'nowrap' }}
        >
          Con làm xong ✋
        </motion.button>
      )}
      {status === 'pending' && (
        <button onClick={onRaise} title="Hủy báo" style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(74,59,50,0.14)', color: 'var(--ink)', fontWeight: 700, fontSize: 14 }}>
          Hủy
        </button>
      )}
      {status === 'done' && <span style={{ fontSize: 26 }}>🎉</span>}
    </div>
  );
}
