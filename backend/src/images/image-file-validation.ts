import { BadRequestException } from "@nestjs/common";
import { extname } from "path";

export type SupportedImageType = "jpeg" | "png" | "webp";

const mimeTypes: Record<SupportedImageType, Set<string>> = {
  jpeg: new Set(["image/jpeg", "image/jpg", "image/pjpeg"]),
  png: new Set(["image/png", "image/x-png"]),
  webp: new Set(["image/webp"]),
};
const extensions: Record<SupportedImageType, Set<string>> = {
  jpeg: new Set([".jpg", ".jpeg"]),
  png: new Set([".png"]),
  webp: new Set([".webp"]),
};

export function validateImageFile(file: Pick<Express.Multer.File, "buffer" | "mimetype" | "originalname" | "size">): SupportedImageType {
  if (!file.buffer?.length || file.size === 0) throw new BadRequestException("Empty image files are not allowed");
  const detected = detectImageType(file.buffer);
  const mime = file.mimetype.toLowerCase().trim();
  const extension = extname(file.originalname).toLowerCase();
  if (!detected || !mimeTypes[detected].has(mime) || !extensions[detected].has(extension)) {
    throw new BadRequestException("Image content, MIME type, and filename extension must match JPEG, PNG, or WEBP");
  }
  return detected;
}

function detectImageType(buffer: Buffer): SupportedImageType | undefined {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return undefined;
}

export function canonicalExtension(type: SupportedImageType) {
  return type === "jpeg" ? ".jpg" : `.${type}`;
}
