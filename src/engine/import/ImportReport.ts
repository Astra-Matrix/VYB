import type { ImportPlan } from './ImportPlanner';
import type { ImportDetectionResult } from './ImportDetector';

export interface CompatibilityWarning {
  severity: 'info' | 'warning' | 'error';
  code: string;
  message: string;
  remediation?: string;
}

export interface ImportReport {
  id: string;
  generatedAt: string;
  rootPath: string;
  detection: ImportDetectionResult;
  plan?: ImportPlan;
  warnings: CompatibilityWarning[];
  summary: {
    detectedType: string;
    importableNow: number;
    requiresManual: number;
    planned: number;
    unsupported: number;
  };
  markdown: string;
}

export class ImportReportBuilder {
  build(rootPath: string, detection: ImportDetectionResult, plan?: ImportPlan): ImportReport {
    const warnings = this.buildWarnings(detection, plan);
    const summary = this.buildSummary(plan);
    const markdown = this.toMarkdown(rootPath, detection, plan, warnings, summary);

    return {
      id: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      rootPath,
      detection,
      plan,
      warnings,
      summary,
      markdown,
    };
  }

  private buildWarnings(detection: ImportDetectionResult, plan?: ImportPlan): CompatibilityWarning[] {
    const warnings: CompatibilityWarning[] = [];

    if (detection.detected.length === 0) {
      warnings.push({
        severity: 'error',
        code: 'NO_PROJECT_DETECTED',
        message: 'No recognizable project format detected',
        remediation: 'Ensure the folder contains a valid VYB, Unity, Unreal, Godot, or raw asset structure',
      });
    }

    if (detection.detected.length > 1) {
      warnings.push({
        severity: 'warning',
        code: 'MULTIPLE_FORMATS',
        message: `Multiple formats detected: ${detection.detected.map((d) => d.type).join(', ')}`,
        remediation: 'Review detection results and select the primary source manually',
      });
    }

    plan?.items.filter((i) => i.risk === 'high').forEach((item) => {
      warnings.push({
        severity: 'warning',
        code: `RISK_${item.category.toUpperCase()}`,
        message: `High migration risk for ${item.category}: ${item.description}`,
      });
    });

    return warnings;
  }

  private buildSummary(plan?: ImportPlan) {
    const items = plan?.items ?? [];
    return {
      detectedType: plan?.source.type ?? 'unknown',
      importableNow: items.filter((i) => i.action === 'import-now' || i.action === 'partial-import').length,
      requiresManual: items.filter((i) => i.action === 'manual-migration').length,
      planned: items.filter((i) => i.action === 'planned').length,
      unsupported: items.filter((i) => i.action === 'unsupported').length,
    };
  }

  private toMarkdown(
    rootPath: string,
    detection: ImportDetectionResult,
    plan: ImportPlan | undefined,
    warnings: CompatibilityWarning[],
    summary: ImportReport['summary'],
  ): string {
    const lines: string[] = [
      '# VYB Import Report',
      '',
      `**Path:** \`${rootPath}\``,
      `**Generated:** ${new Date().toISOString()}`,
      '',
      '## Detection Results',
      '',
    ];

    if (detection.detected.length === 0) {
      lines.push('_No project format detected._');
    } else {
      detection.detected.forEach((d) => {
        lines.push(`- **${d.type}** (confidence: ${(d.confidence * 100).toFixed(0)}%) — markers: ${d.markers.join(', ')}`);
      });
    }

    lines.push('', '## Summary', '');
    lines.push(`| Metric | Count |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Importable now | ${summary.importableNow} |`);
    lines.push(`| Manual migration | ${summary.requiresManual} |`);
    lines.push(`| Planned support | ${summary.planned} |`);
    lines.push(`| Unsupported | ${summary.unsupported} |`);

    if (plan) {
      lines.push('', '## Import Plan', '');
      plan.items.forEach((item) => {
        lines.push(`### ${item.category}`);
        lines.push(`- **Action:** ${item.action}`);
        lines.push(`- **Description:** ${item.description}`);
        if (item.targetPath) lines.push(`- **Target:** ${item.targetPath}`);
        if (item.risk) lines.push(`- **Risk:** ${item.risk}`);
        lines.push('');
      });
    }

    if (warnings.length > 0) {
      lines.push('## Warnings', '');
      warnings.forEach((w) => {
        lines.push(`- **[${w.severity.toUpperCase()}]** ${w.message}`);
        if (w.remediation) lines.push(`  - _Remediation:_ ${w.remediation}`);
      });
    }

    lines.push('', '## Import Execution', '');
    lines.push('Use **Preview Import** or **Run Import** in the Import Report panel to translate Godot scenes and raw asset folders.');
    lines.push('Unity/Unreal remain partial — assets can be copied; full scene graph translation is ongoing.');

    return lines.join('\n');
  }
}

export class AssetNormalizer {
  normalizePath(sourcePath: string, targetRoot = 'assets'): string {
    const filename = sourcePath.split(/[/\\]/).pop() ?? sourcePath;
    return `${targetRoot}/${filename}`;
  }
}

export { GodotSceneTranslator as SceneTranslator } from './translators/GodotSceneTranslator';
export { MaterialTranslator } from './material/MaterialTranslator';

export class ScriptMigrationNotes {
  getNotes(engine: 'unity' | 'unreal' | 'godot'): string[] {
    const notes: Record<string, string[]> = {
      unity: [
        'C# scripts cannot be automatically converted to VYB TypeScript runtime',
        'Review MonoBehaviour lifecycle mappings in docs/04_IMPORT_COMPATIBILITY.md',
        'Consider rewriting gameplay logic incrementally',
      ],
      unreal: [
        'Blueprint graphs require manual recreation in VYB visual scripting',
        'C++ modules need Rust/TypeScript equivalents',
      ],
      godot: [
        'GDScript can be used as reference for TypeScript rewrites',
        'Node hierarchy maps conceptually to VYB ECS entities',
      ],
    };
    return notes[engine] ?? [];
  }
}

export class CompatibilityWarnings {
  static untrustedImport(): CompatibilityWarning {
    return {
      severity: 'warning',
      code: 'UNTRUSTED_SOURCE',
      message: 'Imported project files are treated as untrusted content',
      remediation: 'Review all imported assets and scripts before execution',
    };
  }
}
