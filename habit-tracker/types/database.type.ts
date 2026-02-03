import { Models } from "react-native-appwrite";


// Habit is extended so it will also include the specific attributes of an Appwrite document
export interface Habit extends Models.Document {
  user_id: string;
  title: string;
  description: string;
  streak_count: number;
  last_completed: string;
  frequency: string;
  // created_at: string;
}


export interface HabitCompletion extends Models.Document {
  habit_id: string,
  user_id: string,
  completed_at: string
}