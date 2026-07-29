/**
 * HỆ THỐNG GEN POKEMON V2 - CORE SCRIPT (REFACTORED)
 */

// --- AUDIO ---
const AudioController = {
    vol: 0.5,
    setVolume: (v) => AudioController.vol = v/100,
    playBeep: () => { if(AudioController.vol>0) console.log("Beep sound played"); },
    playGlitch: () => { if(AudioController.vol>0) console.log("Glitch sound played"); }
};

document.getElementById('vol-slider').addEventListener('input', (e) => AudioController.setVolume(e.target.value));

// --- MODAL & UI ---
const UI_MODAL = {
    open: (id) => document.getElementById(id).classList.add('active'),
    close: (id) => document.getElementById(id).classList.remove('active'),
    showToast: (msg) => {
        const t = document.getElementById('toast');
        t.textContent = msg; t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    },
    openCollection: () => {
        const grid = document.getElementById('collection-grid');
        grid.innerHTML = AppLogic.collection.length === 0 
            ? '<p style="color:#aaa; font-size:12px; grid-column:1/-1; text-align:center;">Trống.</p>'
            : AppLogic.collection.map(p => `<div class="col-item"><img src="${p.img}"><span>${p.name}</span></div>`).join('');
        UI_MODAL.open('modal-collection');
    }
};

// --- TAB MANAGER ---
const TabManager = {
    current: 'biom',
    themes: ['biom', 'ultimate', 'chaques'],
    titles: { 'biom': 'LÕI ĐÁ BIOM', 'ultimate': 'LÕI ĐÁ ULTIMATE', 'chaques': 'LÕI ĐÁ CHAQUES' },
    states: { biom: { status: 'idle' }, ultimate: { status: 'idle' }, chaques: { status: 'idle' } },
    
    switchTab: function(tabName) {
        this.current = tabName;
        document.body.className = `theme-${tabName}`;
        document.getElementById('core-title').textContent = this.titles[tabName];
        
        // Đổi SVG Icon Header
        ['biom', 'ultimate', 'chaques'].forEach(id => {
            document.getElementById(`icon-${id}`).style.display = (id === tabName) ? 'block' : 'none';
        });

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.target === `tab-${tabName}`));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tabName}`));
        this.renderRightColumn();
    },

    renderRightColumn: function() {
        const colRight = document.getElementById('col-right');
        const state = this.states[this.current];
        let svgIcon = '';
        if(this.current === 'biom') svgIcon = `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>`;
        else if (this.current === 'ultimate') svgIcon = `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>`;
        else svgIcon = `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`;

        if (state.status === 'idle') {
            colRight.innerHTML = `
                <div class="state-view active">
                    <div class="core-anim-container">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">${svgIcon}</svg>
                    </div>
                    <p style="font-family:var(--font-mono); color:var(--primary-color); font-size:12px; letter-spacing:2px; animation:blink 1.5s infinite;">ĐANG CHỜ LỆNH...</p>
                </div>
            `;
        } else if (state.status === 'loading') {
            colRight.innerHTML = `
                <div class="state-view active">
                    <div class="core-anim-container">
                        <div class="shockwave"></div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">${svgIcon}</svg>
                    </div>
                    <div class="progress-container">
                        <p class="progress-text" id="loading-text-${this.current}">KHỞI ĐỘNG LÕI...</p>
                        <div class="progress-bar-wrapper">
                            <span class="progress-label">TIẾN TRÌNH LÕI</span>
                            <div class="progress-bar-bg"><div class="progress-bar-fill" id="loading-fill-${this.current}"></div></div>
                            <span class="progress-percent" id="loading-percent-${this.current}">0%</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (state.status === 'result' && state.resultData) {
            const d = state.resultData;
            colRight.innerHTML = `
                <div class="state-view result-hologram active">
                    <div class="ai-image-frame"><img src="${d.img}"></div>
                    <div class="ai-stats-panel">
                        <h2 class="result-name">${d.name}</h2>
                        <div class="result-types">${d.types.map(t => `<span class="type-badge">${t}</span>`).join('')}</div>
                        <p class="result-desc">${d.desc}</p>
                        <div class="stats-bars">
                            ${Object.keys(d.stats).map(s => `
                                <div class="stat-row"><span>${s.toUpperCase()}</span><div class="bar-bg"><div class="bar-fill" style="width:${d.stats[s]}%"></div></div></div>
                            `).join('')}
                        </div>
                        <button class="btn-save" onclick="AppLogic.saveToCollection()">LƯU GEN MỚI</button>
                    </div>
                </div>`;
        }
    }
};

