/** Quản lý MÃ PIN RIÊNG của bé đang chọn (Khu phụ huynh). Không bắt buộc; đặt thì
 * bé phải nhập mới vào chơi được. Bố mẹ đổi/xoá bất cứ lúc nào. Áp cho bé đang active
 * (đổi bé ở ChildSwitcher phía trên). */
import { useState } from 'react';
import { useGame } from '../game/store';
import { Panel, BigButton } from '../ui/kit';
import { PinPad } from '../ui/PinPad';
import { sfx } from '../ui/sfx';

export function ChildPinPanel() {
  const childPin = useGame((s) => s.childPin);
  const shopName = useGame((s) => s.shopName);
  const setChildPin = useGame((s) => s.setChildPin);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const onComplete = (code: string) => {
    setChildPin(code);
    setEditing(false);
    setSaved(true);
    sfx.coin();
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <Panel style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 4 }}>🔒 Khoá vào chơi của bé</h3>
      <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 12 }}>
        Đặt mã PIN riêng cho <b style={{ color: 'var(--text)' }}>{shopName}</b> để chỉ bé vào được hồ sơ này. Không bắt buộc.
      </p>

      {!editing ? (
        <>
          <p style={{ fontWeight: 600, marginBottom: 12, color: childPin ? 'var(--sage-dark)' : 'var(--text-soft)' }}>
            {childPin ? 'Đang khoá bằng mã ●●●●' : 'Chưa đặt mã — bé vào thẳng.'}
            {saved && <span style={{ color: 'var(--sage-dark)' }}> · Đã lưu!</span>}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <BigButton tone="peach" onClick={() => { sfx.tap(); setEditing(true); }}>
              {childPin ? '✏️ Đổi mã' : '➕ Đặt mã cho bé'}
            </BigButton>
            {childPin && (
              <BigButton tone="rose" onClick={() => { sfx.tap(); setChildPin(null); }}>
                Xoá mã
              </BigButton>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: 14 }}>Nhập 4 số làm mã của bé</p>
          <PinPad onComplete={onComplete} />
          <button onClick={() => { sfx.tap(); setEditing(false); }} style={{ marginTop: 14, color: 'var(--text-soft)', fontWeight: 600, textDecoration: 'underline' }}>
            Huỷ
          </button>
        </div>
      )}
    </Panel>
  );
}
