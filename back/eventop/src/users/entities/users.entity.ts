import { Role } from '@app/auth/enum/roles.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Event } from '@app/events/entities/events.entity';
import { Comment } from './comments.entity';
import { Exclude } from 'class-transformer';
import { Ticket } from '@app/payment/entities/tickets.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 50, default: 'local' })
  authProvider: string;

  @Column({ type: 'enum', enum: Role, default: 'user' })
  role: Role;

  @Column({ type: 'varchar', length: 10, default: 'SPA' })
  preferredLanguage: string;

  @Column({ type: 'varchar', length: 10, default: 'ARS' })
  preferredCurrency: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  @OneToMany(() => Comment, (comment) => comment.user)
  @Exclude()
  comments: Comment[];

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  banReason: string;

  @Column({ nullable: true })
  banUntil: Date;

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];
}
