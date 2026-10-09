# Script Thông báo Âm thanh

File: `.claude/scripts/notify-sound.sh`

## Mô tả

Script này phát âm thanh thông báo khi hoàn thành công việc, với hỗ trợ tự động phát hiện hệ thống âm thanh có sẵn.

## Cách sử dụng

```bash
# Phát âm thanh success (thành công)
./.claude/scripts/notify-sound.sh success

# Phát âm thanh error (lỗi)
./.claude/scripts/notify-sound.sh error

# Phát âm thanh warning (cảnh báo)
./.claude/scripts/notify-sound.sh warning

# Phát âm thanh info (thông tin)
./.claude/scripts/notify-sound.sh info
```

## Các loại âm thanh được hỗ trợ

- `success` - Âm thanh thành công (chime/ding)
- `error` - Âm thanh lỗi (alert)
- `warning` - Âm thanh cảnh báo (beep)
- `info` - Âm thanh thông tin (bell)

## Cách hoạt động

Script tự động phát hiện và sử dụng hệ thống âm thanh theo thứ tự ưu tiên:

1. **ffplay** (từ FFmpeg) - Tốt nhất cho MP3/WAV
2. **paplay** (PulseAudio) - Linux với PulseAudio
3. **aplay** (ALSA) - Linux với ALSA
4. **afplay** (macOS) - macOS
5. **beep** - Fallback: phát tiếng beep hệ thống

## Thêm file âm thanh tùy chỉnh

Để sử dụng file âm thanh tùy chỉnh, đặt các file vào thư mục `.claude/sounds/`:

```bash
mkdir -p .claude/sounds
# Copy file âm thanh của bạn
cp /đường/dẫn/success.mp3 .claude/sounds/
cp /đường/dẫn/error.mp3 .claude/sounds/
cp /đường/dẫn/warning.mp3 .claude/sounds/
cp /đường/dẫn/info.mp3 .claude/sounds/
```

## Tải file âm thanh từ nguồn công khai

**Các trang web cung cấp âm thanh miễn phí:**

- [Freesound.org](https://freesound.org/) - Thư viện âm thanh lớn
- [Zapsplat.com](https://www.zapsplat.com/) - Hiệu ứng âm thanh miễn phí
- [Pixabay Music](https://pixabay.com/music/) - Âm nhạc và âm thanh royalty-free
- [OpenGameArt.org](https://opengameart.org/) - Tài nguyên game bao gồm âm thanh
- [Notification Sounds](https://notificationsounds.com/) - Chuyên dụng cho thông báo

**Cách tải:**
1. Tìm âm thanh "success chime" hoặc "notification sound"
2. Tải file MP3 hoặc WAV
3. Đặt vào `.claude/sounds/` với tên là `success.mp3`, `error.mp3`, v.v.

## Tích hợp với Hooks

Script tự động được gọi khi:

- ✅ Hoàn thành công việc (TaskCompleted)
- ✅ Hoàn thành batch công cụ (PostToolBatch)
- ✅ Agent con hoàn thành (SubagentStop)

Được cấu hình trong `.claude/settings.json`:

```json
{
  "hooks": [
    {
      "event": "TaskCompleted",
      "commands": ["./.claude/scripts/notify-sound.sh success"]
    }
  ]
}
```

## Xử lý sự cố

### Không nghe thấy âm thanh

1. Kiểm tra script có quyền thực thi:
   ```bash
   chmod +x .claude/scripts/notify-sound.sh
   ```

2. Kiểm tra hệ thống âm thanh:
   ```bash
   # Linux
   pactl list sinks
   # macOS
   system_profiler SPAudioDataType
   ```

3. Thử phát thủ công:
   ```bash
   ./.claude/scripts/notify-sound.sh success
   ```

4. Nếu không có file âm thanh, script sẽ phát tiếng beep hệ thống

### Script không chạy

1. Kiểm tra đường dẫn:
   ```bash
   ls -la .claude/scripts/notify-sound.sh
   ```

2. Kiểm tra quyền:
   ```bash
   file .claude/scripts/notify-sound.sh
   ```

3. Chạy với bash trực tiếp:
   ```bash
   bash .claude/scripts/notify-sound.sh success
   ```

## Ví dụ sử dụng

```bash
# Trong script Bash
#!/bin/bash
./.claude/scripts/notify-sound.sh success
echo "Công việc đã hoàn thành!"

# Trong npm script (package.json)
{
  "scripts": {
    "build": "nx build && ./.claude/scripts/notify-sound.sh success"
  }
}

# Trong Makefile
.PHONY: build
build:
	nx build
	./.claude/scripts/notify-sound.sh success
```

## Tùy chỉnh thêm

Để tùy chỉnh âm thanh thêm, chỉnh sửa hàm `play_sound()` trong script:

```bash
# Ví dụ: thêm âm thanh tùy chỉnh
case "$SOUND_TYPE" in
    success) 
        ffplay -nodisp -autoexit "success.mp3" ;;
    custom)
        ffplay -nodisp -autoexit "custom.mp3" ;;
esac
```

---

**Ghi chú:** Script được thiết kế để hoạt động trên Linux, macOS và các hệ thống Unix khác.
