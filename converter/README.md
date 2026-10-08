# Alpha Video Converter

Web app chuyển video có kênh alpha thành MP4 xếp chồng (màu ở trên, mask ở dưới) cho
`react-native-transparent-video`. Chạy hoàn toàn trong trình duyệt bằng
[ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm); file không được tải lên máy chủ nào.

## Chạy

```sh
cd converter
npm install
npm run dev
```

Mở địa chỉ Vite in ra (mặc định `http://localhost:5173`). `npm run build` tạo bản tĩnh trong
`dist/`, đặt lên hosting tĩnh nào cũng được.

## Dùng

1. Kéo thả file xuất từ After Effects vào trang.
2. Chọn chiều rộng, tốc độ khung hình và chất lượng. Muốn file nhẹ nhất: giảm chiều rộng về
   đúng cỡ hiển thị, 24 fps, chất lượng "Nhẹ nhất".
3. Bấm **Chuyển đổi**, xem thử trên 4 nền gradient, rồi **Tải MP4**.
4. Chép file vào `demo/assets/videos/` và thêm vào `SOURCES` trong `demo/App.tsx`.

Định dạng đầu vào: ProRes 4444 (`.mov`) hoặc WebM VP9 có alpha. Video không có kênh alpha
sẽ bị từ chối.

## Yêu cầu khi xuất từ After Effects

- QuickTime, Apple ProRes 4444, Channels **RGB + Alpha**.
- Color: **Straight (Unmatted)**. Premultiplied làm viền bán trong suốt bị tối.
- Không âm thanh, tốc độ khung hình cố định.
- Cạnh dài của comp từ 1080 px trở xuống: file xuất ra cao gấp đôi comp.
- File nên dưới vài trăm MB vì toàn bộ được xử lý trong bộ nhớ của tab.

## Bên trong

Lệnh ffmpeg tương đương:

```sh
ffmpeg -i input.mov -filter_complex \
  "[0:v]scale=540:-2,setsar=1,format=rgba,split[c][a];[a]alphaextract[m];[c][m]vstack" \
  -c:v libx264 -preset medium -crf 26 -pix_fmt yuv420p -an -movflags +faststart output.mp4
```

Phần xem thử ghép hai nửa bằng WebGL shader giống cách thư viện làm trên Android
([`src/preview.js`](src/preview.js)).
