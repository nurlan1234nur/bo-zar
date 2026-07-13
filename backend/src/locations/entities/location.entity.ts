import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Advertisement } from "../../ads/entities/advertisement.entity";
import { User } from "../../users/entities/user.entity";

@Entity("locations")
export class Location {
  @PrimaryGeneratedColumn({ name: "location_id", type: "bigint" })
  locationId!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ name: "parent_location_id", type: "bigint", nullable: true })
  parentLocationId?: string;

  @Column({ length: 50, nullable: true })
  type?: string;

  @OneToMany(() => User, (user) => user.location)
  users!: User[];

  @OneToMany(() => Advertisement, (ad) => ad.location)
  advertisements!: Advertisement[];
}
