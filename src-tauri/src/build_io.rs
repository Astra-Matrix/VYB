use serde::Serialize;
use std::fs;
use std::path::Path;

const SKIP_DIRS: &[&str] = &[".git", "node_modules", "target", "dist", "builds"];
const MAX_FILES: usize = 25_000;
const MAX_DEPTH: usize = 14;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListBuildFilesResult {
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

pub fn list_build_source_files(project_root: &str) -> Result<ListBuildFilesResult, String> {
  let root = Path::new(project_root);
  if !root.is_dir() {
    return Err(format!("Project root is not a directory: {}", project_root));
  }
  let mut files = Vec::new();
  list_recursive(root, root, 0, &mut files)?;
  Ok(ListBuildFilesResult { files })
}

pub fn write_build_artifact(output_root: &str, relative_path: &str, content: &str) -> Result<(), String> {
  let path = Path::new(output_root).join(relative_path);
  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
  }
  if !path.starts_with(Path::new(output_root)) {
    return Err("Invalid build output path".into());
  }
  fs::write(&path, content).map_err(|e| e.to_string())
}

pub fn copy_build_artifact(
  project_root: &str,
  source_relative: &str,
  output_root: &str,
  target_relative: &str,
) -> Result<(), String> {
  let source = Path::new(project_root).join(source_relative);
  let target = Path::new(output_root).join(target_relative);
  if !source.starts_with(Path::new(project_root)) || !target.starts_with(Path::new(output_root)) {
    return Err("Invalid build paths".into());
  }
  if let Some(parent) = target.parent() {
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
  }
  fs::copy(&source, &target).map_err(|e| e.to_string())
}
