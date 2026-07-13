import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { publicLocations } from "../common/public-catalog";
import { Location } from "./entities/location.entity";

@Injectable()
export class LocationsService {
  constructor(@InjectRepository(Location) private readonly locationRepository: Repository<Location>) {}

  async findAll() {
    try {
      const locations = await this.locationRepository.find({
        order: { locationId: "ASC" },
      });

      if (locations.length > 0) {
        return locations.map((location) => ({
          locationId: Number(location.locationId),
          name: location.name,
          parentLocationId: location.parentLocationId ? Number(location.parentLocationId) : undefined,
          type: location.type ?? "province",
        }));
      }
    } catch {
      // Keep public locations usable while database setup is still in progress.
    }

    return publicLocations;
  }

  async findChildren(locationId: string) {
    try {
      const items = await this.locationRepository.find({
        where: { parentLocationId: locationId },
        order: { locationId: "ASC" },
      });

      if (items.length > 0) {
        return {
          locationId: Number(locationId),
          items: items.map((location) => ({
            locationId: Number(location.locationId),
            name: location.name,
            parentLocationId: location.parentLocationId ? Number(location.parentLocationId) : undefined,
            type: location.type ?? "sum",
          })),
        };
      }
    } catch {
      // Keep public locations usable while database setup is still in progress.
    }

    return {
      locationId: Number(locationId),
      items: publicLocations.filter((item) => item.parentLocationId === Number(locationId)),
    };
  }
}
