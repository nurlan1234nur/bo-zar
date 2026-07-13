import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RoleName } from "../../common/enums";
import { User } from "./user.entity";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn({ name: "role_id", type: "bigint" })
  roleId!: string;

  @Column({ name: "role_name", type: "enum", enum: RoleName, unique: true })
  roleName!: RoleName;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];
}
