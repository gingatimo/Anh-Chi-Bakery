import { Suspense, lazy, useEffect, useState } from 'react';
import { PaperDefs } from './assets/svg/paper';
import { useGame } from './game/store';
import { setSound } from './ui/sfx';
import { initAutosave } from './cloud/autosave';
import { Gallery } from './dev/Gallery';
import { SelfCheck } from './dev/SelfCheck';
import { Playtest } from './dev/Playtest';

const Game = lazy(() => import('./Game').then((m) => ({ default: m.Game })));

function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const theme = useGame((s) => s.settings.theme);
  const sound = useGame((s) => s.settings.sound);

  // áp theme + âm thanh toàn app
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    setSound(sound);
  }, [sound]);

  // DB là nguồn chân lý: bật tự-lưu-lên-DB (một lần). Việc nạp bé từ DB nay do màn
  // Home làm khi bé chọn card (pullChild) — không auto-vào-bé lúc mở app nữa.
  useEffect(() => {
    initAutosave();
  }, []);

  return (
    <>
      <PaperDefs />
      <div className="grain-overlay" />
      {hash === '#gallery' ? (
        <Gallery />
      ) : hash === '#selfcheck' ? (
        <SelfCheck />
      ) : hash === '#playtest' ? (
        <Playtest />
      ) : (
        <Suspense fallback={<div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', color: 'var(--text-soft)' }}>Đang mở tiệm…</div>}>
          <Game />
        </Suspense>
      )}
    </>
  );
}
