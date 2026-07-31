/** Game.tsx — phase router của "ngày bán hàng". */
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from './game/store';
import { Welcome } from './screens/Welcome';
import { Hub } from './screens/Hub';
import { Serve } from './screens/Serve';
import { Lunch } from './screens/Lunch';
import { Summary } from './screens/Summary';
import { Reveal } from './screens/Reveal';
import { StickerBook } from './screens/StickerBook';
import { Shop } from './screens/Shop';
import { Decorate } from './screens/Decorate';
import { Parent } from './screens/Parent';

export function Game() {
  const started = useGame((s) => s.started);
  const phase = useGame((s) => s.phase);

  const view = !started ? 'welcome' : phase;

  const screen = (() => {
    switch (view) {
      case 'welcome':
        return <Welcome />;
      case 'hub':
        return <Hub />;
      case 'serve':
        return <Serve />;
      case 'lunch':
        return <Lunch />;
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
      case 'parent':
        return <Parent />;
      default:
        return <Hub />;
    }
  })();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        style={{ minHeight: '100dvh' }}
      >
        {screen}
      </motion.div>
    </AnimatePresence>
  );
}
