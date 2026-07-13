import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Advertisement } from "../../ads/entities/advertisement.entity";

@Entity("images")
export class Image {
  @PrimaryGeneratedColumn({ name: "image_id", type: "bigint" })
  imageId!: string;

  @ManyToOne(() => Advertisement, (ad) => ad.images)
  @JoinColumn({ name: "ad_id" })
  advertisement!: Advertisement;

  @Column({ name: "image_url", length: 500 })
  imageUrl!: string;

  @Column({ name: "thumbnail_url", length: 500, nullable: true })
  thumbnailUrl?: string;

  @Column({ name: "is_main", default: false })
  isMain!: boolean;

  @CreateDateColumn({ name: "uploaded_at" })
  uploadedAt!: Date;
}
