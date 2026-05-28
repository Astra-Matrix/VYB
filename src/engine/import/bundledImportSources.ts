import godotMainTscn from '../../../examples/godot-import-sample/scenes/main.tscn?raw';
import godotProject from '../../../examples/godot-import-sample/project.godot?raw';

/** Virtual filesystem for web-only import preview (examples/). */
export const BUNDLED_IMPORT_FILES: Record<string, string> = {
  'examples/godot-import-sample/project.godot': godotProject,
  'examples/godot-import-sample/scenes/main.tscn': godotMainTscn,
  'scenes/main.tscn': godotMainTscn,
  'project.godot': godotProject,
};

export const BUNDLED_GODOT_IMPORT_ROOT = 'examples/godot-import-sample';
