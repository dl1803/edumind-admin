export const ALLOWED_VIDEO_EXTENSIONS = ["mp4", "mov", "avi", "mkv", "webm"] as const;

export const VIDEO_ACCEPT_ATTRIBUTE = ALLOWED_VIDEO_EXTENSIONS.map((extension) => `.${extension}`).join(",");

export const MAX_VIDEO_SIZE_BYTES = 5 * 1024 * 1024 * 1024;

export const INVALID_FORMAT_MESSAGE = "File không hợp lệ: chỉ hỗ trợ MP4, MOV, AVI, MKV, WEBM";

export const FILE_TOO_LARGE_MESSAGE = "File quá lớn (tối đa 5GB)";

const EMPTY_FILE_MESSAGE = "File không hợp lệ: file rỗng";

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  webm: "video/webm",
};

export interface VideoFileValidation {
  valid: boolean;
  message: string | null;
}

export function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex < 0 ? "" : fileName.slice(dotIndex + 1).toLowerCase();
}

export function validateVideoFile(file: File): VideoFileValidation {
  if (!(ALLOWED_VIDEO_EXTENSIONS as readonly string[]).includes(getFileExtension(file.name))) {
    return { valid: false, message: INVALID_FORMAT_MESSAGE };
  }
  if (file.size <= 0) {
    return { valid: false, message: EMPTY_FILE_MESSAGE };
  }
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return { valid: false, message: FILE_TOO_LARGE_MESSAGE };
  }
  return { valid: true, message: null };
}

export function resolveContentType(file: File): string {
  return CONTENT_TYPE_BY_EXTENSION[getFileExtension(file.name)] ?? "application/octet-stream";
}

