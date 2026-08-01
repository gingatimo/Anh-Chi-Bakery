/** S03 — Tiệm bánh (hub). Màn chính: Mở cửa / Sổ sticker / Cửa hàng / Trang trí.
 * Hết lượt trong ngày → tiệm đóng cửa DIEGETIC (thiết kế 9.7); phần thưởng (sổ
 * sticker, trang trí) vẫn mở — không bao giờ lấy lại thứ bé đã đạt. */
import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useGame } from '../game/store';
import { flushNow } from '../cloud/autosave';
import { clearLastChild } from '../cloud/lastChild';
import { ShopScene } from '../assets/svg/Scene';
import { Furniture, furnitureById } from '../assets/svg/Furniture';
import { MapChar } from '../ui/MapChar';
import { BigButton, IconButton, XuBadge, SpeechBubble } from '../ui/kit';

export function Hub() {
  const shopName = useGame((s) => s.shopName);
  const xu = useGame((s) => s.xu + s.rewardXu); // TỔNG xu (chơi + thưởng nhiệm vụ)
  const day = useGame((s) => s.day);
  const placed = useGame((s) => s.placed);
  const stickers = useGame((s) => s.stickers);
  const tasks = useGame((s) => s.tasks);
  const approvedToday = useGame((s) => s.approvedToday);
  const settings = useGame((s) => s.settings);
  const daily = useGame((s) => s.daily);
  const openShop = useGame((s) => s.openShop);
  const goto = useGame((s) => s.goto);
  const openParent = useGame((s) => s.openParent);
  const toggleSound = useGame((s) => s.toggleSound);
  const toggleTheme = useGame((s) => s.toggleTheme);
  const refreshDaily = useGame((s) => s.refreshDaily);
  const playSeconds = useGame((s) => s.playSeconds);
  const reduce = useReducedMotion();

  useEffect(() => {
    refreshDaily();
  }, [refreshDaily]);

  void daily; // để re-render khi số lượt trong ngày đổi
  // ĐÓNG CỬA theo TRẦN THỜI GIAN (server) — hết phút/ngày thì nghỉ (chống chỉnh-giờ).
  const closed = settings.dailyMinutes != null && playSeconds >= settings.dailyMinutes * 60;
  const tasksTodo = tasks.filter((t) => !approvedToday.includes(t.id)).length; // nhiệm vụ chưa duyệt hôm nay

  const mapSays = closed
    ? 'Hết giờ chơi hôm nay rồi, mai mình chơi tiếp nhé! 🌙'
    : day === 1
    ? 'Mình khai trương thôi nào!'
    : 'Hôm nay có khách đặt bánh sinh nhật đấy!';

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* nền tiệm */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <ShopScene evening={settings.theme === 'dark'} />
      </div>

      {/* thanh trên */}
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: 10, padding: 14 }}>
        <div style={{ background: 'var(--bg-panel)', borderRadius: 999, padding: '6px 16px', boxShadow: 'var(--shadow-soft)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
          Ngày {day}
          {day === 1 && <span style={{ color: 'var(--rose-dark)' }}> · Khai trương!</span>}
        </div>
        <XuBadge xu={xu} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <IconButton label={settings.sound ? 'Tắt âm' : 'Bật âm'} onClick={toggleSound}>
            {settings.sound ? '🔊' : '🔈'}
          </IconButton>
          <IconButton label="Đổi nền sáng/tối" onClick={toggleTheme}>
            {settings.theme === 'light' ? '🌙' : '☀️'}
          </IconButton>
          <IconButton label="Khu phụ huynh" onClick={openParent}>👪</IconButton>
          <IconButton label="Thoát về màn chọn bé" onClick={() => { void flushNow(); clearLastChild(); goto('home'); }}>
            🚪
          </IconButton>
        </div>
      </div>

      {/* biển hiệu tên tiệm (DOM — chữ Việt phải là DOM) */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            background: 'var(--paper)',
            border: '4px solid rgba(74,59,50,0.16)',
            borderRadius: 18,
            padding: '8px 26px',
            boxShadow: 'var(--shadow)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(20px, 3.4vw, 30px)',
            color: 'var(--text)',
            textAlign: 'center',
            maxWidth: '90%',
          }}
        >
          {shopName}
        </motion.div>
      </div>

      {/* nội thất đã đặt — lớp phủ toàn khung (đồng nhất với màn Trang trí) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        {placed.filter((p) => (p.room ?? 0) === 0).map((p) => {
          const def = furnitureById(p.id);
          if (!def) return null;
          return (
            <div key={p.key} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-50%)' }}>
              <Furniture def={def} width={def.w} />
            </div>
          );
        })}
      </div>

      {/* Mập + thoại */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
        <div style={{ position: 'absolute', left: '50%', bottom: '6%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <SpeechBubble tail="down">{mapSays}</SpeechBubble>
          <MapChar mood={closed ? 'sleep' : 'greet'} width={170} />
        </div>
      </div>

      {/* nút hành động */}
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', padding: '10px 14px 22px' }}>
        {closed ? (
          <BigButton tone="sky" disabled>
            🌙 Hết giờ hôm nay
          </BigButton>
        ) : (
          <motion.div animate={reduce ? {} : { scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <BigButton tone="peach" onClick={openShop}>
              {day === 1 ? '🎀 Khai trương tiệm' : '🔔 Mở cửa đón khách'}
            </BigButton>
          </motion.div>
        )}
        <BigButton tone="sky" onClick={() => goto('book')}>
          📖 Sổ sticker {stickers.length > 0 && `(${stickers.length})`}
        </BigButton>
        <BigButton tone="butter" onClick={() => goto('shop')}>🛍️ Cửa hàng</BigButton>
        <BigButton tone="sage" onClick={() => goto('decorate')}>🪴 Trang trí</BigButton>
        <BigButton tone="rose" onClick={() => goto('tasks')}>
          🎯 Nhiệm vụ {tasksTodo > 0 && `(${tasksTodo})`}
        </BigButton>
      </div>
    </div>
  );
}
