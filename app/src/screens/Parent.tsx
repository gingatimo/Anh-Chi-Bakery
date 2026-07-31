/** S13 + S14 — Cổng phụ huynh (thiết kế mục 8, 9.7). Mở bằng PIN 4 số. Chứa báo
 * cáo gọn, cài đặt độ dài phiên & nghỉ mắt, âm thanh/giao diện, xuất/xoá dữ liệu.
 * Trẻ không bao giờ thấy màn tiền thật — mọi thứ nhạy cảm nằm sau PIN. */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../game/store';
import { SESSION_LABEL, type SessionPreset } from '../game/days';
import { STICKERS } from '../assets/svg/Sticker';
import { BigButton, IconButton, Panel } from '../ui/kit';
import { MapChar } from '../ui/MapChar';
import { sfx } from '../ui/sfx';
import { AccountSection } from './AccountSection';
import { TaskManager } from './TaskManager';
import { ChildSwitcher } from './ChildSwitcher';
import { ChildPinPanel } from './ChildPinPanel';
import { ParentPinPanel } from './ParentPinPanel';
import { PinRecover } from './PinRecover';
import { useSession } from '../cloud/auth';
import { deleteChild } from '../cloud/sync';

const REST_OPTIONS = [20, 30, 45];
const SESSIONS: SessionPreset[] = ['ngan', 'vua', 'dai'];

function PinGate({
  pin,
  onUnlock,
  onSet,
  onForgot,
  onBack,
}: {
  pin: string | null;
  onUnlock: () => void;
  onSet: (pin: string) => void;
  onForgot: () => void;
  onBack: () => void;
}) {
  const settingMode = pin == null;
  const [entry, setEntry] = useState('');
  const [err, setErr] = useState(false);

  function submit(v: string) {
    if (settingMode) {
      sfx.pop();
      onSet(v);
    } else if (v === pin) {
      sfx.pop();
      onUnlock();
    } else {
      sfx.soft();
      setErr(true);
      setEntry('');
      setTimeout(() => setErr(false), 500);
    }
  }
  function push(d: string) {
    if (entry.length >= 4) return;
    sfx.tap();
    const next = entry + d;
    setEntry(next);
    if (next.length === 4) setTimeout(() => submit(next), 140);
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', top: 14, left: 14 }}>
        <IconButton label="Quay lại" onClick={onBack}>←</IconButton>
      </div>
      <motion.div animate={err ? { x: [0, -10, 10, -6, 6, 0] } : {}} style={{ textAlign: 'center', maxWidth: 360, width: '100%' }}>
        <MapChar mood="idle" width={96} />
        <h2 style={{ fontSize: 24, margin: '6px 0 4px' }}>Khu phụ huynh</h2>
        <p style={{ color: 'var(--text-soft)', marginBottom: 20 }}>
          {settingMode ? 'Đặt mã PIN 4 số (nhớ giúp bé nhé)' : 'Nhập mã PIN 4 số'}
        </p>

        {/* 4 ô PIN */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 22 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 44,
                height: 52,
                borderRadius: 12,
                background: 'var(--bg-panel)',
                boxShadow: 'var(--shadow-soft)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 26,
                fontWeight: 700,
                color: 'var(--text)',
              }}
            >
              {entry[i] ? '●' : ''}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 10, justifyContent: 'center' }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
            k === '' ? (
              <div key={i} />
            ) : (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => (k === '⌫' ? (sfx.tap(), setEntry((e) => e.slice(0, -1))) : push(k))}
                style={{
                  height: 60,
                  borderRadius: 14,
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  background: 'var(--bg-panel)',
                  color: 'var(--text)',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                {k}
              </motion.button>
            )
          )}
        </div>

        {!settingMode && (
          <button
            onClick={() => { sfx.tap(); onForgot(); }}
            style={{ marginTop: 18, color: 'var(--text-soft)', fontWeight: 600, textDecoration: 'underline' }}
          >
            Quên mã PIN?
          </button>
        )}
      </motion.div>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ background: 'var(--bg-sunk)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
      <div className="tnum" style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        {value}
      </div>
      <div style={{ color: 'var(--text-soft)', fontSize: 14, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function OptionRow<T extends string | number>({
  value,
  options,
  labelOf,
  descOf,
  onPick,
}: {
  value: T;
  options: T[];
  labelOf: (o: T) => string;
  descOf?: (o: T) => string;
  onPick: (o: T) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={String(o)}
            onClick={() => {
              sfx.tap();
              onPick(o);
            }}
            style={{
              flex: '1 1 90px',
              padding: '10px 12px',
              borderRadius: 14,
              background: on ? 'var(--sage)' : 'var(--bg-sunk)',
              color: on ? 'var(--ink)' : 'var(--text)',
              boxShadow: on ? '0 0 0 3px var(--sage-dark)' : 'var(--shadow-soft)',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              textAlign: 'center',
              minHeight: 44,
            }}
          >
            {labelOf(o)}
            {descOf && <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.85 }}>{descOf(o)}</div>}
          </button>
        );
      })}
    </div>
  );
}

