startSequence: async function() {
        const arr = UI.genData[UI.currentTab];
        if(arr.includes(null)) {
            alert("CẢNH BÁO LƯỢNG TỬ: Phải nạp đầy đủ gen trước khi tiến hành!"); 
            return;
        }
        SoundFX.confirm();
        
        if(window.innerWidth <= 768) UI.switchMobileTab('result');

        document.getElementById('idle-view').style.display = 'none';
        document.getElementById('result-view').classList.remove('active');
        
        const loadingView = document.getElementById('loading-view');
        loadingView.style.display = 'flex';
        
        const progressFill = document.getElementById('progress-fill');
        const percentText = document.getElementById('progress-percent');
        const statusText = document.getElementById('loading-status-text');
        
        let currentPercent = 0;
        progressFill.style.width = '0%';
        percentText.textContent = '0%';

        // BƯỚC 1: THANH LOAD CHẠY GIẢ LẬP LÊN 85%
        statusText.textContent = "Đang trích xuất DNA & thiết lập không gian giả lập...";
        const simulatedLoad = setInterval(() => {
            if(currentPercent < 85) {
                currentPercent += Math.floor(Math.random() * 5) + 2;
                if(currentPercent > 85) currentPercent = 85;
                progressFill.style.width = `${currentPercent}%`;
                percentText.textContent = `${currentPercent}%`;
            }
        }, 150);

        try {
            // BƯỚC 2: GỌI API & CHỜ ĐỢI CẢ AI TEXT LẪN AI IMAGE XONG 100%
            const p1 = arr[0];
            const imgPrompt = AIGenerator.buildImagePrompt(arr, UI.currentTab, UI.currentSize, UI.currentWaifu);
            const aiImageUrl = AIGenerator.generateImageFromAPI(imgPrompt);
            
            statusText.textContent = "Hệ thống AI đang tổng hợp tế bào & vẽ 2D Vector (Có thể mất 10-15s)...";

            // Chạy song song 2 việc: Lấy chữ từ Gemini & Tải ảnh từ Pollinations
            const [loreText] = await Promise.all([
                AIGenerator.generateLoreFromAPI(arr, UI.currentTab, UI.currentWaifu),
                new Promise((resolve, reject) => {
                    // Ép trình duyệt tải ảnh ngầm vào cache
                    const img = new Image();
                    img.onload = () => resolve(); // Chỉ khi ảnh load xong mới đi tiếp
                    img.onerror = () => resolve(); // Lỗi cũng cho qua để không bị kẹt màn hình load
                    img.src = aiImageUrl;
                })
            ]);

            // BƯỚC 3: MỌI THỨ ĐÃ SẴN SÀNG -> ĐẨY THANH LOAD LÊN 100%
            clearInterval(simulatedLoad);
            currentPercent = 100;
            progressFill.style.width = `100%`;
            percentText.textContent = `100%`;
            statusText.textContent = "Hoàn tất kết xuất thực thể AI!";

            // Đợi 0.5s để người chơi thấy số 100% rồi mới bung màn hình kết quả
            setTimeout(() => {
                loadingView.style.display = 'none';
                this.showResultData(arr, p1, imgPrompt, aiImageUrl, loreText);
            }, 500);

        } catch (err) {
            console.error(err);
            clearInterval(simulatedLoad);
            statusText.textContent = "Lỗi kết nối Đa vũ trụ. Đang hủy bỏ...";
            setTimeout(() => UI.showIdleView(), 2000);
        }
    },

    // Hàm phụ để hiển thị sau khi đã load xong hết
    showResultData: function(arr, p1, imgPrompt, aiImageUrl, loreText) {
        let finalName = "";
        if(UI.currentTab === 'biom') {
            finalName = arr.map(p => p.name.substring(0, 3)).join('-').toUpperCase();
        } else if (UI.currentTab === 'ultimate') {
            finalName = `OMEGA ${p1.name.toUpperCase()}`;
        } else {
            finalName = `CHQ-${p1.name.toUpperCase()}`;
        }

        const resultView = document.getElementById('result-view');
        resultView.classList.add('active');
        resultView.innerHTML = `
            <div class="ai-img-box">
                <!-- Do đã tải ngầm ở trên, nên khi chèn thẻ img này nó sẽ hiện ra ngay lập tức -->
                <img src="${aiImageUrl}" alt="${finalName}" onerror="this.src='${p1.img}'">
            </div>
            <div class="ai-data">
                <h2 class="ai-name">${finalName}</h2>
                <p class="ai-lore">"${loreText}"</p>
                <div class="ai-prompt" style="font-size: 10px; opacity: 0.7; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px;">
                    <strong>[HIDDEN SYSTEM LOG - IMAGE PROMPT]:</strong><br>
                    ${imgPrompt}
                </div>
            </div>
        `;
        SoundFX.playTone(950, 'sine', 0.4);
    }
};
