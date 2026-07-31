/**
 * StickerBook.tsx — Sổ sticker (S10). HAI TAB:
 *  • "Kỷ niệm": trang sổ cột mốc — vùng thả tự do (GIỮ NGUYÊN hành vi cũ: dán
 *    sticker đang chờ, kéo-đổi-chỗ + xoay sticker đã có, bóng mờ cột mốc chưa đạt).
 *  • "Bộ sưu tập": catalog 1000 sticker sưu tầm, lọc theo thể loại + phân trang
 *    24 ô/trang. Để "tải nổi" 1000, CHỈ render đúng 24 ô của trang hiện tại
 *    (lọc + cắt trang bằng useMemo, không map toàn bộ danh sách).
 * Toạ độ sticker cột mốc lưu theo % vùng trang; chữ dùng var(--text)/(--text-soft)
 * để hợp cả theme sáng lẫn tối, nền pastel thì dùng var(--ink).
 */
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { useGame, type OwnedSticker } from '../game/store';
import { STICKERS, Sticker, stickerById, type StickerDef } from '../assets/svg/Sticker';
import {
  catalog,
  CatalogStickerView,
  STICKER_CATEGORIES,
  CATALOG_SIZE,
  type CatalogSticker,
} from '../assets/svg/stickerGen';
import { IconButton, BigButton, Panel } from '../ui/kit';
import { sfx } from '../ui/sfx';

const clamp = (v: number) => Math.max(2, Math.min(92, v));
const PAGE_SIZE = 24; // số sticker sưu tầm mỗi trang

type TabKey = 'ky-niem' | 'suu-tap';

