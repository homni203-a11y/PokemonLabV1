/**
 * MODULE: GEMINI & IMAGE AI INTEGRATION CORE (UPDATED)
 */
const AIGenerator = {
    // 🔑 API Key Google AI Studio của bạn
    apiKey: "AQ.Ab8RN6JhXImix19AEaCoJYyR_DNyBrqoYcmpPJo7Zd05jt_RxA",

    // 1. TỰ ĐỘNG SUY LUẬN PROMPT MÔ TẢ HÌNH ẢNH
    buildImagePrompt: function(dnaList, theme, sizeStr, waifuTrait) {
        const validDnas = dnaList.filter(Boolean);
        if (validDnas.length === 0) return "A mysterious glowing egg";

        const names = validDnas.map(d => d.name).join(' and ');
        const types = Array.from(new Set(validDnas.flatMap(d => d.types))).join(', ');
        
        // Phong cách bắt buộc: 2D vector Full HD, đậm chất Pokémon
        const baseStyle = "Authentic official Pokémon art style, 2D vector illustration, Full HD 1080p, flat colors, clean crisp vector lines, solid white background, high quality masterpiece.";
        
        let specificPrompt = "";

        if (theme === 'ultimate') {
            // Ultimatestone: Ép tiến hóa trong môi trường khắc nghiệt
            const env = types.includes('Fire') ? "magma core" : types.includes('Water') ? "abyssal trench" : "harsh radioactive apocalyptic";
            specificPrompt = `An ultimate mutated form of Pokémon ${names}. It was forced to evolve over thousands of years in a ${env} environment to achieve ultimate god-like power. Highly intimidating, glowing elemental aura of ${types}, complex monster design, size: ${sizeStr}.`;
        
        } else if (theme === 'chaques') {
            // Chaquestone: Nữ chiến binh đồng hành dạng người dựa trên tính cách
            specificPrompt = `Humanoid female anthropomorphic version of Pokémon ${names}. A beautiful anime girl companion working alongside the player. She has a ${waifuTrait} personality. Wearing a stylish outfit inspired by ${names} and ${types} types. Beautiful face, expressive eyes, size: ${sizeStr}.`;
        
        } else {
            // Biomstone: Dung hợp 2-5 Pokemon
            specificPrompt = `A seamless hybrid fusion Pokémon combining the DNA of ${names}. Blending their physical traits and ${types} elemental features harmoniously. New unique Pokémon species, size: ${sizeStr}.`;
        }
        
        return `${specificPrompt} ${baseStyle}`;
    },

    // 2. THUẬT TOÁN ĐẶT TÊN THÔNG MINH DỰ PHÒNG (LOCAL FALLBACK)
    generateSmartFallbackName: function(dnaList, theme) {
        const validDnas = dnaList.filter(Boolean);
        if (validDnas.length === 0) return "UNKNOWN-ENTITY";

        const names = validDnas.map(d => d.name);
        let fused = "";

        if (names.length === 1) {
            fused = names[0];
        } else if (names.length === 2) {
            // Lấy nửa đầu tên 1 + nửa sau tên 2 (Ví dụ: Pikachu + Mew = Pikew)
            const p1 = names[0].substring(0, Math.ceil(names[0].length / 2));
            const p2 = names[1].substring(Math.floor(names[1].length / 2));
            fused = p1 + p2;
        } else {
            // Dung hợp từ 3-5 Pokémon
            const parts = names.map((n, i) => {
                if (i === 0) return n.substring(0, Math.min(3, n.length));
                if (i === names.length - 1) return n.substring(Math.floor(n.length / 2));
                return n.substring(0, 2);
            });
            fused = parts.join('');
        }

        fused = fused.toUpperCase();

        if (theme === 'ultimate') return `OMEGA ${fused}`;
        if (theme === 'chaques') return `CHQ-${fused}`;
        return fused;
    },

    // 3. GỌI GEMINI API ĐỂ SINH DỮ LIỆU THỰC THỂ (SMART FUSION NAME & LORE THEO ĐẶC TÍNH)
    generateFusionDataFromAPI: async function(dnaList, theme, waifuTrait) {
        const validDnas = dnaList.filter(Boolean);
        if (validDnas.length === 0) {
            return { name: "KHÔNG XÁC ĐỊNH", lore: "Chưa có mẫu vật DNA." };
        }
        
        const names = validDnas.map(d => d.name).join(', ');
        const types = Array.from(new Set(validDnas.flatMap(d => d.types))).join(', ');
        const fallbackName = this.generateSmartFallbackName(validDnas, theme);

        let prompt = "";

        if (theme === 'ultimate') {
            prompt = `Bạn là hệ thống Pokedex Tối Thượng. Hãy phân tích các Pokémon gốc: ${names} (hệ: ${types}).
1. Sáng tạo 1 tên dung hợp tối thượng mượt mà, uy dũng kết hợp từ tên các Pokémon gốc (Ví dụ: OMEGA PIKEW, CHARSQUIRT OMEGA, hoặc OMEGA + tên ghép).
2. Viết 1 đoạn mô tả Lore sâu sắc (3 câu) bằng tiếng Việt: Môi trường khắc nghiệt hàng triệu năm ép sinh vật hòa trộn từ ${names} tiến hóa đột biến hình thái tối thượng, kết hợp hoàn hảo đặc tính, kỹ năng cùng hệ ${types}, bộc phát mức độ sức mạnh đột biến lượng tử ở cấp độ tuyệt diệt của Lõi Đá Ultimatestone.

Trả về kết quả chuẩn định dạng JSON duy nhất (không chứa ký tự mã bọc ```json...```) như sau:
{"name": "TÊN_DUNG_HỢP", "lore": "NỘI_DUNG_LORE"}`;
        
        } else if (theme === 'chaques') {
            prompt = `Bạn là hệ thống Pokedex Chaquetrix. Hãy phân tích các Pokémon gốc: ${names} (hệ: ${types}).
1. Sáng tạo 1 tên dung hợp mượt mà, độc đáo phong cách nữ chiến binh anime (Ví dụ: CHQ-PIKEW, CHARSQUIRTIA, CHQ-${validDnas[0].name}).
2. Viết 1 đoạn mô tả Lore sâu sắc (3 câu) bằng tiếng Việt: Năng lượng Lõi Đá Chaquestone tái tạo DNA của ${names} thành một nữ chiến binh dạng người (humanoid) mang tính cách ${waifuTrait}. Cô hòa trộn ngoại hình, đặc tính, kỹ năng cùng hệ ${types} của các Pokémon gốc, thể hiện mức độ sức mạnh đột biến đỉnh cao sẵn sàng đồng hành bảo vệ người chơi.

Trả về kết quả chuẩn định dạng JSON duy nhất (không chứa ký tự mã bọc ```json...```) như sau:
{"name": "TÊN_DUNG_HỢP", "lore": "NỘI_DUNG_LORE"}`;
        
        } else {
            // Biomstone
            prompt = `Bạn là hệ thống Pokedex Lượng Tử. Hãy phân tích các Pokémon gốc: ${names} (hệ: ${types}).
1. Sáng tạo 1 tên dung hợp (Smart Fusion Name) độc đáo, cực kỳ mượt mà bằng cách phân tích và ghép các âm tiết từ tên các Pokémon gốc (Ví dụ: Pikachu + Mew = Pikew; Charmander + Squirtle = Charsquirt; Charizard + Lucario = Charcario).
2. Viết 1 đoạn mô tả Lore sâu sắc (3 câu) bằng tiếng Việt: "Sự kết hợp năng lượng Lõi Đá Biomstone từ ${names} tạo ra một sinh vật mới mang hình thái hòa trộn dựa trên đặc tính, kỹ năng và hệ ${types} của các Pokémon gốc. Nó bộc phát mức độ sức mạnh đột biến lượng tử đa hệ vượt trội...".

Trả về kết quả chuẩn định dạng JSON duy nhất (không chứa ký tự mã bọc ```json...```) như sau:
{"name": "TÊN_DUNG_HỢP", "lore": "NỘI_DUNG_LORE"}`;
        }

        const fallbackLore = `Sự kết hợp của ${names} tạo ra sinh vật mới mang hình thái hòa trộn dựa trên đặc tính, kỹ năng và hệ ${types} của các Pokémon gốc, bộc phát mức độ sức mạnh đột biến lượng tử ấn tượng.`;

        if (!this.apiKey || this.apiKey === "YOUR_AI_STUDIO_API_KEY_HERE") {
            return { name: fallbackName, lore: `[Giả lập]: ${fallbackLore}` };
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            
            const data = await response.json();
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                let rawText = data.candidates[0].content.parts[0].text.trim();
                // Bóc tách Markdown JSON nếu có
                rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
                
                try {
                    const parsed = JSON.parse(rawText);
                    if (parsed.name && parsed.lore) {
                        return { name: parsed.name.toUpperCase(), lore: parsed.lore };
                    }
                } catch (e) {
                    return { name: fallbackName, lore: rawText };
                }
            }
            return { name: fallbackName, lore: fallbackLore };
        } catch (error) {
            console.error("Lỗi Gemini API:", error);
            return { name: fallbackName, lore: `Đã xảy ra lỗi kết nối đa vũ trụ khi truy xuất thông tin của ${names}.` };
        }
    },

    // Alias tương thích cũ
    generateLoreFromAPI: async function(dnaList, theme, waifuTrait) {
        const res = await this.generateFusionDataFromAPI(dnaList, theme, waifuTrait);
        return res.lore;
    },

    buildLorePrompt: async function(dnaList, theme, waifuTrait) {
        return await this.generateLoreFromAPI(dnaList, theme, waifuTrait);
    },

    // 4. TẠO URL ẢNH AI
    generateImageFromAPI: function(promptText) {
        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(promptText);
        return `[https://image.pollinations.ai/prompt/$](https://image.pollinations.ai/prompt/$){encodedPrompt}?width=512&height=512&seed=${seed}&model=anime&nologo=true&enhance=false`;
    }
};
