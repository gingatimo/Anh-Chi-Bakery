/**
 * lastChild.ts — CON TRỎ nhẹ tới bé đang chơi (chỉ lưu childId, KHÔNG lưu gameplay).
 * Prod là DB-only nên không cache dữ liệu chơi; nhưng lưu 1 id để reload biết TỰ nạp
 * lại bé đó từ DB và vào thẳng màn chơi (thay vì rơi về màn chọn bé). Gameplay vẫn
 * lấy tươi từ DB qua pullChild → không có hazard cache cũ đè DB.
 */
const KEY = 'anhchi-last-child';

export const setLastChild = (id: string) => {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* localStorage bị chặn — bỏ qua, chỉ mất tiện ích auto-resume */
  }
};

export const getLastChild = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const clearLastChild = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* bỏ qua */
  }
};
