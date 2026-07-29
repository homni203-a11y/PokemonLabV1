/**
 * MODULE: GEMINI & IMAGE AI INTEGRATION CORE
 */
const AIGenerator = {
    // 🔑 API Key Google AI Studio của bạn
    apiKey: "AQ.Ab8RN6JhXImix19AEaCoJYyR_DNyBrqoYcmpPJo7Zd05jt_RxA",

    // 1. TỰ ĐỘNG SUY LUẬN PROMPT MÔ TẢ HÌNH ẢNH (CHIA 3 NHÁNH THEO YÊU CẦU)
    buildImagePrompt: function(dnaList, theme, sizeStr, waifuTrait) {
        const validDnas = dnaList.filter(Boolean);
        if (validDnas.length === 0) return "A mysterious glowing egg";

        const names = validDnas.map(d => d.name).join(' and ');
        const types = validDnas.flatMap(d => d.types).join(', ');
        
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

    // 2. GỌI GEMINI API ĐỂ SINH LORE CHI TIẾT
    generateLoreFromAPI: async function(dnaList, theme, waifuTrait) {
        const validDnas = dnaList.filter(Boolean);
        if (validDnas.length === 0) return "Chưa có mẫu vật DNA.";
        
        const names = validDnas.map(d => d.name).join(', ');
        const types = validDnas.flatMap(d => d.types).join(', ');
        
        let prompt = "";

        if (theme === 'ultimate') {
            prompt = `Bạn là hệ thống Pokedex tối thượng. Hãy viết 1 đoạn mô tả (khoảng 3 câu) bằng tiếng Việt: Pokémon ${names} bị ép phải tiến hóa đột biến trong môi trường khắc nghiệt trong thời gian hàng triệu năm để đạt được sức mạnh hủy diệt của hệ ${types}. Không giải thích thêm.`;
        
        } else if (theme === 'chaques') {
            prompt = `Bạn là hệ thống Pokedex. Hãy viết 1 đoạn mô tả (khoảng 3 câu) bằng tiếng Việt: Pokémon ${names} được áp dụng năng lượng Chaquestone để tạo thành 1 nữ chiến binh dạng cơ thể người. Cô ấy có tính cách ${waifuTrait}, dùng kỹ năng hệ ${types} để sát cánh và đồng hành bảo vệ người chơi. Không giải thích thêm.`;
        
        } else {
            prompt = `Bạn là hệ thống Pokedex. Hãy viết 1 đoạn mô tả (khoảng 3 câu) bằng tiếng Việt theo cấu trúc sau: "Sự kết hợp của ${names} tạo ra một sinh vật mới mang hình thái hòa trộn dựa trên đặc tính và kĩ năng của các Pokémon gốc. Nó sở hữu sức mạnh đột biến của hệ ${types}...". Hãy viết thật ngầu và không giải thích thêm.`;
        }

        if (!this.apiKey || this.apiKey === "YOUR_AI_STUDIO_API_KEY_HERE") {
            return `[Giả lập]: Lore của ${names} hệ ${types}. Đang chờ kết nối API.`;
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text.trim();
            }
            return "Hệ thống lượng tử phản hồi dữ liệu trống.";
        } catch (error) {
            console.error("Lỗi Gemini API:", error);
            return `Đã xảy ra lỗi kết nối sóng tâm linh khi truy xuất thông tin của ${names}.`;
        }
    },

    // Alias tương thích
    buildLorePrompt: async function(dnaList, theme, waifuTrait) {
        return await this.generateLoreFromAPI(dnaList, theme, waifuTrait);
    },

    // 3. TẠO URL ẢNH AI
    generateImageFromAPI: function(promptText) {
        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(promptText);
        return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}&model=anime&nologo=true&enhance=false`;
    }
};
