import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './users.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn({ name: 'comment_id' })
  id: number;

  @Column({ name: 'comment_text' })
  text: string;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;
}
