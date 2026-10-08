# Alpha Video Demo — react-native-transparent-video

Demo phát **video trong suốt (alpha)** trên React Native, chạy song song trên iOS và Android,
kèm công cụ chuyển video xuất từ After Effects sang định dạng thư viện cần. Repo này là bản
fork của
[status-im/react-native-transparent-video](https://github.com/status-im/react-native-transparent-video),
bổ sung:

- [`demo/`](demo): app React Native 0.87 để kiểm tra alpha trên nền gradient.
- [`converter/`](converter): công cụ một file HTML, chuyển video có alpha thành MP4 xếp chồng
  ngay trong trình duyệt.

![Converter ở giữa, cùng video chạy trên Android (trái) và iOS (phải)](docs/demo.gif)

Trong bản quay: file `Comp.mov` xuất từ After Effects (380 MB) được chuyển thành
`comp_stacked.mp4` (501 KB) bằng converter, rồi phát trong suốt trên Android (trái) và iOS
(phải) với 4 nền gradient. Bản quay đầy đủ: [docs/demo.mp4](docs/demo.mp4)

## Quy trình từ After Effects

1. Xuất comp ra QuickTime **Animation hoặc ProRes 4444, RGB + Alpha, Straight (Unmatted)**.
2. Tải
   [alpha-video-converter.html](https://github.com/hieutran0413/react-native-transparent-video/releases/latest/download/alpha-video-converter.html)
   (khoảng 41 MB), bấm đúp để mở bằng Chrome. Không cần cài đặt, video không rời khỏi máy.
3. Kéo thả file `.mov` vào, bấm **Chuyển đổi**, xem thử rồi **Tải MP4**.
4. Dùng file MP4 với `<TransparentVideo>` trong app.

Chi tiết và yêu cầu xuất file: [converter/README.md](converter/README.md).

## Chạy demo

```sh
git clone https://github.com/hieutran0413/react-native-transparent-video.git
cd react-native-transparent-video
```

Rồi chọn nền tảng:

```sh
./run-demo.sh ios
```

```sh
./run-demo.sh android
```

Script tự cài `node_modules`, chạy `pod install` (iOS), build, cài app lên máy ảo và mở
Metro. Lần build đầu mất vài phút.

### Yêu cầu

| | |
| --- | --- |
| Chung | Node >= 22.11 |
| iOS | macOS, Xcode, CocoaPods, một iOS Simulator |
| Android | Android SDK, JDK 17 (`JAVA_HOME`), một emulator đã tạo sẵn |

`ANDROID_HOME` mặc định là `~/Library/Android/sdk` nếu chưa đặt.

### Gặp lỗi?

- **Android báo `Unable to load script`**: Android 17 (API 37) chặn app debug kết nối Metro
  cho tới khi được cấp quyền local network. `run-demo.sh` đã tự cấp quyền; nếu vẫn lỗi, bấm
  **RELOAD** trong app.
- **Cổng 8081 đang bận**: đã có Metro chạy sẵn. Dùng `./run-demo.sh ios --no-packager`
  (tham số sau tên nền tảng được chuyển thẳng cho `react-native run-ios` / `run-android`).

## Trong demo có gì

- **Chọn nguồn video**: `comp` (video xuất từ After Effects qua converter), `alpha-demo`
  (video tự tạo), `parallax x6` (6 video mẫu của thư viện
  xếp chồng), `layer 4` (một lớp đơn).
- **4 card gradient Xanh / Đỏ / Tím / Vàng**: đổi nền phía sau video.
- Dòng chữ `BEHIND THE VIDEO` nằm dưới video. Alpha hoạt động khi nền gradient và dòng chữ
  hiện xuyên qua vùng trong suốt.

Code màn hình test: [`demo/App.tsx`](demo/App.tsx).

## Video alpha hoạt động thế nào

Thư viện không đọc kênh alpha thật của file. Nó dùng **alpha-packing**: một video H.264
thường có chiều cao gấp đôi, trong đó

- nửa trên là phần màu (RGB),
- nửa dưới là mask xám: trắng = hiện, đen = trong suốt.

Mask phải trùng vị trí với phần màu ở mọi frame; nếu lệch, video sẽ có quầng đen hoặc mất hình.

Cách nhanh nhất để tạo file này là dùng converter ở trên. Hoặc dùng ffmpeg trực tiếp:

```sh
ffmpeg -i input.mov -filter_complex \
  "[0:v]split[c][a];[a]alphaextract[m];[c][m]vstack" \
  -c:v libx264 -pix_fmt yuv420p output.mp4
```

### Thử với video của bạn

1. Chép file vào `demo/assets/videos/` (tên file chỉ dùng chữ thường, số và `_`).
2. Thêm vào mảng `SOURCES` trong [`demo/App.tsx`](demo/App.tsx).

## Dùng thư viện trong app của bạn

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

## Ghi nhận

Thư viện gốc do [Status](https://github.com/status-im/react-native-transparent-video) phát
triển, dựa trên bài viết của
[Quentin Fasquel](https://medium.com/@quentinfasquel/ios-transparent-video-with-coreimage-52cfb2544d54)
và [Tristan Ferré](https://medium.com/go-electra/unlock-transparency-in-videos-on-android-5dc43776cc72),
cùng repo [alpha-movie](https://github.com/pavelsemak/alpha-movie) của @pavelsemak và
[bản fork](https://github.com/nopol10/alpha-movie) của @nopol10.

## License

MIT
