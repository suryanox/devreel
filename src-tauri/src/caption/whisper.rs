use std::sync::atomic::{AtomicBool, Ordering};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use tauri::{AppHandle, Emitter};
use std::sync::{Arc, Mutex};

use super::Caption;

const SAMPLE_RATE: u32 = 16000;
const CHUNK_SECS: usize = 3;
const CHUNK_SIZE: usize = SAMPLE_RATE as usize * CHUNK_SECS;

pub fn run_stream(app: AppHandle, streaming: &AtomicBool) -> Result<(), String> {
    let host = cpal::default_host();
    let device = host
        .default_input_device()
        .ok_or("No input device found")?;

    let config = cpal::StreamConfig {
        channels: 1,
        sample_rate: cpal::SampleRate(SAMPLE_RATE),
        buffer_size: cpal::BufferSize::Default,
    };

    let buffer: Arc<Mutex<Vec<f32>>> = Arc::new(Mutex::new(Vec::new()));
    let buffer_clone = buffer.clone();
    let app_clone = app.clone();
    let mut caption_id: u64 = 0;
    let mut elapsed: f64 = 0.0;

    let stream = device
        .build_input_stream(
            &config,
            move |data: &[f32], _: &cpal::InputCallbackInfo| {
                let mut buf = buffer_clone.lock().unwrap();
                buf.extend_from_slice(data);

                if buf.len() >= CHUNK_SIZE {
                    let chunk: Vec<f32> = buf.drain(..CHUNK_SIZE).collect();
                    let text = transcribe_chunk(&chunk);

                    if !text.is_empty() {
                        let caption = Caption {
                            id: caption_id.to_string(),
                            text,
                            start_time: elapsed,
                            end_time: elapsed + CHUNK_SECS as f64,
                        };
                        caption_id += 1;
                        elapsed += CHUNK_SECS as f64;
                        let _ = app_clone.emit("caption_chunk", caption);
                    }
                }
            },
            |err| eprintln!("Caption stream error: {}", err),
            None,
        )
        .map_err(|e| e.to_string())?;

    stream.play().map_err(|e| e.to_string())?;

    while streaming.load(Ordering::SeqCst) {
        std::thread::sleep(std::time::Duration::from_millis(100));
    }

    drop(stream);
    Ok(())
}

fn transcribe_chunk(_samples: &[f32]) -> String {
    String::new()
}