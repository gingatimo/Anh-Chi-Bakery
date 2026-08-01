/** Game.tsx — router điều hướng cấp cao (DB-first, đa con):
 *   chưa đăng nhập → ParentAuth; đã đăng nhập → Home (board chọn bé) trừ khi đang
 *   trong game của một bé hoặc Khu phụ huynh. Bé có PIN riêng → ChildLock trước khi vào.
 *   Không cấu hình Supabase (dev) → local-first 1 bé, bỏ qua board. */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from './game/store';
import { supabaseConfigured } from './cloud/supabase';
import { useSession } from './cloud/auth';
import { pullChild } from './cloud/sync';
import { getLastChild, clearLastChild } from './cloud/lastChild';
import { ParentAuth, CreateChild } from './screens/Welcome';
import { Home } from './screens/Home';
import { ChildLock } from './screens/ChildLock';
import { Hub } from './screens/Hub';
import { Serve } from './screens/Serve';
import { Lunch } from './screens/Lunch';
import { Activity } from './screens/Activity';
import { Summary } from './screens/Summary';
import { Reveal } from './screens/Reveal';
import { StickerBook } from './screens/StickerBook';
import { Shop } from './screens/Shop';
import { Decorate } from './screens/Decorate';
import { Tasks } from './screens/Tasks';
import { Parent } from './screens/Parent';
import { ParentAccessButton } from './ui/ParentAccessButton';

const GAME_PHASES = ['hub', 'serve', 'lunch', 'activity', 'summary', 'reveal', 'book', 'shop', 'decorate', 'tasks'];

export function Game() {
  const started = useGame((s) => s.started);
  const phase = useGame((s) => s.phase);
  const childPin = useGame((s) => s.childPin);
  const childUnlocked = useGame((s) => s.childUnlocked);
  const { session, ready } = useSession();
  const [resuming, setResuming] = useState(false);
  const resumeTried = useRef(false);

  // Prod: reload → TỰ nạp lại BÉ GẦN NHẤT từ DB, vào thẳng màn đang chơi (con trỏ
  // lastChild). Bé có PIN → ChildLock (có nút ← về board). Bé bị xoá/lỗi → về board.
  useEffect(() => {
    if (!supabaseConfigured || !ready || !session || started || resumeTried.current) return;
    if (!getLastChild()) return;
    resumeTried.current = true;
    setResuming(true);
    pullChild(getLastChild()!, session.user.id, { resume: true })
      .then((r) => { if (r === 'missing') clearLastChild(); }) // lỗi mạng → GIỮ con trỏ, thử lại lần sau
      .finally(() => setResuming(false));
  }, [ready, session, started]);

  const view = (() => {
    const gamePhase = () => (childPin && !childUnlocked ? 'childlock' : phase);
    if (supabaseConfigured) {
      if (!ready) return 'loading';
      if (!session) return 'login';
      if (resuming && !started) return 'loading'; // đang tự nạp bé gần nhất
      if (phase === 'parent') return 'parent';
      if (GAME_PHASES.includes(phase)) return gamePhase();
      return 'home'; // 'home' / 'welcome' / mặc định → board chọn bé
    }
    // Dev local-first (không Supabase): 1 bé cục bộ, không có board
    if (!started) return 'create';
    if (phase === 'parent') return 'parent';
    if (GAME_PHASES.includes(phase)) return gamePhase();
    return 'hub';
  })();

  const screen = (() => {
    switch (view) {
      case 'loading':
        return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', color: 'var(--text-soft)' }}>Đang tải…</div>;
      case 'login':
        return <ParentAuth />;
      case 'create':
        return <CreateChild session={null} />;
      case 'home':
        return <Home />;
      case 'childlock':
        return <ChildLock />;
      case 'hub':
        return <Hub />;
      case 'serve':
        return <Serve />;
      case 'lunch':
        return <Lunch />;
      case 'activity':
        return <Activity />;
      case 'summary':
        return <Summary />;
      case 'reveal':
        return <Reveal />;
      case 'book':
        return <StickerBook />;
      case 'shop':
        return <Shop />;
      case 'decorate':
        return <Decorate />;
      case 'tasks':
        return <Tasks />;
      case 'parent':
        return <Parent />;
      default:
        return <Home />;
    }
  })();

  // Nút "Bố mẹ" nổi trên các màn bé đang CHƠI DỞ (không có lối ra sẵn) → ba mẹ luôn vào được.
  const showParentBtn = ['serve', 'lunch', 'activity', 'summary', 'reveal'].includes(view);

  return (
    <>
      {showParentBtn && <ParentAccessButton />}
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} style={{ minHeight: '100dvh' }}>
          {screen}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
