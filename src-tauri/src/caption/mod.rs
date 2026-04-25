pub mod whisper;

use std::sync::atomic::{AtomicBool, Ordering};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

static STREAMING: AtomicBool = AtomicBool::new(false);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Caption {
    pub id: String,
    pub text: String,
    pub start_time: f64,
    pub end_time: f64,
}

#[tauri::command]
pub fn start_caption_stream(app: AppHandle) -> Result<(), String> {
    if STREAMING.load(Ordering::SeqCst) {
        return Ok(());
    }

    STREAMING.store(true, Ordering::SeqCst);

    std::thread::spawn(move || {
        if let Err(e) = whisper::run_stream(app.clone(), &STREAMING) {
            let _ = app.emit("caption_error", e);
        }
    });

    Ok(())
}

#[tauri::command]
pub fn stop_caption_stream() -> Result<(), String> {
    STREAMING.store(false, Ordering::SeqCst);
    Ok(())
}