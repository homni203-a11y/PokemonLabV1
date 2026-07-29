/**
 * MODULE: GEMINI & IMAGE AI INTEGRATION CORE
 * Chuyên trách suy luận prompt, kết nối Gemini API cho Text & Gọi AI sinh ảnh.
 */
const AIGenerator = {
    // 🔑 API Key Google AI Studio của bạn
    apiKey: "AQ.Ab8RN6JhXImix19AEaCoJYyR_DNyBrqoYcmpPJo7Zd05jt_RxA",

    // 1. TỰ ĐỘNG SUY LUẬN PROMPT MÔ TẢ HÌNH ẢNH (IMAGE PROMPT REASONING)
    buildImagePrompt: function(dnaList, theme, sizeStr, waifuTrait) {
        const validDnas = dnaList.filter(Boolean);
        if (validDnas.length === 0) return "A mysterious glowing cyberpunk creature egg";

        const names = validDnas.map(d => d.name).join(' and ');
        const types = validDnas.flatMap(d => d.types).join(', ');
        
        let styleDesc = "Masterpiece 2D anime style, official Pokemon artwork, clean line art, vibrant lighting, centered view, highly detailed.";
        
        if (theme === 'ultimate') {
            styleDesc += ` An apocalyptic mutated biomechanical titan creature, hybrid fusion of ${names}, elemental powers of ${types}, glowing neon red eyes, heavy armor plating, size: ${sizeStr}.`;
        } else if (theme === 'biom') {
            styleDesc += ` A seamless genetic mutated hybrid pokemon organism fusing traits of ${names}, elemental aura of ${types}, organic cybernetic details, size: ${sizeStr}.`;
        } else if (theme === 'chaques') {
            styleDesc += ` A sleek high-tech anime mecha musume waifu warrior inspired by ${names}, personality: ${waifuTrait}, wearing glowing elemental armor, size: ${sizeStr}.`;
        } else {
            styleDesc += ` Cybernetic hybrid pokemon creature inspired by ${names}.`;
        }
        
        return styleDesc;
    },

    // 2. GỌI GEMINI API ĐỂ SINH LORE / BÁCH KHOA THƯ (TEXT GENERATION)
    generateLoreFromAPI: async function(dnaList, theme, waifuTrait) {
        const validDnas = dnaList.filter(Boolean);
        if (validDnas.length === 0) {
            return "Chưa có mẫu vật DNA nào được nạp vào buồng lai tạo.";
        }
        
        const names = validDnas.map(d => d.name).join(', ');
        const types = validDnas.flatMap(d => d.types).join(', ');
        
        const prompt = `Bạn là một kỹ sư sinh học viễn tưởng trong phòng thí nghiệm cyberpunk.
Hãy viết một đoạn bách khoa thư Pokédex ngắn gọn (từ 2 đến 3 câu) mô tả sinh vật lai tạo đột biến từ các mẫu vật: ${names} (thuộc hệ ${types}).
Chủ đề dung hợp: ${theme.toUpperCase()}. Tính cách/Đặc trưng: ${waifuTrait}.
Tập trung vào đặc điểm sinh học, kỹ năng chiến đấu hoặc dị tật năng lượng. Viết hoàn toàn bằng tiếng Việt, giọng văn khoa học ngầu, không giải thích thêm.`;

        if (!this.apiKey || this.apiKey === "YOUR_AI_STUDIO_API_KEY_HERE") {
            return `[Chế độ giả lập]: Sinh vật lai tạo từ ${names} mang năng lượng đột biến thuộc hệ ${types}. Cập nhật API Key để kích hoạt Trí tuệ Lượng tử.`;
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text.trim();
            } else {
                return "Hệ thống lượng tử phản hồi dữ liệu trống.";
            }
        } catch (error) {
            console.error("Lỗi Gemini API:", error);
            return `Sinh vật lai tạo phức hợp giữa ${names}, kết hợp sức mạnh thần bí và công nghệ lượng tử cyberpunk.`;
        }
    },

    // Alias hỗ trợ gọi tương thích
    buildLorePrompt: async function(dnaList, theme, waifuTrait) {
        return await this.generateLoreFromAPI(dnaList, theme, waifuTrait);
    },

    // 3. TẠO ẢNH DỰA TRÊN PROMPT SUY LUẬN (IMAGE GENERATION)
    generateImageFromAPI: async function(promptText) {
        try {
            // Tự động tạo URL Render ảnh chất lượng cao từ Prompt được hệ thống suy luận
            const seed = Math.floor(Math.random() * 1000000);
            const encodedPrompt = encodeURIComponent(promptText);
            return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}&nologo=true&enhance=true`;
        } catch (e) {
            console.error("Lỗi sinh ảnh AI:", e);
            return null;
        }
    }
};
