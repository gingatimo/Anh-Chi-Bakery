/** Màn nhập PIN RIÊNG của bé (khi hồ sơ bé có đặt mã). Đúng → vào chơi; ← quay về
 * Home để bé khác chọn. Quên mã → bố mẹ mở Khu phụ huynh đặt lại. */
import { useState } from 'react';
import { useGame } from '../game/store';
import { MapChar } from '../ui/MapChar';
import { IconButton } from '../ui/kit';
import { PinPad } from '../ui/PinPad';
import { sfx } from '../ui/sfx';

export function ChildLock() {
  const childPin = useGame((s) => s.childPin);
  const shopName = useGame((s) => s.shopName);
  const unlockChild = useGame((s) => s.unlockChild);
  const goto = useGame((s) => s.goto);
  const [shake, setShake] = useState(false);

  const submit = (code: string) => {
    if (code === childPin) {
      sfx.pop();
      unlockChild(); // Game router → Hub
    } else {
      sfx.soft();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', top: 14, left: 14 }}>
        <IconButton label="Về màn chọn bé" onClick={() => { sfx.tap(); goto('home'); }}>
          ←
        </IconButton>
      </div>
      <div style={{ textAlign: 'center', maxWidth: 360, width: '100%' }}>
        <MapChar mood="idle" width={100} />
        <h2 style={{ fontSize: 24, margin: '6px 0 4px' }}>{shopName}</h2>
        <p style={{ color: 'var(--text-soft)', marginBottom: 20 }}>Nhập mã của con để vào chơi nhé</p>
        <PinPad onComplete={submit} shake={shake} />
        <p style={{ color: 'var(--text-soft)', fontSize: 13, marginTop: 18 }}>
          Quên mã? Nhờ bố mẹ mở <b>Khu phụ huynh</b> để đặt lại.
        </p>
      </div>
    </div>
  );
}
