import { Event } from 'src/events/entities/events.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => Event, (event) => event.category_id)
  events_id: Event[];
}
