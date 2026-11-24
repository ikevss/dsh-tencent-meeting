interface DiskEntry {
    savedAt: number;
    view: unknown;
}
export declare function diskGet(key: string, maxAgeMs: number): DiskEntry | null;
export declare function diskPut(key: string, view: unknown): void;
/** 删某场会的全部正文缓存（不带 id 就全清） */
export declare function diskDrop(meetingId?: string): void;
/** 删单个键（如一条详情缓存） */
export declare function diskRemove(key: string): void;
/** 只读长度、不取整份内容：给判定/预览算「素材有多少字」用，零接口 */
export declare function diskPeekChars(key: string): number | null;
/** 只读视图、不取整份内容给判定用：参与度分析要 chunks */
export declare function diskPeekView(key: string): unknown | null;
/** 按前缀批量删（详情类键都以 detail: 开头） */
export declare function diskDropPrefix(prefix: string): void;
export {};
