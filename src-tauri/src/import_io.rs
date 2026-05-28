use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

const SKIP_DIRS: &[&str] = &[".git", "node_modules", "target", "dist", "build", ".vyb"];
const MAX_FILES: usize = 25_000;
const MAX_DEPTH: usize = 14;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListImportFilesResult {
  pub files: Vec<String>,
}

fn should_skip(name: &str) -> bool {
  SKIP_DIRS.iter().any(|s| name.eq_ignore_ascii_case(s))
}

fn list_recursive(dir: &Path, root: &Path, depth: usize, out: &mut Vec<String>) -> Result<(), String> {
  if depth > MAX_DEPTH || out.len() >= MAX_FILES {
    return Ok(());
  }
  for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
    let entry = entry.map_err(|e| e.to_string())?;
    let path = entry.path();
    let name = entry.file_name().to_string_lossy().to_string();
    if path.is_dir() {
      if should_skip(&name) {
        continue;
      }
      list_recursive(&path, root, depth + 1, out)?;
      continue;
    }
    if let Ok(rel) = path.strip_prefix(root) {
      out.push(rel.to_string_lossy().replace('\\', "/"));
    }
  }
  Ok(())
}

pub fn list_import_source_files(root_path: &str) -> Result<ListImportFilesResult, String> {
  let root = Path::new(root_path);
  if !root.is_dir() {
    return Err(format!("Source path is not a directory: {}", root_path));
  }
  let mut files = Vec::new();
  list_recursive(root, root, 0, &mut files)?;
  Ok(ListImportFilesResult { files })
}

pub fn read_import_source_text(root_path: &str, relative_path: &str) -> Result<String, String> {
  let path = Path::new(root_path).join(relative_path);
  if !path.starts_with(Path::new(root_path)) {
    return Err("Invalid relative path".into());
  }
  fs::read_to_string(&path).map_err(|e| e.to_string())
}

pub fn write_project_text_file(root_path: &str, relative_path: &str, content: &str) -> Result<(), String> {
  let path = Path::new(root_path).join(relative_path);
  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
  }
  if !path.starts_with(Path::new(root_path)) {
    return Err("Invalid relative path".into());
  }
  fs::write(&path, content).map_err(|e| e.to_string())
}

pub fn copy_import_asset(
  source_root: &str,
  source_relative: &str,
  target_root: &str,
  target_relative: &str,
) -> Result<(), String> {
  let source = Path::new(source_root).join(source_relative);
  let target = Path::new(target_root).join(target_relative);
  if !source.starts_with(Path::new(source_root)) || !target.starts_with(Path::new(target_root)) {
    return Err("Invalid import paths".into());
  }
  if let Some(parent) = target.parent() {
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
  }
  fs::copy(&source, &target).map_err(|e| e.to_string())?;
  Ok(())
}
