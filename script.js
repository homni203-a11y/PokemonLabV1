/**
 * HỆ THỐNG GEN POKEMON V2 - CORE SCRIPT
 */

// ==========================================
// 1. WEB AUDIO API (Tích hợp Volume)
// ==========================================
const AudioController = (function() {
    let ctx = null;
    let masterVolume = 0.5;

    function initCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
    }

    return {
        setVolume: (val) => { masterVolume = val / 100; },
        playBeep: function() {
            if(masterVolume <= 0) return;
            try {
                initCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(masterVolume * 0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(); osc.stop(ctx.currentTime + 0.1);
            } catch(e) {}
        },
        playGlitch: function() {
            if(masterVolume <= 0) return;
            try {
                initCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                let time = ctx.currentTime;
                for(let i=0; i<10; i++) {
                    osc.frequency.setValueAtTime(Math.random() * 1000 + 100, time);
                    time += 0.02;
                }
                gain.gain.setValueAtTime(masterVolume * 0.2, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, time);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(); osc.stop(time);
            } catch(e) {}
        }
    };
})();

document.addEventListener('click', (e) => {
    if(e.target.closest('button, .tab-btn, .sub-btn, .grid-btn, .gen-preview')) {
        if(e.target.closest('.dice-btn')) AudioController.playGlitch();
        else AudioController.playBeep();
    }
});

document.getElementById('vol-slider').addEventListener('input', (e) => {
    AudioController.setVolume(e.target.value);
});

// ==========================================
// 2. UI MODALS & NOTIFICATIONS
// ==========================================
const UI_MODAL = {
    open: (id) => document.getElementById(id).classList.add('active'),
    close: (id) => document.getElementById(id).classList.remove('active'),
    showToast: (msg) => {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    },
    openCollection: () => {
        const grid = document.getElementById('collection-grid');
        grid.innerHTML = '';
        if(AppLogic.collection.length === 0) {
            grid.innerHTML = '<p style="color:#aaa; font-size:12px; grid-column:1/-1; text-align:center;">Bộ sưu tập trống.</p>';
        } else {
            AppLogic.collection.forEach(p => {
                grid.innerHTML += `
                    <div class="col-item">
                        <img src="${p.img}" alt="${p.name}">
                        <span>${p.name}</span>
                    </div>
                `;
            });
        }
        UI_MODAL.open('modal-collection');
    }
};

