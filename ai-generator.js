/**
 * MODULE: AI PROMPT ENGINEER CORE
 * Chịu trách nhiệm thiết kế cấu trúc lệnh chuẩn gửi cho Text & Image API
 */
const AIGenerator = {
    // 1. CHUẨN HÓA LẠI IMAGE PROMPT (GIẢI QUYẾT LỖI PIXEL ART)
    buildImagePrompt: function(dna1, dna2, theme, sizeStr, waifuTrait) {
        // Bắt buộc từ khóa chất lượng cao
        const baseStyle = "High quality 2D Anime style, highly detailed illustration, studio quality, FHD, flat color shading, Pokemon official artwork style, dynamic pose, pure black background.";
        
        let visualDesc = "";
        if (theme === 'ultimate') {
            visualDesc = `A mutated, extremely powerful oversized version of ${dna1.name}, bursting with elemental energy, glowing aura, menacing eyes, epic sci-fi armor parts.`;
        } else if (theme === 'biom') {
            visualDesc = `A flawless genetic fusion of ${dna1.name} and ${dna2.name}. Combining body structure and elemental types (${dna1.types.join(',')} and ${dna2.types.join(',')}), seamless hybrid creature.`;
        } else if (theme === 'chaques') {
            visualDesc = `A beautiful anime girl wearing a high-tech sci-fi suit heavily inspired by the pokemon ${dna1.name}. She has a ${waifuTrait} expression and posture. Mecha musume style, neon accents.`;
        }

        return `${baseStyle} ${visualDesc}`;
    },

    // 2. CHUẨN HÓA TEXT LORE (TIẾN SĨ SINH HỌC POKEMON)
    buildLorePrompt: function(dna1, dna2, theme, waifuTrait) {
        // Hệ thống sẽ gửi đoạn system prompt này cho API Text (OpenAI/Gemini)
        // Dưới đây là bộ khung (Framework) bắt buộc để AI không viết lặp lại văn mẫu.
        
        const systemRole = "Bạn là Giáo sư Lượng Tử, một chuyên gia sinh học Pokemon. Hãy viết 1 đoạn mô tả (tối đa 4 câu) bằng tiếng Việt cực kỳ sáng tạo, KHÔNG LẶP LẠI.";
        
        let context = "";
        if (theme === 'ultimate') {
            context = `Mô tả về sự tiến hóa ép xung của ${dna1.name}. Tập trung miêu tả: 1 đặc điểm cơ thể bị phóng đại, 1 hiện tượng vật lý kỳ lạ xảy ra xung quanh nó khi nổi giận, và mức độ tàn phá môi trường tự nhiên.`;
        } else if (theme === 'biom') {
            context = `Mô tả về sinh vật lai tạo giữa ${dna1.name} và ${dna2.name}. Tập trung miêu tả: Vũ khí đặc trưng hình thành từ sự kết hợp gen, cách nó săn mồi độc đáo, hoặc một lỗ hổng trong cấu trúc sinh học.`;
        } else if (theme === 'chaques') {
            context = `Mô tả về một nữ chiến binh nhân tạo mang mã gen ${dna1.name} và có tính cách [${waifuTrait}]. Tập trung miêu tả: Thói quen/hành động đặc trưng của cô ấy với chủ nhân, cách cô ấy sử dụng năng lượng hệ ${dna1.types.join(',')} trong chiến đấu.`;
        }

        // Để test giao diện mà không cần API key thực, ta sẽ viết một hàm giả lập LLM cực xịn ở đây:
        return this.mockLLMResponse(theme, dna1, dna2, waifuTrait);
    },

    mockLLMResponse: function(theme, p1, p2, waifu) {
        const hienTuong = ["làm bốc hơi hơi ẩm trong không khí", "bẻ cong không gian xung quanh", "phát ra sóng điện từ làm nhiễu radar", "khiến cỏ cây xung quanh héo úa ngay lập tức"];
        const vuKhi = ["lưỡi dao sinh học sắc bén", "lõi năng lượng rực sáng trước ngực", "cặp sừng hấp thụ tinh tú", "chiếc đuôi chứa dung dịch axit quang học"];
        
        if (theme === 'ultimate') {
            return `Báo cáo nghiên cứu: Thể đột biến của ${p1.name} đã vượt ngưỡng an toàn. Lớp da bên ngoài bong tróc để lộ những ${vuKhi[Math.floor(Math.random()*4)]}. Mỗi khi nó di chuyển, năng lượng khổng lồ rò rỉ ra ngoài ${hienTuong[Math.floor(Math.random()*4)]}. Mức độ thảm họa cấp S.`;
        } else if (theme === 'biom') {
            return `Kết quả cấy ghép chéo: Con lai kế thừa bản tính hung hăng của ${p1.name} và cấu trúc của ${p2.name}. Chúng săn mồi bằng cách sử dụng ${vuKhi[Math.floor(Math.random()*4)]}. Các tài liệu ghi nhận sinh vật này có tập tính ngụy trang cực kỳ tinh vi trong đêm.`;
        } else {
            const hanhDong = waifu === 'MOMMY' ? "luôn muốn ôm bạn vào lòng để bảo vệ khỏi sát thương vật lý" : 
                             waifu === 'TSUNDERE' ? "thường xuyên phàn nàn về mệnh lệnh nhưng luôn hoàn thành nhiệm vụ xuất sắc" :
                             waifu === 'YANDERE' ? "sẽ lập tức thiêu rụi bất cứ ai dám đến gần bạn với ý đồ xấu" : 
                             "luôn duy trì liên kết thần kinh để hỗ trợ chiến thuật";
            return `Mẫu vật nữ mang gen ${p1.name}. Đặc điểm nhận dạng: Tính cách ${waifu.toLowerCase()}, ${hanhDong}. Bộ giáp sinh học của cô ấy có thể ${hienTuong[Math.floor(Math.random()*4)]} khi bước vào trạng thái bảo vệ chủ nhân.`;
        }
    }
};
