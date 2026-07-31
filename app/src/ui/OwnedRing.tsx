/** Vòng tròn sáng (vàng bơ) bao quanh vật bé ĐÃ SỞ HỮU — dùng ở Cửa hàng & Sổ sticker.
 * Vòng luôn TRÒN đều (aspectRatio:1) dù đồ vật rộng hay hẹp. `on=false` → chỉ bọc thường. */
import type { ReactNode } from 'react';

export function OwnedRing({ on, scale = 1.18, children }: { on: boolean; scale?: number; children: ReactNode }) {
  return (
    <div style={{ position: 'relative', display: 'inline-grid', placeItems: 'center' }}>
      {on && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            width: `${scale * 100}%`,
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            boxShadow: '0 0 0 3px rgba(242,206,133,0.9), 0 0 18px 5px rgba(242,206,133,0.7)',
            background: 'radial-gradient(closest-side, rgba(242,206,133,0.22), transparent)',
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </div>
  );
}
