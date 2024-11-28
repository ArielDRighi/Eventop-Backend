import { Role } from '@app/auth/enum/roles.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Comment } from './comments.entity';
import { Exclude } from 'class-transformer';

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

  @OneToMany(() => Comment, (comment) => comment.user)
  @Exclude()
  comments: Comment[];
}
