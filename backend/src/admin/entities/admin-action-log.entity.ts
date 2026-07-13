import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("admin_action_logs")
export class AdminActionLog {
  @PrimaryGeneratedColumn({ name: "log_id", type: "bigint" })
  logId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "admin_user_id" })
  adminUser!: User;

  @Column({ name: "action_type", length: 50 })
  actionType!: string;

  @Column({ name: "target_type", length: 50 })
  targetType!: string;

  @Column({ name: "target_id", type: "bigint" })
  targetId!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