function ParentPanel() {
  const settings = useGame((s) => s.settings);
  const counters = useGame((s) => s.counters);
  const levels = useGame((s) => s.levels);
  const stickers = useGame((s) => s.stickers);
  const day = useGame((s) => s.day);
  const goto = useGame((s) => s.goto);
  const setSession = useGame((s) => s.setSession);
  const setRest = useGame((s) => s.setRest);
  const setSessionsPerDay = useGame((s) => s.setSessionsPerDay);
  const grantBonusSession = useGame((s) => s.grantBonusSession);
  const sessionsLeft = useGame((s) => s.sessionsLeft);
  const daily = useGame((s) => s.daily);
  const toggleSound = useGame((s) => s.toggleSound);
  const toggleTheme = useGame((s) => s.toggleTheme);
  const resetAll = useGame((s) => s.resetAll);
  const childId = useGame((s) => s.childId);
  const shopName = useGame((s) => s.shopName);
  const { session } = useSession();

  function exportJson() {
    sfx.tap();
    const data = localStorage.getItem('anhchi-save') ?? '{}';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tiem-banh-anh-chi.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="scroll" style={{ minHeight: '100dvh', maxHeight: '100dvh', padding: '14px 16px 40px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <IconButton label="Về màn chọn bé" onClick={() => goto('home')}>←</IconButton>
          <h1 style={{ fontSize: 24 }}>Khu phụ huynh</h1>
        </div>

        {/* Chọn/đổi hồ sơ bé (nhiều con) — báo cáo & nhiệm vụ bên dưới theo bé đang chọn */}
        <ChildSwitcher />

        {/* Mã PIN riêng của bé đang chọn (tùy chọn) */}
        <ChildPinPanel />

        {/* Báo cáo */}
        <Panel style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 4 }}>Tiến bộ của bé · <span style={{ color: 'var(--peach-dark, #C67C43)' }}>{shopName}</span></h3>
          <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 14 }}>Nói về tiến bộ của chính bé — không so sánh với bạn khác.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
            <Stat value={counters.days} label="ngày đã chơi" />
            <Stat value={counters.khach} label="khách phục vụ" />
            <Stat value={`${stickers.length}/${STICKERS.length}`} label="sticker đạt" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <Stat value={`${levels.A}/5`} label="Tiền tệ — đang học" />
            <Stat value={`${levels.B}/5`} label="Nhân chia — đang học" />
          </div>
          <p style={{ color: 'var(--text-soft)', fontSize: 13, marginTop: 12 }}>
            Báo cáo chi tiết (dạng bài hay sai, gợi ý đồng hành) sẽ có ở bản đầy đủ.
          </p>
        </Panel>

        {/* Nhiệm vụ hằng ngày — giao việc thật, duyệt để thưởng xu */}
        <TaskManager />

        {/* Cài đặt thời gian */}
        <Panel style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 4 }}>Thời gian chơi</h3>
          <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 14 }}>Bé chỉ thấy “số khách”, không thấy đồng hồ — không tạo áp lực thời gian.</p>

          <div style={{ fontWeight: 700, marginBottom: 8 }}>Số lượt chơi mỗi ngày</div>
          <OptionRow value={settings.sessionsPerDay} options={[1, 2, 3]} labelOf={(n) => `${n} lượt`} onPick={setSessionsPerDay} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', margin: '10px 0 2px' }}>
            <span style={{ color: 'var(--text-soft)', fontSize: 14 }}>Hôm nay còn {sessionsLeft()} lượt (đã chơi {daily.used}).</span>
            <button onClick={grantBonusSession} style={{ color: 'var(--sage-dark)', fontWeight: 700, textDecoration: 'underline' }}>
              + Tặng thêm 1 lượt
            </button>
          </div>
          <p style={{ color: 'var(--text-soft)', fontSize: 13, marginBottom: 18 }}>Tặng thêm lượt được ghi lại để bố mẹ tự thấy tần suất nhượng bộ (bản đầy đủ).</p>

          <div style={{ fontWeight: 700, marginBottom: 8 }}>Độ dài một buổi chơi</div>
          <OptionRow
            value={settings.session}
            options={SESSIONS}
            labelOf={(s) => SESSION_LABEL[s].name}
            descOf={(s) => SESSION_LABEL[s].desc}
            onPick={setSession}
          />

          <div style={{ fontWeight: 700, margin: '18px 0 8px' }}>Thời gian nghỉ mắt (20-20-20)</div>
          <OptionRow value={settings.restSeconds} options={REST_OPTIONS} labelOf={(n) => `${n} giây`} onPick={setRest} />
        </Panel>

        {/* Âm thanh & giao diện */}
        <Panel style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12 }}>Âm thanh & giao diện</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <BigButton wide tone={settings.sound ? 'sage' : 'rose'} onClick={toggleSound}>
              {settings.sound ? '🔊 Âm thanh: Bật' : '🔈 Âm thanh: Tắt'}
            </BigButton>
            <BigButton wide tone="sky" onClick={toggleTheme}>
              {settings.theme === 'light' ? '🌙 Nền: Sáng' : '☀️ Nền: Tối ấm'}
            </BigButton>
          </div>
        </Panel>

        {/* Mã PIN phụ huynh — đổi mã */}
        <ParentPinPanel />

        {/* Dữ liệu */}
        <Panel>
          <h3 style={{ marginBottom: 12 }}>Dữ liệu</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <BigButton tone="butter" onClick={exportJson}>⬇︎ Xuất dữ liệu (JSON)</BigButton>
            <BigButton
              tone="rose"
              onClick={async () => {
                if (!confirm(`Xoá TOÀN BỘ tiến trình (ngày ${day}, ${stickers.length} sticker) và chơi lại từ đầu?`)) return;
                if (session && childId) await deleteChild(childId, session.user.id); // xoá cả trên DB
                resetAll();
              }}
            >
              🗑 Xoá dữ liệu
            </BigButton>
          </div>
          <p style={{ color: 'var(--text-soft)', fontSize: 13, marginTop: 12 }}>Dữ liệu được lưu trên đám mây (Supabase) và đồng bộ đa thiết bị. Thanh toán nằm ở bản đầy đủ.</p>
        </Panel>

        {/* Tài khoản & sao lưu đám mây (Supabase) — đặt cuối cùng */}
        <AccountSection />
      </div>
    </div>
  );
}

export function Parent() {
  const pin = useGame((s) => s.settings.parentPin);
  const setParentPin = useGame((s) => s.setParentPin);
  const goto = useGame((s) => s.goto);
  const [unlocked, setUnlocked] = useState(false);
  const [recovering, setRecovering] = useState(false);

  if (recovering) {
    return <PinRecover onDone={() => { setRecovering(false); setUnlocked(true); }} onCancel={() => setRecovering(false)} />;
  }
  if (!unlocked) {
    return (
      <PinGate
        pin={pin}
        onUnlock={() => setUnlocked(true)}
        onSet={(p) => {
          setParentPin(p);
          setUnlocked(true);
        }}
        onForgot={() => setRecovering(true)}
        onBack={() => goto('home')}
      />
    );
  }
  return <ParentPanel />;
}
