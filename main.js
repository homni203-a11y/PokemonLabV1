/**
 * HỆ THỐNG ĐIỀU KHIỂN CHÍNH (MAIN.JS)
 */

// --- 1. HỆ THỐNG ÂM THANH SCI-FI (WEB AUDIO API) ---
const SoundFX = {
    enabled: true,
    ctx: new (window.AudioContext || window.webkitAudioContext)(),
    toggle: function() {
        this.enabled = !this.enabled;
        document.getElementById('btn-toggle-sound').textContent = this.enabled ? "ĐANG BẬT 🔊" : "ĐÃ TẮT 🔇";
    },
    playTone: function(freq, type, duration) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + duration);
    },
    hover: () => SoundFX.playTone(600, 'sine', 0.1),
    click: () => SoundFX.playTone(900, 'square', 0.1),
    confirm: () => SoundFX.playTone(1200, 'triangle', 0.2)
};

// Gắn Event Hover/Click cho toàn bộ Button
document.addEventListener('click', (e) => { if(e.target.closest('button') || e.target.closest('.size-step')) SoundFX.click(); });
document.addEventListener('mouseover', (e) => { if(e.target.closest('button')) SoundFX.hover(); });

// --- 2. QUẢN LÝ GIAO DIỆN & MODAL ---
const UI = {
    currentTab: 'biom',
    sizeTexts: ["SIÊU NHỎ", "RẤT NHỎ", "NHỎ", "B.THƯỜNG", "LỚN", "RẤT LỚN", "SIÊU LỚN"],
    currentSize: "B.THƯỜNG",
    currentWaifu: "TOMBOY",
    activeBoxToFill: null,
    genData: { biom: [null, null], ultimate: [null], chaques: [null] },

    switchTab: function(tabId) {
        this.currentTab = tabId;
        document.body.className = `theme-${tabId}`;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === tabId));
        
        const titles = { biom: "BIOMNITRIX", ultimate: "ULTIMATE CORE", chaques: "CHAQUETRIX" };
        document.getElementById('core-title').textContent = titles[tabId];
        
        document.getElementById('chaquetrix-module').style.display = (tabId === 'chaques' || tabId === 'ultimate') ? 'block' : 'none';
        document.getElementById('waifu-grid').parentElement.style.display = tabId === 'chaques' ? 'block' : 'none';
        
        this.renderGenBoxes();
        document.getElementById('col-right').innerHTML = `
            <div class="state-view active" id="idle-view">
                <div class="core-anim-container"><div class="pulse-ring"></div></div>
                <p class="status-text">ĐANG CHỜ LỆNH HỆ THỐNG...</p>
            </div>`;
    },

    openModal: (id) => document.getElementById(id).classList.add('active'),
    closeModal: (id) => document.getElementById(id).classList.remove('active'),

    // --- POKEDEX GRID ---
    openPokedex: function(boxIndex = null) {
        this.activeBoxToFill = boxIndex; // Nếu null là mở để xem, có index là để chọn
        const grid = document.getElementById('dex-grid');
        grid.innerHTML = PokemonDB.map(p => `
            <div class="col-item" onclick="UI.selectPokemon(${p.id})">
                <img src="${p.img}">
                <span>${p.name}</span>
            </div>
        `).join('');
        this.openModal('modal-pokedex');
    },

    selectPokemon: function(id) {
        const pkmn = PokemonDB.find(p => p.id === id);
        if(this.activeBoxToFill !== null && pkmn) {
            this.genData[this.currentTab][this.activeBoxToFill] = pkmn;
            this.renderGenBoxes();
            SoundFX.confirm();
        }
        this.closeModal('modal-pokedex');
    },

    removePokemon: function(index, e) {
        e.stopPropagation();
        this.genData[this.currentTab][index] = null;
        this.renderGenBoxes();
    },

    // --- RENDER BOX ---
    renderGenBoxes: function() {
        const container = document.getElementById('gen-list-container');
        container.innerHTML = '';
        const dataArr = this.genData[this.currentTab];
        
        dataArr.forEach((pkmn, i) => {
            if(!pkmn) {
                container.innerHTML += `
                    <div class="gen-box empty" onclick="UI.openPokedex(${i})">
                        <div class="empty-ui">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span>NẠP MÃ GEN</span>
                        </div>
                    </div>`;
            } else {
                container.innerHTML += `
                    <div class="gen-box filled" onclick="UI.openPokedex(${i})">
                        <div class="filled-top">
                            <span>DNA SEQ #${pkmn.id}</span>
                            <button class="btn-remove" onclick="UI.removePokemon(${i}, event)">&times;</button>
                        </div>
                        <div class="filled-img"><img src="${pkmn.img}"></div>
                        <div class="filled-name">${pkmn.name}</div>
                        <div class="filled-size">HỆ: ${pkmn.types.join(' - ').toUpperCase()}</div>
                    </div>`;
            }
        });
    }
};

