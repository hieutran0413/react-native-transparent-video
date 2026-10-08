# Video trong suốt cho React Native

Phát video có nền trong suốt trên iOS và Android, kèm công cụ chuyển file từ After Effects.

[![Converter ở giữa, cùng video chạy trên Android (trái) và iOS (phải)](docs/demo.gif)](docs/demo.mp4)

Bấm vào ảnh để xem bản quay nét hơn.

Bạn là ai?

- **Designer**: bạn làm video trong After Effects và cần xuất ra file cho dev. Xem [phần Designer](#designer).
- **Dev**: bạn nhận file từ designer và đưa vào app. Xem [phần Dev](#dev).

---

## Designer

Bạn chỉ cần làm 3 bước. Không phải cài gì thêm.

### Bước 1: Xuất video từ After Effects

Trong Output Module, chọn:

| Mục | Chọn |
| --- | --- |
| Format | QuickTime |
| Codec | Animation hoặc Apple ProRes 4444 |
| Channels | **RGB + Alpha** |
| Color | **Straight (Unmatted)** |
| Audio | Tắt |

Lưu ý:

- Comp cỡ 1080×1440 đã chạy tốt. Comp càng nhỏ, file cuối càng nhẹ.
- Nên chọn ProRes 4444 nếu file Animation quá nặng. File nguồn trên 500 MB có thể làm trình duyệt hết bộ nhớ.
- Đừng dùng blend mode (Add, Screen…) để hoà với nền. App chỉ nhận màu và độ trong suốt.

### Bước 2: Chuyển đổi

1. Tải [alpha-video-converter.html](https://github.com/hieutran0413/react-native-transparent-video/releases/latest/download/alpha-video-converter.html) (khoảng 41 MB).
2. Bấm đúp để mở bằng **Chrome**.
3. Kéo thả file `.mov` vào trang, rồi bấm **Chuyển đổi**.

Video được xử lý ngay trên máy bạn, không tải lên đâu cả.

Muốn file nhẹ nhất: chọn chiều rộng đúng bằng cỡ sẽ hiển thị trong app, 24 fps, chất lượng "Nhẹ nhất".

### Bước 3: Kiểm tra và gửi cho dev

- Xem phần **Xem thử trên nền**, bấm 4 ô màu để đổi nền. Nếu viền sạch, không có quầng tối là đạt.
- Bấm **Tải MP4** và gửi file đó cho dev.

File tải về trông lạ là bình thường: nửa trên là hình, nửa dưới là mặt nạ trắng đen. App sẽ tự ghép lại.

---

## Dev

### Chạy thử demo

Cần có sẵn: Node 22.11 trở lên, và Xcode + CocoaPods (iOS) hoặc Android SDK + JDK 17 + một emulator (Android).

```sh
git clone https://github.com/hieutran0413/react-native-transparent-video.git
cd react-native-transparent-video
```

```sh
./run-demo.sh ios
```

```sh
./run-demo.sh android
```

Script tự cài thư viện, build và mở app. Lần đầu mất vài phút.

Trong app: hàng trên để chọn video, 4 ô màu để đổi nền. Nếu thấy nền và dòng chữ `BEHIND THE VIDEO` hiện xuyên qua video là đã chạy đúng.

### Thử video của designer

1. Chép file MP4 vào `demo/assets/videos/`. Tên file chỉ dùng chữ thường, số và dấu `_`.
2. Thêm một dòng vào mảng `SOURCES` trong [`demo/App.tsx`](demo/App.tsx).

### Dùng trong app của bạn

```sh
npm install @status-im/react-native-transparent-video
```

```tsx
import TransparentVideo from '@status-im/react-native-transparent-video';

<TransparentVideo
  source={require('./assets/video.mp4')}
  style={StyleSheet.absoluteFill}
  loop
/>
```

### Gặp lỗi?

- **Android báo `Unable to load script`**: bấm **RELOAD** trong app. Android 17 chặn app debug kết nối Metro cho tới khi được cấp quyền mạng nội bộ; script đã tự cấp quyền này.
- **Cổng 8081 đang bận**: Metro đã chạy sẵn, dùng `./run-demo.sh ios --no-packager`.
- **Video có quầng tối quanh viền**: nhờ designer xuất lại với Color là Straight (Unmatted).

### Cấu trúc repo

| Thư mục | Nội dung |
| --- | --- |
| [`demo/`](demo/README.md) | App demo React Native 0.87 |
| [`converter/`](converter/README.md) | Mã nguồn công cụ chuyển đổi |
| `src/`, `ios/`, `android/` | Thư viện gốc |
| `example/` | Ví dụ gốc (React Native 0.67, không còn build được với Xcode mới) |

Cách thư viện hoạt động: video H.264 thường không có kênh trong suốt, nên file được xếp thành hai nửa (hình ở trên, mặt nạ ở dưới) và app ghép lại lúc phát. Chi tiết kỹ thuật và lệnh ffmpeg tương đương nằm trong [converter/README.md](converter/README.md).

---

## Ghi nhận

Repo này là bản fork của [status-im/react-native-transparent-video](https://github.com/status-im/react-native-transparent-video) (MIT), bổ sung app demo và công cụ chuyển đổi.
