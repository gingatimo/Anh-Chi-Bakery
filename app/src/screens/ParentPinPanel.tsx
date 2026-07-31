/** Đổi mã PIN PHỤ HUYNH (trong Khu phụ huynh — đã mở khoá nên chỉ cần nhập mã mới). */
import { useState } from 'react';
import { useGame } from '../game/store';
import { Panel, BigButton } from '../ui/kit';
import { PinPad } from '../ui/PinPad';
import { sfx } from '../ui/sfx';

export function ParentPinPanel() {
  const setParentPin = useGame((s) => s.setParentPin);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const onComplete = (code: string) => {
    setParentPin(code);
    setEditing(false);
    setSaved(true);
    sfx.coin();
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <Panel style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 4 }}>🔑 Mã PIN phụ huynh</h3>
      <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 14 }}>
        Mã 4 số để mở Khu phụ huynh này. Đổi bất cứ lúc nào.
      </p>
      {!editing ? (
        <BigButton tone="peach" onClick={() => { sfx.tap(); setEditing(true); }}>
          ✏️ Đổi mã PIN{saved && ' · Đã lưu!'}
        </BigButton>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: 14 }}>Nhập mã PIN mới (4 số)</p>
          <PinPad onComplete={onComplete} />
          <button onClick={() => { sfx.tap(); setEditing(false); }} style={{ marginTop: 14, color: 'var(--text-soft)', fontWeight: 600, textDecoration: 'underline' }}>
            Huỷ
          </button>
        </div>
      )}
    </Panel>
  );
}
