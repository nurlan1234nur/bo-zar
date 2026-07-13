import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Category } from "../../categories/entities/category.entity";
import { SubCategory } from "../../categories/entities/subcategory.entity";
import { AdvertisementStatus } from "../../common/enums";
import { Image } from "../../images/entities/image.entity";
import { Location } from "../../locations/entities/location.entity";
import { User } from "../../users/entities/user.entity";

@Entity("advertisements")
export class Advertisement {
  @PrimaryGeneratedColumn({ name: "ad_id", type: "bigint" })
  adId!: string;

  @ManyToOne(() => User, (user) => user.advertisements)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Category, (category) => category.advertisements)
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @ManyToOne(() => SubCategory, (subcategory) => subcategory.advertisements, { nullable: true })
  @JoinColumn({ name: "subcategory_id" })
  subcategory?: SubCategory;

  @ManyToOne(() => Location, (location) => location.advertisements, { nullable: true })
  @JoinColumn({ name: "location_id" })
  location?: Location;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "numeric", precision: 12, scale: 2, nullable: true })
  price?: string;

  @Column({ type: "enum", enum: AdvertisementStatus, default: AdvertisementStatus.ACTIVE })
  status!: AdvertisementStatus;

  @Column({ name: "view_count", default: 0 })
  viewCount!: number;

  @Column({ name: "contact_phone", length: 20, nullable: true })
  contactPhone?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @Column({ name: "expired_at", type: "timestamp", nullable: true })
  expiredAt?: Date;

  @OneToMany(() => Image, (image) => image.advertisement)
  images!: Image[];
}
