/**
 * Decorate.tsx — Trang trí tiệm (S12). Ba phòng (ROOMS); mỗi phòng là một khung
 * phủ ShopScene làm nền. Đồ trong KHO được GỘP theo id kèm số lượng — KÉO thả vào
 * phòng (hoặc CHẠM để đặt vào giữa) → placeFromInventory. Món đã đặt kéo tự do
 * (movePlaced); chạm chọn → nút ✕ trả về kho (removePlaced). App KHÔNG tự sắp xếp
 * — đặt tự do trên 3 phòng (nguyên tắc 5).
 *
 * Toạ độ %: quy đổi px→% qua getBoundingClientRect của khung, clamp 4..96.
 * Tôn trọng prefers-reduced-motion: tắt kéo & rung, GIỮ chạm-để-đặt (vẫn đặt được).
 */
import { useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { ROOMS, useGame, shopLevelFor, unlockedRoomsFor, roomUnlockLevel, type Placed } from '../game/store';
import { furnitureById, Furniture, type FurnitureDef } from '../assets/svg/Furniture';
import { ShopScene } from '../assets/svg/Scene';
import { BigButton, IconButton } from '../ui/kit';
import { sfx } from '../ui/sfx';

const clamp = (v: number) => Math.max(4, Math.min(96, v));

export function Decorate() {
  const goto = useGame((s) => s.goto);
  const placed = useGame((s) => s.placed);
  const inventory = useGame((s) => s.inventory);
  const placeFromInventory = useGame((s) => s.placeFromInventory);
  const movePlaced = useGame((s) => s.movePlaced);
  const removePlaced = useGame((s) => s.removePlaced);
  const evening = useGame((s) => s.settings.theme === 'dark');
  const khach = useGame((s) => s.counters.khach);
  const reduce = !!useReducedMotion();

  // Phòng MỞ KHOÁ theo cấp tiệm (lộ trình lớn lên) — phòng chưa mở hiện 🔒.
  const unlockedRooms = useMemo(() => new Set(unlockedRoomsFor(shopLevelFor(khach))), [khach]);

  const frameRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);

  const roomPlaced = placed.filter((p) => p.room === room);

  // KHO gộp theo id (giữ thứ tự xuất hiện) + số lượng.
  const groups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const id of inventory) counts.set(id, (counts.get(id) ?? 0) + 1);
    const out: { id: string; count: number; def: FurnitureDef }[] = [];
    counts.forEach((count, id) => {
      const def = furnitureById(id);
      if (def) out.push({ id, count, def });
    });
    return out;
  }, [inventory]);

  function frameRect(): DOMRect | null {
    const r = frameRef.current?.getBoundingClientRect();
    return r && r.width > 0 && r.height > 0 ? r : null;
  }

  // di chuyển món đã đặt theo offset(px) của lần kéo → %.
  function commitMove(key: number, curX: number, curY: number, offX: number, offY: number) {
    const r = frameRect();
    if (!r) return;
    movePlaced(key, clamp(curX + (offX / r.width) * 100), clamp(curY + (offY / r.height) * 100));
  }

  // thả ô kho tại điểm (viewport) → nếu trong khung thì đặt vào phòng hiện tại.
  function dropFromInventory(id: string, px: number, py: number) {
    const r = frameRect();
    if (!r) return;
    const x = ((px - r.left) / r.width) * 100;
    const y = ((py - r.top) / r.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return; // thả ngoài khung → bỏ qua
    placeFromInventory(id, room, clamp(x), clamp(y));
    sfx.pop();
  }

  // chạm ô kho → đặt vào giữa phòng hiện tại (fallback + a11y, hoạt động cả khi reduce).
  function tapPlace(id: string) {
    placeFromInventory(id, room, 50, 50);
    sfx.pop();
  }

  return (
    <div style={{ padding: '8px 16px 16px', maxWidth: 1040, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <IconButton label="Quay lại" onClick={() => goto('hub')}>
          ←
        </IconButton>
        <h1 style={{ fontSize: 22, color: 'var(--text)' }}>Trang trí</h1>
        <div style={{ marginLeft: 'auto' }}>
          <BigButton tone="butter" onClick={() => goto('shop')}>
            Mua thêm
          </BigButton>
        </div>
      </header>

      {/* TAB PHÒNG */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {ROOMS.map((r) => {
          const active = r.id === room;
          const locked = !unlockedRooms.has(r.id);
          const n = placed.filter((p) => p.room === r.id).length;
          return (
            <button
              key={r.id}
              disabled={locked}
              onClick={() => {
                if (locked) return; // phòng chưa mở khoá theo cấp tiệm
                sfx.tap();
                setRoom(r.id);
                setSelected(null);
              }}
              aria-pressed={active}
              title={locked ? `Mở ở Cấp ${roomUnlockLevel(r.id)}` : r.name}
              style={{
                minHeight: 44,
                padding: '10px 18px',
                borderRadius: 999,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16,
                color: active ? 'var(--ink)' : 'var(--text)',
                background: active ? 'var(--sage)' : 'var(--bg-panel)',
                border: active ? '3px solid var(--sage-dark)' : '3px solid transparent',
                boxShadow: active ? 'var(--shadow)' : 'var(--shadow-soft)',
                opacity: locked ? 0.55 : 1,
                cursor: locked ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {locked && <span aria-hidden>🔒</span>}
              {r.name}
              {locked ? (
                <span
                  style={{
                    height: 22,
                    padding: '0 8px',
                    borderRadius: 999,
                    background: 'var(--peach)',
                    color: 'var(--ink)',
                    fontSize: 12,
                    fontWeight: 800,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  Cấp {roomUnlockLevel(r.id)}
                </span>
              ) : (
                n > 0 && (
                  <span
                    className="tnum"
                    style={{
                      minWidth: 22,
                      height: 22,
                      padding: '0 6px',
                      borderRadius: 999,
                      background: active ? 'var(--ink)' : 'var(--bg-sunk)',
                      color: active ? 'var(--paper)' : 'var(--text-soft)',
                      fontSize: 13,
                      fontWeight: 800,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {n}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>

      {/* KHUNG PHÒNG */}
      <div
        ref={frameRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1000 / 640', // đúng tỉ lệ cảnh → KHÔNG bị cắt, phòng to hết cỡ
          maxHeight: '64vh',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow)',
        }}
      >
        {/* nền phòng — đổi theo phòng; chạm vùng trống để bỏ chọn */}
        <div style={{ position: 'absolute', inset: 0 }} onPointerDown={() => setSelected(null)}>
          <ShopScene evening={evening} variant={room} />
        </div>

        {roomPlaced.map((p) => {
          const def = furnitureById(p.id);
          if (!def) return null;
          return (
            <PlacedItem
              key={p.key}
              rec={p}
              def={def}
              reduce={reduce}
              selected={selected === p.key}
              onSelect={() => setSelected(p.key)}
              onDragCommit={(offX, offY) => commitMove(p.key, p.x, p.y, offX, offY)}
              onRemove={() => {
                sfx.pop();
                removePlaced(p.key);
                setSelected(null);
              }}
            />
          );
        })}

        {roomPlaced.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              pointerEvents: 'none',
              padding: 24,
            }}
          >
            <div
              style={{
                background: 'var(--paper)',
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: 16,
                lineHeight: 1.4,
                padding: '12px 20px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-soft)',
                textAlign: 'center',
                maxWidth: 360,
              }}
            >
              {groups.length > 0
                ? 'Kéo đồ từ Kho thả vào phòng, hoặc chạm món trong Kho để đặt vào giữa.'
                : 'Phòng còn trống — mua đồ ở Cửa hàng rồi trang trí nhé!'}
            </div>
          </div>
        )}
      </div>

      {/* KHO — panel nổi bật để dễ nhận biết */}
      <section style={{ marginTop: 10, background: 'var(--bg-panel)', border: '3px solid var(--wood)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', padding: '8px 10px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 18, color: 'var(--text)' }}>🧰 Kho đồ</h2>
          <span className="tnum" style={{ background: 'var(--peach)', color: 'var(--ink)', borderRadius: 999, padding: '2px 12px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            {inventory.length}
          </span>
          {groups.length > 0 && (
            <span style={{ color: 'var(--text-soft)', fontSize: 15, marginLeft: 'auto' }}>Kéo vào phòng · hoặc chạm để đặt vào giữa</span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: 8,
            background: 'var(--bg-sunk)',
            borderRadius: 'var(--radius-sm)',
            minHeight: 86,
            alignItems: 'center',
          }}
        >
          {groups.length === 0 ? (
            <div style={{ color: 'var(--text-soft)', fontSize: 15, fontWeight: 600, padding: '0 8px' }}>
              Mua đồ ở Cửa hàng rồi kéo vào phòng nhé!
            </div>
          ) : (
            groups.map((g) => (
              <InventoryTile
                key={g.id}
                def={g.def}
                count={g.count}
                reduce={reduce}
                onDropAt={(px, py) => dropFromInventory(g.id, px, py)}
                onTap={() => tapPlace(g.id)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

/** Một món đã đặt — kéo để di chuyển, chạm để chọn, ✕ để trả về kho. */
function PlacedItem({
  rec,
  def,
  reduce,
  selected,
  onSelect,
  onDragCommit,
  onRemove,
}: {
  rec: Placed;
  def: FurnitureDef;
  reduce: boolean;
  selected: boolean;
  onSelect: () => void;
  onDragCommit: (offX: number, offY: number) => void;
  onRemove: () => void;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${rec.x}%`,
        top: `${rec.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: selected ? 50 : 10,
      }}
    >
      <motion.div
        drag={!reduce}
        dragMomentum={false}
        dragElastic={0}
        whileDrag={reduce ? undefined : { scale: 1.06, zIndex: 60 }}
        onPointerDown={onSelect}
        onDragStart={() => sfx.paper()}
        onDragEnd={(_, info) => {
          onDragCommit(info.offset.x, info.offset.y);
          mx.set(0);
          my.set(0);
        }}
        style={{
          x: mx,
          y: my,
          position: 'relative',
          cursor: reduce ? 'pointer' : 'grab',
          touchAction: 'none',
          outline: selected ? '3px dashed var(--rose-dark)' : 'none',
          outlineOffset: 4,
          borderRadius: 8,
        }}
      >
        <Furniture def={def} width={def.w} />
        {selected && (
          <button
            aria-label={`Bỏ ${def.label} về kho`}
            title="Bỏ về kho"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onRemove}
            style={{
              position: 'absolute',
              top: -14,
              right: -14,
              width: 40,
              height: 40,
              borderRadius: 999,
              background: 'var(--rose)',
              color: 'var(--ink)',
              border: '2px solid var(--paper)',
              boxShadow: 'var(--shadow-soft)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        )}
      </motion.div>
    </div>
  );
}

/** Một ô trong KHO — kéo thả vào phòng, hoặc chạm để đặt vào giữa phòng hiện tại. */
function InventoryTile({
  def,
  count,
  reduce,
  onDropAt,
  onTap,
}: {
  def: FurnitureDef;
  count: number;
  reduce: boolean;
  onDropAt: (px: number, py: number) => void;
  onTap: () => void;
}) {
  return (
    <motion.button
      drag={reduce ? false : true}
      dragSnapToOrigin
      whileDrag={reduce ? undefined : { scale: 1.12, zIndex: 80, boxShadow: 'var(--shadow-lift)' }}
      whileHover={reduce ? undefined : { y: -3 }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      onDragStart={() => sfx.paper()}
      onDragEnd={(_, info) => onDropAt(info.point.x, info.point.y)}
      onClick={onTap}
      style={{
        position: 'relative',
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        minWidth: 76,
        minHeight: 92,
        padding: '6px 6px 4px',
        background: 'var(--paper)',
        border: '2px solid rgba(74,59,50,0.12)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-soft)',
        cursor: reduce ? 'pointer' : 'grab',
        touchAction: 'none',
      }}
    >
      <Furniture def={def} width={52} />
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--text)',
          fontFamily: 'var(--font-display)',
          whiteSpace: 'nowrap',
        }}
      >
        {def.label}
      </span>
      <span
        className="tnum"
        aria-label={`số lượng ${count}`}
        style={{
          position: 'absolute',
          top: 3,
          right: 3,
          minWidth: 22,
          height: 22,
          padding: '0 6px',
          borderRadius: 999,
          background: 'var(--peach)',
          color: 'var(--ink)',
          fontSize: 14,
          fontWeight: 800,
          display: 'grid',
          placeItems: 'center',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        ×{count}
      </span>
    </motion.button>
  );
}
