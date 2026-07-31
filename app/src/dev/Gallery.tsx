/**
 * Gallery.tsx — harness render–review (thiết kế 10.5). Chỉ dùng để agent + người
 * XEM lại asset, đối chiếu checklist art direction. Không thuộc luồng game.
 * Mở bằng #gallery.
 */
import { NOTES, Money } from '../assets/svg/Money';
import { CAKE_KINDS, Cake } from '../assets/svg/Cake';
import { Map, type Mood } from '../assets/svg/Map';
import { CUSTOMER_VARIANTS, Customer } from '../assets/svg/Customer';
import { STICKERS, Sticker } from '../assets/svg/Sticker';
import { catalog, CatalogStickerView, STICKER_CATEGORIES } from '../assets/svg/stickerGen';
import { FURNITURE, Furniture } from '../assets/svg/Furniture';
import { ShopScene } from '../assets/svg/Scene';

const MOODS: Mood[] = ['idle', 'happy', 'greet', 'confused', 'hint', 'eat'];

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ marginBottom: 12, fontSize: 22 }}>{title}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>{children}</div>
    </section>
  );
}

export function Gallery() {
  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>Tiệm Bánh Anh Chi — Asset Gallery</h1>
      <p style={{ color: 'var(--text-soft)', marginBottom: 28 }}>
        Vòng render–review · vector giấy cắt · 12 màu · bóng 135° · vân giấy toàn cục
      </p>

      <Row title="Tiền — 9 mệnh giá (số phải đọc được)">
        {NOTES.map((v) => (
          <Money key={v} value={v} width={180} />
        ))}
      </Row>

      <Row title="Mập — 6 biểu cảm (part-swap)">
        {MOODS.map((m) => (
          <div key={m} style={{ textAlign: 'center' }}>
            <Map mood={m} width={130} />
            <div style={{ fontSize: 14, color: 'var(--text-soft)' }}>{m}</div>
          </div>
        ))}
      </Row>

      <Row title="Bánh — 8 loại">
        {CAKE_KINDS.map((k) => (
          <Cake key={k} kind={k} width={110} steam />
        ))}
      </Row>

      <Row title="Khách — 6 kiểu × 3 biểu cảm (bối rối/kiên nhẫn khi bé sai)">
        {CUSTOMER_VARIANTS.map((v) => (
          <div key={v} style={{ display: 'flex', gap: 4 }}>
            <Customer variant={v} mood="neutral" width={90} />
            <Customer variant={v} mood="happy" width={90} />
            <Customer variant={v} mood="patient" width={90} />
          </div>
        ))}
      </Row>

      <Row title={`Sticker cột mốc (${STICKERS.length}) — nền tên đám mây + bóng mờ`}>
        {STICKERS.map((s) => (
          <Sticker key={s.id} def={s} width={104} />
        ))}
        <Sticker def={STICKERS[3]} width={104} ghost />
      </Row>

      <Row title={`Sticker sưu tầm — mẫu 48/1000 (sinh bằng code · ${STICKER_CATEGORIES.length} thể loại)`}>
        {catalog().slice(0, 48).map((s) => (
          <CatalogStickerView key={s.id} s={s} width={92} />
        ))}
        <CatalogStickerView s={catalog()[7]} width={92} ghost />
      </Row>

      <Row title="Nội thất — 9 món">
        {FURNITURE.map((f) => (
          <div key={f.id} style={{ textAlign: 'center' }}>
            <Furniture def={f} width={110} />
            <div style={{ fontSize: 14 }}>
              {f.label} · {f.price} xu
            </div>
          </div>
        ))}
      </Row>

      <Row title="Cảnh tiệm (ngày / tối)">
        <div style={{ width: 460, height: 285, borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <ShopScene />
        </div>
        <div style={{ width: 460, height: 285, borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <ShopScene evening />
        </div>
      </Row>
    </div>
  );
}
