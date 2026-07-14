import { FindOptionsWhere, Raw } from "typeorm";
import { AdvertisementStatus } from "../common/enums";
import { Advertisement } from "./entities/advertisement.entity";

export function publicAdvertisementVisibilityWhere(now: Date): FindOptionsWhere<Advertisement> {
  return {
    status: AdvertisementStatus.ACTIVE,
    expiredAt: Raw((column) => `(${column} IS NULL OR ${column} > :publicNow)`, { publicNow: now }),
  };
}
