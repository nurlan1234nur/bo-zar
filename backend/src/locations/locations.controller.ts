import { Controller, Get, Param } from "@nestjs/common";
import { ok } from "../common/api-response";
import { LocationsService } from "./locations.service";

@Controller("locations")
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async findAll() {
    return ok(await this.locationsService.findAll(), "Байршлын жагсаалт");
  }

  @Get(":locationId/children")
  async children(@Param("locationId") locationId: string) {
    return ok(await this.locationsService.findChildren(locationId), "Дэд байршлын жагсаалт");
  }
}
