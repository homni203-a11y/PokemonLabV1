/**
 * AI GENERATOR MODULE
 * Xử lý logic dung hợp gen động (Nội suy thông số, Đặt tên, Cốt truyện, Prompt tạo ảnh)
 */

const AIGenerator = {
    // 1. Phân tích & Trộn Chỉ Số (HP, ATK, DEF, SP.ATK, SP.DEF, SPD)
    generateStats: function(stats1, stats2, ratio = 0.5) {
        if(!stats2) return stats1; // Nếu chỉ có 1 cơ thể
        let newStats = {};
        const statKeys = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'spd'];
        const s1 = JSON.parse(stats1);
        const s2 = JSON.parse(stats2);
        
        statKeys.forEach((key, i) => {
            // Nội suy theo tỷ lệ (mặc định 50-50, hoặc nghiêng về Main)
            let val = Math.floor((s1[i] * ratio) + (s2[i] * (1 - ratio)));
            // Tính toán thêm "đột biến" (Random +- 10%)
            const mutation = val * (Math.random() * 0.2 - 0.1); 
            // Scale bar cho đẹp (Max 150)
            newStats[key] = Math.min(100, Math.max(10, ((val + mutation) / 150) * 100)); 
        });
        return newStats;
    },

    // 2. Sinh Tên Mới
    generateName: function(name1, name2, theme) {
        const prefixes = ['Cyber', 'Neo', 'Mecha', 'Giga', 'Omni'];
        const pfx = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        if(!name2) return `${pfx}-${name1.toUpperCase()}`; // Ultimate/Chaques
        
        // Cắt nửa tên Biom
        const part1 = name1.substring(0, Math.ceil(name1.length/2));
        const part2 = name2.substring(Math.floor(name2.length/2));
        return `${pfx}-${part1}${part2}`.toUpperCase();
    },

    // 3. Sinh Tiểu Sử / Đặc tính Sinh học
    generateDescription: function(typesArr, theme) {
        const typesStr = typesArr.join(" và ");
        if(theme === 'biom') return `Sinh vật lai tạo mang đặc tính gen hệ ${typesStr}. Cấu trúc cơ thể được tái tổ hợp, sở hữu khả năng thích nghi cao trong môi trường khắc nghiệt nhờ chuỗi DNA lai chéo 2 chiều.`;
        if(theme === 'ultimate') return `Hệ gen thuần túy hệ ${typesStr} đã vượt qua giới hạn sinh học, được Ép Xung để giải phóng lõi năng lượng lượng tử, mang lại sức mạnh tàn phá vượt trội.`;
        return `Đồng hành nhân tạo được triệu hồi từ dữ liệu hệ ${typesStr}. Giao thức tình cảm được tối ưu hóa, đảm bảo độ trung thành tuyệt đối và hỗ trợ tác chiến chiến thuật.`;
    },

    // 4. Viết Prompt tự động gửi API (Midjourney/Dall-E)
    generatePrompt: function(name1, name2, config) {
        let prompt = "A highly detailed, ultra-realistic masterpiece, cyberpunk style pokemon, ";
        if(config.theme === 'biom') {
            prompt += `fusion of ${name1} and ${name2}, mechanical parts, neon lights glowing, hybrid creature, bioluminescence, 8k resolution, volumetric lighting, dark sci-fi background.`;
        } else if(config.theme === 'ultimate') {
            prompt += `mutated massive ${name1}, overloaded with raw energy, glowing aura, hyper-aggressive stance, cinematic lighting, 8k, mechanical armor plates.`;
        } else {
            const waifuTrait = document.querySelector('#waifu-grid .active').innerText;
            prompt += `anime style waifu heavily inspired by ${name1}, ${waifuTrait} traits, sci-fi mechanical bodysuit, neon accents, beautiful face, highly detailed, dramatic lighting.`;
        }
        console.log("SEND THIS PROMPT TO MIDJOURNEY/DALL-E: ", prompt);
        return prompt;
    },

    // MAIN EXECUTION
    processFusion: function(tabName, loadedBoxes) {
        const p1 = loadedBoxes[0].dataset;
        const p2 = loadedBoxes.length > 1 ? loadedBoxes[1].dataset : null;
        
        // Xác định tỷ lệ trộn dựa vào UI
        let ratio = 0.5;
        if(tabName === 'biom') {
            const isBalance = document.querySelector('#mix-mode-toggle button[data-mode="can-bang"]').classList.contains('active');
            if(isBalance) {
                ratio = document.querySelector('.cyber-slider').value / 100;
            } else {
                ratio = document.getElementById('btn-main-1').classList.contains('active') ? 0.8 : 0.2; // Main/Sub ratio
            }
        }

        // Tạo dữ liệu
        const name = this.generateName(p1.pokeName, p2 ? p2.pokeName : null, tabName);
        const types = [...new Set(p1.pokeTypes.split(',').concat(p2 ? p2.pokeTypes.split(',') : []))];
        const stats = this.generateStats(p1.pokeStats, p2 ? p2.pokeStats : null, ratio);
        const desc = this.generateDescription(types, tabName);
        
        // Tạo Prompt
        this.generatePrompt(p1.pokeName, p2 ? p2.pokeName : null, {theme: tabName});

        // Tạo Fake Image (Sử dụng Image gốc của Con 1 tạm thời - trong thực tế sẽ gán URL từ API trả về)
        const fakeResultImg = document.querySelector(`#${loadedBoxes[0].id} img`).src;

        // Lưu vào State và Render
        TabManager.states[tabName].resultData = { name, types, desc, stats, img: fakeResultImg };
        TabManager.states[tabName].status = 'result';
        
        // Reset Box UI Level Color
        loadedBoxes.forEach(box => {
            box.querySelectorAll('.lvl-box').forEach(l => {l.style.background='transparent'; l.style.boxShadow='none';});
            const lvls = box.querySelectorAll('.lvl-box');
            if(lvls.length>0) {
               lvls[Math.floor(Math.random()*5)].style.background = 'var(--primary-color)';
            }
        });

        TabManager.renderRightColumn();
        
        // Xử lý Animation Bar-fill mượt mà
        setTimeout(() => {
            const rData = TabManager.states[tabName].resultData.stats;
            const bars = document.querySelectorAll('.state-view.active .bar-fill');
            Object.values(rData).forEach((val, i) => { if(bars[i]) bars[i].style.width = val + '%'; });
        }, 100);
    }
};
