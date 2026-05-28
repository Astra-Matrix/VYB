import { ImportDetector } from './ImportDetector';
import { ImportPlanner } from './ImportPlanner';
import { ImportReportBuilder } from './ImportReport';

export * from './ImportDetector';
export * from './ImportPlanner';
export * from './ImportReport';
export * from './ImportMap';
export * from './ImportFileOps';
export * from './ImportPipeline';
export * from './material/VybMaterialFile';
export * from './material/MaterialTranslator';
export * from './translators/GodotSceneTranslator';
export * from './translators/RawAssetSceneBuilder';

const detector = new ImportDetector();
const planner = new ImportPlanner();
const reportBuilder = new ImportReportBuilder();

export function runImportDetection(
  rootPath: string,
  entries: string[],
  recursiveFiles: string[] = [],
) {
  const detection = detector.detectFromDirectoryListing(rootPath, entries, recursiveFiles);
  const plan = detection.primary ? planner.createPlan(detection.primary) : undefined;
  return reportBuilder.build(rootPath, detection, plan);
}

export { detector, planner, reportBuilder };
