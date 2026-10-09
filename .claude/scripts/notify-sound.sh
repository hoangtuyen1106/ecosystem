#!/bin/bash

# Script để phát âm thanh thông báo
# Sử dụng C:\Windows\Media\chimes.wav khi hoàn thành task

SOUND_TYPE=${1:-success}
SOUNDS_DIR="$(dirname "$0")/sounds"

# Đường dẫn đến Windows chimes.wav
WINDOWS_CHIMES="/mnt/c/Windows/Media/chimes.wav"
WINDOWS_CHIMES_PATH="C:\\Windows\\Media\\chimes.wav"

# Hàm phát âm thanh bằng PowerShell (Background process)
play_with_powershell() {
    local sound_path="$1"

    # Nếu là đường dẫn WSL, chuyển sang Windows path
    if [[ "$sound_path" == /mnt/c/* ]]; then
        sound_path="${sound_path/\/mnt\/c\//C:\\}"
        sound_path="${sound_path//\//\\}"
    fi

    # Phát âm thanh trong background
    (
        powershell.exe -NoProfile -Command "[System.Media.SoundPlayer]::new('$sound_path').PlaySync()" 2>/dev/null || \
        powershell.exe -NoProfile -Command "Add-Type -AssemblyName System.Media; [System.Media.SystemSounds]::Beep.Play()" 2>/dev/null
    ) &

    return 0
}

# Hàm phát âm thanh qua cmd.exe
play_with_cmd() {
    local sound_path="$1"

    (
        cmd.exe /c "powershell -Command \"[System.Media.SoundPlayer]::new('$sound_path').PlaySync()\"" 2>/dev/null
    ) &

    return 0
}

# Hàm phát âm thanh dùng ffplay
play_with_ffplay() {
    local sound_file=$1

    if command -v ffplay &> /dev/null; then
        ffplay -nodisp -autoexit -v 0 "$sound_file" 2>/dev/null &
        return 0
    fi
    return 1
}

# Hàm phát âm thanh dùng paplay
play_with_paplay() {
    local sound_file=$1

    if command -v paplay &> /dev/null; then
        paplay "$sound_file" 2>/dev/null &
        return 0
    fi
    return 1
}

# Hàm phát âm thanh dùng aplay
play_with_aplay() {
    local sound_file=$1

    if command -v aplay &> /dev/null; then
        aplay "$sound_file" 2>/dev/null &
        return 0
    fi
    return 1
}

# Main logic
play_notification() {
    local sound_type=$1

    if [ "$sound_type" = "success" ] && [ -f "$WINDOWS_CHIMES" ]; then
        # Ưu tiên 1: PowerShell trên Windows
        if command -v powershell.exe &> /dev/null; then
            play_with_powershell "$WINDOWS_CHIMES_PATH"
            return 0
        fi

        # Ưu tiên 2: cmd.exe
        if command -v cmd.exe &> /dev/null; then
            play_with_cmd "$WINDOWS_CHIMES_PATH"
            return 0
        fi
    fi

    # Kiểm tra custom sounds
    if [ -f "$SOUNDS_DIR/$sound_type.wav" ]; then
        # Thử ffplay
        play_with_ffplay "$SOUNDS_DIR/$sound_type.wav" && return 0

        # Thử paplay
        play_with_paplay "$SOUNDS_DIR/$sound_type.wav" && return 0

        # Thử aplay
        play_with_aplay "$SOUNDS_DIR/$sound_type.wav" && return 0
    fi

    if [ -f "$SOUNDS_DIR/$sound_type.mp3" ]; then
        play_with_ffplay "$SOUNDS_DIR/$sound_type.mp3" && return 0
    fi

    # Fallback: hiển thị thông báo
    case "$sound_type" in
        success)
            echo "✅ Hoàn thành thành công!"
            # Thử phát system beep
            printf '\a' 2>/dev/null || true
            ;;
        error)
            echo "❌ Có lỗi xảy ra!"
            printf '\a\a' 2>/dev/null || true
            ;;
        warning)
            echo "⚠️  Cảnh báo!"
            printf '\a' 2>/dev/null || true
            ;;
        info)
            echo "ℹ️  Thông tin"
            printf '\a' 2>/dev/null || true
            ;;
    esac

    return 0
}

# Chạy notification
play_notification "$SOUND_TYPE"
