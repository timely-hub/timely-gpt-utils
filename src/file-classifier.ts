import { FileCategoryType } from "./types";

// binary 문서 형식 - MIME type만으로는 text/binary 구분이 어려운 것들
const DOCUMENT_MIMES = new Set([
  // Microsoft Office
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // ODF (LibreOffice / OpenOffice)
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  // 한글과컴퓨터
  "application/haansofthwp",
  "application/x-hwp",
  "application/vnd.hancom.hwp",
  "application/vnd.hancom.hwpx",
  // Apple iWork
  "application/vnd.apple.pages",
  "application/vnd.apple.numbers",
  "application/vnd.apple.keynote",
  // 기타
  "application/rtf",
  "application/epub+zip",
]);

const EXTENSION_CATEGORY_MAP: Record<string, FileCategoryType> = {
  // DOCUMENT
  pdf: "DOCUMENT",
  doc: "DOCUMENT",
  docx: "DOCUMENT",
  docm: "DOCUMENT",
  xls: "DOCUMENT",
  xlsx: "DOCUMENT",
  xlsm: "DOCUMENT",
  ppt: "DOCUMENT",
  pptx: "DOCUMENT",
  pptm: "DOCUMENT",
  hwp: "DOCUMENT",
  hwpx: "DOCUMENT",
  hwpml: "DOCUMENT",
  odt: "DOCUMENT",
  ods: "DOCUMENT",
  odp: "DOCUMENT",
  pages: "DOCUMENT",
  numbers: "DOCUMENT",
  key: "DOCUMENT",
  rtf: "DOCUMENT",
  epub: "DOCUMENT",
  // TEXT
  txt: "TEXT",
  md: "TEXT",
  csv: "TEXT",
  html: "TEXT",
  htm: "TEXT",
  xml: "TEXT",
  json: "TEXT",
  yaml: "TEXT",
  yml: "TEXT",
  // IMAGE
  jpg: "IMAGE",
  jpeg: "IMAGE",
  png: "IMAGE",
  gif: "IMAGE",
  webp: "IMAGE",
  svg: "IMAGE",
  bmp: "IMAGE",
  tiff: "IMAGE",
  tif: "IMAGE",
  heic: "IMAGE",
  heif: "IMAGE",
  // AUDIO
  mp3: "AUDIO",
  wav: "AUDIO",
  ogg: "AUDIO",
  aac: "AUDIO",
  flac: "AUDIO",
  m4a: "AUDIO",
  // VIDEO
  mp4: "VIDEO",
  mov: "VIDEO",
  avi: "VIDEO",
  mkv: "VIDEO",
  webm: "VIDEO",
  wmv: "VIDEO",
  flv: "VIDEO",
  m4v: "VIDEO",
};

export const classifyByExtension = (extension: string): FileCategoryType => {
  const ext = extension.replace(/^\./, "").toLowerCase();
  return EXTENSION_CATEGORY_MAP[ext] ?? "OTHER";
};

export const classifyByMime = (mimeType: string): FileCategoryType => {
  const [type] = mimeType.split("/");

  if (type === "image") return "IMAGE";
  if (type === "audio") return "AUDIO";
  if (type === "video") return "VIDEO";
  if (type === "text") return "TEXT";
  if (DOCUMENT_MIMES.has(mimeType)) return "DOCUMENT";

  return "OTHER";
};

export const classifyByFile = (
  file: Pick<File, "name" | "type">,
): FileCategoryType => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension) return classifyByExtension(extension);
  const mimeType = file.type;
  if (mimeType) return classifyByMime(mimeType);
  return "OTHER";
};
