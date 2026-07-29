/**
 * HỆ THỐNG GEN POKEMON - CORE SCRIPT
 * Xử lý DOM, Web Audio API, PokeAPI, logic UI và mô phỏng AI.
 */

// ==========================================
// 1. WEB AUDIO API (SYNTHETIC SOUNDS)
// ==========================================
const AudioController = (function() {
    let ctx = null;

    function initCtx() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    return {
        playBeep: function() {
            try {
                initCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
                
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            } catch(e) {}
        },
        playGlitch: function() {
            try {
                initCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                
                // Randomize frequency rapidly to simulate glitch
                let time = ctx.currentTime;
                for(let i=0; i<10; i++) {
                    osc.frequency.setValueAtTime(Math.random() * 1000 + 100, time);
                    time += 0.02;
                }
                
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, time);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(time);
            } catch(e) {}
        }
    };
})();

// Gắn âm thanh bíp cho mọi thao tác click có ý nghĩa
document.addEventListener('click', (e) => {
    if(e.target.closest('button, .tab-btn, .sub-btn, .grid-btn')) {
        // Trừ nút xúc xắc vì có âm thanh riêng
        if(!e.target.closest('.dice-btn')) {
            AudioController.playBeep();
        }
    }
});

// ==========================================
// 2. STATE & THEME MANAGEMENT
// ==========================================
const body = document.body;
const coreTitle = document.getElementById('core-title');

const titles = {
    'theme-biom': 'LÕI ĐÁ BIOM',
    'theme-ultimate': 'LÕI ĐÁ ULTIMATE',
    'theme-chaques': 'LÕI ĐÁ CHAQUES'
};

// PC Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Đổi active button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Đổi content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(btn.dataset.target).classList.add('active');

        // Đổi Theme body
        body.className = '';
        body.classList.add(btn.dataset.theme);
        
        // Đổi Title Header
        coreTitle.textContent = titles[btn.dataset.theme];
    });
});

// Nút phụ (Toggle Logic)
document.querySelectorAll('.toggle-group, .grid-options').forEach(group => {
    group.addEventListener('click', (e) => {
        const btn = e.target.closest('.sub-btn, .grid-btn');
        if(btn) {
            group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    });
});

// Mô tả Waifu (Tab 3)
const waifuGrid = document.getElementById('waifu-grid');
const waifuDesc = document.getElementById('waifu-desc');
waifuGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.grid-btn');
    if(btn) {
        waifuDesc.textContent = btn.dataset.desc;
    }
});

// Mobile Bottom Navigation Logic
const colLeft = document.getElementById('col-left');
const colRight = document.getElementById('col-right');
const btnMobileLab = document.getElementById('mobile-tab-lab');
const btnMobileResult = document.getElementById('mobile-tab-result');

function switchToResultView() {
    if(window.innerWidth <= 768) {
        colLeft.classList.remove('active');
        colRight.classList.add('active');
        btnMobileLab.classList.remove('active');
        btnMobileResult.classList.add('active');
    }
}

btnMobileLab.addEventListener('click', () => {
    colRight.classList.remove('active');
    colLeft.classList.add('active');
    btnMobileResult.classList.remove('active');
    btnMobileLab.classList.add('active');
});
btnMobileResult.addEventListener('click', switchToResultView);

// ==========================================
// 3. POKEAPI & GEN INPUT LOGIC
// ==========================================
const template = document.getElementById('gen-input-template');

// Khởi tạo các ô nhập Gen cho từng tab
const biomList = document.getElementById('biom-gen-list');
const ultimateList = document.getElementById('ultimate-gen-list');
const chaquesList = document.getElementById('chaques-gen-list');
let biomCount = 2;

function createGenInput(container) {
    const clone = template.content.cloneNode(true);
    const box = clone.querySelector('.gen-box');
    const input = clone.querySelector('.poke-input');
    const diceBtn = clone.querySelector('.dice-btn');
    const previewContent = clone.querySelector('.preview-content');
    
    // Fetch API logic
    const fetchData = async (query) => {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
            if(!res.ok) throw new Error('Not found');
            const data = await res.json();
            const imgUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
            
            // Xóa SVG placeholder, thêm ảnh mới
            previewContent.innerHTML = `<img src="${imgUrl}" alt="pokemon">`;
            return data;
        } catch (error) {
            previewContent.innerHTML = `<svg class="default-dna" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path stroke-width="2" stroke="red" d="M12 2L2 22h20L12 2z"/></svg>`;
            return null;
        }
    };

    // Enter to search
    input.addEventListener('keypress', (e) => {
        if(e.key === 'Enter' && input.value.trim() !== '') {
            fetchData(input.value.trim());
        }
    });

    // Dice to random (1 - 1000)
    diceBtn.addEventListener('click', () => {
        AudioController.playGlitch();
        const randomId = Math.floor(Math.random() * 1000) + 1;
        input.value = randomId;
        fetchData(randomId.toString());
    });

    container.appendChild(box);
}