// Khởi tạo Event cho Scale 7 nấc
document.querySelectorAll('.size-step').forEach(el => {
    el.addEventListener('click', () => {
        document.querySelectorAll('.size-step').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
        UI.currentSize = UI.sizeTexts[parseInt(el.dataset.val) - 1];
        document.getElementById('size-label').textContent = UI.currentSize;
    });
});

// Khởi tạo Event cho Waifu Grid
document.querySelectorAll('.grid-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.grid-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('waifu-desc').textContent = btn.dataset.desc;
        UI.currentWaifu = btn.textContent;
    });
});

// --- 3. LÕI XỬ LÝ (CORE LOGIC) ---
const CoreLogic = {
    randomizeAll: function() {
        const arr = UI.genData[UI.currentTab];
        for(let i = 0; i < arr.length; i++) {
            arr[i] = getRandomPokemon();
        }
        UI.renderGenBoxes();
        SoundFX.confirm();
    },

    startSequence: function() {
        const arr = UI.genData[UI.currentTab];
        if(arr.includes(null)) {
            alert("CẢNH BÁO: Phải nạp đủ mã DNA trước khi dung hợp!"); return;
        }
        SoundFX.confirm();
        
        const colRight = document.getElementById('col-right');
        colRight.innerHTML = `
            <div class="state-view active" style="flex-direction:column; align-items:center;">
                <div class="core-anim-container"><div class="pulse-ring" style="border-color:var(--primary-color)"></div></div>
                <p class="status-text">ĐANG KẾT XUẤT HÌNH ẢNH API...</p>
            </div>
        `;

        setTimeout(() => { this.showResult(); }, 2000);
    },

    showResult: function() {
        const p1 = UI.genData[UI.currentTab][0];
        const p2 = UI.genData[UI.currentTab][1]; // Có thể undefined
        
        // 1. Lấy Image Prompt
        const imgPrompt = AIGenerator.buildImagePrompt(p1, p2, UI.currentTab, UI.currentSize, UI.currentWaifu);
        
        // 2. Lấy Text Lore
        const loreText = AIGenerator.buildLorePrompt(p1, p2, UI.currentTab, UI.currentWaifu);
        
        // 3. Đặt Tên
        let finalName = "";
        if(UI.currentTab === 'biom') finalName = (p1.name.substring(0, Math.ceil(p1.name.length/2)) + p2.name.substring(Math.floor(p2.name.length/2))).toUpperCase();
        else if (UI.currentTab === 'ultimate') finalName = `OMEGA ${p1.name}`;
        else finalName = `PROJECT: ${p1.name}`;

        // Render ra kết quả (Sử dụng ảnh base của p1 minh họa)
        const colRight = document.getElementById('col-right');
        colRight.innerHTML = `
            <div class="result-hologram active">
                <div class="ai-img-box"><img src="${p1.img}"></div>
                <div class="ai-data">
                    <h2 class="ai-name">${finalName}</h2>
                    <p class="ai-lore">"${loreText}"</p>
                    <div class="ai-prompt">
                        <strong>LỆNH GỬI API ẢNH:</strong><br>
                        ${imgPrompt}
                    </div>
                </div>
            </div>
        `;
        SoundFX.playTone(800, 'sine', 0.5);
    }
};

// Init UI ban đầu
UI.switchTab('biom');
