#![allow(clippy::needless_return)]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize)]
struct CreateVybProjectInput {
  name: String,
  root_path: String,
}

#[derive(Debug, Serialize)]
struct CreateVybProjectOutput {
  created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ValidateVybProjectInput {
  root_path: String,
}

#[derive(Debug, Serialize)]
struct ValidateVybProjectOutput {
  valid: bool,
  errors: Vec<String>,
  warnings: Vec<String>,
  project: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
struct DetectImportResponse {
  markdown: String,
  report: serde_json::Value,
}

fn normalize_path(p: &str) -> String {
  // Preserve Windows paths as-is; callers pass platform-correct roots.
  p.to_string()
}

fn project_paths(root: &Path) -> (PathBuf, PathBuf, PathBuf, PathBuf) {
  let vyb_dir = root.join(".vyb");
  let project_file = vyb_dir.join("project.vyb.json");
  let engine_config = vyb_dir.join("engine.config.json");
  let import_map = vyb_dir.join("import.map.json");
  (vyb_dir, project_file, engine_config, import_map)
}

fn default_project_json(name: &str) -> serde_json::Value {
  // Keep this intentionally close to src/engine/project/types.ts defaults.
  serde_json::json!({
    "name": name,
    "version": "0.1.0",
    "engineVersion": "0.1.0",
    "description": "A new VYB project",
    "createdAt": chrono::Utc::now().to_rfc3339(),
    "modifiedAt": chrono::Utc::now().to_rfc3339(),
    "targetPlatforms": ["windows", "macos", "linux"],
    "renderingMode": "webgpu",
    "assetFolders": ["assets","scenes","scripts","materials","shaders","audio","ui"],
    "scenes": ["scenes/main.vybscene"],
    "plugins": [],
    "scriptingLanguages": ["typescript","javascript"],
    "defaultScene": "scenes/main.vybscene",
    "importCompatibility": {}
  })
}

fn default_engine_config_json() -> serde_json::Value {
  serde_json::json!({
    "renderer": {
      "backend": "webgpu",
      "maxTextureSize": 8192,
      "msaa": 4,
      "vsync": true
    },
    "physics": { "enabled": true, "gravity": [0,-9.81,0] },
    "audio": { "masterVolume": 1, "sampleRate": 48000 },
    "networking": { "enabled": false, "maxPlayers": 16 }
  })
}

fn default_import_map_json() -> serde_json::Value {
  serde_json::json!({
    "entries": [],
    "lastUpdated": chrono::Utc::now().to_rfc3339()
  })
}

#[tauri::command]
fn create_vyb_project(input: CreateVybProjectInput) -> Result<CreateVybProjectOutput, String> {
  let root = Path::new(&normalize_path(&input.root_path));
  if !root.exists() {
    return Err("Root path does not exist. Please select an existing folder.".into());
  }

  let (vyb_dir, project_file, engine_config, import_map) = project_paths(root);

  fs::create_dir_all(&vyb_dir).map_err(|e| e.to_string())?;
  fs::create_dir_all(root.join("assets")).ok();
  fs::create_dir_all(root.join("scenes")).ok();
  fs::create_dir_all(root.join("scripts")).ok();
  fs::create_dir_all(root.join("materials")).ok();
  fs::create_dir_all(root.join("shaders")).ok();
  fs::create_dir_all(root.join("audio")).ok();
  fs::create_dir_all(root.join("ui")).ok();
  fs::create_dir_all(root.join("builds")).ok();
  fs::create_dir_all(root.join("plugins")).ok();
  fs::create_dir_all(root.join("docs")).ok();

  fs::write(
    project_file,
    serde_json::to_string_pretty(&default_project_json(&input.name)).map_err(|e| e.to_string())?,
  )
  .map_err(|e| e.to_string())?;

  fs::write(
    engine_config,
    serde_json::to_string_pretty(&default_engine_config_json()).map_err(|e| e.to_string())?,
  )
  .map_err(|e| e.to_string())?;

  fs::write(
    import_map,
    serde_json::to_string_pretty(&default_import_map_json()).map_err(|e| e.to_string())?,
  )
  .map_err(|e| e.to_string())?;

  Ok(CreateVybProjectOutput {
    created_at: chrono::Utc::now().to_rfc3339(),
  })
}

#[tauri::command]
fn validate_vyb_project(input: ValidateVybProjectInput) -> Result<ValidateVybProjectOutput, String> {
  let root = Path::new(&normalize_path(&input.root_path));
  let mut errors: Vec<String> = vec![];
  let mut warnings: Vec<String> = vec![];

  let (vyb_dir, project_file, engine_config, import_map) = project_paths(root);

  if !vyb_dir.exists() {
    errors.push("Missing required .vyb configuration directory".into());
  }
  if !project_file.exists() {
    errors.push("Missing .vyb/project.vyb.json".into());
  }
  if !engine_config.exists() {
    warnings.push("Missing .vyb/engine.config.json".into());
  }
  if !import_map.exists() {
    warnings.push("Missing .vyb/import.map.json".into());
  }

  let project: Option<serde_json::Value> = match fs::read_to_string(&project_file) {
    Ok(text) => serde_json::from_str(&text).ok(),
    Err(_) => None,
  };

  Ok(ValidateVybProjectOutput {
    valid: errors.is_empty(),
    errors,
    warnings,
    project,
  })
}

#[tauri::command]
fn detect_import_compatibility(root_path: String) -> Result<DetectImportResponse, String> {
  // Lightweight native heuristic. Full planning/translation is scaffolded in TypeScript.
  let root = Path::new(&normalize_path(&root_path));

  let entries = fs::read_dir(root).map_err(|e| e.to_string())?;
  let mut top_level: Vec<String> = vec![];
  for e in entries {
    if let Ok(ent) = e {
      if let Some(name) = ent.file_name().to_str() {
        top_level.push(name.to_string());
      }
    }
  }

  let has_vyb = root.join(".vyb").exists() && root.join(".vyb").join("project.vyb.json").exists();
  let has_unity = root.join("Assets").exists() || root.join("ProjectSettings").exists() || root.join("Packages").exists();
  let has_unreal = root.join(".uproject").exists() || root.join("Content").exists() || root.join("Config").exists();
  let has_godot = root.join("project.godot").exists();

  // Raw assets: scan only for common extensions in top-level (fast + safe).
  let mut raw_assets = 0usize;
  let raw_exts = [".fbx", ".obj", ".glb", ".gltf", ".png", ".wav", ".mp3", ".hdr", ".exr"];
  let deep = fs::read_dir(root).map_err(|e| e.to_string())?;
  for e in deep {
    if let Ok(ent) = e {
      if ent.file_type().map(|t| t.is_file()).unwrap_or(false) {
        if let Some(name) = ent.file_name().to_str() {
          let lower = name.to_lowercase();
          if raw_exts.iter().any(|ext| lower.ends_with(ext)) {
            raw_assets += 1;
          }
        }
      }
    }
  }

  let mut detected: Vec<serde_json::Value> = vec![];
  if has_vyb {
    detected.push(serde_json::json!({"type":"vyb","confidence":1.0,"rootPath":root_path,"markers":[".vyb/project.vyb.json"]}));
  }
  if has_unity {
    detected.push(serde_json::json!({"type":"unity","confidence":0.7,"rootPath":root_path,"markers":["Assets/ProjectSettings/Packages"]}));
  }
  if has_unreal {
    detected.push(serde_json::json!({"type":"unreal","confidence":0.6,"rootPath":root_path,"markers":["Content/Config/.uproject"]}));
  }
  if has_godot {
    detected.push(serde_json::json!({"type":"godot","confidence":0.95,"rootPath":root_path,"markers":["project.godot"]}));
  }
  if raw_assets > 0 {
    detected.push(serde_json::json!({"type":"raw","confidence":0.3,"rootPath":root_path,"markers":[format!("{} raw asset files", raw_assets)]}));
  }

  let markdown = if detected.is_empty() {
    format!(
      "# VYB Import Report\n\n*Path:* `{}`\n\nNo recognizable project format detected.\n",
      root_path
    )
  } else {
    let lines: Vec<String> = detected
      .iter()
      .map(|d| {
        let t = d.get("type").and_then(|v| v.as_str()).unwrap_or("unknown");
        let c = d.get("confidence").and_then(|v| v.as_f64()).unwrap_or(0.0);
        format!("- **{}** (confidence: {:.0}%)", t, c * 100.0)
      })
      .collect();
    format!(
      "# VYB Import Report\n\n*Path:* `{}`\n\n## Detection Results\n\n{}\n\n## Plan\n\nFull import pipelines are planned (Phase 4+). This scaffold provides detection and reporting.",
      root_path,
      lines.join("\n")
    )
  };

  Ok(DetectImportResponse {
    markdown,
    report: serde_json::json!({
      "detected": detected,
      "scannedAt": chrono::Utc::now().to_rfc3339()
    }),
  })
}

#[tauri::command]
fn scan_project_assets(_root_path: String) -> Result<serde_json::Value, String> {
  // Scaffold: asset scanning is implemented in TypeScript in this first iteration,
  // and native scanning will be added alongside renderer/import phases.
  Ok(serde_json::json!({
    "assets": [],
    "scannedAt": chrono::Utc::now().to_rfc3339()
  }))
}

#[tauri::command]
fn probe_hardware_capabilities() -> Result<serde_json::Value, String> {
  Ok(serde_json::json!({
    "probeStatus": "unknown",
    "gpu": { "available": false, "backend": "web-unknown" },
    "cpu": {},
    "ram": {},
    "storage": {}
  }))
}

#[tauri::command]
fn read_doc_markdown(payload: serde_json::Value) -> Result<serde_json::Value, String> {
  // Security: treat docId as untrusted.
  let doc_id = payload.get("docId").and_then(|v| v.as_str()).unwrap_or("");
  if doc_id.contains("..") || doc_id.contains('\\') || doc_id.contains('/') {
    return Ok(serde_json::json!({"markdown": format!("Invalid docId: {}", doc_id)}));
  }

  let docs_path = Path::new("docs").join(format!("{}.md", doc_id));
  let markdown = fs::read_to_string(&docs_path).unwrap_or_else(|_| format!("Doc not found: {}", doc_id));
  Ok(serde_json::json!({ "markdown": markdown }))
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      create_vyb_project,
      validate_vyb_project,
      detect_import_compatibility,
      scan_project_assets,
      probe_hardware_capabilities,
      read_doc_markdown
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

