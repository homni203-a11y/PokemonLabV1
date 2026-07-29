// Cấu hình dữ liệu hiển thị cho các Tab
const LAB_CONFIG = {
  biostone: {
    title: 'BIOSTONE',
    btnText: 'DUNG HỢP GEN'
  },
  ultimatestone: {
    title: 'ULTIMATESTONE',
    btnText: 'TIẾN HÓA MEGA'
  },
  chaquestone: {
    title: 'CHAQUESTONE',
    btnText: 'TRIỆU HỒI ĐỒNG HÀNH'
  }
};

// Dữ liệu giả lập Kho lưu trữ GEN Pokemon
const POKEMON_DATA = [
  { id: 1, name: "Charizard", genType: "Fire/Flying" },
  { id: 2, name: "Machamp", genType: "Fighting" },
  { id: 3, name: "Deoxys", genType: "Psychic" },
  { id: 4, name: "Diancie", genType: "Rock/Fairy" },
  { id: 5, name: "Rotom", genType: "Electric/Ghost" }
];

// Hàm render danh sách Pokemon
function renderPokemonList() {
  const container = document.getElementById('pokemon-list');
  container.innerHTML = ''; // Xóa rỗng trước khi render
  
  POKEMON_DATA.forEach(pokemon => {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.innerHTML = `
      <div class="pokemon-name">#${pokemon.id} ${pokemon.name}</div>
      <div class="pokemon-gen">Hệ GEN: ${pokemon.genType}</div>
    `;
    container.appendChild(card);
  });
}

// Xử lý sự kiện click chuyển Tab
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    // 1. Cập nhật trạng thái Active cho Tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    
    // 2. Lấy dữ liệu tab được chọn
    const selectedTab = e.target.getAttribute('data-tab');
    const config = LAB_CONFIG[selectedTab];
    
    // 3. Đổi Theme (Màu sắc) bằng cách đổi class trên body
    document.body.className = `theme-${selectedTab}`;
    
    // 4. Cập nhật text trên giao diện
    if (config) {
      document.getElementById('app-title').innerText = config.title;
      document.querySelector('.btn-text').innerText = config.btnText;
    }
  });
});

// Khởi chạy khi tải trang
window.addEventListener('DOMContentLoaded', () => {
  renderPokemonList();
});
