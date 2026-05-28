#![allow(clippy::needless_return)]

mod build_io;
mod filesystem;
mod import_io;
mod scene_io;

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateVybProjectInput {
  name: String,
  root_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CreateVybProjectOutput {
  created_at: String,
  default_scene_path: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ValidateVybProjectInput {
  root_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ValidateVybProjectOutput {
  valid: bool,
  errors: Vec<String>,
  warnings: Vec<String>,
  project: Option<serde_json::Value>,
  engine_config: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RootPathInput {
  root_path: String,
}

#[derive(Debug, Serialize)]
struct DetectImportResponse {
  markdown: String,
  report: serde_json::Value,
}

fn project_paths(root: &Path) -> (PathBuf, PathBuf, PathBuf, PathBuf) {
  let vyb_dir = root.join(".vyb");
  let project_file = vyb_dir.join("project.vyb.json");
  let engine_config = vyb_dir.join("engine.config.json");
  let import_map = vyb_dir.join("import.map.json");
  (vyb_dir, project_file, engine_config, import_map)
}

fn default_project_json(name: &str) -> serde_json::Value {
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
    "renderer": { "backend": "webgpu", "maxTextureSize": 8192, "msaa": 4, "vsync": true },
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

/// Minimal default scene written on project creation (Phase 1).
fn default_scene_json() -> serde_json::Value {
  serde_json::json!({
    "metadata": {
      "name": "Main Scene",
      "version": "0.1.0",
      "createdAt": chrono::Utc::now().to_rfc3339()
    },
    "activeCameraEntityId": "1",
    "entities": [
      {
        "id": "1",
        "name": "Camera",
        "components": {
          "transform": { "position": { "x": 3, "y": 2, "z": 6 }, "rotation": { "xDeg": 0, "yDeg": 0, "zDeg": 0 }, "scale": { "x": 1, "y": 1, "z": 1 } },
          "camera": { "projection": "perspective", "fovDegrees": 60, "near": 0.1, "far": 500, "orthographicWidth": 10, "priority": 1 }
        }
      },
      {
        "id": "2",
        "name": "Directional Light",
        "components": {
          "transform": { "position": { "x": 0, "y": 3, "z": 0 }, "rotation": { "xDeg": 0, "yDeg": 0, "zDeg": 0 }, "scale": { "x": 1, "y": 1, "z": 1 } },
          "light": { "lightType": "directional", "color": { "x": 1, "y": 1, "z": 1 }, "intensity": 3.0, "castShadows": true }
        }
      },
      {
        "id": "3",
        "name": "Cube",
        "components": {
          "transform": { "position": { "x": 0, "y": 0.5, "z": 0 }, "rotation": { "xDeg": 0, "yDeg": 0, "zDeg": 0 }, "scale": { "x": 1, "y": 1, "z": 1 } },
          "meshRenderer": { "meshId": "mesh:unit-cube", "materialIds": ["mat:default"], "visible": true, "castShadows": true, "receiveShadows": true }
        }
      }
    ]
  })
}

#[tauri::command]
fn create_vyb_project(input: CreateVybProjectInput) -> Result<CreateVybProjectOutput, String> {
  let root = Path::new(&input.root_path);
  if !root.exists() {
    return Err("Root path does not exist. Please select an existing folder.".into());
  }

  let (vyb_dir, project_file, engine_config, import_map) = project_paths(root);

  fs::create_dir_all(&vyb_dir).map_err(|e| e.to_string())?;
  for dir in ["assets", "scenes", "scripts", "materials", "shaders", "audio", "ui", "builds", "plugins", "docs"] {
    fs::create_dir_all(root.join(dir)).ok();
  }

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

  let default_scene_rel = "scenes/main.vybscene";
  let scene_path = root.join(default_scene_rel);
  fs::write(
    &scene_path,
    serde_json::to_string_pretty(&default_scene_json()).map_err(|e| e.to_string())?,
  )
  .map_err(|e| e.to_string())?;

  Ok(CreateVybProjectOutput {
    created_at: chrono::Utc::now().to_rfc3339(),
    default_scene_path: default_scene_rel.replace('\\', "/"),
  })
}

#[tauri::command]
fn validate_vyb_project(input: ValidateVybProjectInput) -> Result<ValidateVybProjectOutput, String> {
  let root = Path::new(&input.root_path);
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

  let project: Option<serde_json::Value> = fs::read_to_string(&project_file)
    .ok()
    .and_then(|t| serde_json::from_str(&t).ok());

  let engine_config_json: Option<serde_json::Value> = fs::read_to_string(&engine_config)
    .ok()
    .and_then(|t| serde_json::from_str(&t).ok());

  Ok(ValidateVybProjectOutput {
    valid: errors.is_empty(),
    errors,
    warnings,
    project,
    engine_config: engine_config_json,
  })
}

#[tauri::command]
fn detect_import_compatibility(input: RootPathInput) -> Result<DetectImportResponse, String> {
  let root_path = input.root_path;
  let root = Path::new(&root_path);

  let entries = fs::read_dir(root).map_err(|e| e.to_string())?;
  let mut top_level: Vec<String> = vec![];
  for e in entries {
    if let Ok(ent) = e {
      if let Some(name) = ent.file_name().to_str() {
        top_level.push(name.to_string());
      }
    }
  }

  let has_vyb = root.join(".vyb").join("project.vyb.json").exists();
  let has_unity = root.join("Assets").exists() || root.join("ProjectSettings").exists();
  let has_unreal = root.join("Content").exists() || root.join("Config").exists();
  let has_godot = root.join("project.godot").exists();

  let mut detected: Vec<serde_json::Value> = vec![];
  if has_vyb {
    detected.push(serde_json::json!({"type":"vyb","confidence":1.0,"rootPath":root_path,"markers":[".vyb/project.vyb.json"]}));
  }
  if has_unity {
    detected.push(serde_json::json!({"type":"unity","confidence":0.7,"rootPath":root_path,"markers":["Assets/ProjectSettings"]}));
  }
  if has_unreal {
    detected.push(serde_json::json!({"type":"unreal","confidence":0.6,"rootPath":root_path,"markers":["Content/Config"]}));
  }
  if has_godot {
    detected.push(serde_json::json!({"type":"godot","confidence":0.95,"rootPath":root_path,"markers":["project.godot"]}));
  }

  let markdown = if detected.is_empty() {
    format!("# VYB Import Report\n\n*Path:* `{}`\n\nNo recognizable project format detected.\n", root_path)
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
      "# VYB Import Report\n\n*Path:* `{}`\n\n## Detection Results\n\n{}\n",
      root_path,
      lines.join("\n")
    )
  };

  Ok(DetectImportResponse {
    markdown,
    report: serde_json::json!({ "detected": detected, "scannedAt": chrono::Utc::now().to_rfc3339() }),
  })
}

#[tauri::command]
fn scan_project_assets(input: RootPathInput) -> Result<filesystem::ScanAssetsResult, String> {
  filesystem::scan_project_assets(&input.root_path)
}

#[tauri::command]
fn list_project_tree(input: RootPathInput) -> Result<filesystem::ListProjectTreeResult, String> {
  filesystem::list_project_tree(&input.root_path, 6)
}

#[tauri::command]
fn load_scene(input: scene_io::LoadSceneInput) -> Result<scene_io::LoadSceneOutput, String> {
  scene_io::load_scene(input)
}

#[tauri::command]
fn save_scene(input: scene_io::SaveSceneInput) -> Result<scene_io::SaveSceneOutput, String> {
  scene_io::save_scene(input)
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ReadImportTextInput {
  root_path: String,
  relative_path: String,
}

#[derive(Debug, Serialize)]
struct ReadImportTextOutput {
  content: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct WriteProjectTextInput {
  root_path: String,
  relative_path: String,
  content: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CopyImportAssetInput {
  source_root: String,
  source_relative: String,
  target_root: String,
  target_relative: String,
}

#[tauri::command]
fn list_import_source_files(input: RootPathInput) -> Result<import_io::ListImportFilesResult, String> {
  import_io::list_import_source_files(&input.root_path)
}

#[tauri::command]
fn read_import_source_text(input: ReadImportTextInput) -> Result<ReadImportTextOutput, String> {
  let content = import_io::read_import_source_text(&input.root_path, &input.relative_path)?;
  Ok(ReadImportTextOutput { content })
}

#[tauri::command]
fn write_project_text_file(input: WriteProjectTextInput) -> Result<(), String> {
  import_io::write_project_text_file(&input.root_path, &input.relative_path, &input.content)
}

#[tauri::command]
fn copy_import_asset(input: CopyImportAssetInput) -> Result<(), String> {
  import_io::copy_import_asset(
    &input.source_root,
    &input.source_relative,
    &input.target_root,
    &input.target_relative,
  )
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListBuildSourceInput {
  project_root: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct WriteBuildArtifactInput {
  output_root: String,
  relative_path: String,
  content: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CopyBuildArtifactInput {
  project_root: String,
  source_relative: String,
  output_root: String,
  target_relative: String,
}

#[tauri::command]
fn list_build_source_files(input: ListBuildSourceInput) -> Result<build_io::ListBuildFilesResult, String> {
  build_io::list_build_source_files(&input.project_root)
}

#[tauri::command]
fn write_build_artifact(input: WriteBuildArtifactInput) -> Result<(), String> {
  build_io::write_build_artifact(&input.output_root, &input.relative_path, &input.content)
}

#[tauri::command]
fn copy_build_artifact(input: CopyBuildArtifactInput) -> Result<(), String> {
  build_io::copy_build_artifact(
    &input.project_root,
    &input.source_relative,
    &input.output_root,
    &input.target_relative,
  )
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
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![
      create_vyb_project,
      validate_vyb_project,
      detect_import_compatibility,
      scan_project_assets,
      list_project_tree,
      load_scene,
      save_scene,
      list_import_source_files,
      read_import_source_text,
      write_project_text_file,
      copy_import_asset,
      list_build_source_files,
      write_build_artifact,
      copy_build_artifact,
      probe_hardware_capabilities,
      read_doc_markdown
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
