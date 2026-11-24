/**
 * 技能注册。
 *
 * 8 个技能：3 个操作类（查日程 / 出简报 / 建会改会）+ 5 个产出类（五份会后文档）。
 * 产出类受偏好里的 outputSkills 开关控制：变了就反注册再注册（返回 disposer）。
 * 技能正文只写「怎么做」，不重复工具说明（工具描述里已经有）。
 */
import type { Context } from '@deepseek-ai/cordis';
export declare function registerSkills(ctx: Context): () => void;
export declare const ALL_SKILL_NAMES: string[];