document.getElementById('btn-cycle-core').addEventListener('click', () => {
    let idx = (TabManager.themes.indexOf(TabManager.current) + 1) % TabManager.themes.length;
    TabManager.switchTab(TabManager.themes[idx]);
});

// --- GEN BOX MANAGER ---
const GenManager = {
    activeBoxId: null, counter: 0,
    
    createBox: function(containerId, indexTitle) {
        this.counter++;
        const boxId = `gen-box-${this.counter}`;
        const container = document.getElementById(containerId);
        const div = document.createElement('div');
        div.className = 'gen-box empty';
        div.id = boxId;
        div.innerHTML = `
            <div class="gen-top">
                <span class="dna-label">ADN ${indexTitle}</span>
                <button class="clear-btn" onclick="GenManager.clearBox('${boxId}', event)">&times;</button>
            </div>
            <div class="gen-preview" onclick="GenManager.openSearch('${boxId}')">
                <div class="preview-content"><svg style="width:30px; color:#333;" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4l16 16M4 20L20 4M8 8l8 8M8 16l8-8"/></svg></div>
                <div class="hover-overlay"><span>ĐỔI DNA</span></div>
            </div>
            <div class="gen-name">TRỐNG</div>
            <div class="gen-bottom">
                <div class="size-info"><span>SIZE</span><span class="size-val">B.THƯỜNG</span></div>
                <div class="gene-level">
                    <div class="lvl-box"></div><div class="lvl-box"></div><div class="lvl-box"></div><div class="lvl-box"></div><div class="lvl-box"></div>
                </div>
            </div>
        `;
        container.appendChild(div);
    },
    
    clearBox: function(boxId, event) {
        event.stopPropagation();
        const box = document.getElementById(boxId);
        box.classList.remove('has-data');
        box.removeAttribute('data-poke-id');
        box.querySelector('.preview-content').innerHTML = `<svg style="width:30px; color:#333;" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4l16 16M4 20L20 4M8 8l8 8M8 16l8-8"/></svg>`;
        box.querySelector('.gen-name').textContent = "TRỐNG";
    },

    openSearch: function(boxId) {
        this.activeBoxId = boxId;
        document.getElementById('pokemon-search-input').value = '';
        if(document.getElementById('quick-pick-grid').children.length <= 1) this.loadQuickPicks();
        UI_MODAL.open('modal-search');
    },

    fetchAndSet: async function(query, boxId) {
        const box = document.getElementById(boxId);
        box.querySelector('.preview-content').innerHTML = `<span style="font-size:10px; color:#aaa;">LOADING</span>`;
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toString().toLowerCase()}`);
            if(!res.ok) throw new Error();
            const data = await res.json();
            box.querySelector('.preview-content').innerHTML = `<img src="${data.sprites.front_default}" alt="${data.name}">`;
            box.querySelector('.gen-name').textContent = data.name.toUpperCase();
            box.classList.add('has-data');
            box.dataset.pokeId = data.id; box.dataset.pokeName = data.name; box.dataset.pokeTypes = data.types.map(t=>t.type.name).join(',');
            box.dataset.pokeStats = JSON.stringify(data.stats.map(s => s.base_stat));
        } catch (e) {
            this.clearBox(boxId, {stopPropagation:()=>{}});
            UI_MODAL.showToast('Không tìm thấy Gen này!');
        }
    },

    loadQuickPicks: async function() {
        const grid = document.getElementById('quick-pick-grid');
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20`); // Load tạm 20 con cho nhanh
            const data = await res.json();
            grid.innerHTML = '';
            data.results.forEach((p, idx) => {
                const id = idx + 1;
                grid.innerHTML += `
                    <div class="col-item" onclick="document.getElementById('pokemon-search-input').value='${id}'; document.getElementById('btn-submit-search').click();">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png">
                        <span>${p.name.toUpperCase()}</span>
                    </div>`;
            });
        } catch(e) { grid.innerHTML = '<p>Lỗi kết nối CSDL.</p>'; }
    }
};

// Khởi tạo Box (Biom cần 2, Ultimate/Chaques cần 1)
GenManager.createBox('biom-gen-list', '1');
GenManager.createBox('biom-gen-list', '2');
GenManager.createBox('ultimate-gen-list', 'GỐC');
GenManager.createBox('chaques-gen-list', 'GỐC');

