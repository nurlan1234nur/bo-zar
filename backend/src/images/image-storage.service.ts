import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { mkdir, rename, unlink, writeFile } from "fs/promises";
import { isAbsolute, relative, resolve, sep } from "path";

export interface StagedImageDeletion { originalPath: string; tombstonePath: string }

@Injectable()
export class ImageStorageService {
  private readonly root: string;

  constructor(config: ConfigService) {
    this.root = resolve(process.cwd(), config.get<string>("IMAGE_STORAGE_PATH") ?? "uploads");
  }

  async write(buffer: Buffer, extension: string): Promise<string> {
    await mkdir(this.root, { recursive: true });
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const filename = `${randomUUID()}${extension}`;
      try {
        await writeFile(this.resolveFilename(filename), buffer, { flag: "wx" });
        return `/uploads/${filename}`;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      }
    }
    throw new InternalServerErrorException("Could not allocate a unique image filename");
  }

  async remove(imageUrl: string): Promise<void> {
    try { await unlink(this.resolvePublicUrl(imageUrl)); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  }

  async stageDeletion(imageUrl: string): Promise<StagedImageDeletion | undefined> {
    const originalPath = this.resolvePublicUrl(imageUrl);
    const tombstonePath = this.resolveFilename(`.${randomUUID()}.deleting`);
    try {
      await rename(originalPath, tombstonePath);
      return { originalPath, tombstonePath };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
      throw error;
    }
  }

  async commitDeletion(staged?: StagedImageDeletion): Promise<void> { if (staged) await unlink(staged.tombstonePath); }
  async rollbackDeletion(staged?: StagedImageDeletion): Promise<void> { if (staged) await rename(staged.tombstonePath, staged.originalPath); }

  private resolvePublicUrl(imageUrl: string): string {
    if (!imageUrl.startsWith("/uploads/")) throw new InternalServerErrorException("Unsafe stored image path");
    const filename = imageUrl.slice("/uploads/".length);
    if (!filename || filename.includes("/") || filename.includes("\\")) throw new InternalServerErrorException("Unsafe stored image path");
    return this.resolveFilename(filename);
  }

  private resolveFilename(filename: string): string {
    const candidate = resolve(this.root, filename);
    const fromRoot = relative(this.root, candidate);
    if (!fromRoot || fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
      throw new InternalServerErrorException("Unsafe image storage path");
    }
    return candidate;
  }
}
