use serde::Serialize;
use std::path::{Path, PathBuf};

const ASSET_EXTENSIONS: &[&str] = &[
  ".fbx", ".obj", ".glb", ".gltf", ".png", ".jpg", ".jpeg", ".webp", ".hdr", ".exr", ".wav", ".mp3",
  ".ogg", ".ts", ".js", ".lua", ".rs", ".wasm", ".json", ".vybscene", ".vybmat", ".vybprefab", ".wgsl",
  ".glsl", ".hlsl",
];

const SKIP_DIR_NAMES: &[&str] = &[
  ".git",
  "node_modules",
  "target",
  "dist",
  "build",
  ".vyb",
  "node_modules",
];

const DEFAULT_SCAN_FOLDERS: &[&str] = &[
  "assets",
  "scenes",
  "scripts",
  "materials",
  "shaders",
  "audio",
  "ui",
  "plugins",
];

const MAX_SCAN_FILES: usize = 20_000;
const MAX_SCAN_DEPTH: usize = 12;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScannedAsset {
  pub path: String,
  pub extension: String,
  pub size_bytes: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanAssetsResult {
  pub assets: Vec<ScannedAsset>,
  pub scanned_at: String,
  pub truncated: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectTreeEntry {
  pub relative_path: String,
  pub name: String,
  pub is_directory: bool,
  pub depth: u32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListProjectTreeResult {
  pub entries: Vec<ProjectTreeEntry>,
  pub scanned_at: String,
}

fn is_skipped_dir(name: &str) -> bool {
  SKIP_DIR_NAMES.iter().any(|s| name.eq_ignore_ascii_case(s))
}

fn extension_of(path: &Path) -> Option<String> {
  path
    .extension()
    .and_then(|e| e.to_str())
    .map(|e| format!(".{}", e.to_lowercase()))
}

fn is_asset_extension(ext: &str) -> bool {
  ASSET_EXTENSIONS.iter().any(|e| e.eq_ignore_ascii_case(ext))
}

/// Ensure `candidate` stays inside `root` (best-effort canonicalization).
fn is_inside_root(root: &Path, candidate: &Path) -> bool {
  let Ok(root_canon) = root.canonicalize() else {
    return candidate.starts_with(root);
  };
  let Ok(canon) = candidate.canonicalize() else {
    return candidate.starts_with(root);
  };
  canon.starts_with(root_canon)
}

pub fn scan_project_assets(root_path: &str) -> Result<ScanAssetsResult, String> {
  let root = Path::new(root_path);
  if !root.exists() || !root.is_dir() {
    return Err("Project root does not exist or is not a directory.".into());
  }

  let mut assets: Vec<ScannedAsset> = Vec::new();
  let mut truncated = false;

  for folder in DEFAULT_SCAN_FOLDERS {
    let start = root.join(folder);
    if !start.exists() {
      continue;
    }
    walk_assets(
      root,
      &start,
      0,
      &mut assets,
      &mut truncated,
    )?;
    if assets.len() >= MAX_SCAN_FILES {
      truncated = true;
      break;
    }
  }

  Ok(ScanAssetsResult {
    assets,
    scanned_at: chrono::Utc::now().to_rfc3339(),
    truncated,
  })
}

fn walk_assets(
  root: &Path,
  dir: &Path,
  depth: usize,
  out: &mut Vec<ScannedAsset>,
  truncated: &mut bool,
) -> Result<(), String> {
  if depth > MAX_SCAN_DEPTH || out.len() >= MAX_SCAN_FILES {
    *truncated = true;
    return Ok(());
  }

  if !is_inside_root(root, dir) {
    return Ok(());
  }

  let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;
  for entry in entries {
    if out.len() >= MAX_SCAN_FILES {
      *truncated = true;
      return Ok(());
    }

    let entry = entry.map_err(|e| e.to_string())?;
    let path = entry.path();
    if !is_inside_root(root, &path) {
      continue;
    }

    let file_type = entry.file_type().map_err(|e| e.to_string())?;
    if file_type.is_dir() {
      let name = entry.file_name().to_string_lossy().to_string();
      if is_skipped_dir(&name) {
        continue;
      }
      walk_assets(root, &path, depth + 1, out, truncated)?;
    } else if file_type.is_file() {
      if let Some(ext) = extension_of(&path) {
        if is_asset_extension(&ext) {
          let rel = path
            .strip_prefix(root)
            .unwrap_or(&path)
            .to_string_lossy()
            .replace('\\', "/");
          let size_bytes = entry.metadata().map(|m| m.len()).unwrap_or(0);
          out.push(ScannedAsset {
            path: rel,
            extension: ext,
            size_bytes,
          });
        }
      }
    }
  }

  Ok(())
}

use std::fs;

pub fn list_project_tree(root_path: &str, max_depth: u32) -> Result<ListProjectTreeResult, String> {
  let root = Path::new(root_path);
  if !root.exists() || !root.is_dir() {
    return Err("Project root does not exist or is not a directory.".into());
  }

  let mut entries: Vec<ProjectTreeEntry> = Vec::new();
  walk_tree(root, root, 0, max_depth.min(8), &mut entries)?;

  entries.sort_by(|a, b| a.relative_path.cmp(&b.relative_path));

  Ok(ListProjectTreeResult {
    entries,
    scanned_at: chrono::Utc::now().to_rfc3339(),
  })
}

fn walk_tree(
  root: &Path,
  dir: &Path,
  depth: u32,
  max_depth: u32,
  out: &mut Vec<ProjectTreeEntry>,
) -> Result<(), String> {
  if depth > max_depth {
    return Ok(());
  }

  if !is_inside_root(root, dir) {
    return Ok(());
  }

  let read = fs::read_dir(dir).map_err(|e| e.to_string())?;
  let mut children: Vec<PathBuf> = Vec::new();

  for entry in read {
    let entry = entry.map_err(|e| e.to_string())?;
    let path = entry.path();
    if !is_inside_root(root, &path) {
      continue;
    }

    let name = entry.file_name().to_string_lossy().to_string();
    if depth > 0 && is_skipped_dir(&name) {
      continue;
    }

    let rel = path
      .strip_prefix(root)
      .unwrap_or(&path)
      .to_string_lossy()
      .replace('\\', "/");

    let is_directory = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
    out.push(ProjectTreeEntry {
      relative_path: if rel.is_empty() { ".".into() } else { rel },
      name,
      is_directory,
      depth,
    });

    if is_directory {
      children.push(path);
    }
  }

  children.sort();
  for child in children {
    walk_tree(root, &child, depth + 1, max_depth, out)?;
  }

  Ok(())
}