export function StickerBook() {
  const goto = useGame((s) => s.goto);
  const ownedCount = useGame((s) => s.stickers.length); // cột mốc đã dán vào sổ
  const collectedCount = useGame((s) => s.collected.length); // sưu tầm đã có
  const reduce = !!useReducedMotion();
  const [tab, setTab] = useState<TabKey>('ky-niem');

  return (
    <div style={{ padding: '20px 20px 40px', maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <IconButton label="Quay lại" onClick={() => goto('hub')}>
          ←
        </IconButton>
        <h1 style={{ fontSize: 28 }}>Sổ sticker của mình</h1>
      </header>

      <div role="tablist" aria-label="Chọn trang sổ" style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <TabButton active={tab === 'ky-niem'} reduce={reduce} onClick={() => setTab('ky-niem')}>
          Kỷ niệm ({ownedCount}/{STICKERS.length})
        </TabButton>
        <TabButton active={tab === 'suu-tap'} reduce={reduce} onClick={() => setTab('suu-tap')}>
          Bộ sưu tập ({collectedCount}/{CATALOG_SIZE})
        </TabButton>
      </div>

      {tab === 'ky-niem' ? <MemoriesTab reduce={reduce} /> : <CollectionTab reduce={reduce} />}
    </div>
  );
}

/** Nút chuyển tab — tab đang chọn nổi bật (nền var(--sage), chữ var(--ink)). */
function TabButton({
  active,
  reduce,
  onClick,
  children,
}: {
  active: boolean;
  reduce: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      role="tab"
      aria-selected={active}
      whileHover={reduce || active ? undefined : { y: -1 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      onClick={() => {
        sfx.tap();
        onClick();
      }}
      style={{
        flex: '1 1 0',
        minHeight: 48,
        padding: '10px 16px',
        borderRadius: 999,
        border: '3px solid rgba(74,59,50,0.14)',
        background: active ? 'var(--sage)' : 'var(--bg-panel)',
        color: active ? 'var(--ink)' : 'var(--text)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 16,
        boxShadow: active ? 'var(--shadow)' : 'var(--shadow-soft)',
        cursor: 'pointer',
      }}
    >
      {children}
    </motion.button>
  );
}

/* ══════════════════════ TAB 1 — KỶ NIỆM (giữ nguyên hành vi cũ) ══════════════════════ */

function MemoriesTab({ reduce }: { reduce: boolean }) {
  const stickers = useGame((s) => s.stickers);
  const pending = useGame((s) => s.pendingSticker);
  const placeSticker = useGame((s) => s.placeSticker);
  const moveSticker = useGame((s) => s.moveSticker);
  const pageRef = useRef<HTMLDivElement>(null);

  const owned = new Set(stickers.map((k) => k.id));
  const ghosts = STICKERS.filter((d) => !owned.has(d.id) && d.id !== pending);
  const pendingDef = pending ? stickerById(pending) : undefined;

  return (
    <>
      <p style={{ color: 'var(--text-soft)', fontSize: 16, margin: '0 0 14px 4px' }}>
        Kéo để sắp xếp, chạm ⟳ để xoay — sổ của con, con tự bày nhé.
      </p>

      <Panel style={{ background: 'var(--paper)' }}>
        <div
          ref={pageRef}
          style={{
            position: 'relative',
            minHeight: 'clamp(320px, 52vh, 560px)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--paper)',
            backgroundImage:
              'radial-gradient(rgba(74,59,50,0.05) 1.6px, transparent 1.7px)',
            backgroundSize: '26px 26px',
          }}
        >
          {stickers.map((rec) => {
            const def = stickerById(rec.id);
            if (!def) return null;
            return (
              <OwnedStickerItem
                key={rec.id}
                rec={rec}
                def={def}
                pageRef={pageRef}
                reduce={reduce}
                onMove={(x, y, rotation) => moveSticker(rec.id, x, y, rotation)}
              />
            );
          })}

          {pendingDef && (
            <PendingSticker
              def={pendingDef}
              pageRef={pageRef}
              reduce={reduce}
              onPlace={(x, y) => placeSticker(pendingDef.id, 0, x, y, 0)}
            />
          )}

          {stickers.length === 0 && !pendingDef && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                color: 'var(--text-soft)',
                fontWeight: 600,
                textAlign: 'center',
                padding: 24,
                pointerEvents: 'none',
              }}
            >
              Chưa có sticker nào — phục vụ khách để nhận sticker đầu tiên nhé!
            </div>
          )}
        </div>
      </Panel>

      {ghosts.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 21, marginBottom: 2 }}>Chưa mở khoá</h2>
          <p style={{ color: 'var(--text-soft)', fontSize: 16, marginBottom: 14 }}>
            Những ô trống đang chờ con quay lại.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {ghosts.map((d) => (
              <div key={d.id} style={{ width: 120, textAlign: 'center' }}>
                <Sticker def={d} width={92} ghost />
                <div style={{ fontSize: 14, color: 'var(--text-soft)', marginTop: 2, lineHeight: 1.3 }}>
                  {d.earn}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** Một sticker đã sở hữu — kéo để đổi chỗ, nút ⟳ để xoay +15°. */
function OwnedStickerItem({
  rec,
  def,
  pageRef,
  reduce,
  onMove,
}: {
  rec: OwnedSticker;
  def: StickerDef;
  pageRef: RefObject<HTMLDivElement | null>;
  reduce: boolean;
  onMove: (x: number, y: number, rotation: number) => void;
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
        zIndex: 10,
      }}
    >
      <motion.div
        drag={!reduce}
        dragMomentum={false}
        dragElastic={0}
        style={{ x: mx, y: my, position: 'relative', cursor: reduce ? 'default' : 'grab', touchAction: 'none' }}
        whileDrag={reduce ? undefined : { scale: 1.08, zIndex: 60 }}
        onDragStart={() => sfx.paper()}
        onDragEnd={(_, info) => {
          const r = pageRef.current?.getBoundingClientRect();
          if (r && r.width > 0 && r.height > 0) {
            onMove(
              clamp(rec.x + (info.offset.x / r.width) * 100),
              clamp(rec.y + (info.offset.y / r.height) * 100),
              rec.rotation
            );
          }
          mx.set(0);
          my.set(0);
        }}
      >
        <div style={{ transform: `rotate(${rec.rotation}deg)`, transformOrigin: 'center' }}>
          <Sticker def={def} width={96} />
        </div>
        <button
          aria-label={`Xoay ${def.label}`}
          title="Xoay"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            sfx.pop();
            onMove(rec.x, rec.y, (rec.rotation + 15) % 360);
          }}
          style={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 36,
            height: 36,
            borderRadius: 999,
            background: 'var(--bg-panel)',
            boxShadow: 'var(--shadow-soft)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 18,
          }}
        >
          ⟳
        </button>
      </motion.div>
    </div>
  );
}

