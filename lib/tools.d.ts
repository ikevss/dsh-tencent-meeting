import type { Context } from '@deepseek-ai/cordis';
export interface ToolsConfig {
    binary: string;
    timeoutMs: number;
    expectedVersion: string;
}
export declare function buildTools(ctx: Context, cfg: ToolsConfig): import("@deepseek-ai/dsh-tools").ToolDefinition[];
export declare function registerTools(ctx: Context, cfg: ToolsConfig): () => void;
