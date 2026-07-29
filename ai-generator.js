/**
 * HỆ THỐNG ĐIỀU KHIỂN CHÍNH (MAIN.JS)
 */

// --- 1. HỆ THỐNG ÂM THANH WEB AUDIO API (SFX) ---
const SoundFX = {
    enabled: true,
    ctx: new (window.AudioContext || window.webkitAudioContext)(),
    toggle: function() {
        this.enabled = !this.enabled;
        document.getElementById('btn-toggle-sound').textContent = this.enabled ? "ĐANG BẬT 🔊" : "ĐÃ TẮT 🔇";
    },
    playTone: function(freq, type, duration, detune = 0) {
        if (!this.enabled) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type; 
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.detune.setValueAtTime(detune, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(); osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
    },
    hover: () => SoundFX.playTone(550, 'sine', 0.08),
    click: () => SoundFX.playTone(850, 'square', 0.08),
    confirm: () => SoundFX.playTone(1200, 'triangle', 0.15),
    remove: () => SoundFX.playTone(300, 'sawtooth', 0.2, -50)
};

document.addEventListener('click', (e) => { 
    if(e.target.closest('button') || e.target.closest('.size-step') || e.target.closest('.col-item')) SoundFX.click(); 
});
document.addEventListener('mouseover', (e) => { 
    if(e.target.closest('button')) SoundFX.hover(); 
});

// --- 2. QUẢN LÝ GIAO DIỆN & STATE ---
const UI = {
    currentTab: 'biom',
    sizeTexts: ["SIÊU NHỎ", "RẤT NHỎ", "NHỎ", "B.THƯỜNG", "LỚN", "RẤT LỚN", "SIÊU LỚN"],
    currentSize: "B.THƯỜNG",
    currentWaifu: "TOMBOY",
    activeBoxToFill: null,
    
    genData: {
        ultimate: [null],
        biom: [null, null], 
        chaques: [null]
    },

    switchTab: function(tabId) {
        this.currentTab = tabId;
        document.body.className = `theme-${tabId}`;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === tabId));
        
        const titles = { ultimate: "LÕI ĐÁ ULTIMATE", biom: "LÕI ĐÁ BIOM", chaques: "LÕI ĐÁ CHAQUES" };
        document.getElementById('core-title').textContent = titles[tabId];
        
        document.getElementById('biom-slot-controls').style.display = (tabId === 'biom') ? 'flex' : 'none';
        document.getElementById('instability-container').style.display = (tabId === 'biom') ? 'block' : 'none';
        document.getElementById('chaquetrix-module').style.display = (tabId === 'chaques') ? 'block' : 'none';
        
        this.renderGenBoxes();
        if(tabId === 'biom') this.updateInstability();
        this.showIdleView();
    },

    switchMobileTab: function(viewName) {
        document.querySelectorAll('.m-nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`mnav-${viewName}`).classList.add('active');
        
        if(viewName === 'lab') {
            document.getElementById('col-left-panel').classList.add('mobile-active');
            document.getElementById('col-right').classList.remove('mobile-active');
        } else {
            document.getElementById('col-right').classList.add('mobile-active');
            document.getElementById('col-left-panel').classList.remove('mobile-active');
        }
    },

    showIdleView: function() {
        document.getElementById('idle-view').style.display = 'flex';
        document.getElementById('loading-view').style.display = 'none';
        document.getElementById('result-view').classList.remove('active');
    },

    openModal: (id) => document.getElementById(id).classList.add('active'),
    closeModal: (id) => document.getElementById(id).classList.remove('active'),

    adjustBiomSlots: function(change) {
        SoundFX.click();
        let currentLen = this.genData.biom.length;
        let newLen = currentLen + change;
        if(newLen >= 2 && newLen <= 5) {
            if(newLen > currentLen) {
                this.genData.biom.push(null);
            } else {
                this.genData.biom.pop();
            }
            document.getElementById('biom-slot-count').textContent = this.genData.biom.length;
            this.renderGenBoxes();
            this.updateInstability();
        }
    },

    updateInstability: function() {
        const filledCount = this.genData.biom.filter(Boolean).length;
        const totalSlots = this.genData.biom.length;
        const score = Math.min(100, Math.round((filledCount / totalSlots) * 35 + (totalSlots * 12)));
        document.getElementById('instability-val').textContent = `${score}%`;
        document.getElementById('instability-fill').style.width = `${score}%`;
    },

    openPokedex: function(boxIndex = null) {
        this.activeBoxToFill = boxIndex;
        this.renderPokedexGrid(PokemonDB);
        this.openModal('modal-pokedex');
    },

    renderPokedexGrid: function(list) {
        const grid = document.getElementById('dex-grid');
        grid.innerHTML = list.map(p => `
            <div class="col-item" onclick="UI.selectPokemon(${p.id})">
                <img src="${p.img}">
                <span>${p.name}</span>
            </div>
        `).join('');
    },

    filterPokedex: function(keyword) {
        const key = keyword.toLowerCase().trim();
        const filtered = PokemonDB.filter(p => p.name.toLowerCase().includes(key) || p.id.toString() === key);
        this.renderPokedexGrid(filtered);
    },

    selectPokemon: function(id) {
        const pkmn = PokemonDB.find(p => p.id === id);
        if(this.activeBoxToFill !== null && pkmn) {
            this.genData[this.currentTab][this.activeBoxToFill] = pkmn;
            this.renderGenBoxes();
            if(this.currentTab === 'biom') this.updateInstability();
            SoundFX.confirm();
        }
        this.closeModal('modal-pokedex');
    },

    removePokemon: function(index, e) {
        e.stopPropagation();
        SoundFX.remove();
        this.genData[this.currentTab][index] = null;
        this.renderGenBoxes();
        if(this.currentTab === 'biom') this.updateInstability();
    },

    renderGenBoxes: function() {
        const container = document.getElementById('gen-list-container');
        container.innerHTML = '';
        const dataArr = this.genData[this.currentTab];
        
        dataArr.forEach((pkmn, i) => {
            if(!pkmn) {
                container.innerHTML += `
                    <div class="gen-box empty" onclick="UI.openPokedex(${i})">
                        <div class="empty-ui">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                            <span>NẠP MÃ GEN #${i+1}</span>
                        </div>
                    </div>`;
            } else {
                container.innerHTML += `
                    <div class="gen-box filled" onclick="UI.openPokedex(${i})">
                        <div class="filled-top">
                            <span>GEN SEQ #${pkmn.id}</span>
                            <button class="btn-remove" onclick="UI.removePokemon(${i}, event)" title="Gỡ Pokemon">&times;</button>
                        </div>
                        <div class="filled-img">
                            <img src="${pkmn.img}">
                            <div class="hover-hint">NHẤN ĐỂ ĐỔI DNA</div>
                        </div>
                        <div class="filled-name">${pkmn.name}</div>
                        <div class="filled-size">${pkmn.types.join(' / ').toUpperCase()}</div>
                    </div>`;
            }
        });
    }
};

