import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HabitsController } from './habits.controller.js';
import { HabitsService } from './habits.service.js';
import { Habit, HabitSchema } from './schemas/habit.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Habit.name, schema: HabitSchema }]),
  ],
  controllers: [HabitsController],
  providers: [HabitsService],
})
export class HabitsModule {}