/** Sticker vừa nhận, chờ dán. Nổi bật giữa trang, lấp lánh, kéo vào trang để dán. */
function PendingSticker({
  def,
  pageRef,
  reduce,
  onPlace,
}: {
  def: StickerDef;
  pageRef: RefObject<HTMLDivElement | null>;
  reduce: boolean;
  onPlace: (x: number, y: number) => void;
}) {
  useEffect(() => {
    sfx.sparkle();
  }, []);

  const stars: { top?: number; bottom?: number; left?: number; right?: number; d: number }[] = [
    { top: -6, left: -10, d: 0 },
    { top: -2, right: -14, d: 0.25 },
    { bottom: 6, right: -6, d: 0.5 },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '46%',
        transform: 'translate(-50%, -50%)',
        zIndex: 70,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div
        style={{
          background: 'var(--butter)',
          color: 'var(--ink)',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          padding: '6px 16px',
          borderRadius: 999,
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        Dán vào sổ nhé!
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: [1, 1.05, 1] }}
        transition={reduce ? { duration: 0.2 } : { scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }}
        drag={!reduce}
        dragSnapToOrigin
        dragMomentum={false}
        whileDrag={reduce ? undefined : { scale: 1.12, zIndex: 90 }}
        onDragStart={() => sfx.paper()}
        onDragEnd={(_, info) => {
          const r = pageRef.current?.getBoundingClientRect();
          if (!r || r.width === 0 || r.height === 0) return;
          const px = ((info.point.x - r.left) / r.width) * 100;
          const py = ((info.point.y - r.top) / r.height) * 100;
          if (px >= 0 && px <= 100 && py >= 0 && py <= 100) onPlace(clamp(px), clamp(py));
        }}
        onClick={reduce ? () => onPlace(50, 46) : undefined}
        style={{
          position: 'relative',
          cursor: reduce ? 'pointer' : 'grab',
          touchAction: 'none',
          filter: 'drop-shadow(0 6px 14px rgba(74,59,50,0.28))',
        }}
      >
        <Sticker def={def} width={112} />
        {stars.map((s, i) => (
          <motion.span
            key={i}
            aria-hidden
            animate={reduce ? { opacity: 0.7 } : { scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
            transition={reduce ? undefined : { duration: 1.4, repeat: Infinity, delay: s.d, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: s.top,
              bottom: s.bottom,
              left: s.left,
              right: s.right,
              width: 12,
              height: 12,
              color: 'var(--butter)',
              fontSize: 14,
              lineHeight: 1,
              textShadow: '0 0 6px rgba(242,206,133,0.9)',
            }}
          >
            ✦
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

/* ══════════════════════ TAB 2 — BỘ SƯU TẬP (catalog 1000) ══════════════════════ */

const STICKER_COST = 15; // xu để đổi 1 sticker sưu tầm bất ngờ

function CollectionTab({ reduce }: { reduce: boolean }) {
  const collected = useGame((s) => s.collected);
  const xu = useGame((s) => s.xu);
  const buyRandomSticker = useGame((s) => s.buyRandomSticker);
  const all = useMemo<CatalogSticker[]>(() => catalog(), []); // 1000 phần tử, dựng 1 lần
  const [catKey, setCatKey] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [buyMsg, setBuyMsg] = useState<string | null>(null);

  const openSurprise = () => {
    const id = buyRandomSticker(STICKER_COST);
    if (id === null) {
      sfx.tap();
      setBuyMsg(xu < STICKER_COST ? `Cần ${STICKER_COST} xu để mở — làm nhiệm vụ hoặc bán bánh nhé!` : 'Con đã sưu tầm đủ bộ rồi! 🎉');
      return;
    }
    sfx.sparkle();
    const s = all.find((x) => x.id === id);
    setBuyMsg(`Mở được ${s ? s.label : 'một sticker mới'}! 🎁`);
  };

  const collectedSet = useMemo(() => new Set(collected), [collected]);
  // Lọc theo thể loại (O(1000) tra Set — rẻ). Chưa cắt trang ở bước này.
  const filtered = useMemo<CatalogSticker[]>(
    () => (catKey ? all.filter((s) => s.catKey === catKey) : all),
    [all, catKey]
  );
  const doneInFilter = useMemo(
    () => filtered.reduce((n, s) => (collectedSet.has(s.id) ? n + 1 : n), 0),
    [filtered, collectedSet]
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // CHỈ 24 phần tử của trang hiện tại được đưa ra render.
  const pageItems = useMemo<CatalogSticker[]>(
    () => filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [filtered, page]
  );

  const selectCat = (key: string | null) => {
    if (key === catKey) return;
    sfx.tap();
    setCatKey(key);
    setPage(0); // đổi bộ lọc → về trang 1
  };
  const go = (delta: number) => setPage((p) => Math.min(pageCount - 1, Math.max(0, p + delta)));

  return (
    <Panel>
      {/* Hàng lọc thể loại */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        <FilterChip active={catKey === null} reduce={reduce} onClick={() => selectCat(null)}>
          Tất cả
        </FilterChip>
        {STICKER_CATEGORIES.map((c) => (
          <FilterChip key={c.key} active={catKey === c.key} reduce={reduce} onClick={() => selectCat(c.key)}>
            {c.name}
          </FilterChip>
        ))}
      </div>

      {/* Dòng tiến độ */}
      <p style={{ color: 'var(--text-soft)', fontSize: 16, fontWeight: 600, margin: '0 0 12px' }}>
        Đã sưu tầm: <strong style={{ color: 'var(--text)' }}>{doneInFilter}</strong>/{filtered.length}
      </p>

      {/* Đổi xu lấy sticker bất ngờ (tiêu xu kiếm từ nhiệm vụ / bán bánh) */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <BigButton tone="butter" onClick={openSurprise}>
          🎁 Mở sticker mới ({STICKER_COST} xu)
        </BigButton>
        <span className="tnum" style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Đang có {xu} xu</span>
        {buyMsg && <span style={{ color: 'var(--sage-dark)', fontWeight: 700 }}>{buyMsg}</span>}
      </div>

      {/* Lưới sticker — CHỈ render 24 ô của trang hiện tại */}
      <motion.div
        key={`${catKey ?? 'all'}-${page}`}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: 14,
          justifyItems: 'center',
        }}
      >
        {pageItems.map((s) => (
          <CatalogStickerView key={s.id} s={s} width={92} ghost={!collectedSet.has(s.id)} />
        ))}
      </motion.div>

      {/* Điều hướng trang */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 22 }}>
        <BigButton tone="sage" onClick={() => go(-1)} disabled={page <= 0}>
          ‹ Trước
        </BigButton>
        <span
          className="tnum"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--text)',
            minWidth: 96,
            textAlign: 'center',
          }}
        >
          Trang {page + 1}/{pageCount}
        </span>
        <BigButton tone="sage" onClick={() => go(1)} disabled={page >= pageCount - 1}>
          Sau ›
        </BigButton>
      </div>
    </Panel>
  );
}

/** Nút lọc thể loại — đang chọn thì nổi bật (nền var(--sage), chữ var(--ink)). */
function FilterChip({
  active,
  reduce,
  onClick,
  children,
}: {
  active: boolean;
  reduce: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      aria-pressed={active}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      onClick={onClick}
      style={{
        minHeight: 40,
        padding: '8px 16px',
        borderRadius: 999,
        border: '2px solid rgba(74,59,50,0.12)',
        background: active ? 'var(--sage)' : 'var(--bg-panel)',
        color: active ? 'var(--ink)' : 'var(--text)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 15,
        boxShadow: active ? 'var(--shadow-soft)' : 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </motion.button>
  );
}
