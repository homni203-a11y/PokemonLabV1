// Cấu hình Header và Text cho từng loại Đá/Thiết bị
const HEADER_CONFIG = {
  biostone: {
    title: 'BIOSTONE',
    subtitle: 'PokemonLab // Ash Ketchum',
    processText: 'PHÂN TÍCH GEN POKEMON...',
    btnText: 'DUNG HỢP GEN'
  },
  ultimatestone: {
    title: 'ULTIMATESTONE',
    subtitle: 'PokemonLab // Paul',
    processText: 'KÍCH HOẠT GEN TIẾN HÓA MEGA...',
    btnText: 'TIẾN HÓA MEGA'
  },
  chaquestone: {
    title: 'CHAQUESTONE',
    subtitle: 'PokemonLab // Brock',
    processText: 'ĐỒNG BỘ HÓA GEN ĐỒNG HÀNH...',
    btnText: 'TRIỆU HỒI ĐỒNG HÀNH'
  }
};

// Dữ liệu Pokemon
const POKEMON_DATA = [
  { id: 1, name: "Charizard", genType: "Fire/Flying", stats: { power: 8, speed: 6, durability: 7, intelligence: 6, energy: 9 } },
  { id: 2, name: "Machamp", genType: "Fighting", stats: { power: 10, speed: 5, durability: 9, intelligence: 4, energy: 5 } },
  { id: 3, name: "Deoxys", genType: "Psychic", stats: { power: 5, speed: 10, durability: 5, intelligence: 7, energy: 6 } }
];

// Hàm chuyển đổi theme
function switchTheme(themeName) {
  // Cập nhật class trên body
  document.body.className = '';
  document.body.classList.add(`theme-${themeName}`);
  
  // Cập nhật tiêu đề và text hiển thị
  const config = HEADER_CONFIG[themeName];
  if(config) {
    document.getElementById('app-title').innerText = config.title;
    document.querySelector('.btn-text').innerText = config.btnText;
    console.log(`[PokemonLab] Đã chuyển sang cấu hình: ${config.title}`);
  }
}

// Bắt sự kiện chuyển tab
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    // Xóa active class ở các tab khác
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('tab-active'));
    e.target.classList.add('tab-active');
    
    // Gọi hàm đổi theme
    const selectedTab = e.target.getAttribute('data-tab');
    switchTheme(selectedTab);
  });
});