/**
 * ============================================================================
 *  MODULE: fusion.js
 *  CHỨC NĂNG: "Bộ não" của Fusion Chamber — tính toán ra Alien mới khi người
 *  dùng dung hợp 2-3 Alien gốc.
 *
 *  QUY TRÌNH DUNG HỢP:
 *  1. Tính chỉ số nền (baseStats) = trung bình cộng chỉ số các Alien được chọn,
 *     nhân thêm một hệ số dao động ngẫu nhiên +-10% để tạo cảm giác "không
 *     ai giống ai" mỗi lần dung hợp.
 *  2. Quay xác suất Đột Biến (Mutation Roll): 92% Normal / 3% Glitch / 5% Gold.
 *  3. Áp dụng hiệu ứng đột biến lên chỉ số nền.
 *  4. Tính Tổng Điểm (Base Stats) -> suy ra Hạng (Rank) -> suy ra Mức Độ
 *     Nguy Hiểm (Danger Level).
 *  5. Sinh Tên mới + Kỹ năng mới bằng cách trộn dữ liệu của các Alien cha mẹ.
 * ============================================================================
 */

import { STAT_KEYS, RANK_THRESHOLDS, DANGER_LEVELS } from "./data.js";

/** Xáo trộn ngẫu nhiên một mảng (thuật toán Fisher-Yates) — dùng để chọn kỹ năng / chỉ số ngẫu nhiên */
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Quay xác suất đột biến: trả về "normal" | "glitch" | "gold" theo đúng tỉ lệ 92% / 3% / 5% */
function rollMutation() {
  const roll = Math.random() * 100;
  if (roll < 3) return "glitch";      // 0%   - 3%   => Glitch
  if (roll < 8) return "gold";        // 3%   - 8%   => Gold (5% kích thước)
  return "normal";                    // 8%   - 100% => Normal (92% kích thước)
}

/** Tính chỉ số nền bằng trung bình cộng có dao động ngẫu nhiên +-10% cho từng trục */
function computeBaseStats(parentAliens) {
  const baseStats = {};
  STAT_KEYS.forEach((key) => {
    const avg = parentAliens.reduce((sum, a) => sum + a.stats[key], 0) / parentAliens.length;
    const variance = 0.9 + Math.random() * 0.2; // hệ số dao động: 0.9 -> 1.1
    baseStats[key] = Math.round(avg * variance);
  });
  return baseStats;
}

/**
 * Áp dụng hiệu ứng đột biến lên bộ chỉ số nền.
 * - glitch: 1 chỉ số ngẫu nhiên bị đẩy lên MỨC TỐI ĐA (100), 1 chỉ số khác bị giảm mạnh còn ~30%.
 * - gold:   toàn bộ 6 chỉ số được nhân 1.2 (tăng 20%), giới hạn trần ở 120.
 * - normal: giữ nguyên chỉ số nền.
 */
function applyMutation(baseStats, mutationType) {
  const finalStats = { ...baseStats };

  if (mutationType === "glitch") {
    const shuffledKeys = shuffleArray(STAT_KEYS);
    const boostKey = shuffledKeys[0];
    const nerfKey = shuffledKeys[1];
    finalStats[boostKey] = 100;
    finalStats[nerfKey] = Math.max(5, Math.round(finalStats[nerfKey] * 0.3));
    return { finalStats, glitchInfo: { boostKey, nerfKey } };
  }

  if (mutationType === "gold") {
    STAT_KEYS.forEach((key) => {
      finalStats[key] = Math.min(120, Math.round(finalStats[key] * 1.2));
    });
    return { finalStats, glitchInfo: null };
  }

  return { finalStats, glitchInfo: null };
}

/** Suy ra Hạng (SS/A/B/C/D/E/F) từ tổng điểm 6 chỉ số */
export function calculateRank(total) {
  const found = RANK_THRESHOLDS.find((t) => total >= t.min);
  return found ? found.rank : "F";
}

/** Suy ra Mức Độ Nguy Hiểm từ Hạng */
export function getDangerLevel(rank) {
  return DANGER_LEVELS[rank] || "Cấp Độ Địa Phương";
}

/**
 * Sinh tên Alien mới bằng cách ghép âm tiết từ tên các Alien cha mẹ
 * (2 alien: ghép nửa đầu tên này + nửa sau tên kia — kiểu "fusion name" quen thuộc)
 */
function generateFusionName(parentAliens) {
  if (parentAliens.length === 2) {
    const [a, b] = parentAliens;
    const half1 = a.name.slice(0, Math.ceil(a.name.length / 2));
    const half2 = b.name.slice(Math.floor(b.name.length / 2));
    return half1 + half2.toLowerCase();
  }
  // Dung hợp 3 alien: lấy 1 đoạn ngắn từ mỗi tên rồi nối lại
  const parts = parentAliens.map((a, idx) => {
    const len = Math.max(2, Math.floor(a.name.length / 3));
    return idx === 0 ? a.name.slice(0, len) : a.name.slice(0, len).toLowerCase();
  });
  return parts.join("");
}

/** Trộn kỹ năng nổi bật: lấy ngẫu nhiên 2-3 kỹ năng từ toàn bộ kỹ năng của các alien cha mẹ */
function generateFusionSkills(parentAliens) {
  const pooledSkills = parentAliens.flatMap((a) =>
    a.skills.map((skill) => ({ skill, from: a.name }))
  );
  const shuffled = shuffleArray(pooledSkills);
  const count = Math.min(3, Math.max(2, shuffled.length));
  return shuffled.slice(0, count);
}

/**
 * HÀM CHÍNH: performFusion
 * Đầu vào: mảng 2-3 object Alien gốc (lấy từ ALIENS_GOC trong data.js)
 * Đầu ra: object Alien Dung Hợp hoàn chỉnh, sẵn sàng để hiển thị lên UI
 */
export function performFusion(parentAliens) {
  if (!parentAliens || parentAliens.length < 2 || parentAliens.length > 3) {
    throw new Error("Cần chọn 2 hoặc 3 Alien để thực hiện Dung Hợp.");
  }

  const mutationType = rollMutation();
  const baseStats = computeBaseStats(parentAliens);
  const { finalStats, glitchInfo } = applyMutation(baseStats, mutationType);

  const total = STAT_KEYS.reduce((sum, key) => sum + finalStats[key], 0);
  const rank = calculateRank(total);
  const dangerLevel = getDangerLevel(rank);

  return {
    id: "fusion_" + Date.now(),
    name: generateFusionName(parentAliens),
    types: parentAliens.map((a) => a.type).join(" + "),
    parents: parentAliens,
    mutationType,          // "normal" | "glitch" | "gold" -> quyết định hiệu ứng CSS
    glitchInfo,            // { boostKey, nerfKey } nếu là glitch, ngược lại null
    stats: finalStats,
    total,
    rank,
    dangerLevel,
    naturalRate: 0,        // Luôn = 0%, alien dung hợp không tồn tại tự nhiên
    skills: generateFusionSkills(parentAliens),
    createdAt: new Date()
  };
}
