import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Advertisement } from "../../ads/entities/advertisement.entity";
import { SubCategory } from "./subcategory.entity";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn({ name: "category_id", type: "bigint" })
  categoryId!: string;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ length: 255, nullable: true })
  icon?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => SubCategory, (subcategory) => subcategory.category)
  subcategories!: SubCategory[];

  @OneToMany(() => Advertisement, (ad) => ad.category)
  advertisements!: Advertisement[];
}
