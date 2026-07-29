/**
 * ============================================================================
 *  MODULE: battle.js
 *  CHỨC NĂNG: Toàn bộ logic của Khu Vực 03 - Đấu Trường (Battle Arena)
 *  - generateBotOpponent(): tạo một đối thủ AI bằng cách tự động dung hợp
 *    2 alien gốc ngẫu nhiên (dùng lại chính logic của fusion.js).
 *  - simulateBattle(): mô phỏng trận đấu theo lượt (turn-based) dựa trên
 *    chỉ số ATK/DEF/HP, sinh ra một "text log" tường thuật trận đấu.
 *
 *  GHI CHÚ QUAN TRỌNG VỀ CHẾ ĐỘ PVP:
 *  GitHub Pages chỉ là hosting tĩnh (static hosting), không có backend/server
 *  để xử lý ghép trận thời gian thực. Vì vậy chế độ "Đấu Online (PvP)" trong
 *  bản demo này được MÔ PHỎNG (giả lập một khoảng thời gian "tìm trận" rồi gán
 *  một đối thủ ngẫu nhiên) — không phải multiplayer thật.
 *  Muốn có PvP thật, bạn cần tích hợp thêm backend, ví dụ Firebase Firestore
 *  (realtime database) để đồng bộ trạng thái trận đấu giữa 2 người chơi thật.
 * ============================================================================
 */

import { ALIENS_GOC, STAT_KEYS } from "./data.js";
import { performFusion } from "./fusion.js";

/** Chọn ngẫu nhiên N phần tử khác nhau từ một mảng */
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * Sinh đối thủ AI Bot (dùng cho cả PvE lẫn PvP mô phỏng):
 * Tự động chọn 2 alien gốc ngẫu nhiên rồi dung hợp -> đảm bảo đối thủ luôn
 * là một "Alien Dung Hợp" ngang tầm so sánh với alien của người chơi.
 */
export function generateBotOpponent() {
  const twoRandomAliens = pickRandom(ALIENS_GOC, 2);
  const bot = performFusion(twoRandomAliens);
  bot.isBot = true;
  return bot;
}

/**
 * Mô phỏng một trận đấu theo lượt giữa 2 Alien Dung Hợp.
 * Công thức đơn giản: sát thương = ATK người tấn công - 1/2 DEF đối thủ (+- ngẫu nhiên),
 * tối thiểu luôn gây được 5 sát thương để trận đấu không bị "đứng hình".
 * HP trận đấu = chỉ số "Máu" nhân đôi để trận đấu có đủ số lượt kịch tính.
 *
 * Trả về: { log: string[], winner, loser, rounds }
 */
export function simulateBattle(alienA, alienB) {
  let hpA = alienA.stats.hp * 2;
  let hpB = alienB.stats.hp * 2;
  const log = [];
  let round = 1;
  const MAX_ROUNDS = 12;

  log.push(`⚔️ Trận đấu bắt đầu: ${alienA.name} (Tổng điểm ${alienA.total}) đối đầu ${alienB.name} (Tổng điểm ${alienB.total})!`);

  while (hpA > 0 && hpB > 0 && round <= MAX_ROUNDS) {
    // Lượt của A tấn công B
    const variance1 = Math.round((Math.random() - 0.5) * 10);
    const dmgToB = Math.max(5, Math.round(alienA.stats.atk - alienB.stats.def / 2) + variance1);
    hpB = Math.max(0, hpB - dmgToB);
    log.push(`Vòng ${round}: ${alienA.name} tấn công bằng "${alienA.skills[0].skill || alienA.skills[0]}", gây ${dmgToB} sát thương lên ${alienB.name} (HP còn ${hpB}).`);

    if (hpB <= 0) break;

    // Lượt của B phản công A
    const variance2 = Math.round((Math.random() - 0.5) * 10);
    const dmgToA = Math.max(5, Math.round(alienB.stats.atk - alienA.stats.def / 2) + variance2);
    hpA = Math.max(0, hpA - dmgToA);
    log.push(`Vòng ${round}: ${alienB.name} phản công bằng "${alienB.skills[0].skill || alienB.skills[0]}", gây ${dmgToA} sát thương lên ${alienA.name} (HP còn ${hpA}).`);

    round++;
  }

  let winner, loser;
  if (hpA === hpB) {
    // Hòa tuyệt đối (hiếm khi xảy ra) -> ai tổng điểm cao hơn thắng
    winner = alienA.total >= alienB.total ? alienA : alienB;
    loser = winner === alienA ? alienB : alienA;
    log.push(`🤝 Cả hai kiệt sức cùng lúc! Trọng tài xét theo Tổng Điểm: ${winner.name} giành chiến thắng!`);
  } else {
    winner = hpA > hpB ? alienA : alienB;
    loser = winner === alienA ? alienB : alienA;
    log.push(`🏆 ${winner.name} là người chiến thắng chung cuộc!`);
  }

  return { log, winner, loser, rounds: round };
}
