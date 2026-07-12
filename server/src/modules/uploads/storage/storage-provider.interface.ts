/**
 * Injection token + contract for pluggable file storage. The default binding is
 * the local-disk adapter (dev); a cloud adapter (e.g. S3) can be bound to this
 * same token without touching call sites.
 */
export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

/** Minimal shape of a multipart file, decoupled from @types/multer. */
export interface UploadedFileData {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface StoredFile {
  /** Opaque generated filename (safe, no path components). */
  filename: string;
  /** Public URL path the client can render/link, e.g. `/uploads/<name>`. */
  url: string;
}

export interface StorageProvider {
  save(file: UploadedFileData): Promise<StoredFile>;
  /** Absolute-or-relative path on disk for a stored filename, for serving. */
  resolvePath(filename: string): string;
}
