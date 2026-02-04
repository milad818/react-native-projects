import { databases, DATABASE_ID, HABITS_COLLECTION_ID, COMPLETIONS_COLLECTION_ID } from "@/lib/appwrite";
import { Habit, HabitCompletion } from "@/types/database.type";
import { View, Text } from "react-native";
import { Query } from "react-native-appwrite";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";


interface StreakData {
  streak: number,
  bestStreak: number,
  total: number
}


export default function StreaksScreen() {

  const { signOut, user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]); // Initialization ensures that the state is never undefined, even with operations on it

  useEffect(() => {
    if (user) {

      // Initial fetch when the component mounts
      // or when the `user` dependency changes
      fetchHabits();
      fetchCompletions();

    }
  }, [user])


  const fetchHabits = async () => {
    try {
      // Adding <Habit> we explicitly tell TypeScript that these documents follow the Habit shape
      const response = await databases.listDocuments<Habit>(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      )

      // Investigate document content
      // console.log("Retrieved Appwrite documents: \n", response.documents)
      // console.log("Retrieved Appwrite documents: \n", response.documents[0])
      // console.log("Retrieved documents length: \n", response.documents.length)

      setHabits(response.documents as Habit[]);

      // NOTE! 
      // DefaultDocument[] does not sufficiently overlap with Habit[]
      // AND TypeScript cannot verify that fields like title, frequency, etc. actually exist

      // If the type of response not set to Habit you can set Habits as below      
      // setHabits(
      //   response.documents.map(doc => ({
      //     ...doc,
      //     user_id: doc.user_id,
      //     title: doc.title,
      //     description: doc.description,
      //     streak_count: doc.streak_count,
      //     last_completed: doc.last_completed,
      //     frequency: doc.frequency
      //   })) as Habit[]);

      // OR

    } catch (error) {
      console.log(error);
    }
  }

  const fetchCompletions = async () => {
    try {

      const response = await databases.listDocuments<HabitCompletion>(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );

      const completions = response.documents as HabitCompletion[];
      setCompletedHabits(completions);

    } catch (error) {
      console.log(error);
    }
  }

  // Return the streak, the best streak, total amount
  // So all sequences will be kind of analyzed in order to compute the values above
  const getStreakData = (habitId: string): StreakData => {

    // Keep in mind that each habit can have several completions and therefore different sequences
    const habitCompletions = completedHabits?.filter((c) => c.$id === habitId)
      .sort((a, b) =>
        new Date(a.completed_at).getTime() -
        new Date(b.completed_at).getTime()  // Sort in an ascending order (use list.sort((a, b) => b - a) for descending)

      );

    // Handle empty array condition
    if (habitCompletions?.length === 0) {
      return { streak: 0, bestStreak: 0, total: 0 };
    }

    // Extract streak data
    let streak = 0;
    let bestStreak = 0;
    let total = habitCompletions?.length;

    // Last date of completion
    let lastDate: Date | null = null; // Type null since it is initialized as null in fact
    let currentStreak = 0;

    habitCompletions?.forEach((c) => {
      const date = new Date(c.completed_at);
      if (lastDate) {
        const diff = (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        // Check if this is the continuation of a recent sequence OR
        // The sequence has already been broken and needs to be restarted
        if (diff <= 1.5) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        if (currentStreak > bestStreak) bestStreak = currentStreak;
        streak = currentStreak;
        lastDate = date;
      }
    });

    return { streak, bestStreak, total };
  };

  const habitStreaks = habits.map((habit) => {
    const {streak, bestStreak, total} = getStreakData(habit.$id);
    return {habit, bestStreak, streak, total}
  })

  const rankedHabits = habitStreaks.sort((a, b) => a.bestStreak - b.bestStreak);
  // Log titles to check if the order is as expected
  console.log("Ranked completed habit titles: \n", rankedHabits.map((rh) => rh.habit.title))

  return (
    <View>
      {/* {" "} */}
      <Text>This is login page.</Text>
    </View>
  );
}