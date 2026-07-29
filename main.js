/**
 * ============================================================================
 *  MODULE: main.js  (ĐIỂM KHỞI ĐẦU CỦA ỨNG DỤNG)
 *  CHỨC NĂNG: Kết nối tất cả các module (data, fusion, battle, api) lại với
 *  UI thật trên trang. Chịu trách nhiệm:
 *  - Quản lý "state" (trạng thái) toàn cục của ứng dụng trong bộ nhớ.
 *  - Render Khu Vực 01 (Pokédex Grid), Khu Vực 02 (Fusion Chamber),
 *    Khu Vực 03 (Kết Quả Dung Hợp + Đấu Trường).
 *  - Vẽ Radar Chart bằng Chart.js.
 *  - Xử lý toàn bộ sự kiện: click, kéo-thả (drag & drop), chuyển tab, modal
 *    đăng nhập...
 *
 *  GHI CHÚ: state chỉ lưu trong bộ nhớ (biến JS), sẽ mất khi tải lại trang.
 *  Muốn lưu trữ lâu dài, có thể nâng cấp bằng localStorage hoặc Firebase.
 * ============================================================================
 */

import {
  ALIENS_GOC,
  STAT_KEYS,
  STAT_LABELS,
  RANK_COLORS,
  MUTATION_INFO
} from "./data.js";
import { performFusion } from "./fusion.js";
import { generateBotOpponent, simulateBattle } from "./battle.js";
import { generateAlienImageAI, generateAlienLoreAI, getMockAccounts } from "./api.js";

/* ----------------------------------------------------------------------------
 * STATE TOÀN CỤC
 * -------------------------------------------------------------------------- */
const state = {
  selectedForFusion: [],   // mảng id (tối đa 3) đang chờ trong Khoang Dung Hợp
  fusionResult: null,      // Alien Dung Hợp mới nhất
  fusionHistory: [],       // toàn bộ Alien đã Dung Hợp trong phiên này (dùng cho Đấu Trường)
  currentUser: null        // tài khoản đang đăng nhập (mock)
};

// Lưu tham chiếu các Chart.js instance để hủy trước khi vẽ lại (tránh lỗi "canvas in use")
const charts = { resultRadar: null, arenaRadar: null };

/* ----------------------------------------------------------------------------
 * KHỞI TẠO ỨNG DỤNG
 * -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderAlienGrid();
  renderFusionSlots();
  setupZone3Tabs();
  setupFusionChamber();
  setupBattleArena();
  setupAuthUI();
});

/* ----------------------------------------------------------------------------
 * KHU VỰC 01 — PHÒNG TRƯNG BÀY (POKÉDEX GRID)
 * -------------------------------------------------------------------------- */
function renderAlienGrid() {
  const grid = document.getElementById("alien-grid");
  grid.innerHTML = ALIENS_GOC.map(alienCardTemplate).join("");

  grid.querySelectorAll(".alien-card").forEach((card) => {
    card.addEventListener("click", () => handleAlienCardClick(card.dataset.alienId));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleAlienCardClick(card.dataset.alienId);
      }
    });
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", card.dataset.alienId);
      card.classList.add("is-dragging");
    });
    card.addEventListener("dragend", () => card.classList.remove("is-dragging"));
  });
}

function alienCardTemplate(alien) {
  const isSelected = state.selectedForFusion.includes(alien.id);
  return `
    <div class="alien-card ${isSelected ? "is-selected" : ""}"
         data-alien-id="${alien.id}" draggable="true" tabindex="0"
         role="button" aria-pressed="${isSelected}"
         style="--alien-color:${alien.color}">
      <div class="alien-card-frame">
        <span class="alien-card-icon">${alien.icon}</span>
      </div>
      <div class="alien-card-name">${alien.name}</div>
      <div class="alien-card-type">${alien.type}</div>
    </div>
  `;
}

function handleAlienCardClick(alienId) {
  if (state.selectedForFusion.includes(alienId)) {
    removeAlienFromFusion(alienId);
  } else {
    addAlienToFusion(alienId);
  }
}

/* ----------------------------------------------------------------------------
 * KHU VỰC 02 — KHOANG DUNG HỢP (FUSION CHAMBER)
 * -------------------------------------------------------------------------- */
