/**
 * taskTemplates.ts — thư viện MẪU nhiệm vụ hằng ngày cho ba mẹ chọn nhanh.
 * Việc làm ngoài đời thật → ba mẹ duyệt → bé nhận xu (mua đồ trang trí / sticker).
 * xu cân theo kinh tế game: đồ trang trí 30–120 xu, mỗi khách ~8–13 xu →
 * mỗi nhiệm vụ 5–20 xu (thói quen nhỏ 5, việc vừa 10, học tập 15–20).
 */
export interface TaskTemplate {
  title: string;
  emoji: string;
  xu: number;
}

export const TASK_TEMPLATES: { group: string; items: TaskTemplate[] }[] = [
  {
    group: 'Vệ sinh cá nhân',
    items: [
      { title: 'Đánh răng sáng & tối', emoji: '🪥', xu: 10 },
      { title: 'Rửa tay trước khi ăn', emoji: '🧼', xu: 5 },
      { title: 'Tắm gội sạch sẽ', emoji: '🛁', xu: 10 },
      { title: 'Chải đầu gọn gàng', emoji: '💇', xu: 5 },
    ],
  },
  {
    group: 'Học tập',
    items: [
      { title: 'Đọc sách 15 phút', emoji: '📖', xu: 15 },
      { title: 'Làm bài tập về nhà', emoji: '✏️', xu: 20 },
      { title: 'Luyện viết chữ đẹp', emoji: '📝', xu: 15 },
      { title: 'Học từ mới', emoji: '🔤', xu: 10 },
    ],
  },
  {
    group: 'Việc nhà',
    items: [
      { title: 'Dọn đồ chơi gọn gàng', emoji: '🧸', xu: 10 },
      { title: 'Gấp quần áo', emoji: '👕', xu: 10 },
      { title: 'Dọn bàn ăn', emoji: '🍽️', xu: 10 },
      { title: 'Tưới cây', emoji: '🪴', xu: 5 },
      { title: 'Cho thú cưng ăn', emoji: '🐶', xu: 5 },
    ],
  },
  {
    group: 'Thói quen tốt',
    items: [
      { title: 'Ngủ đúng giờ', emoji: '😴', xu: 10 },
      { title: 'Uống đủ nước', emoji: '💧', xu: 5 },
      { title: 'Tập thể dục', emoji: '🤸', xu: 10 },
      { title: 'Ăn hết phần rau', emoji: '🥦', xu: 10 },
    ],
  },
  {
    group: 'Lễ phép & yêu thương',
    items: [
      { title: 'Chào hỏi ông bà bố mẹ', emoji: '🙇', xu: 5 },
      { title: 'Nói cảm ơn / xin lỗi', emoji: '💗', xu: 5 },
      { title: 'Giúp đỡ việc nhỏ trong nhà', emoji: '🤝', xu: 10 },
      { title: 'Giữ bình tĩnh, không cáu', emoji: '😊', xu: 10 },
    ],
  },
];

/** Emoji gợi ý khi ba mẹ TỰ tạo nhiệm vụ mới. */
export const TASK_EMOJIS = ['⭐', '📚', '🎨', '🎵', '⚽', '🧹', '🛏️', '🥗', '🦷', '🌙', '💪', '🧩', '🚲', '🙏'];
