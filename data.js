/**
 * ============================================================================
 *  MODULE: data.js
 *  CHỨC NĂNG: Lưu trữ toàn bộ dữ liệu tĩnh của OmnitrixLab
 *  - Danh sách 10 Alien gốc (Original 10) cùng chỉ số, kỹ năng, mô tả
 *  - Bảng quy đổi Tổng điểm -> Hạng (Rank)
 *  - Bảng quy đổi Hạng -> Mức độ nguy hiểm (Danger Level)
 *  - Bảng màu & icon riêng cho từng "Hệ" (type) alien
 *
 *  LƯU Ý: Đây là dữ liệu SÁNG TẠO của dự án fan-made, không sao chép nguyên
 *  văn từ bất kỳ nguồn chính thức nào. Chỉ số (int, atk, def, spd, hp, mag)
 *  là giá trị do OmnitrixLab tự cân bằng để phục vụ mục đích giải trí.
 * ============================================================================
 */

// Thang điểm mỗi chỉ số: 0 - 100 (Gold Mutation có thể vượt lên tới 120)
// 6 trục chỉ số theo đúng yêu cầu Radar Chart:
//   int = Thông Minh | atk = Tấn Công | def = Phòng Thủ
//   spd = Tốc Độ     | hp  = Máu      | mag = Phép

export const ALIENS_GOC = [
  {
    id: "heatblast",
    name: "Heatblast",
    type: "Lửa",
    species: "Pyronite",
    homeworld: "Pyros",
    color: "#ff5a2e",
    icon: "🔥",
    description: "Alien đến từ hành tinh núi lửa Pyros, cơ thể cấu tạo từ đá magma sống và ngọn lửa vĩnh cửu.",
    stats: { int: 55, atk: 88, def: 48, spd: 52, hp: 68, mag: 82 },
    skills: ["Cầu Lửa Plasma", "Bay Bằng Phản Lực Nhiệt", "Miễn Nhiễm Dung Nham"],
    image: "./assets/images/heatblast.png"
  },
  {
    id: "xlr8",
    name: "XLR8",
    type: "Tốc Độ",
    species: "Kineceleran",
    homeworld: "Kinet",
    color: "#1e90ff",
    icon: "⚡",
    description: "Alien khủng long hai chân đến từ Kinet, sở hữu tốc độ di chuyển vượt ngưỡng âm thanh.",
    stats: { int: 58, atk: 62, def: 38, spd: 99, hp: 52, mag: 28 },
    skills: ["Chạy Siêu Tốc", "Vuốt Sắc Bén", "Phản Xạ Tức Thời"],
    image: "./assets/images/xlr8.png"
  },
  {
    id: "diamondhead",
    name: "Diamondhead",
    type: "Pha Lê",
    species: "Petrosapien",
    homeworld: "Petropia",
    color: "#22d3d3",
    icon: "💎",
    description: "Alien tinh thể đến từ Petropia, toàn thân cấu tạo từ khối silic siêu cứng có thể tái tạo.",
    stats: { int: 56, atk: 78, def: 92, spd: 38, hp: 76, mag: 42 },
    skills: ["Phóng Gai Pha Lê", "Tái Tạo Cơ Thể", "Khiên Chắn Tinh Thể"],
    image: "./assets/images/diamondhead.png"
  },
  {
    id: "fourarms",
    name: "Four Arms",
    type: "Sức Mạnh",
    species: "Tetramand",
    homeworld: "Khoros",
    color: "#e5342f",
    icon: "👊",
    description: "Chiến binh bốn tay đến từ Khoros, nổi danh khắp dải ngân hà nhờ sức mạnh cơ bắp phi thường.",
    stats: { int: 38, atk: 96, def: 82, spd: 34, hp: 92, mag: 18 },
    skills: ["Đấm Tứ Quyền", "Nhảy Chấn Địa", "Phòng Ngự Bốn Tay"],
    image: "./assets/images/fourarms.png"
  },
  {
    id: "greymatter",
    name: "Grey Matter",
    type: "Trí Tuệ",
    species: "Galvan",
    homeworld: "Galvan Prime",
    color: "#9aa5ad",
    icon: "🧠",
    description: "Sinh vật tí hon đến từ Galvan Prime — hành tinh mật độ dân số cao nhất vũ trụ, sở hữu trí tuệ siêu việt.",
    stats: { int: 99, atk: 18, def: 22, spd: 48, hp: 26, mag: 58 },
    skills: ["Phân Tích Siêu Tốc", "Chui Lọt Khe Hẹp", "Chế Tạo Tức Thời"],
    image: "./assets/images/greymatter.png"
  },
  {
    id: "stinkfly",
    name: "Stinkfly",
    type: "Bay",
    species: "Lepidopterran",
    homeworld: "Lepidopterra",
    color: "#e83e9e",
    icon: "🪰",
    description: "Alien côn trùng đến từ Lepidopterra, sở hữu bốn cánh và khả năng bay lượn cực kỳ linh hoạt.",
    stats: { int: 48, atk: 54, def: 44, spd: 72, hp: 54, mag: 52 },
    skills: ["Bắn Chất Nhờn", "Bay Lượn Linh Hoạt", "Mắt Kép Toàn Cảnh"],
    image: "./assets/images/stinkfly.png"
  },
  {
    id: "ripjaws",
    name: "Ripjaws",
    type: "Thủy Sinh",
    species: "Piscciss Volann",
    homeworld: "Piscciss",
    color: "#2f7de1",
    icon: "🐟",
    description: "Alien lưỡng cư đến từ Piscciss, có thể hô hấp cả dưới nước lẫn trên cạn với hàm răng sắc bén.",
    stats: { int: 44, atk: 62, def: 54, spd: 66, hp: 60, mag: 32 },
    skills: ["Cắn Hàm Cá Mập", "Bơi Siêu Tốc", "Định Vị Thủy Âm"],
    image: "./assets/images/ripjaws.png"
  },
  {
    id: "upgrade",
    name: "Upgrade",
    type: "Công Nghệ",
    species: "Galvanic Mechamorph",
    homeworld: "Galvan B",
    color: "#54677a",
    icon: "🤖",
    description: "Sinh vật kim loại lỏng đến từ Galvan B, có thể hợp nhất và nâng cấp mọi loại máy móc nó chạm vào.",
    stats: { int: 88, atk: 58, def: 68, spd: 44, hp: 58, mag: 78 },
    skills: ["Hợp Nhất Máy Móc", "Biến Hình Vũ Khí", "Bắn Tia Năng Lượng"],
    image: "./assets/images/upgrade.png"
  },
  {
    id: "ghostfreak",
    name: "Ghostfreak",
    type: "Bóng Ma",
    species: "Ectonurite",
    homeworld: "Anur Phaetos",
    color: "#6a3fc9",
    icon: "👻",
    description: "Sinh vật vô hình đến từ Anur Phaetos, có khả năng xuyên qua vật chất rắn và ẩn mình trong bóng tối.",
    stats: { int: 68, atk: 64, def: 32, spd: 58, hp: 48, mag: 92 },
    skills: ["Xuyên Vật Chất", "Tàng Hình Tuyệt Đối", "Xúc Tu Bóng Tối"],
    image: "./assets/images/ghostfreak.png"
  },
  {
    id: "wildmutt",
    name: "Wildmutt",
    type: "Bản Năng",
    species: "Vulpimancer",
    homeworld: "Vulpin",
    color: "#f2900c",
    icon: "🐾",
    description: "Sinh vật bốn chân đến từ Vulpin, không có mắt nhưng bù lại giác quan nhạy bén bậc nhất vũ trụ.",
    stats: { int: 28, atk: 82, def: 66, spd: 78, hp: 74, mag: 22 },
    skills: ["Giác Quan Siêu Nhạy", "Cắn Xé Hàm Răng", "Lao Vào Kẻ Địch"],
    image: "./assets/images/wildmutt.png"
  }
];

