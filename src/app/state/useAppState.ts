import { create } from 'zustand';
import type { VybProject } from '../../engine/project/types';
import type { VybScene } from '../../engine/scene';
import type { AssetMetadata } from '../../engine/assets';
import type { ImportReport } from '../../engine/import';
import type { HardwareCapabilities } from '../../engine/hardware/hardwareCapabilities';
import type { NodeGraphModel } from '../../engine/visual-scripting';
import type { BuildPlatformTarget } from '../../engine/build';

export interface StudioConsoleEntry {
  id: string;
  at: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface AppState {
  // Project workspace
  projectRootPath?: string;
  currentProject?: VybProject;

  // Editor scene state
  scene: VybScene | null;
  selectedEntityId?: string;

  // Assets
  assetRegistry: { assets: AssetMetadata[]; scannedAt?: string };

  // Import
  importReport?: ImportReport;
  importLastSourcePath?: string;

  // UI / modes
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

  // Console
  consoleEntries: StudioConsoleEntry[];

  // Hardware probe
  hardwareCapabilities?: HardwareCapabilities;
  hardwareLastProbedAt?: string;

  // Visual scripting
  nodeGraph?: NodeGraphModel;

  // Build page
  selectedBuildTarget?: BuildPlatformTarget;
  selectedBuildConfig: 'debug' | 'release';
  buildOutputFolder?: string;
  buildLogs: StudioConsoleEntry[];

  actions: {
    setSettingsOpen: (open: boolean) => void;
    setActiveMode: (mode: AppState['activeMode']) => void;

    openProject: (payload: { rootPath: string; project: VybProject }) => void;
    closeProject: () => void;
    setScene: (scene: VybScene) => void;
    selectEntity: (entityId?: string) => void;

    setAssetRegistry: (assets: AssetMetadata[], scannedAt?: string) => void;

    setImportReport: (report: ImportReport | undefined, sourcePath?: string) => void;

    pushConsole: (entry: Omit<StudioConsoleEntry, 'id' | 'at'>) => void;
    clearConsole: () => void;

    setHardwareCapabilities: (cap: HardwareCapabilities, at: string) => void;

    setNodeGraph: (graph: NodeGraphModel) => void;

    setBuildTarget: (target: BuildPlatformTarget | undefined) => void;
    setBuildConfig: (config: 'debug' | 'release') => void;
    setBuildOutputFolder: (folder?: string) => void;
    pushBuildLog: (entry: Omit<StudioConsoleEntry, 'id' | 'at'>) => void;
    clearBuildLogs: () => void;
  };
}

function uid(): string {
  return crypto.randomUUID?.() ?? String(Math.random());
}

export const useAppState = create<AppState>()((set, get) => ({
  projectRootPath: undefined,
  currentProject: undefined,
  scene: null,
  selectedEntityId: undefined,
  assetRegistry: { assets: [] },
  importReport: undefined,
  importLastSourcePath: undefined,

  activeMode: 'Design',
  isSettingsOpen: false,
  consoleEntries: [],

  hardwareCapabilities: undefined,
  hardwareLastProbedAt: undefined,
  nodeGraph: undefined,

  selectedBuildTarget: undefined,
  selectedBuildConfig: 'debug',
  buildOutputFolder: undefined,
  buildLogs: [],

  actions: {
    setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    setActiveMode: (mode) => set({ activeMode: mode }),

    openProject: ({ rootPath, project }) =>
      set({
        projectRootPath: rootPath,
        currentProject: project,
      }),
    closeProject: () =>
      set({
        projectRootPath: undefined,
        currentProject: undefined,
        assetRegistry: { assets: [] },
        importReport: undefined,
        importLastSourcePath: undefined,
        scene: null,
        selectedEntityId: undefined,
        activeMode: 'Design',
        nodeGraph: undefined,
        hardwareCapabilities: undefined,
        hardwareLastProbedAt: undefined,
      }),
    setScene: (scene) => set({ scene }),
    selectEntity: (entityId) => set({ selectedEntityId: entityId }),

    setAssetRegistry: (assets, scannedAt) => set({ assetRegistry: { assets, scannedAt } }),
    setImportReport: (report, sourcePath) => set({ importReport: report, importLastSourcePath: sourcePath }),

    pushConsole: (entry) => {
      const e: StudioConsoleEntry = { id: uid(), at: new Date().toISOString(), ...entry };
      set({ consoleEntries: [...get().consoleEntries, e] });
    },
    clearConsole: () => set({ consoleEntries: [] }),

    setHardwareCapabilities: (cap, at) => set({ hardwareCapabilities: cap, hardwareLastProbedAt: at }),

    setNodeGraph: (graph) => set({ nodeGraph: graph }),

    setBuildTarget: (target) => set({ selectedBuildTarget: target }),
    setBuildConfig: (config) => set({ selectedBuildConfig: config }),
    setBuildOutputFolder: (folder) => set({ buildOutputFolder: folder }),
    pushBuildLog: (entry) => {
      const e: StudioConsoleEntry = { id: uid(), at: new Date().toISOString(), ...entry };
      set({ buildLogs: [...get().buildLogs, e] });
    },
    clearBuildLogs: () => set({ buildLogs: [] }),
  },
}));

