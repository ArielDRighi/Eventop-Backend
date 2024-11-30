import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('banned_emails')
export class BannedEmail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;
}
