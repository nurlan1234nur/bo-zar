import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("system_event_logs")
export class SystemEventLog {
  @PrimaryGeneratedColumn({ name: "event_id", type: "bigint" })
  eventId!: string;

  @Column({ name: "event_type", length: 50 })
  eventType!: string;

  @Column({ name: "actor_type", length: 50, nullable: true })
  actorType?: string;

  @Column({ name: "actor_id", type: "bigint", nullable: true })
  actorId?: string;

  @Column({ name: "target_type", length: 50, nullable: true })
  targetType?: string;

  @Column({ name: "target_id", type: "bigint", nullable: true })
  targetId?: string;

  @Column({ name: "request_id", length: 80, nullable: true })
  requestId?: string;

  @Column({ name: "http_method", length: 10, nullable: true })
  httpMethod?: string;

  @Column({ name: "path", length: 255, nullable: true })
  path?: string;

  @Column({ name: "status_code", type: "integer", nullable: true })
  statusCode?: number;

  @Column({ type: "text", nullable: true })
  message?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