// Search Logic
document.getElementById('btn-submit-search').addEventListener('click', () => {
    const val = document.getElementById('pokemon-search-input').value.trim();
    if(val && GenManager.activeBoxId) {
        GenManager.fetchAndSet(val, GenManager.activeBoxId);
        UI_MODAL.close('modal-search');
    }
});

// UI Logic Biomstone Toggles
document.getElementById('mix-mode-toggle').addEventListener('click', (e) => {
    if(e.target.tagName === 'BUTTON') {
        document.querySelectorAll('#mix-mode-toggle button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const isBalance = e.target.dataset.mode === 'can-bang';
        document.getElementById('ui-can-bang').style.display = isBalance ? 'block' : 'none';
        document.getElementById('ui-chinh-phu').style.display = isBalance ? 'none' : 'flex';
    }
});
document.getElementById('ui-chinh-phu').addEventListener('click', (e) => {
    if(e.target.tagName === 'BUTTON') {
        document.getElementById('btn-main-1').classList.remove('active');
        document.getElementById('btn-main-2').classList.remove('active');
        e.target.classList.add('active');
    }
});


// --- APP LOGIC ---
const AppLogic = {
    collection: [],
    
    rollDice: function(tabName) {
        AudioController.playGlitch();
        // Lấy toàn bộ box (kể cả có data để ghi đè)
        const boxes = document.querySelectorAll(`#${tabName}-gen-list .gen-box`);
        boxes.forEach(box => {
            const randomId = Math.floor(Math.random() * 151) + 1; // Gen 1 cho quen thuộc
            GenManager.fetchAndSet(randomId, box.id);
        });
    },

    startProcess: function(tabName) {
        const loadedBoxes = document.querySelectorAll(`#${tabName}-gen-list .gen-box.has-data`);
        if(loadedBoxes.length === 0) return UI_MODAL.showToast('LỖI: Chưa có dữ liệu gen!');

        if(window.innerWidth <= 768) {
            document.getElementById('col-left').classList.remove('active');
            document.getElementById('col-right').classList.add('active');
            document.getElementById('mobile-tab-lab').classList.remove('active');
            document.getElementById('mobile-tab-result').classList.add('active');
        }

        TabManager.states[tabName].status = 'loading';
        TabManager.renderRightColumn();
        AudioController.playBeep();

        let progress = 0;
        const fillBar = document.getElementById(`loading-fill-${tabName}`);
        const textPct = document.getElementById(`loading-percent-${tabName}`);
        const textLabel = document.getElementById(`loading-text-${tabName}`);
        
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => AIGenerator.processFusion(tabName, Array.from(loadedBoxes)), 500);
            }
            if(fillBar && textPct && textLabel) {
                fillBar.style.width = progress + '%';
                textPct.textContent = progress + '%';
                if(progress < 31) textLabel.textContent = "ĐANG DUNG HỢP CHUỖI GEN CHÉO 2 CHIỀU...";
                else if(progress < 61) textLabel.textContent = "ĐANG KẾT XUẤT HÌNH THÁI VECTOR 2D...";
                else textLabel.textContent = "ĐANG HIỆU CHUẨN DẢI QUANG PHỔ LƯỢNG TỬ...";
            }
        }, 200);
    },

    saveToCollection: function() {
        const currentData = TabManager.states[TabManager.current].resultData;
        if(currentData) {
            this.collection.push(currentData);
            UI_MODAL.showToast(`Đã lưu trữ thành công!`);
        }
    }
};

// UI Toggles (Waifu)
document.getElementById('waifu-grid').addEventListener('click', (e) => {
    if(e.target.tagName === 'BUTTON') {
        document.querySelectorAll('#waifu-grid button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById('waifu-desc').textContent = e.target.dataset.desc;
    }
});

// Mobile Nav
document.getElementById('mobile-tab-lab').addEventListener('click', function() {
    document.getElementById('col-right').classList.remove('active'); document.getElementById('col-left').classList.add('active');
    document.getElementById('mobile-tab-result').classList.remove('active'); this.classList.add('active');
});
document.getElementById('mobile-tab-result').addEventListener('click', function() {
    document.getElementById('col-left').classList.remove('active'); document.getElementById('col-right').classList.add('active');
    document.getElementById('mobile-tab-lab').classList.remove('active'); this.classList.add('active');
});

// Init tabs
document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => TabManager.switchTab(btn.dataset.theme.replace('theme-', ''))));
TabManager.renderRightColumn();
