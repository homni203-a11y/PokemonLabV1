/**
 * MODULE: GEMINI API INTEGRATION CORE (GitHub Pages Version)
 * Chuyên trách kết nối trực tiếp với Google Gemini API cho Text & Prompt Generation.
 */
const AIGenerator = {
    // 🔑 Dán API Key lấy từ Google AI Studio của bạn vào đây
    apiKey: "AQ.Ab8RN6JhXImix19AEaCoJYyR_DNyBrqoYcmpPJo7Zd05jt_RxA",

    // 1. GỌI GEMINI API ĐỂ SINH LORE ĐỘC BẢN CHO POKEMON LAI
    generateLoreFromAPI: async function(dnaList, theme, waifuTrait) {
        const validDnas = dnaList.filter(Boolean);
        if (validDnas.length === 0) {
            return "Chưa có mẫu vật DNA nào được nạp vào buồng lai tạo.";
        }
        
        const names = validDnas.map(d => d.name).join(', ');
        
        const prompt = `Bạn là một kỹ sư sinh học viễn tưởng trong một phòng thí nghiệm cyberpunk. 
        Hãy viết một đoạn bách khoa thư ngắn gọn (từ 2 đến 3 câu độc đáo) mô tả một sinh vật lai tạo từ các mẫu vật: ${names}. 
        Chủ đề hệ thống: ${theme.toUpperCase()}. Đặc trưng tính cách/ngoại hình: ${waifuTrait}. 
        CẤM lặp lại văn mẫu. Tập trung vào dị tật cơ thể, thói quen kỳ lạ hoặc khả năng chiến đấu thực chiến. Chỉ trả về kết quả đoạn văn mô tả bằng tiếng Việt, không kèm giải thích thêm.`;

        // Kiểm tra nếu chưa thay API Key
        if (this.apiKey === "YOUR_AI_STUDIO_API_KEY_HERE" || !this.apiKey) {
            return `[Chế độ giả lập an toàn]: Chủ thể lai tạo từ ${names} hiển thị cấu trúc tế bào đột biến dưới giao thức ${theme.toUpperCase()}. Hãy cập nhật API Key chính thức trong tệp ai-generator.js để kích hoạt trí tuệ nhân tạo lượng tử.`;
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text.trim();
            } else {
                return "Hệ thống lượng tử phản hồi dữ liệu trống hoặc không hợp lệ.";
            }
        } catch (error) {
            console.error("Lỗi khi kết nối Gemini API:", error);
            return "Lỗi kết nối lượng tử: Không thể truyền tải dữ liệu sinh học từ máy chủ trung tâm. Vui lòng kiểm tra lại đường truyền mạng hoặc khóa bảo mật.";
        }
    },

    // 2. XÂY DỰNG THÔNG SỐ PROMPT HÌNH ẢNH HIỂN THỊ
    buildImagePrompt: function(dnaList, theme, sizeStr, waifuTrait) {
        const validDnas = dnaList.filter(Boolean);
        const primaryName = validDnas[0] ? validDnas[0].name : "UNKNOWN";
        const names = validDnas.map(d => d.name).join(' + ');
        
        let styleDesc = "High quality 2D Anime style illustration, official Pokemon artwork style, clean line art, vivid cyberpunk lighting, pure black background.";
        
        if (theme === 'ultimate') {
            styleDesc += ` Apocalyptic mutated oversized biomechanical creature inspired by ${names}, glowing red optics, heavy armor plates.`;
        } else if (theme === 'biom') {
            styleDesc += ` Seamless genetic fusion hybrid creature combining traits of ${names}, organic cybernetics.`;
        } else if (theme === 'chaques') {
            styleDesc += ` High-tech anime mecha musume warrior inspired by ${names}, expression: ${waifuTrait}, tactical glowing neon suit.`;
        } else {
            styleDesc += ` Cybernetic hybrid pokemon fusion creature inspired by ${names}.`;
        }
        
        return styleDesc;
    }
};
