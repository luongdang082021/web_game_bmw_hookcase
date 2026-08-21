# BMW X3 Hookcase 🚗💥

Một mini game lái xe 2D pixel-art chạy hoàn toàn bằng HTML/CSS/JavaScript thuần
(không cần build tool, không phụ thuộc thư viện ngoài), chơi được ngay trên
trình duyệt và host miễn phí bằng **GitHub Pages**.

## Cách chơi

- Bạn điều khiển chiếc **BMW X3** (xe màu đen, phù hiệu xanh-trắng) di chuyển
  tự do lên/xuống/trái/phải trên đường 2 làn:
  - Làn bên phải (làn của bạn) là chiều xe bạn đang đi tới.
  - Làn bên trái là chiều xe ngược lại, các phương tiện chạy từ trên xuống.
  - Bên trái đường là hàng cây, bên phải là hàng đèn đường.
- **Điều khiển:**
  - Kéo chuột (hoặc chạm màn hình trên thiết bị cảm ứng) để lái xe trực tiếp.
  - Hoặc dùng phím mũi tên / `WASD`.
- **Mục tiêu chiến thắng:** phải tông trúng **cả hai** thứ sau trong một lượt chơi:
  1. 🌳 Một **cây** bên đường (bạn cần lái lấn ra lề để tông trúng).
  2. 👨‍👧 Chiếc xe của **người bố đang chở con gái** (xuất hiện ngẫu nhiên ở làn
     đối diện).
- Làn đối diện sẽ random xuất hiện 1 trong 5 loại phương tiện mỗi lượt:

  | Biểu tượng | Đối tượng | Kết quả nếu tông trúng |
  | --- | --- | --- |
  | 👨‍👧 | Bố chở con gái | ✅ Mục tiêu đúng |
  | 🐱 | Doraemon & Nobita cưỡi cỗ máy thời gian | ❌ Thua ngay |
  | 🥋 | Yamcha cưỡi mô tô bay | ❌ Thua ngay |
  | 🦊 | Naruto cưỡi Kurama | ❌ Thua ngay |
  | 💑 | Đôi tình nhân | ❌ Thua ngay |

- Tông nhầm bất kỳ phương tiện nào trong 4 loại còn lại → **thua ngay lập tức**.
- Hết đường (hết thời gian) mà chưa tông đủ **cả cây lẫn xe của bố chở con
  gái** → cũng **thua cuộc**.

## Cấu trúc dự án

```
.
├── index.html          # khung giao diện + canvas
├── css/style.css        # giao diện, HUD, overlay
├── js/sprites.js         # sprite pixel-art vẽ bằng code (không cần ảnh ngoài)
├── js/game.js             # vòng lặp game, input, va chạm, thắng/thua
└── .github/workflows/pages.yml  # tự động deploy GitHub Pages khi push vào main
```

Toàn bộ đồ họa pixel-art (xe BMW, cây, đèn đường, các nhân vật/phương tiện
mục tiêu) được vẽ trực tiếp bằng canvas (`js/sprites.js`) dưới dạng lưới pixel
định nghĩa bằng code — không cần tải file ảnh, nhẹ và dễ chỉnh sửa màu sắc/hình
dáng.

## Chạy thử ở local

Chỉ cần một static server bất kỳ, ví dụ:

```bash
python3 -m http.server 8080
# rồi mở http://localhost:8080
```

## Deploy bằng GitHub Pages

Repo đã có sẵn workflow `.github/workflows/pages.yml`: mỗi khi có push vào
nhánh `main`, GitHub Actions sẽ tự build & deploy trang tĩnh này lên GitHub
Pages.

Để bật, vào **Settings → Pages** của repo và chọn nguồn **GitHub Actions**
(chỉ cần làm một lần). Sau đó trang sẽ có tại:

```
https://<tên-user>.github.io/web_game_bmw_hookcase/
```
