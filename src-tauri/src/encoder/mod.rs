pub mod ffmpeg;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportConfig {
    pub input_path: String,
    pub output_path: String,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub quality: ExportQuality,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExportQuality {
    Draft,
    High,
    Ultra,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportProgress {
    pub percent: f32,
    pub stage: String,
    pub eta_secs: u32,
}

#[tauri::command]
pub fn export_reel(app: AppHandle, config: ExportConfig) -> Result<String, String> {
    let app_clone = app.clone();

    std::thread::spawn(move || {
        let stages = vec![
            (10.0, "Preparing frames"),
            (30.0, "Compositing overlays"),
            (60.0, "Encoding video"),
            (85.0, "Muxing audio"),
            (100.0, "Finalizing"),
        ];

        for (percent, stage) in stages {
            let _ = app_clone.emit("export_progress", ExportProgress {
                percent,
                stage: stage.into(),
                eta_secs: ((100.0 - percent) / 10.0) as u32,
            });
            std::thread::sleep(std::time::Duration::from_millis(500));
        }

        match ffmpeg::encode(&app_clone, ExportConfig {
            input_path: String::new(),
            output_path: String::new(),
            width: 7680,
            height: 4320,
            fps: 60,
            quality: ExportQuality::Ultra,
        }) {
            Ok(path) => {
                let _ = app_clone.emit("export_complete", path);
            }
            Err(e) => {
                let _ = app_clone.emit("export_error", e);
            }
        }
    });

    Ok("export_started".into())
}