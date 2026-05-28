import { BUILD_TARGETS } from './BuildTargets';
import { createBuildManifest, manifestToJson } from './BuildManifest';
import type { BuildFileOps } from './BuildFileOps';
import { createBuildFileOps } from './BuildFileOps';
import type { BuildPipelineResult, BuildRequest, BuildStepLog } from './BuildTypes';
import { targetLaunchConfig, targetStubReadme } from './targetStubs';

const STAGE_PREFIX = 'project';
const STAGE_DIRS = ['assets', 'scenes', 'scripts', 'materials', 'shaders', 'audio', 'ui', 'plugins'];
const STAGE_DOTVYB = ['.vyb/project.vyb.json', '.vyb/engine.config.json', '.vyb/import.map.json'];

const SKIP_BUILD_PATH =
  /(^|\/)(node_modules|target|dist|builds|\.git)(\/|$)/i;

function normalizeOutputPath(projectRoot: string, outputFolder: string | undefined, target: string, config: string): string {
  const base = (outputFolder?.trim() || `${projectRoot.replace(/\\/g, '/')}/builds`).replace(/\\/g, '/');
  return `${base.replace(/\/$/, '')}/${target}/${config}`;
}

function shouldStageFile(relativePath: string): boolean {
  const norm = relativePath.replace(/\\/g, '/');
  if (SKIP_BUILD_PATH.test(norm)) return false;
  if (STAGE_DOTVYB.includes(norm)) return true;
  return STAGE_DIRS.some((d) => norm === d || norm.startsWith(`${d}/`));
}

export class BuildPipeline {
  constructor(private readonly fileOps: BuildFileOps = createBuildFileOps()) {}

  async run(request: BuildRequest): Promise<BuildPipelineResult> {
    const steps: BuildStepLog[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    const outputPath = normalizeOutputPath(request.projectRoot, request.outputRoot, request.target, request.configuration);

    const log = (step: string, level: BuildStepLog['level'], message: string) => {
      steps.push({ step, level, message });
    };

    log('validate', 'info', `Validating project at ${request.projectRoot}`);
    if (!request.projectName?.trim()) {
      errors.push('Project name is required.');
    }
    const targetDesc = BUILD_TARGETS.find((t) => t.id === request.target);
    if (!targetDesc) {
      errors.push(`Unknown build target: ${request.target}`);
    }
    if (errors.length > 0) {
      return {
        success: false,
        outputPath,
        manifestPath: `${outputPath}/build-manifest.json`,
        filesStaged: 0,
        bytesStaged: 0,
        steps,
        warnings,
        errors,
      };
    }

    log('plan', 'info', `Output: ${outputPath}`);
    let filesToStage: string[] = [];
    const previewOnly = request.previewOnly === true;
    try {
      const allFiles =
        request.knownProjectFiles && request.knownProjectFiles.length > 0
          ? request.knownProjectFiles
          : await this.fileOps.listProjectFiles(request.projectRoot);
      filesToStage = allFiles.filter(shouldStageFile);
      if (filesToStage.length === 0) {
        warnings.push('No project files discovered — manifest-only build.');
      }
    } catch (e) {
      warnings.push(`File listing limited: ${e instanceof Error ? e.message : String(e)}`);
    }

    log('stage', 'info', previewOnly ? `Planning ${filesToStage.length} files (preview)` : `Staging ${filesToStage.length} files…`);
    let filesStaged = 0;
    let bytesStaged = 0;

    if (!previewOnly) {
      for (const rel of filesToStage) {
        const dest = `${STAGE_PREFIX}/${rel.replace(/\\/g, '/')}`;
        try {
          await this.fileOps.copyToBuild(request.projectRoot, rel, outputPath, dest);
          filesStaged++;
          try {
            const text = await this.fileOps.readProjectText(request.projectRoot, rel);
            bytesStaged += new TextEncoder().encode(text).length;
          } catch {
            bytesStaged += 4096;
          }
        } catch (e) {
          warnings.push(`Skipped ${rel}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    } else {
      filesStaged = filesToStage.length;
      bytesStaged = filesToStage.length * 2048;
      warnings.push('Preview build — run VYB Desktop (Tauri) to write artifacts to disk.');
    }

    const stagedPaths = filesToStage.map((f) => `${STAGE_PREFIX}/${f.replace(/\\/g, '/')}`);
    const manifest = createBuildManifest(request, stagedPaths);
    const manifestJson = manifestToJson(manifest);
    const manifestPath = 'build-manifest.json';

    if (!previewOnly) {
      try {
        await this.fileOps.writeBuildText(outputPath, manifestPath, manifestJson);
        await this.fileOps.writeBuildText(
          outputPath,
          'build-report.json',
          JSON.stringify(
            {
              success: true,
              outputPath,
              filesStaged,
              warnings,
              builtAt: manifest.builtAt,
            },
            null,
            2,
          ),
        );
        await this.fileOps.writeBuildText(
          outputPath,
          'runtime/README.md',
          targetStubReadme(request.target, request.configuration),
        );
        await this.fileOps.writeBuildText(
          outputPath,
          'runtime/launch.config.json',
          JSON.stringify(targetLaunchConfig(request.target), null, 2),
        );
        filesStaged += 4;
      } catch (e) {
        errors.push(`Failed to write build artifacts: ${e instanceof Error ? e.message : String(e)}`);
      }
    } else {
      log('manifest', 'info', 'Build manifest generated (preview mode).');
    }

    log('complete', 'info', `Build finished — ${filesStaged} artifacts at ${outputPath}`);

    return {
      success: errors.length === 0,
      outputPath,
      manifestPath: `${outputPath}/${manifestPath}`,
      filesStaged,
      bytesStaged,
      steps,
      warnings,
      errors,
      manifestJson,
    };
  }
}

export function resolveDefaultBuildOutput(
  projectRoot: string,
  target: string,
  configuration: string,
): string {
  return normalizeOutputPath(projectRoot, undefined, target, configuration);
}
