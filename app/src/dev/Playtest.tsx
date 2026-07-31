/** Playtest — dev harness chạy thẳng vòng phục vụ (Serve/Lunch/Summary) để kiểm
 * tra các màn câu hỏi mà không cần book/shop/decorate. Mở bằng #playtest. */
import { useEffect } from 'react';
import { useGame } from '../game/store';
import { Serve } from '../screens/Serve';
import { Lunch } from '../screens/Lunch';
import { Summary } from '../screens/Summary';

export function Playtest() {
  const phase = useGame((s) => s.phase);

  useEffect(() => {
    useGame.setState({ started: true, shopName: 'Tiệm Test', day: 2, xu: 40, phase: 'hub', stickers: [], placed: [] });
    useGame.getState().openShop();
  }, []);

  return (
    <div style={{ minHeight: '100dvh' }}>
      <div style={{ padding: '8px 16px', color: 'var(--text-soft)', fontSize: 14 }}>DEV playtest · phase: {phase}</div>
      {phase === 'serve' && <Serve />}
      {phase === 'lunch' && <Lunch />}
      {phase === 'summary' && <Summary />}
      {phase === 'hub' && <div style={{ padding: 20 }}>Đang khởi tạo…</div>}
    </div>
  );
}