// Event handlers cho size & waifu
document.querySelectorAll('.size-step').forEach(el => {
    el.addEventListener('click', () => {
        document.querySelectorAll('.size-step').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
        UI.currentSize = UI.sizeTexts[parseInt(el.dataset.val) - 1];
        document.getElementById('size-label').textContent = UI.currentSize;
    });
});

document.querySelectorAll('.grid-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.grid-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('waifu-desc').textContent = btn.dataset.desc;
        UI.currentWaifu = btn.textContent;
    });
});

// --- 3. CORE LOGIC & PRELOAD AI ---
const CoreLogic = {
    randomizeAll: function() {
        const diceBtn = document.getElementById('dice-btn');
        diceBtn.classList.add('shaking');
        setTimeout(() => diceBtn.classList.remove('shaking'), 400);

        const arr = UI.genData[UI.currentTab];
        for(let i = 0; i < arr.length; i++) {
            arr[i] = getRandomPokemon();
        }
        UI.renderGenBoxes();
        if(UI.currentTab === 'biom') UI.updateInstability();
        SoundFX.confirm();
    },

    startSequence: async function() {
        const arr = UI.genData[UI.currentTab];
        if(arr.includes(null)) {
            alert("CẢNH BÁO LƯỢNG TỬ: Phải nạp đầy đủ tất cả các slot gen yêu cầu trước khi tiến hành khởi chạy!"); 
            return;
        }
        SoundFX.confirm();
        
        if(window.innerWidth <= 768) {
            UI.switchMobileTab('result');
        }

        document.getElementById('idle-view').style.display = 'none';
        document.getElementById('result-view').classList.remove('active');
        const loadingView = document.getElementById('loading-view');
        loadingView.style.display = 'flex';
        
        const progressFill = document.getElementById('progress-fill');
        const percentText = document.getElementById('progress-percent');
        const statusText = document.getElementById('loading-status-text');
        
        let currentPercent = 0;
        progressFill.style.width = '0%';
        percentText.textContent = '0%';

        // BƯỚC 1: THANH LOAD CHẠY GIẢ LẬP ĐẾN 85% ĐỂ CHỜ DỮ LIỆU
        statusText.textContent = "Đang trích xuất DNA & khởi tạo buồng lượng tử...";
        const simulatedLoad = setInterval(() => {
            if(currentPercent < 85) {
                currentPercent += Math.floor(Math.random() * 4) + 2;
                if(currentPercent > 85) currentPercent = 85;
                progressFill.style.width = `${currentPercent}%`;
                percentText.textContent = `${currentPercent}%`;
            }
        }, 120);

        try {
            const p1 = arr[0];
            const imgPrompt = AIGenerator.buildImagePrompt(arr, UI.currentTab, UI.currentSize, UI.currentWaifu);
            const aiImageUrl = AIGenerator.generateImageFromAPI(imgPrompt);
            
            statusText.textContent = "Hệ thống AI đang kết xuất đồ họa 2D Vector & Tổng hợp Lore...";

            // Đợi song song API Text (Gemini) và Cache ảnh AI tải xong 100%
            const [loreText] = await Promise.all([
                AIGenerator.generateLoreFromAPI(arr, UI.currentTab, UI.currentWaifu),
                new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // Tránh bị treo nếu mạng lỗi
                    img.src = aiImageUrl;
                })
            ]);

            // BƯỚC 2: KHI MỌI THỨ ĐÃ SẴN SÀNG -> CHẠY NỐT LÊN 100%
            clearInterval(simulatedLoad);
            currentPercent = 100;
            progressFill.style.width = `100%`;
            percentText.textContent = `100%`;
            statusText.textContent = "Hoàn tất kết xuất thực thể AI!";

            setTimeout(() => {
                loadingView.style.display = 'none';
                this.showResultData(arr, p1, imgPrompt, aiImageUrl, loreText);
            }, 400);

        } catch (err) {
            console.error(err);
            clearInterval(simulatedLoad);
            statusText.textContent = "Lỗi kết nối Đa vũ trụ. Đang hủy bỏ...";
            setTimeout(() => UI.showIdleView(), 2000);
        }
    },

    showResultData: function(arr, p1, imgPrompt, aiImageUrl, loreText) {
        let finalName = "";
        if(UI.currentTab === 'biom') {
            finalName = arr.map(p => p.name.substring(0, 3)).join('-').toUpperCase();
        } else if (UI.currentTab === 'ultimate') {
            finalName = `OMEGA ${p1.name.toUpperCase()}`;
        } else {
            finalName = `CHQ-${p1.name.toUpperCase()}`;
        }

        const resultView = document.getElementById('result-view');
        resultView.classList.add('active');
        resultView.innerHTML = `
            <div class="ai-img-box">
                <img src="${aiImageUrl}" alt="${finalName}" onerror="this.src='${p1.img}'">
            </div>
            <div class="ai-data">
                <h2 class="ai-name">${finalName}</h2>
                <p class="ai-lore">"${loreText}"</p>
                <div class="ai-prompt" style="font-size: 10px; opacity: 0.7; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px;">
                    <strong>[HIDDEN SYSTEM LOG - IMAGE PROMPT]:</strong><br>
                    ${imgPrompt}
                </div>
            </div>
        `;
        SoundFX.playTone(950, 'sine', 0.4);
    }
};

// --- KHỞI TẠO GIAO DIỆN MẶC ĐỊNH ---
UI.switchTab('biom');
