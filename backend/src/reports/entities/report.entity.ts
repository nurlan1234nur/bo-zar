import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Advertisement } from "../../ads/entities/advertisement.entity";
import { ReportReason, ReportStatus } from "../../common/enums";
import { User } from "../../users/entities/user.entity";

@Entity("reports")
@Unique("uq_reports_user_ad", ["reporter", "advertisement"])
export class Report {
  @PrimaryGeneratedColumn({ name: "report_id", type: "bigint" })
  reportId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "reporter_user_id" })
  reporter!: User;

  @ManyToOne(() => Advertisement)
  @JoinColumn({ name: "ad_id" })
  advertisement!: Advertisement;

  @Column({ type: "enum", enum: ReportReason })
  reason!: ReportReason;

  @Column({ type: "text", nullable: true })
  comment?: string;

  @Column({ type: "enum", enum: ReportStatus, default: ReportStatus.PENDING })
  status!: ReportStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ name: "reviewed_at", type: "timestamp", nullable: true })
  reviewedAt?: Date;

  @Column({ name: "reviewed_by", type: "bigint", nullable: true })
  reviewedBy?: string;
}
