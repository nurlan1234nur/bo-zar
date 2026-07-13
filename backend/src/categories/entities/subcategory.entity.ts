import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Advertisement } from "../../ads/entities/advertisement.entity";
import { Category } from "./category.entity";

@Entity("subcategories")
export class SubCategory {
  @PrimaryGeneratedColumn({ name: "subcategory_id", type: "bigint" })
  subcategoryId!: string;

  @ManyToOne(() => Category, (category) => category.subcategories)
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @OneToMany(() => Advertisement, (ad) => ad.subcategory)
  advertisements!: Advertisement[];
}
