import type { AIStudioContext } from '../../engine/ai/AIContext';
import type { AppState } from '../state/useAppState';

export function buildAIContext(snapshot: AppState): AIStudioContext {
  const entityCount = snapshot.scene
    ? snapshot.scene.world.getEntitiesWithComponent('transform').length
    : undefined;
  const selectedName = snapshot.selectedEntityId
    ? snapshot.scene?.world.getEntity(snapshot.selectedEntityId)?.name
    : undefined;

  return {
    projectName: snapshot.currentProject?.name,
    projectVersion: snapshot.currentProject?.version,
    projectRoot: snapshot.projectRootPath ?? undefined,
    activeMode: snapshot.activeMode,
    entityCount,
    selectedEntityName: selectedName,
    defaultScene: snapshot.currentProject?.defaultScene,
    importReport: snapshot.importReport
      ? {
          markdown: snapshot.importReport.markdown,
          summary: snapshot.importReport.summary,
          warnings: snapshot.importReport.warnings,
        }
      : undefined,
    buildTarget: snapshot.selectedBuildTarget,
    runtimeSubsystems: snapshot.runtimeSubsystems,
    consoleTail: snapshot.consoleEntries.slice(-8).map((e) => `[${e.level}] ${e.message}`),
  };
}
