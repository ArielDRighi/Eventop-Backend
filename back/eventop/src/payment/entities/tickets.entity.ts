import { Event } from '@app/events/entities/events.entity';
import { User } from '@app/users/entities/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  ticketId: number;

  @Column()
  preferenceId: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) // Asegúrate de que el tipo de dato sea decimal
  price: number;

  @ManyToOne(() => Event, (event) => event.tickets)
  event: Event;

  @ManyToOne(() => User, (user) => user.tickets)
  user: User;
}
