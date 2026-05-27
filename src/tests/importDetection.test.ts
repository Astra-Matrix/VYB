import { describe, expect, it } from 'vitest';
import { ImportDetector } from '../engine/import/ImportDetector';

describe('ImportDetector', () => {
  it('detects Unity-like structure via Assets/ProjectSettings/Packages', () => {
    const detector = new ImportDetector();
    const result = detector.detectFromDirectoryListing(
      'C:/ExampleUnity',
      ['Assets', 'ProjectSettings', 'Packages', 'ProjectSettings'],
      [],
    );

    expect(result.detected[0]?.type).toBe('unity');
    expect(result.detected.some((d) => d.type === 'unity')).toBe(true);
  });

  it('detects Unreal-like structure via .uproject + Content/Config', () => {
    const detector = new ImportDetector();
    const result = detector.detectFromDirectoryListing(
      'C:/ExampleUnreal',
      ['Content', 'Config', 'Source'],
      ['MyProject.uproject', 'Content/Maps/map.umap'],
    );

    expect(result.detected.some((d) => d.type === 'unreal')).toBe(true);
  });

  it('detects Godot-like structure via project.godot', () => {
    const detector = new ImportDetector();
    const result = detector.detectFromDirectoryListing(
      'C:/ExampleGodot',
      ['scenes', 'scripts'],
      ['project.godot', 'scenes/Main.tscn'],
    );
    expect(result.detected.some((d) => d.type === 'godot')).toBe(true);
  });

  it('detects raw asset folders via known extensions', () => {
    const detector = new ImportDetector();
    const result = detector.detectFromDirectoryListing(
      'C:/ExampleRaw',
      ['some-folder'],
      ['some-folder/a.fbx', 'some-folder/b.png', 'some-folder/c.wav', 'some-folder/d.exr', 'some-folder/e.obj'],
    );
    expect(result.detected.some((d) => d.type === 'raw')).toBe(true);
  });
});

