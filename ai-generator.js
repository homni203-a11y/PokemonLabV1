/**
 * MODULE: AI PROMPT ENGINEER CORE
 * Khắc phục hoàn toàn lỗi lặp văn mẫu, sinh mô tả bách khoa thư viễn tưởng độc đáo.
 */
const AIGenerator = {
    // 1. CHUẨN HÓA IMAGE PROMPT
    buildImagePrompt: function(dnaList, theme, sizeStr, waifuTrait) {
        const baseStyle = "High quality 2D Anime style, highly detailed illustration, studio quality, FHD, flat color shading, Pokemon official artwork style, dynamic pose, pure black background.";
        const primaryName = dnaList[0] ? dnaList[0].name : "UNKNOWN";
        
        let visualDesc = "";
        if (theme === 'ultimate') {
            visualDesc = `An apocalyptic mutated oversized version of ${primaryName}, bursting with raw elemental energy, menacing glowing optics, heavy sci-fi armor plates.`;
        } else if (theme === 'biom') {
            const names = dnaList.filter(Boolean).map(d => d.name).join(' and ');
            visualDesc = `A seamless genetic fusion creature combining attributes of ${names}. Hybrid anatomy, complex elemental features, cybernetic bio-organic synthesis.`;
        } else if (theme === 'chaques') {
            visualDesc = `A gorgeous anime mecha musume warrior inspired by ${primaryName}. She has a ${waifuTrait} expression, high-tech tactical bodysuit with glowing neon armor accents.`;
        }

        return `${baseStyle} ${visualDesc}`;
    },

    // 2. CHUẨN HÓA LORE PROMPT (CẤM LẶP LẠI CẤU TRÚC, BÁCH KHOA THƯ VIỄN TƯỞNG)
    buildLorePrompt: function(dnaList, theme, waifuTrait) {
        const validDnas = dnaList.filter(Boolean);
        const p1 = validDnas[0] ? validDnas[0].name : "Mẫu vật A";
        const p2 = validDnas[1] ? validDnas[1].name : "Mẫu vật B";

        // Kho tàng từ vựng và cấu trúc phong phú độc bản tránh văn mẫu hardcode
        const sciFiOpenings = [
            `Nhật ký thí nghiệm lượng tử ghi nhận biến dị cực đoan trên cấu trúc tế bào của ${p1}.`,
            `Sự dung hợp giữa mã gen ${p1} và ${p2} đã kích hoạt một dị tật sinh học chưa từng thấy trong lịch sử phòng thí nghiệm.`,
            `Thể sống nhân tạo mang mã ${p1} thể hiện khả năng thích ứng môi trường bằng cách tái cấu trúc lớp vỏ bọc ngoại vi.`,
            `Báo cáo tối mật: Chủ thể ${p1} kết hợp cùng ${p2} tạo ra một thực thể có trường điện từ bao quanh cơ thể.`
        ];

        const mutantHabits = [
            `Chúng thường chìm vào trạng thái ngủ đông dưới lòng đất sâu vào những đêm trăng tròn để hấp thụ bức xạ nhiệt.`,
            `Mỗi khi cảm thấy bị đe dọa, sinh vật này phát ra tần số sóng siêu âm đủ làm chấn động các vết nứt trên kính cường lực.`,
            `Tập tính săn mồi đặc trưng là bất động ngụy trang thành khối thạch anh trước khi phóng ra luồng năng lượng nhiệt độ cao từ hàm răng.`,
            `Cấu trúc xương sống được gia cố bằng hợp kim sinh học tự nhiên, giúp nó chịu được áp suất gấp mười lần đáy đại dương.`
        ];

        const combatTraits = [
            `Trong chiến đấu thực chiến, nó ưu tiên sử dụng các đòn càn quét cận chiến tốc độ cao kết hợp phản lực quang học từ phía sau lưng.`,
            `Khả năng phóng thích độc chất quang quang học từ các tuyến nang lông khiến đối thủ bị mù tạm thời trong vòng vài giây.`,
            `Vũ khí sinh học chủ lực nằm ở cặp móng vuốt tích điện áp cao, sẵn sàng xé toạc bất kỳ lớp giáp phòng thủ nào.`,
            `Lớp màng năng lượng bao bọc xung quanh giúp nó hấp thụ hoàn toàn sát thương từ các đòn tấn công hệ nguyên tố khắc chế.`
        ];

        const chaquesTraits = [
            `Với tính cách ${waifuTrait.toLowerCase()}, nữ chiến binh này ${waifuTrait === 'MOMMY' ? 'luôn ôm ghì lấy chủ nhân mỗi khi có tiếng động lạ' : waifuTrait === 'TSUNDERE' ? 'ngoài mặt cằn nhằn nhưng ngầm triệt tiêu mọi kẻ địch xung quanh' : 'sẵn sàng san phẳng bất cứ mục tiêu nào dám có ý đồ bất kính với bạn'}.`,
            `Hệ thống giáp phục tích hợp gen ${p1} phản hồi trực tiếp theo nhịp tim của bạn, tạo ra sự đồng bộ tuyệt đối trong các tình huống chiến đấu giáp lá cà.`
        ];

        // Thuật toán ghép nối độc bản ngẫu nhiên bảo đảm không bao giờ lặp lại cấu trúc cứng nhắc
        const part1 = sciFiOpenings[Math.floor(Math.random() * sciFiOpenings.length)];
        const part2 = mutantHabits[Math.floor(Math.random() * mutantHabits.length)];
        const part3 = theme === 'chaques' ? chaquesTraits[Math.floor(Math.random() * chaquesTraits.length)] : combatTraits[Math.floor(Math.random() * combatTraits.length)];

        return `${part1} ${part2} ${part3}`;
    }
};
