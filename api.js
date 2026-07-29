/**
 * ============================================================================
 *  MODULE: api.js
 *  CHỨC NĂNG:
 *  1) Các hàm fetch() GỌI DỊCH VỤ AI BÊN NGOÀI để sinh ảnh & sinh mô tả (lore)
 *     cho Alien Dung Hợp. Đây CHỈ LÀ KHUNG SƯỜN (boilerplate) — bạn cần tự
 *     điền API_KEY và endpoint thật của dịch vụ bạn muốn dùng (OpenAI, Stability
 *     AI, Gemini, Midjourney API, v.v...). Khi chưa điền API Key, hệ thống sẽ
 *     tự động dùng ảnh/placeholder thay thế để trang web không bị lỗi vỡ giao diện.
 *  2) Mock đăng nhập Google (mô phỏng UI, không cần backend thật) + khung sườn
 *     Firebase Auth thật để bạn nâng cấp khi cần.
 * ============================================================================
 */

/* ----------------------------------------------------------------------------
 * 1. AI SINH ẢNH (Image Generation)
 * -------------------------------------------------------------------------- */

// ⚠️ QUY TẮC BẮT BUỘC: Mọi prompt gửi tới AI sinh ảnh PHẢI LUÔN chứa đoạn style
// dưới đây để giữ đúng phong cách hoạt hình gốc của Ben 10 (2D, màu phẳng,
// vector, KHÔNG 3D, KHÔNG tả thực). Tuyệt đối không được bỏ đoạn này.
export const REQUIRED_STYLE_PROMPT =
  "2D anime style, exact flat colors, vector art, Ben 10 original cartoon aesthetic, strictly no 3D, no realism";

/**
 * Gọi AI sinh ảnh cho Alien Dung Hợp.
 * @param {string} alienName - Tên Alien Dung Hợp (VD: "Heatr8")
 * @param {string} description - Mô tả ngắn về ngoại hình / nguồn gốc dung hợp
 * @returns {Promise<string|null>} URL ảnh trả về từ AI, hoặc null nếu lỗi / chưa cấu hình
 */
export async function generateAlienImageAI(alienName, description) {
  // ĐIỀN THÔNG TIN DỊCH VỤ AI SINH ẢNH CỦA BẠN TẠI ĐÂY (VD: Stability AI, DALL-E...)
  const API_KEY = "";                                             // <-- Điền API Key tại đây
  const API_ENDPOINT = "https://api.your-image-ai-service.com/v1/generate"; // <-- Điền endpoint thật tại đây

  // Prompt cuối cùng LUÔN gắn kèm REQUIRED_STYLE_PROMPT ở cuối
  const fullPrompt = `${alienName}, a fused hybrid alien creature, ${description}, ${REQUIRED_STYLE_PROMPT}`;

  if (!API_KEY) {
    console.warn("⚠️ [OmnitrixLab] Chưa cấu hình API Key cho dịch vụ sinh ảnh AI. Dùng ảnh placeholder.");
    return null;
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        width: 512,
        height: 512
        // Tuỳ dịch vụ AI, có thể cần thêm các tham số khác (style_preset, negative_prompt, seed...)
      })
    });

    if (!response.ok) throw new Error(`API trả về lỗi: ${response.status}`);

    const data = await response.json();
    // ⚠️ Cấu trúc response khác nhau tuỳ dịch vụ — chỉnh lại dòng dưới cho đúng với
    // dịch vụ bạn dùng. VD ở đây giả định response có dạng { imageUrl: "..." }
    return data.imageUrl || null;
  } catch (error) {
    console.error("❌ [OmnitrixLab] Lỗi khi gọi AI sinh ảnh:", error);
    return null;
  }
}

/* ----------------------------------------------------------------------------
 * 2. AI SINH VĂN BẢN (Text / Lore Generation)
 * -------------------------------------------------------------------------- */

/**
 * Gọi AI sinh mô tả/lore cho Alien Dung Hợp dựa trên chỉ số & alien cha mẹ.
 * @param {object} fusedAlien - Object Alien Dung Hợp (kết quả từ performFusion())
 * @returns {Promise<string|null>} Đoạn văn mô tả do AI sinh ra, hoặc null nếu lỗi / chưa cấu hình
 */
export async function generateAlienLoreAI(fusedAlien) {
  // ĐIỀN THÔNG TIN DỊCH VỤ AI TEXT CỦA BẠN TẠI ĐÂY (VD: Claude API, OpenAI API...)
  const API_KEY = "";                                          // <-- Điền API Key tại đây
  const API_ENDPOINT = "https://api.your-text-ai-service.com/v1/chat"; // <-- Điền endpoint thật tại đây

  const parentNames = fusedAlien.parents.map((p) => p.name).join(" + ");
  const promptText =
    `Viết 2-3 câu mô tả (bằng tiếng Việt, giọng văn Pokédex khoa học viễn tưởng) cho một alien lai ` +
    `tên "${fusedAlien.name}", được dung hợp từ ${parentNames}, thuộc Hạng ${fusedAlien.rank}, ` +
    `Mức độ nguy hiểm ${fusedAlien.dangerLevel}.`;

  if (!API_KEY) {
    console.warn("⚠️ [OmnitrixLab] Chưa cấu hình API Key cho dịch vụ AI text. Dùng mô tả mặc định.");
    return null;
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: promptText }],
        max_tokens: 300
      })
    });

    if (!response.ok) throw new Error(`API trả về lỗi: ${response.status}`);

    const data = await response.json();
    // ⚠️ Chỉnh lại dòng dưới cho đúng cấu trúc response thật của dịch vụ bạn dùng
    return data.content?.[0]?.text || data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("❌ [OmnitrixLab] Lỗi khi gọi AI sinh văn bản:", error);
    return null;
  }
}

/* ----------------------------------------------------------------------------
 * 3. ĐĂNG NHẬP GOOGLE (Mock UI + khung sườn Firebase Auth thật)
 * -------------------------------------------------------------------------- */

/*
 * NÂNG CẤP LÊN FIREBASE AUTH THẬT (tuỳ chọn):
 * 1) Thêm vào index.html trước script main.js:
 *    <script type="module">
 *      import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
 *      import { getAuth, GoogleAuthProvider, signInWithPopup }
 *        from "https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js";
 *    </script>
 * 2) Điền cấu hình dự án Firebase của bạn:
 *    const firebaseConfig = {
 *      apiKey: "...", authDomain: "...", projectId: "...", appId: "..."
 *    };
 * 3) Thay hàm mockGoogleSignIn() bên dưới bằng:
 *    const auth = getAuth(initializeApp(firebaseConfig));
 *    const result = await signInWithPopup(auth, new GoogleAuthProvider());
 *    return { name: result.user.displayName, email: result.user.email, photo: result.user.photoURL };
 *
 * Ở BẢN DEMO này, ta dùng mock để trang chạy được ngay mà không cần cấu hình gì.
 */

const MOCK_ACCOUNTS = [
  { name: "Ben Tennyson", email: "ben10.hero@gmail.com", photo: "🧑‍🚀" },
  { name: "Gwen Tennyson", email: "gwen.anodite@gmail.com", photo: "🧙‍♀️" },
  { name: "Kevin Levin", email: "kevin.11@gmail.com", photo: "🧑‍🔧" }
];

/**
 * Mô phỏng luồng đăng nhập Google: trả về danh sách tài khoản demo để hiển thị
 * trong modal "chọn tài khoản" (giống hệt trải nghiệm Google thật).
 */
export function getMockAccounts() {
  return MOCK_ACCOUNTS;
}
