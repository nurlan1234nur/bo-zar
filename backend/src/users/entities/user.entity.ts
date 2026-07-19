import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Advertisement } from "../../ads/entities/advertisement.entity";
import { UserStatus } from "../../common/enums";
import { Location } from "../../locations/entities/location.entity";
import { Role } from "./role.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn({ name: "user_id", type: "bigint" })
  userId!: string;

  @Column({ name: "full_name", length: 150 })
  fullName!: string;

  @Column({ length: 20, unique: true })
  phone!: string;

  @Column({ type: "varchar", length: 150, unique: true, nullable: true })
  email?: string | null;

  @Column({ name: "password_hash", length: 255 })
  passwordHash!: string;

  @Column({ name: "profile_image", type: "varchar", length: 500, nullable: true })
  profileImage?: string | null;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @ManyToOne(() => Location, (location) => location.users, { nullable: true })
  @JoinColumn({ name: "location_id" })
  location?: Location | null;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => Advertisement, (ad) => ad.user)
  advertisements!: Advertisement[];
}