// Init mặc định
createGenInput(biomList);
createGenInput(biomList);
createGenInput(ultimateList);
createGenInput(chaquesList);

// Nút +/- của Tab 1 (Biomstone)
const btnAddGen = document.getElementById('btn-add-gen');
const btnSubGen = document.getElementById('btn-sub-gen');
const countDisplay = document.getElementById('gen-count-display');

btnAddGen.addEventListener('click', () => {
    if(biomCount < 5) {
        biomCount++;
        createGenInput(biomList);
        countDisplay.textContent = biomCount;
    }
});

btnSubGen.addEventListener('click', () => {
    if(biomCount > 2) {
        biomCount--;
        biomList.removeChild(biomList.lastElementChild);
        countDisplay.textContent = biomCount;
    }
});


// ==========================================
// 4. ACTION PROCESS & AI SIMULATION
// ==========================================
const stateIdle = document.getElementById('state-idle');
const stateLoading = document.getElementById('state-loading');
const stateResult = document.getElementById('state-result');

const loadingFill = document.getElementById('loading-fill');
const loadingPercent = document.getElementById('loading-percent');

// Gắn sự kiện cho 3 nút Action
document.getElementById('action-biom').addEventListener('click', () => startProcess('DUNG HỢP'));
document.getElementById('action-ultimate').addEventListener('click', () => startProcess('ÉP XUNG'));
document.getElementById('action-chaques').addEventListener('click', () => startProcess('TRIỆU HỒI'));

function startProcess(typeStr) {
    // 1. Chuyển UI Mobile sang tab kết quả
    switchToResultView();

    // 2. Ẩn Idle, Hiện Loading
    stateIdle.classList.remove('active');
    stateResult.classList.remove('active');
    stateLoading.classList.add('active');
    
    // Reset Progress
    let progress = 0;
    loadingFill.style.width = '0%';
    loadingPercent.textContent = '0%';

    // 3. Giả lập tiến trình (Progress bar chạy 0 - 100 trong ~3s)
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                showResult();
            }, 500);
        }
        loadingFill.style.width = progress + '%';
        loadingPercent.textContent = progress + '%';
    }, 300);
}

// Function giả lập fetch AI (để điền API OpenAI/Midjourney sau này)
async function generateAIImage(parameters) {
    /* 
    TODO: API Integration for AI Image Generator (DALL-E 3, Midjourney, Stable Diffusion, etc.)
    const apiKey = 'YOUR_API_KEY';
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "dall-e-3",
            prompt: `A futuristic sci-fi holographic rendering of ${parameters}`,
            n: 1,
            size: "1024x1024"
        })
    });
    const data = await response.json();
    return data.data[0].url;
    */
    
    // Dữ liệu giả lập (Placeholder mô phỏng đã load xong)
    return new Promise((resolve) => {
        setTimeout(() => resolve('rendered'), 1000); 
    });
}

async function showResult() {
    // Chuyển UI
    stateLoading.classList.remove('active');
    stateResult.classList.add('active');

    // Random Tên & Hệ
    const prefixes = ["Mecha", "Cyber", "Neo", "Omni", "Void", "Quantum"];
    const suffixes = ["tron", "zor", "x", " Prime", " Genesis"];
    const types = ["FIRE", "WATER", "ELECTRIC", "STEEL", "DRAGON", "DARK", "FAIRY"];
    
    document.getElementById('result-name').textContent = 
        prefixes[Math.floor(Math.random()*prefixes.length)] + "-" + suffixes[Math.floor(Math.random()*suffixes.length)];
    
    document.getElementById('result-types').innerHTML = `
        <span class="type-badge">${types[Math.floor(Math.random()*types.length)]}</span>
        <span class="type-badge">${types[Math.floor(Math.random()*types.length)]}</span>
    `;

    // Random Chỉ số (0 - 100%)
    const stats = ['hp', 'atk', 'def', 'spatk', 'spdef', 'spd'];
    stats.forEach(s => {
        const val = Math.floor(Math.random() * 60) + 40; // 40-100%
        // Delay nhẹ để tạo hiệu ứng thanh chạy
        setTimeout(() => {
            document.getElementById(`stat-${s}`).style.width = val + '%';
        }, 100);
    });

    // Gọi hàm AI Mock
    await generateAIImage("Futuristic Pokemon");
    // Vì không có ảnh thật nên giữ nguyên UI Placeholder Hologram, chỉ phát tiếng beep
    AudioController.playBeep();
}
