import { Ticket } from '@app/payment/entities/tickets.entity';
import { User } from '@app/users/entities/users.entity';
import { Category } from 'src/categories/entities/categories.entity';
import { Location } from 'src/locations/entities/locations.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn({ name: 'event_id' })
  eventId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 5 })
  time: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  price: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'int', name: 'quantity_total', default: 100 })
  quantityTotal: number;

  @Column({ type: 'int', name: 'quantity_available', default: 100 })
  quantityAvailable: number;

  @Column({ type: 'int', name: 'quantity_sold', default: 0 })
  quantitySold: number;

  @Column({ type: 'boolean', default: false })
  approved: boolean;

  @ManyToOne(() => Location, (location) => location.events_id)
  @JoinColumn({ name: 'location_id' })
  location_id: Location;

  @ManyToOne(() => Category, (category) => category.events_id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category_id: Category;

  @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets: Ticket[];
}