// ==========================================
// 3. TAB STATE MANAGEMENT (ISOLATION)
// ==========================================
const TabManager = {
    current: 'biom',
    themes: ['biom', 'ultimate', 'chaques'],
    titles: { 'biom': 'LÕI ĐÁ BIOM', 'ultimate': 'LÕI ĐÁ ULTIMATE', 'chaques': 'LÕI ĐÁ CHAQUES' },
    states: {
        biom: { status: 'idle', resultData: null },
        ultimate: { status: 'idle', resultData: null },
        chaques: { status: 'idle', resultData: null }
    },
    switchTab: function(tabName) {
        this.current = tabName;
        document.body.className = `theme-${tabName}`;
        document.getElementById('core-title').textContent = this.titles[tabName];
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.target === `tab-${tabName}`));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tabName}`));
        
        this.renderRightColumn();
    },
    renderRightColumn: function() {
        const colRight = document.getElementById('col-right');
        const state = this.states[this.current];
        
        let html = '';
        if (state.status === 'idle') {
            html = `
                <div class="state-view active">
                    <svg class="hologram-pokeball" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="10 5" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5" />
                        <path d="M5 50 H95 M50 35 A15 15 0 1 0 50 65 A15 15 0 1 0 50 35 M45 50 A5 5 0 1 0 55 50 A5 5 0 1 0 45 50" fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <p class="blink-text">ĐANG CHỜ LỆNH...</p>
                </div>`;
        } else if (state.status === 'loading') {
            html = `
                <div class="state-view active">
                    <div class="shockwave"></div>
                    <div class="progress-container">
                        <p class="blink-text">ĐANG PHÂN TÍCH CHUỖI GEN...</p>
                        <div class="progress-bar-bg"><div class="progress-bar-fill" id="loading-fill-${this.current}" style="width:0%"></div></div>
                        <p class="progress-percent" id="loading-percent-${this.current}">0%</p>
                    </div>
                </div>`;
        } else if (state.status === 'result' && state.resultData) {
            const d = state.resultData;
            html = `
                <div class="state-view result-hologram active">
                    <div class="ai-image-frame">
                        <div class="scanline"></div>
                        <img src="${d.img}" alt="Hybrid" style="border-radius:14px;">
                    </div>
                    <div class="ai-stats-panel">
                        <h2 class="result-name">${d.name}</h2>
                        <div class="result-types">
                            ${d.types.map(t => `<span class="type-badge">${t}</span>`).join('')}
                        </div>
                        <p class="result-desc">${d.desc}</p>
                        <div class="stats-bars">
                            ${Object.keys(d.stats).map(s => `
                                <div class="stat-row"><span>${s.toUpperCase()}</span><div class="bar-bg"><div class="bar-fill" style="width:${d.stats[s]}%"></div></div></div>
                            `).join('')}
                        </div>
                        <div class="result-actions">
                            <button class="btn-save" onclick="AppLogic.saveToCollection()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                LƯU GEN
                            </button>
                        </div>
                    </div>
                </div>`;
        }
        colRight.innerHTML = html;
        // Đảm bảo style CSS map đúng màu primary cho svg bên trong nếu cần
        colRight.style.color = "var(--primary-color)"; 
    }
};

// Cycle Core Button
document.getElementById('btn-cycle-core').addEventListener('click', () => {
    let idx = TabManager.themes.indexOf(TabManager.current);
    idx = (idx + 1) % TabManager.themes.length;
    TabManager.switchTab(TabManager.themes[idx]);
});


// ==========================================
// 4. GEN BOX MANAGEMENT & POKEAPI
// ==========================================
const GenManager = {
    activeBoxId: null,
    counter: 0,
    
    createBox: function(containerId) {
        this.counter++;
        const boxId = `gen-box-${this.counter}`;
        const container = document.getElementById(containerId);
        
        const div = document.createElement('div');
        div.className = 'gen-box empty';
        div.id = boxId;
        div.dataset.pokeId = "";
        
        div.innerHTML = `
            <button class="clear-btn" title="Xóa ADN" onclick="GenManager.clearBox('${boxId}', event)">&times;</button>
            <div class="gen-preview" onclick="GenManager.openSearch('${boxId}')">
                <div class="scanline"></div>
                <div class="preview-content">
                    <svg class="default-dna" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M4 4l16 16M4 20L20 4M8 8l8 8M8 16l8-8"/></svg>
                </div>
                <div class="hover-overlay"><span>NHẤN ĐỂ ĐỔI DNA</span></div>
            </div>
            <div class="gen-name">TRỐNG</div>
        `;
        container.appendChild(div);
    },
    
    clearBox: function(boxId, event) {
        event.stopPropagation(); // Ngăn click vào preview
        const box = document.getElementById(boxId);
        box.classList.remove('has-data');
        box.dataset.pokeId = "";
        box.querySelector('.preview-content').innerHTML = `<svg class="default-dna" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M4 4l16 16M4 20L20 4M8 8l8 8M8 16l8-8"/></svg>`;
        box.querySelector('.gen-name').textContent = "TRỐNG";
    },

    openSearch: function(boxId) {
        this.activeBoxId = boxId;
        document.getElementById('pokemon-search-input').value = '';
        UI_MODAL.open('modal-search');
    },

    fetchAndSet: async function(query, boxId) {
        const box = document.getElementById(boxId);
        const preview = box.querySelector('.preview-content');
        const nameEl = box.querySelector('.gen-name');
        
        preview.innerHTML = `<span style="font-size:10px; color:#aaa;">LOADING...</span>`;
        
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toString().toLowerCase()}`);
            if(!res.ok) throw new Error('Not found');
            const data = await res.json();
            
            const imgUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
            preview.innerHTML = `<img src="${imgUrl}" alt="${data.name}">`;
            nameEl.textContent = data.name.toUpperCase();
            
            box.classList.add('has-data');
            box.dataset.pokeId = data.id;
            box.dataset.pokeName = data.name;
        } catch (e) {
            UI_MODAL.showToast('Không tìm thấy Pokemon này!');
            this.clearBox(boxId, {stopPropagation:()=>{}});
        }
    }
};

// Khởi tạo các ô Gen
GenManager.createBox('biom-gen-list');
GenManager.createBox('biom-gen-list');
GenManager.createBox('ultimate-gen-list');
GenManager.createBox('chaques-gen-list');

// Xử lý nút Search Modal
document.getElementById('btn-submit-search').addEventListener('click', () => {
    const val = document.getElementById('pokemon-search-input').value.trim();
    if(val && GenManager.activeBoxId) {
        GenManager.fetchAndSet(val, GenManager.activeBoxId);
        UI_MODAL.close('modal-search');
    }
});
document.getElementById('pokemon-search-input').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') document.getElementById('btn-submit-search').click();
});

// Nút +/- Tab Biomstone
let biomCount = 2;
document.getElementById('btn-add-gen').addEventListener('click', () => {
    if(biomCount < 5) {
        biomCount++;
        GenManager.createBox('biom-gen-list');
        document.getElementById('gen-count-display').textContent = biomCount;
    }
});
document.getElementById('btn-sub-gen').addEventListener('click', () => {
    if(biomCount > 2) {
        biomCount--;
        const list = document.getElementById('biom-gen-list');
        list.removeChild(list.lastElementChild);
        document.getElementById('gen-count-display').textContent = biomCount;
    }
});


// ==========================================
// 5. APPLICATION LOGIC & AI SIMULATION
// ==========================================
const AppLogic = {
    collection: [],
    
    rollDice: function(tabName) {
        const btn = document.querySelector(`#tab-${tabName} .dice-btn`);
        btn.classList.add('dice-shake');
        setTimeout(() => btn.classList.remove('dice-shake'), 500);

        // Tìm tất cả các box TRỐNG trong tab hiện tại
        const emptyBoxes = document.querySelectorAll(`#${tabName}-gen-list .gen-box:not(.has-data)`);
        if(emptyBoxes.length === 0) {
            UI_MODAL.showToast('Tất cả các ô đã đầy dữ liệu!');
            return;
        }
        
        emptyBoxes.forEach(box => {
            const randomId = Math.floor(Math.random() * 898) + 1; // Gen 1-8
            GenManager.fetchAndSet(randomId, box.id);
        });
    },

    startProcess: function(tabName) {
        // Validation: Đảm bảo có ít nhất 1 gen được nạp
        const loadedBoxes = document.querySelectorAll(`#${tabName}-gen-list .gen-box.has-data`);
        if(loadedBoxes.length === 0) {
            UI_MODAL.showToast('LỖI: Chưa nạp chuỗi gen nào!');
            return;
        }

        // Chuyển view mobile nếu cần
        if(window.innerWidth <= 768) {
            document.getElementById('col-left').classList.remove('active');
            document.getElementById('col-right').classList.add('active');
            document.getElementById('mobile-tab-lab').classList.remove('active');
            document.getElementById('mobile-tab-result').classList.add('active');
        }

        // Set State to Loading
        TabManager.states[tabName].status = 'loading';
        TabManager.renderRightColumn();

        // Giả lập Progress Bar
        let progress = 0;
        const fillBar = document.getElementById(`loading-fill-${tabName}`);
        const textPct = document.getElementById(`loading-percent-${tabName}`);
        
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    this.simulateAIModule(tabName, loadedBoxes);
                }, 500);
            }
            if(fillBar && textPct) {
                fillBar.style.width = progress + '%';
                textPct.textContent = progress + '%';
            }
        }, 300);
    },

    simulateAIModule: async function(tabName, baseElements) {
        /*
        Đây là Module AI. Trong thực tế, bạn thu thập param:
        let params = Array.from(baseElements).map(b => b.dataset.pokeName).join(' + ');
        const prompt = `Create a cyberpunk hybrid pokemon of ${params}...`;
        // Gửi fetch POST đến OpenAI / Midjourney tại đây
        */
        
        // Mocking delay sinh ảnh
        await new Promise(r => setTimeout(r, 1000));

        const names = Array.from(baseElements).map(b => b.dataset.pokeName || 'unknown');
        const prefixes = ["Neo", "Cyber", "Mecha", "Void", "Quantum"];
        const baseName = names[0].substring(0, 4) + (names[1] ? names[1].slice(-4) : "tron");
        const finalName = (prefixes[Math.floor(Math.random()*prefixes.length)] + "-" + baseName).toUpperCase();

        const data = {
            name: finalName,
            types: ["STEEL", "ELECTRIC"], // Mock
            desc: `Sinh vật được tổng hợp từ mã gen [${names.join(', ')}]. Sở hữu lớp giáp hợp kim nano có khả năng tự phục hồi và phát ra trường điện từ mạnh mẽ để vô hiệu hóa đối thủ.`,
            stats: { hp: 70, atk: 85, def: 90, spatk: 60, spdef: 65, spd: 80 },
            img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/137.png" // Placeholder Porygon (hợp theme sci-fi)
        };

        TabManager.states[tabName].status = 'result';
        TabManager.states[tabName].resultData = data;
        TabManager.renderRightColumn();
        AudioController.playBeep();
    },

    saveToCollection: function() {
        const currentData = TabManager.states[TabManager.current].resultData;
        if(currentData) {
            this.collection.push(currentData);
            UI_MODAL.showToast(`Đã lưu ${currentData.name} vào Bộ sưu tập!`);
        }
    }
};

// UI Toggles (Nút phụ trong các tab)
document.querySelectorAll('.toggle-group, .grid-options').forEach(group => {
    group.addEventListener('click', (e) => {
        const btn = e.target.closest('.sub-btn, .grid-btn');
        if(btn) {
            group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Xử lý riêng mô tả cho Waifu tab
            if(group.id === 'waifu-grid') {
                document.getElementById('waifu-desc').textContent = btn.dataset.desc;
            }
        }
    });
});

// Mobile Bottom Nav
document.getElementById('mobile-tab-lab').addEventListener('click', function() {
    document.getElementById('col-right').classList.remove('active');
    document.getElementById('col-left').classList.add('active');
    document.getElementById('mobile-tab-result').classList.remove('active');
    this.classList.add('active');
});
document.getElementById('mobile-tab-result').addEventListener('click', function() {
    document.getElementById('col-left').classList.remove('active');
    document.getElementById('col-right').classList.add('active');
    document.getElementById('mobile-tab-lab').classList.remove('active');
    this.classList.add('active');
});

// Tab PC Init
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => TabManager.switchTab(btn.dataset.theme.replace('theme-', '')));
});
TabManager.renderRightColumn(); // Khởi tạo ban đầu
