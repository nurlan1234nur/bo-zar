import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Advertisement } from "../../ads/entities/advertisement.entity";
import { User } from "../../users/entities/user.entity";

@Entity("favorites")
@Unique("uq_favorites_user_ad", ["user", "advertisement"])
export class Favorite {
  @PrimaryGeneratedColumn({ name: "favorite_id", type: "bigint" })
  favoriteId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Advertisement)
  @JoinColumn({ name: "ad_id" })
  advertisement!: Advertisement;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
