#!/bin/bash

#########################################
# Video Quality Encoding Script
# Encodes a video into multiple quality levels
# for adaptive bitrate streaming
#########################################

set -e  # Exit on error

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: FFmpeg is not installed"
    echo "Install with:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu: sudo apt install ffmpeg"
    exit 1
fi

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: ./encode-video-qualities.sh <input_file> <output_dir> [qualities]"
    echo ""
    echo "Arguments:"
    echo "  input_file   : Path to the input video file"
    echo "  output_dir   : Directory to save encoded videos"
    echo "  qualities    : Optional comma-separated list (e.g., '4K,1080p,720p')"
    echo "                 Default: all qualities (4K,1440p,1080p,720p,480p)"
    echo ""
    echo "Examples:"
    echo "  ./encode-video-qualities.sh video.mp4 ./output"
    echo "  ./encode-video-qualities.sh video.mp4 ./output '1080p,720p'"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_DIR="$2"
QUALITIES="${3:-4K,1440p,1080p,720p,480p}"

# Validate input file
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Error: Input file not found: $INPUT_FILE"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🎬 Starting video encoding..."
echo "📹 Input: $INPUT_FILE"
echo "📁 Output: $OUTPUT_DIR"
echo "🎯 Qualities: $QUALITIES"
echo ""

# Function to encode a specific quality
encode_quality() {
    local quality=$1
    local output_file="$OUTPUT_DIR/${quality}.mp4"
    
    echo "⚙️  Encoding $quality..."
    
    case $quality in
        "4K")
            ffmpeg -i "$INPUT_FILE" \
                -vf scale=3840:2160 \
                -c:v libx264 -preset slow -crf 18 \
                -b:v 40M -maxrate 42M -bufsize 80M \
                -c:a aac -b:a 192k \
                -movflags +faststart \
                -y "$output_file" \
                2>&1 | grep -E 'time=|error' || true
            ;;
        "1440p")
            ffmpeg -i "$INPUT_FILE" \
                -vf scale=2560:1440 \
                -c:v libx264 -preset slow -crf 20 \
                -b:v 16M -maxrate 18M -bufsize 32M \
                -c:a aac -b:a 192k \
                -movflags +faststart \
                -y "$output_file" \
                2>&1 | grep -E 'time=|error' || true
            ;;
        "1080p")
            ffmpeg -i "$INPUT_FILE" \
                -vf scale=1920:1080 \
                -c:v libx264 -preset slow -crf 22 \
                -b:v 8M -maxrate 10M -bufsize 16M \
                -c:a aac -b:a 128k \
                -movflags +faststart \
                -y "$output_file" \
                2>&1 | grep -E 'time=|error' || true
            ;;
        "720p")
            ffmpeg -i "$INPUT_FILE" \
                -vf scale=1280:720 \
                -c:v libx264 -preset slow -crf 23 \
                -b:v 5M -maxrate 6M -bufsize 10M \
                -c:a aac -b:a 128k \
                -movflags +faststart \
                -y "$output_file" \
                2>&1 | grep -E 'time=|error' || true
            ;;
        "480p")
            ffmpeg -i "$INPUT_FILE" \
                -vf scale=854:480 \
                -c:v libx264 -preset slow -crf 24 \
                -b:v 2500k -maxrate 3M -bufsize 5M \
                -c:a aac -b:a 96k \
                -movflags +faststart \
                -y "$output_file" \
                2>&1 | grep -E 'time=|error' || true
            ;;
        *)
            echo "❌ Unknown quality: $quality"
            return 1
            ;;
    esac
    
    if [ -f "$output_file" ]; then
        local size=$(du -h "$output_file" | cut -f1)
        echo "✅ $quality complete - Size: $size"
        echo ""
    else
        echo "❌ Failed to encode $quality"
        return 1
    fi
}

# Encode each quality
IFS=',' read -ra QUALITY_ARRAY <<< "$QUALITIES"
for quality in "${QUALITY_ARRAY[@]}"; do
    encode_quality "$quality"
done

echo "🎉 Encoding complete!"
echo ""
echo "📊 Summary:"
ls -lh "$OUTPUT_DIR"/*.mp4 | awk '{print "   ", $9, "-", $5}'
echo ""
echo "Next steps:"
echo "1. Upload these files to UploadThing"
echo "2. Update your video database with the URLs"
echo "3. Use AdaptiveVideoPlayer component"
echo ""
echo "Example database structure:"
echo "{"
echo '  "videoQualities": {'

first=true
for quality in "${QUALITY_ARRAY[@]}"; do
    if [ "$first" = false ]; then
        echo ","
    fi
    echo -n '    "'$quality'": "https://utfs.io/f/your-video-'$quality'.mp4"'
    first=false
done

echo ""
echo "  }"
echo "}"
