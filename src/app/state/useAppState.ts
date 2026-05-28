import { create } from 'zustand';
import type { VybProject } from '../../engine/project/types';
import type { VybScene } from '../../engine/scene/VybScene';
import type { AssetMetadata } from '../../engine/assets';
import type { ImportReport } from '../../engine/import';
import type { HardwareCapabilities } from '../../engine/hardware/hardwareCapabilities';
import type { NodeGraphModel } from '../../engine/visual-scripting';
import type { BuildPlatformTarget } from '../../engine/build';
import type { ProjectTreeEntryDto } from '../commands/tauriCommands';
import type { TransformComponent } from '../../engine/components';
import type { WorkspaceBootstrapResult } from '../workspace/projectWorkspace';
import type { RuntimePlaybackState, RuntimeStats } from '../../engine/runtime/types';
import { bindSceneRuntime, getSceneRuntime, setRuntimeGraphOptions, stopSceneRuntime } from '../runtime/sceneRuntimeController';

export interface StudioConsoleEntry {
  id: string;
  at: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface AppState {
  projectRootPath?: string;
  currentProject?: VybProject;
  activeSceneRelativePath?: string;

  scene: VybScene | null;
  selectedEntityId?: string;

  assetRegistry: { assets: AssetMetadata[]; scannedAt?: string };
  projectTree: ProjectTreeEntryDto[];

  importReport?: ImportReport;
  importLastSourcePath?: string;

  activeMode:
    | 'Design'
    | 'Code'
    | 'World'
    | 'Render'
    | 'Audio'
    | 'Network'
    | 'Build'
    | 'AI';
  isSettingsOpen: boolean;
  openDocsId?: string;

  consoleEntries: StudioConsoleEntry[];

  hardwareCapabilities?: HardwareCapabilities;
  hardwareLastProbedAt?: string;

  nodeGraph?: NodeGraphModel;
  shaderGraph?: NodeGraphModel;
  runBehaviorGraphOnPlay: boolean;
  runtimeSubsystems: {
    physics: boolean;
    animation: boolean;
    audio: boolean;
    ui: boolean;
    network: boolean;
  };

  selectedBuildTarget?: BuildPlatformTarget;
  selectedBuildConfig: 'debug' | 'release';
  buildOutputFolder?: string;
  buildLogs: StudioConsoleEntry[];
  buildInProgress: boolean;

  viewportBackend: 'webgpu' | 'placeholder' | null;

  runtimePlayback: RuntimePlaybackState;
  runtimeStats: RuntimeStats | null;

  actions: {
    setSettingsOpen: (open: boolean) => void;
    setOpenDocsId: (docId?: string) => void;
    setActiveMode: (mode: AppState['activeMode']) => void;

    applyWorkspace: (workspace: WorkspaceBootstrapResult) => void;
    openProject: (payload: { rootPath: string; project: VybProject }) => void;
    closeProject: () => void;
    setScene: (scene: VybScene) => void;
    selectEntity: (entityId?: string) => void;

    setAssetRegistry: (assets: AssetMetadata[], scannedAt?: string) => void;
    setProjectTree: (entries: ProjectTreeEntryDto[]) => void;

    renameSelectedEntity: (name: string) => void;
    addEmptyEntity: () => void;
    removeSelectedEntity: () => void;
    updateSelectedTransform: (partial: Partial<TransformComponent>) => void;

    setImportReport: (report: ImportReport | undefined, sourcePath?: string) => void;

    pushConsole: (entry: Omit<StudioConsoleEntry, 'id' | 'at'>) => void;
    clearConsole: () => void;

    setHardwareCapabilities: (cap: HardwareCapabilities, at: string) => void;

    setNodeGraph: (graph: NodeGraphModel) => void;
    setShaderGraph: (graph: NodeGraphModel) => void;
    setRunBehaviorGraphOnPlay: (enabled: boolean) => void;
    setRuntimeSubsystem: (key: keyof AppState['runtimeSubsystems'], enabled: boolean) => void;

    setBuildTarget: (target: BuildPlatformTarget | undefined) => void;
    setBuildConfig: (config: 'debug' | 'release') => void;
    setBuildOutputFolder: (folder?: string) => void;
    pushBuildLog: (entry: Omit<StudioConsoleEntry, 'id' | 'at'>) => void;
    clearBuildLogs: () => void;
    setBuildInProgress: (inProgress: boolean) => void;

    setViewportBackend: (backend: AppState['viewportBackend']) => void;

    playRuntime: () => Promise<void>;
    pauseRuntime: () => void;
    resumeRuntime: () => void;
    stopRuntime: () => Promise<void>;
    stepRuntime: () => Promise<void>;
    notifySceneMutated: () => void;

    applyImportedPreview: (payload: {
      scene: VybScene;
      sceneRelativePath: string;
      assets?: AssetMetadata[];
      projectTree?: ProjectTreeEntryDto[];
    }) => void;
  };
}

function uid(): string {
  return crypto.randomUUID?.() ?? String(Math.random());
}

export const useAppState = create<AppState>()((set, get) => ({
  projectRootPath: undefined,
  currentProject: undefined,
  activeSceneRelativePath: undefined,
  scene: null,
  selectedEntityId: undefined,
  assetRegistry: { assets: [] },
  projectTree: [],
  importReport: undefined,
  importLastSourcePath: undefined,

  activeMode: 'Design',
  isSettingsOpen: false,
  openDocsId: undefined,
  consoleEntries: [],

  hardwareCapabilities: undefined,
  hardwareLastProbedAt: undefined,
  nodeGraph: undefined,

  selectedBuildTarget: undefined,
  selectedBuildConfig: 'debug',
  buildOutputFolder: undefined,
  buildLogs: [],
  buildInProgress: false,
  viewportBackend: null,
  runtimePlayback: 'stopped',
  runtimeStats: null,
  shaderGraph: undefined,
  runBehaviorGraphOnPlay: true,
  runtimeSubsystems: {
    physics: true,
    animation: true,
    audio: true,
    ui: true,
    network: false,
  },

  actions: {
    setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    setOpenDocsId: (docId) => set({ openDocsId: docId }),
    setActiveMode: (mode) => set({ activeMode: mode }),

    applyWorkspace: (workspace) => {
      void stopSceneRuntime();
      set({
        projectRootPath: workspace.rootPath,
        currentProject: workspace.project,
        activeSceneRelativePath: workspace.defaultSceneRelativePath,
        scene: workspace.scene,
        selectedEntityId: workspace.selectEntityId,
        assetRegistry: { assets: workspace.assets, scannedAt: workspace.assetsScannedAt },
        projectTree: workspace.projectTree,
        runtimePlayback: 'stopped',
        runtimeStats: null,
      });
    },

    openProject: ({ rootPath, project }) =>
      set({
        projectRootPath: rootPath,
        currentProject: project,
      }),

    closeProject: () => {
      void stopSceneRuntime();
      set({
        projectRootPath: undefined,
        currentProject: undefined,
        activeSceneRelativePath: undefined,
        assetRegistry: { assets: [] },
        projectTree: [],
        importReport: undefined,
        importLastSourcePath: undefined,
        scene: null,
        selectedEntityId: undefined,
        activeMode: 'Design',
        nodeGraph: undefined,
        hardwareCapabilities: undefined,
        hardwareLastProbedAt: undefined,
        runtimePlayback: 'stopped',
        runtimeStats: null,
      });
    },

    setScene: (scene) => set({ scene }),
    selectEntity: (entityId) => set({ selectedEntityId: entityId }),

    setAssetRegistry: (assets, scannedAt) => set({ assetRegistry: { assets, scannedAt } }),
    setProjectTree: (entries) => set({ projectTree: entries }),

    renameSelectedEntity: (name) => {
      const { scene, selectedEntityId } = get();
      if (!scene || !selectedEntityId) return;
      scene.world.renameEntity(selectedEntityId, name);
      set({ scene });
    },

    addEmptyEntity: () => {
      const { scene } = get();
      if (!scene) return;
      const id = scene.world.createEntity('Empty');
      scene.world.addComponent(id, 'transform', {
        position: { x: 0, y: 0, z: 0 },
        rotation: { xDeg: 0, yDeg: 0, zDeg: 0 },
        scale: { x: 1, y: 1, z: 1 },
      });
      set({ scene, selectedEntityId: id });
    },

    removeSelectedEntity: () => {
      const { scene, selectedEntityId } = get();
      if (!scene || !selectedEntityId) return;
      scene.world.removeEntity(selectedEntityId);
      set({ scene, selectedEntityId: undefined });
    },

    updateSelectedTransform: (partial) => {
      const { scene, selectedEntityId } = get();
      if (!scene || !selectedEntityId) return;
      const current = scene.world.getTransform(selectedEntityId);
      if (!current) return;
      scene.world.updateComponent(selectedEntityId, 'transform', { ...current, ...partial });
      set({ scene });
    },

    setImportReport: (report, sourcePath) => set({ importReport: report, importLastSourcePath: sourcePath }),

    pushConsole: (entry) => {
      const e: StudioConsoleEntry = { id: uid(), at: new Date().toISOString(), ...entry };
      set({ consoleEntries: [...get().consoleEntries, e] });
    },
    clearConsole: () => set({ consoleEntries: [] }),

    setHardwareCapabilities: (cap, at) => set({ hardwareCapabilities: cap, hardwareLastProbedAt: at }),

    setNodeGraph: (graph) => set({ nodeGraph: graph }),
    setShaderGraph: (graph) => set({ shaderGraph: graph }),
    setRunBehaviorGraphOnPlay: (enabled) => set({ runBehaviorGraphOnPlay: enabled }),

    setBuildTarget: (target) => set({ selectedBuildTarget: target }),
    setBuildConfig: (config) => set({ selectedBuildConfig: config }),
    setBuildOutputFolder: (folder) => set({ buildOutputFolder: folder }),
    pushBuildLog: (entry) => {
      const e: StudioConsoleEntry = { id: uid(), at: new Date().toISOString(), ...entry };
      set({ buildLogs: [...get().buildLogs, e] });
    },
    clearBuildLogs: () => set({ buildLogs: [] }),
    setBuildInProgress: (inProgress) => set({ buildInProgress: inProgress }),

    setViewportBackend: (backend) => set({ viewportBackend: backend }),

    setRuntimeSubsystem: (key, enabled) =>
      set({ runtimeSubsystems: { ...get().runtimeSubsystems, [key]: enabled } }),

    playRuntime: async () => {
      const { scene, actions, nodeGraph, runBehaviorGraphOnPlay, selectedEntityId, runtimeSubsystems } = get();
      if (!scene) return;
      setRuntimeGraphOptions({
        behaviorGraph: runBehaviorGraphOnPlay ? nodeGraph : null,
        targetEntityId: selectedEntityId,
        enablePhysics: runtimeSubsystems.physics,
        enableAnimation: runtimeSubsystems.animation,
        enableAudio: runtimeSubsystems.audio,
        enableUI: runtimeSubsystems.ui,
        enableNetwork: runtimeSubsystems.network,
      });
      const runtime = bindSceneRuntime(scene, {
        onLog: (level, message) => actions.pushConsole({ level, message }),
        onSceneMutated: () => get().actions.notifySceneMutated(),
        onStats: (stats) => set({ runtimeStats: stats }),
      });
      await runtime.play();
      set({ runtimePlayback: 'playing', runtimeStats: runtime.getStats() });
      actions.pushConsole({ level: 'info', message: 'Runtime playback started.' });
    },

    pauseRuntime: () => {
      getSceneRuntime()?.pause();
      set({ runtimePlayback: 'paused', runtimeStats: getSceneRuntime()?.getStats() ?? null });
    },

    resumeRuntime: () => {
      getSceneRuntime()?.resume();
      set({ runtimePlayback: 'playing', runtimeStats: getSceneRuntime()?.getStats() ?? null });
    },

    stopRuntime: async () => {
      await stopSceneRuntime();
      set({ runtimePlayback: 'stopped', runtimeStats: null });
      get().actions.pushConsole({ level: 'info', message: 'Runtime playback stopped.' });
    },

    stepRuntime: async () => {
      const runtime = getSceneRuntime();
      if (!runtime) return;
      await runtime.stepOnce();
      get().actions.notifySceneMutated();
      set({ runtimeStats: runtime.getStats() });
    },

    notifySceneMutated: () => {
      const { scene } = get();
      if (!scene) return;
      set({ scene });
    },

    applyImportedPreview: ({ scene, sceneRelativePath, assets, projectTree }) =>
      set({
        scene,
        activeSceneRelativePath: sceneRelativePath,
        assetRegistry: assets ? { assets, scannedAt: new Date().toISOString() } : get().assetRegistry,
        projectTree: projectTree ?? get().projectTree,
        runtimePlayback: 'stopped',
        runtimeStats: null,
      }),
  },
}));