// Tên đầy đủ + thứ tự hiển thị của 6 trục chỉ số (dùng chung cho thanh stat & radar chart)
export const STAT_LABELS = {
  int: "Thông Minh",
  atk: "Tấn Công",
  def: "Phòng Thủ",
  spd: "Tốc Độ",
  hp: "Máu",
  mag: "Phép"
};
export const STAT_KEYS = ["int", "atk", "def", "spd", "hp", "mag"];

// Ngưỡng tổng điểm (tổng 6 chỉ số) để quy đổi ra Hạng.
// Được cân bằng dựa trên tổng điểm trung bình của bộ dữ liệu gốc (~270 - 395)
// cộng thêm biên độ dao động khi Dung Hợp (biến động ngẫu nhiên + đột biến Gold/Glitch).
export const RANK_THRESHOLDS = [
  { rank: "SS", min: 440 },
  { rank: "A", min: 380 },
  { rank: "B", min: 320 },
  { rank: "C", min: 260 },
  { rank: "D", min: 200 },
  { rank: "E", min: 140 },
  { rank: "F", min: 0 }
];

// Màu đại diện riêng cho từng Hạng (dùng cho badge + thanh Base Stats)
export const RANK_COLORS = {
  SS: "#ffd93c",
  A: "#ff4d4d",
  B: "#ff9f40",
  C: "#ffe14d",
  D: "#39ff6a",
  E: "#4dd0ff",
  F: "#8a99a5"
};

// Quy đổi Hạng -> Mức độ nguy hiểm (Danger Level) theo yêu cầu đề bài
export const DANGER_LEVELS = {
  F: "Cấp Độ Địa Phương",
  E: "Cấp Độ Địa Phương",
  D: "Cấp Độ Hành Tinh",
  C: "Cấp Độ Hành Tinh",
  B: "Cấp Độ Thiên Hà",
  A: "Cấp Độ Thiên Hà",
  SS: "Cấp Độ Vũ Trụ"
};

// Trọng số hiển thị (icon) cho từng loại Đột Biến khi dung hợp
export const MUTATION_INFO = {
  normal: { label: "Bình Thường", icon: "🧬", rate: "92%" },
  glitch: { label: "Glitch — Lỗi Gen", icon: "⚠️", rate: "3%" },
  gold: { label: "Gen Hoàng Kim", icon: "✨", rate: "5%" }
};