import { FileCategoryType } from "./types";
export declare const classifyByExtension: (extension: string) => FileCategoryType;
export declare const classifyByMime: (mimeType: string) => FileCategoryType;
export declare const classifyByFile: (file: Pick<File, "name" | "type">) => FileCategoryType;
//# sourceMappingURL=file-classifier.d.ts.map