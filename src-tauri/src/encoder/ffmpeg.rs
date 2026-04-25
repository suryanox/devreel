use tauri::AppHandle;
use std::process::Command;
use super::ExportConfig;

pub fn encode(app: &AppHandle, config: ExportConfig) -> Result<String, String> {
    let output = config.output_path.clone();

    let ffmpeg_path = find_ffmpeg()?;

    let width = config.width;
    let height = config.height;
    let fps = config.fps;

    let crf = match config.quality {
        super::ExportQuality::Draft => "28",
        super::ExportQuality::High => "18",
        super::ExportQuality::Ultra => "12",
    };

    let status = Command::new(&ffmpeg_path)
        .args([
            "-y",
            "-f", "avfoundation",
            "-framerate", &fps.to_string(),
            "-i", "1:0",
            "-vf", &format!("scale={}:{}", width, height),
            "-c:v", "hevc_videotoolbox",
            "-crf", crf,
            "-tag:v", "hvc1",
            "-c:a", "aac",
            "-b:a", "320k",
            "-movflags", "+faststart",
            &output,
        ])
        .status()
        .map_err(|e| format!("Failed to run ffmpeg: {}", e))?;

    if status.success() {
        Ok(output)
    } else {
        Err("FFmpeg encoding failed".into())
    }
}

fn find_ffmpeg() -> Result<String, String> {
    let candidates = vec![
        "/opt/homebrew/bin/ffmpeg",
        "/usr/local/bin/ffmpeg",
        "ffmpeg",
    ];

    for path in candidates {
        if std::path::Path::new(path).exists() {
            return Ok(path.to_string());
        }
    }

    Err("FFmpeg not found. Install with: brew install ffmpeg".into())
}