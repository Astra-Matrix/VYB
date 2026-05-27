export type AITaskStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export type AICommandType =
  | 'create_design_doc'
  | 'explain_import_errors'
  | 'propose_scene_changes'
  | 'refactor_script'
  | 'generate_build_plan'
  | 'create_shader_notes'
  | 'create_ui_layout'
  | 'create_npc_behavior';

export interface AICommand {
  id: string;
  type: AICommandType;
  createdAt: string;
  input: {
    projectName?: string;
    selection?: { entityId?: string };
    importReportMarkdown?: string;
  };
}

export interface AIContextProvider {
  /**
   * Provide structured context for AI tasks.
   * In this scaffold, no external provider is wired; this interface documents what will be needed later.
   */
  getContext(): Promise<unknown>;
}

export interface AITaskHistoryEntry {
  id: string;
  command: AICommand;
  status: AITaskStatus;
  updatedAt: string;
  /**
   * AI output is stored as a string payload in this scaffold to keep the interface provider-agnostic.
   */
  output?: string;
  error?: string;
}