function setupFusionChamber() {
  document.getElementById("fuse-btn").addEventListener("click", handleFuseClick);
  document.getElementById("fusion-reset-btn").addEventListener("click", () => {
    state.selectedForFusion = [];
    renderAlienGrid();
    renderFusionSlots();
  });
}

function addAlienToFusion(alienId) {
  if (!alienId) return;
  if (state.selectedForFusion.includes(alienId)) {
    showToast("⚠️ Alien này đã có trong Khoang Dung Hợp.");
    return;
  }
  if (state.selectedForFusion.length >= 3) {
    showToast("⚠️ Khoang Dung Hợp đã đầy (tối đa 3 Alien).");
    return;
  }
  state.selectedForFusion.push(alienId);
  renderAlienGrid();
  renderFusionSlots();
}

function removeAlienFromFusion(alienId) {
  state.selectedForFusion = state.selectedForFusion.filter((id) => id !== alienId);
  renderAlienGrid();
  renderFusionSlots();
}

function renderFusionSlots() {
  const container = document.getElementById("fusion-slots");
  container.innerHTML = [0, 1, 2]
    .map((i) => {
      const alienId = state.selectedForFusion[i];
      const alien = alienId ? ALIENS_GOC.find((a) => a.id === alienId) : null;
      if (!alien) {
        return `<div class="fusion-slot" data-slot-index="${i}"><span class="fusion-slot-placeholder">+</span></div>`;
      }
      return `
        <div class="fusion-slot is-filled" data-slot-index="${i}" style="--alien-color:${alien.color}">
          <button class="fusion-slot-remove" data-remove-id="${alien.id}" aria-label="Bỏ ${alien.name} khỏi khoang">✕</button>
          <span class="fusion-slot-icon">${alien.icon}</span>
          <span class="fusion-slot-name">${alien.name}</span>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll(".fusion-slot").forEach((slotEl) => {
    slotEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      slotEl.classList.add("is-drag-over");
    });
    slotEl.addEventListener("dragleave", () => slotEl.classList.remove("is-drag-over"));
    slotEl.addEventListener("drop", (e) => {
      e.preventDefault();
      slotEl.classList.remove("is-drag-over");
      addAlienToFusion(e.dataTransfer.getData("text/plain"));
    });
  });

  container.querySelectorAll(".fusion-slot-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeAlienFromFusion(btn.dataset.removeId);
    });
  });

  document.getElementById("fuse-btn").disabled = state.selectedForFusion.length < 2;
}

function handleFuseClick() {
  const parents = state.selectedForFusion.map((id) => ALIENS_GOC.find((a) => a.id === id));
  if (parents.length < 2) return;

  playFusionChargeAnimation();

  // Thời gian chờ khớp với hiệu ứng "nạp năng lượng" CSS trong khoang dung hợp
  setTimeout(() => {
    const result = performFusion(parents);
    state.fusionResult = result;
    state.fusionHistory.push(result);

    // Dọn khoang dung hợp để sẵn sàng cho lượt tiếp theo
    state.selectedForFusion = [];
    renderAlienGrid();
    renderFusionSlots();

    renderFusionResult(result);
    switchZone3Tab("result");
    updateArenaAvailability();
    showToast(`✅ Dung Hợp thành công: ${result.name}!`);
  }, 900);
}

function playFusionChargeAnimation() {
  const core = document.getElementById("fusion-chamber-core");
  core.classList.add("is-charging");
  setTimeout(() => core.classList.remove("is-charging"), 900);
}

/* ----------------------------------------------------------------------------
 * KHU VỰC 03 (TAB A) — MÀN HÌNH KẾT QUẢ DUNG HỢP
 * -------------------------------------------------------------------------- */
function renderFusionResult(result) {
  document.getElementById("result-empty-state").classList.add("hidden");
  const content = document.getElementById("result-content");
  content.classList.remove("hidden", "is-glitch", "is-gold");
  if (result.mutationType === "glitch") content.classList.add("is-glitch");
  if (result.mutationType === "gold") content.classList.add("is-gold");

  document.getElementById("result-image-box").innerHTML =
    `<span class="result-icon-mix">${result.parents.map((p) => p.icon).join(" ")}</span>`;

  const nameEl = document.getElementById("result-name");
  nameEl.textContent = result.name;
  nameEl.dataset.glitchName = result.name; // dùng cho hiệu ứng nhiễu sóng CSS (::before/::after)

  document.getElementById("result-types").textContent = result.types;
  document.getElementById("result-parents").textContent =
    "Dung hợp từ: " + result.parents.map((p) => p.name).join(" + ");

  const mutationMeta = MUTATION_INFO[result.mutationType];
  const badge = document.getElementById("result-mutation-badge");
  badge.textContent = `${mutationMeta.icon} ${mutationMeta.label}`;
  badge.className = `mutation-badge mutation-${result.mutationType}`;

  // Thanh Base Stats (tổng điểm 6 chỉ số)
  const MAX_TOTAL = 600;
  const totalPercent = Math.min(100, Math.round((result.total / MAX_TOTAL) * 100));
  document.getElementById("basestats-fill").style.width = totalPercent + "%";
  document.getElementById("basestats-value").textContent = `${result.total} / ${MAX_TOTAL}`;

  // Thanh Đánh Giá Hạng
  const rankFill = document.getElementById("rank-fill");
  rankFill.style.width = "100%";
  rankFill.style.background = RANK_COLORS[result.rank];
  document.getElementById("rank-value").textContent = result.rank;

  document.getElementById("result-danger-level").textContent = result.dangerLevel;
  document.getElementById("result-natural-rate").textContent =
    `${result.naturalRate}% — Đột biến nhân tạo từ OmnitrixLab`;

  document.getElementById("result-skills-list").innerHTML = result.skills
    .map((s) => `<li><span class="skill-name">${s.skill}</span><span class="skill-source">thừa hưởng từ ${s.from}</span></li>`)
    .join("");

  const loreBox = document.getElementById("result-lore-text");
  loreBox.textContent = "";
  loreBox.classList.add("hidden");

  renderResultRadar(result);
}

function renderResultRadar(result) {
  const ctx = document.getElementById("result-radar-canvas").getContext("2d");
  if (charts.resultRadar) charts.resultRadar.destroy();
  charts.resultRadar = new Chart(ctx, {
    type: "radar",
    data: {
      labels: STAT_KEYS.map((k) => STAT_LABELS[k]),
      datasets: [radarDataset(result.name, result.stats, "#39ff6a")]
    },
    options: radarChartOptions()
  });
}

async function handleGenerateImageClick() {
  if (!state.fusionResult) return;
  const btn = document.getElementById("btn-gen-image");
  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "⏳ Đang kết nối AI...";

  const description = `hybrid fusion of ${state.fusionResult.parents.map((p) => p.name).join(" and ")}, rank ${state.fusionResult.rank}`;
  const imageUrl = await generateAlienImageAI(state.fusionResult.name, description);

  if (imageUrl) {
    document.getElementById("result-image-box").innerHTML =
      `<img src="${imageUrl}" alt="Ảnh AI của ${state.fusionResult.name}" class="result-ai-image" />`;
  } else {
    showToast("⚠️ Chưa cấu hình API Key sinh ảnh AI — xem hướng dẫn trong js/api.js.");
  }
  btn.disabled = false;
  btn.textContent = originalLabel;
}

async function handleGenerateLoreClick() {
  if (!state.fusionResult) return;
  const btn = document.getElementById("btn-gen-lore");
  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "⏳ Đang kết nối AI...";

  const lore = await generateAlienLoreAI(state.fusionResult);
  const loreBox = document.getElementById("result-lore-text");

  if (lore) {
    loreBox.textContent = lore;
    loreBox.classList.remove("hidden");
  } else {
    showToast("⚠️ Chưa cấu hình API Key cho AI text — xem hướng dẫn trong js/api.js.");
  }
  btn.disabled = false;
  btn.textContent = originalLabel;
}

/* ----------------------------------------------------------------------------
 * KHU VỰC 03 (TAB B) — ĐẤU TRƯỜNG (BATTLE ARENA)
 * -------------------------------------------------------------------------- */
function setupBattleArena() {
  document.getElementById("arena-mode-pve-btn").addEventListener("click", () => startArenaFlow("pve"));
  document.getElementById("arena-mode-pvp-btn").addEventListener("click", () => startArenaFlow("pvp"));
  document.getElementById("btn-gen-image").addEventListener("click", handleGenerateImageClick);
  document.getElementById("btn-gen-lore").addEventListener("click", handleGenerateLoreClick);
}

function updateArenaAvailability() {
  const hasFusions = state.fusionHistory.length > 0;
  document.getElementById("arena-empty-state").classList.toggle("hidden", hasFusions);
  document.getElementById("arena-content").classList.toggle("hidden", !hasFusions);
  if (hasFusions) populatePlayerSelect();
}

function populatePlayerSelect() {
  const select = document.getElementById("arena-player-select");
  const previousValue = select.value;
  select.innerHTML = state.fusionHistory
    .map((a) => `<option value="${a.id}">${a.name} — Hạng ${a.rank} (${a.total} điểm)</option>`)
    .join("");
  if (state.fusionHistory.some((a) => a.id === previousValue)) select.value = previousValue;
}

async function startArenaFlow(mode) {
  if (state.fusionHistory.length === 0) {
    showToast("⚠️ Bạn cần Dung Hợp ít nhất 1 Alien trước khi vào Đấu Trường!");
    return;
  }
  const playerId = document.getElementById("arena-player-select").value;
  const playerAlien = state.fusionHistory.find((a) => a.id === playerId) || state.fusionHistory[state.fusionHistory.length - 1];

  document.getElementById("arena-log").innerHTML = "";
  document.getElementById("arena-vs-display").classList.add("hidden");

  if (mode === "pvp") {
    setArenaStatus("🔎 Đang tìm đối thủ Online...");
    await delay(1600);
  } else {
    setArenaStatus("🤖 Đang khởi tạo AI Bot...");
    await delay(500);
  }

  const opponent = generateBotOpponent();
  document.getElementById("arena-vs-display").classList.remove("hidden");
  renderVsCards(playerAlien, opponent, mode);
  renderArenaRadar(playerAlien, opponent);

  setArenaStatus("⚔️ Trận đấu đang diễn ra...");
  await delay(400);

  const battleResult = simulateBattle(playerAlien, opponent);
  renderBattleLog(battleResult.log);
  setArenaStatus(
    battleResult.winner === playerAlien ? "🎉 Bạn đã chiến thắng trận đấu!" : "💀 Bạn đã thua trận này, thử dung hợp một Alien mạnh hơn!"
  );
}

function renderVsCards(player, opponent, mode) {
  const el = document.getElementById("arena-vs-display");
  el.innerHTML = `
    <div class="vs-card vs-card--player">
      <span class="vs-card-tag">Của bạn</span>
      <span class="vs-card-icon">${player.parents.map((p) => p.icon).join("")}</span>
      <div class="vs-card-name">${player.name}</div>
      <div class="vs-card-rank" style="color:${RANK_COLORS[player.rank]}">Hạng ${player.rank}</div>
      <div class="vs-card-total">Tổng điểm: ${player.total}</div>
    </div>
    <div class="vs-divider">VS</div>
    <div class="vs-card vs-card--opponent">
      <span class="vs-card-tag">${mode === "pvp" ? "Đối thủ Online" : "AI Bot"}</span>
      <span class="vs-card-icon">${opponent.parents.map((p) => p.icon).join("")}</span>
      <div class="vs-card-name">${opponent.name}</div>
      <div class="vs-card-rank" style="color:${RANK_COLORS[opponent.rank]}">Hạng ${opponent.rank}</div>
      <div class="vs-card-total">Tổng điểm: ${opponent.total}</div>
    </div>
  `;
}

function renderArenaRadar(player, opponent) {
  const ctx = document.getElementById("arena-radar-canvas").getContext("2d");
  if (charts.arenaRadar) charts.arenaRadar.destroy();
  charts.arenaRadar = new Chart(ctx, {
    type: "radar",
    data: {
      labels: STAT_KEYS.map((k) => STAT_LABELS[k]),
      datasets: [radarDataset(player.name, player.stats, "#39ff6a"), radarDataset(opponent.name, opponent.stats, "#ff4d4d")]
    },
    options: radarChartOptions()
  });
}

function renderBattleLog(logLines) {
  document.getElementById("arena-log").innerHTML = logLines.map((line) => `<p class="log-line">${line}</p>`).join("");
}

function setArenaStatus(text) {
  document.getElementById("arena-status").textContent = text;
}

/* ----------------------------------------------------------------------------
 * TAB SWITCHING (KHU VỰC 03)
 * -------------------------------------------------------------------------- */
function setupZone3Tabs() {
  document.getElementById("tab-result-btn").addEventListener("click", () => switchZone3Tab("result"));
  document.getElementById("tab-arena-btn").addEventListener("click", () => switchZone3Tab("arena"));
}

function switchZone3Tab(tabName) {
  const isResult = tabName === "result";
  document.getElementById("panel-result").classList.toggle("hidden", !isResult);
  document.getElementById("panel-arena").classList.toggle("hidden", isResult);
  document.getElementById("tab-result-btn").classList.toggle("active", isResult);
  document.getElementById("tab-arena-btn").classList.toggle("active", !isResult);
  if (!isResult) updateArenaAvailability();
}

/* ----------------------------------------------------------------------------
 * ĐĂNG NHẬP (MOCK GOOGLE SIGN-IN)
 * -------------------------------------------------------------------------- */
function setupAuthUI() {
  document.getElementById("login-btn").addEventListener("click", openLoginModal);
  document.getElementById("login-modal-close").addEventListener("click", closeLoginModal);
  document.getElementById("login-modal-overlay").addEventListener("click", closeLoginModal);
  document.getElementById("logout-btn").addEventListener("click", handleLogout);
  renderAccountList();
}

function renderAccountList() {
  const list = document.getElementById("login-account-list");
  list.innerHTML = getMockAccounts()
    .map(
      (acc) => `
      <button class="account-option" data-email="${acc.email}">
        <span class="account-avatar">${acc.photo}</span>
        <span class="account-info">
          <span class="account-name">${acc.name}</span>
          <span class="account-email">${acc.email}</span>
        </span>
      </button>`
    )
    .join("");

  list.querySelectorAll(".account-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const account = getMockAccounts().find((a) => a.email === btn.dataset.email);
      handleLoginSuccess(account);
    });
  });
}

function openLoginModal() {
  document.getElementById("login-modal-overlay").classList.remove("hidden");
}
function closeLoginModal() {
  document.getElementById("login-modal-overlay").classList.add("hidden");
}

function handleLoginSuccess(account) {
  state.currentUser = account;
  closeLoginModal();
  document.getElementById("login-btn").classList.add("hidden");
  const badge = document.getElementById("user-badge");
  badge.classList.remove("hidden");
  badge.querySelector(".user-avatar").textContent = account.photo;
  badge.querySelector(".user-name").textContent = account.name;
  showToast(`👋 Xin chào, ${account.name}!`);
}

function handleLogout() {
  state.currentUser = null;
  document.getElementById("login-btn").classList.remove("hidden");
  document.getElementById("user-badge").classList.add("hidden");
}

/* ----------------------------------------------------------------------------
 * TIỆN ÍCH DÙNG CHUNG (Chart.js helpers, Toast, delay...)
 * -------------------------------------------------------------------------- */
function radarDataset(label, stats, color) {
  return {
    label,
    data: STAT_KEYS.map((k) => stats[k]),
    backgroundColor: hexToRgba(color, 0.25),
    borderColor: color,
    borderWidth: 2,
    pointBackgroundColor: color,
    pointRadius: 3
  };
}

function radarChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: "rgba(57,255,106,0.15)" },
        grid: { color: "rgba(57,255,106,0.15)" },
        pointLabels: { color: "#c9ffe0", font: { family: "Chakra Petch", size: 12, weight: "600" } },
        ticks: { display: false, backdropColor: "transparent" },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      legend: { labels: { color: "#c9ffe0", font: { family: "Chakra Petch" } } }
    }
  };
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
