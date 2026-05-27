use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoadSceneInput {
  pub scene_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoadSceneOutput {
  pub json: String,
  pub scene_path: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveSceneInput {
  pub scene_path: String,
  pub json: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveSceneOutput {
  pub saved_at: String,
  pub scene_path: String,
}

pub fn load_scene(input: LoadSceneInput) -> Result<LoadSceneOutput, String> {
  let path = std::path::Path::new(&input.scene_path);
  if !path.exists() {
    return Err(format!("Scene file not found: {}", input.scene_path));
  }
  let json = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
  // Validate JSON parses (do not validate schema deeply yet).
  serde_json::from_str::<serde_json::Value>(&json).map_err(|e| format!("Invalid scene JSON: {}", e))?;
  Ok(LoadSceneOutput {
    json,
    scene_path: input.scene_path,
  })
}

pub fn save_scene(input: SaveSceneInput) -> Result<SaveSceneOutput, String> {
  let path = std::path::Path::new(&input.scene_path);
  if input.scene_path.contains("..") {
    return Err("Invalid scene path.".into());
  }
  if let Some(parent) = path.parent() {
    std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
  }
  serde_json::from_str::<serde_json::Value>(&input.json).map_err(|e| format!("Invalid scene JSON: {}", e))?;
  std::fs::write(path, &input.json).map_err(|e| e.to_string())?;
  Ok(SaveSceneOutput {
    saved_at: chrono::Utc::now().to_rfc3339(),
    scene_path: input.scene_path,
  })
}
