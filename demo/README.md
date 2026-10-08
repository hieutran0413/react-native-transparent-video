# AlphaVideoDemo

App React Native 0.87 để kiểm tra khả năng render video trong suốt (alpha) của
[`react-native-transparent-video`](../README.md) trên iOS và Android. App link thẳng vào
source của thư viện ở thư mục gốc repo (`../src`, `../ios`, `../android`).

Thư mục `example/` gốc dùng React Native 0.67 và không còn build được với Xcode / Android
toolchain hiện tại, nên demo này được tạo riêng.

## Màn hình test

- Hàng trên: chọn nguồn video — `comp` (video xuất từ After Effects qua
  [converter](../converter/README.md)), `alpha-demo` (video tự tạo), `parallax x6` (6 video mẫu
  của thư viện xếp chồng), `layer 4` (một lớp đơn).
- 4 card vuông **Xanh / Đỏ / Tím / Vàng**: đổi nền gradient phía sau video.
- Dòng chữ `BEHIND THE VIDEO` nằm dưới video. Nếu alpha hoạt động, nền gradient và dòng chữ
  hiện xuyên qua vùng trong suốt của video.

## Chạy

Từ thư mục gốc repo:

```sh
./run-demo.sh ios
./run-demo.sh android
```

Xem [README gốc](../README.md) để biết yêu cầu và cách xử lý lỗi.

## Dùng video của bạn

Thư viện không đọc kênh alpha thật của file video. Nó dùng định dạng **alpha-packing**:
một video H.264 thường, chiều cao gấp đôi, trong đó

- nửa trên là phần màu (RGB),
- nửa dưới là mask xám: trắng = hiện, đen = trong suốt.

Mask phải trùng vị trí với phần màu ở mọi frame, nếu lệch video sẽ có quầng đen hoặc bị
mất hình.

Từ một video có alpha thật (ví dụ ProRes 4444 hoặc WebM), có thể tạo file alpha-packing
bằng ffmpeg:

```sh
ffmpeg -i input.mov -filter_complex \
  "[0:v]split[c][a];[a]alphaextract[m];[c][m]vstack" \
  -c:v libx264 -pix_fmt yuv420p output.mp4
```

Sau đó:

1. Chép file vào `demo/assets/videos/`. Tên file chỉ dùng chữ thường, số và `_`.
2. Thêm vào mảng `SOURCES` trong [`App.tsx`](App.tsx).

```tsx
import TransparentVideo from 'react-native-transparent-video';

<TransparentVideo
  source={require('./assets/videos/my_video.mp4')}
  style={StyleSheet.absoluteFill}
  loop
/>
```

## Ghi chú kỹ thuật

- `ios/AlphaVideoDemo/AppDelegate.swift` dùng UIScene lifecycle (`SceneDelegate`), bắt buộc
  khi build với iOS 27 SDK.
- `metro.config.js` và `react-native.config.js` trỏ thư viện về thư mục gốc repo.
