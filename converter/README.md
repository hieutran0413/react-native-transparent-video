# Alpha Video Converter

Chuyển video có kênh alpha thành MP4 xếp chồng (màu ở trên, mask ở dưới) cho
`react-native-transparent-video`. Toàn bộ app là **một file HTML** mở trực tiếp bằng trình
duyệt, không cần cài đặt hay máy chủ. ffmpeg được nhúng sẵn trong file
([ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)) nên video không rời khỏi máy.

## Tạo file HTML

```sh
cd converter
npm install
npm run build
```

Kết quả: `dist/alpha-video-converter.html` (khoảng 41 MB). Gửi file này cho người dùng; họ chỉ
cần bấm đúp để mở bằng Chrome.

## Dùng

1. Kéo thả file xuất từ After Effects vào trang.
2. Chọn chiều rộng, tốc độ khung hình và chất lượng. Muốn file nhẹ nhất: giảm chiều rộng về
   đúng cỡ hiển thị, 24 fps, chất lượng "Nhẹ nhất".
3. Bấm **Chuyển đổi**, xem thử trên 4 nền gradient, rồi **Tải MP4**.

Định dạng đầu vào: QuickTime Animation hoặc ProRes 4444 (`.mov`), hoặc WebM VP9 có alpha. Video không có kênh alpha
sẽ bị từ chối.

## Yêu cầu khi xuất từ After Effects

- QuickTime (.mov), codec **Animation** hoặc **Apple ProRes 4444**, Channels **RGB + Alpha**.
  ProRes 4444 cho file nguồn nhỏ hơn nhiều.
- Color: **Straight (Unmatted)**. Premultiplied làm viền bán trong suốt bị tối.
- Không âm thanh, tốc độ khung hình cố định.
- File xuất ra cao gấp đôi comp. Comp 1080×1440 đã chạy tốt trên iOS và Android; comp lớn hơn
  thì chọn "Chiều rộng" nhỏ lại khi chuyển đổi.
- File nguồn 400 MB đã thử được. Trên 500 MB trình duyệt có thể hết bộ nhớ.

## Bên trong

- [`src/main.js`](src/main.js): giao diện và lệnh ffmpeg.
- [`src/worker.js`](src/worker.js): chạy ffmpeg trong Web Worker.
- [`src/preview.js`](src/preview.js): ghép hai nửa bằng WebGL để xem thử, giống cách thư viện
  làm trên Android.
- [`build.mjs`](build.mjs): gộp tất cả, kèm ffmpeg dạng base64, vào một file HTML.

Lệnh ffmpeg tương đương:

```sh
ffmpeg -i input.mov -filter_complex \
  "[0:v]scale=540:-2,setsar=1,format=rgba,split[c][a];[a]alphaextract[m];[c][m]vstack,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset medium -crf 26 -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -an -movflags +faststart output.mp4
```
