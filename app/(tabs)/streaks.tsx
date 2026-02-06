import { databases, DATABASE_ID, HABITS_COLLECTION_ID, COMPLETIONS_COLLECTION_ID, client, RealtimeResponse } from "@/lib/appwrite";
import { Habit, HabitCompletion } from "@/types/database.type";
import { View, StyleSheet } from "react-native";
import { Query } from "react-native-appwrite";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, Text } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";


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

      const habitsChannel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`

      // Subscribe to realtime events on the Habits collection
      const habitsSubscription = client.subscribe(
        habitsChannel,
        (response: RealtimeResponse) => {

          // Check which type of event was triggered
          const isCreate = response.events.includes("databases.*.collections.*.documents.*.create")
          const isUpdate = response.events.includes("databases.*.collections.*.documents.*.update")
          const isDelete = response.events.includes("databases.*.collections.*.documents.*.delete")

          // If a habit was created, updated, or deleted,
          // refetch the habits to keep UI state in sync
          if (isCreate) {
            fetchHabits();
          } else if (isUpdate) {
            fetchHabits();
          } else if (isDelete) {
            fetchHabits();
          }
        }
      )

      const completionsChannel = `databases.${DATABASE_ID}.collections.${COMPLETIONS_COLLECTION_ID}.documents`

      // Subscribe to realtime events on the Habits collection
      const completionsSubscription = client.subscribe(
        completionsChannel,
        (response: RealtimeResponse) => {

          // In this case, delete or update are never triggered
          const isCreate = response.events.includes("databases.*.collections.*.documents.*.create")

          if (isCreate) {
            fetchCompletions();
          }
        }
      );

      // Initial fetch when the component mounts
      // or when the `user` dependency changes
      fetchHabits();
      fetchCompletions();

      return () => {
        habitsSubscription();
        completionsSubscription();
      }

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
      console.error(error);
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
      console.error(error);
    }
  }

  // Return the streak, the best streak, total amount
  // So all sequences will be kind of analyzed in order to compute the values above
  const getStreakData = (habitId: string): StreakData => {
    // console.log("Completed Habits: ", completedHabits)
    // Keep in mind that each habit can have several completions and therefore different sequences
    const habitCompletions = completedHabits?.filter((c) => c.habit_id === habitId)
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
    let total = habitCompletions.length;

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
        currentStreak = 1;
      }

      if (currentStreak > bestStreak) bestStreak = currentStreak;
      streak = currentStreak;
      lastDate = date;
    });

    return { streak, bestStreak, total };
  };

  const habitStreaks = habits.map((habit) => {
    const { streak, bestStreak, total } = getStreakData(habit.$id);
    return { habit, bestStreak, streak, total }
  })

  const rankedHabits = habitStreaks.sort((a, b) => a.bestStreak - b.bestStreak);
  // Log titles to check if the order is as expected
  // console.log("Ranked completed habit titles: \n", rankedHabits.map((rh) => (rh.habit.title)))

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Habit Streaks </Text>
      {habits.length === 0 ? (
        <View>
          {" "}
          <Text> No habits yet. Add your first habit! </Text>
        </View>) : (
        <ScrollView showsVerticalScrollIndicator={false}
          style={styles.container}>
          {rankedHabits.map(({ habit, streak, bestStreak, total }, key) => (
            <Card key={key} style={[styles.card, key === 0 && styles.firstCard]}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.habitTitle}> {habit.title} </Text>
                <Text style={styles.habitDescription}> {habit.description} </Text>
                <View style={styles.statsRow}>
                  <View style={styles.statBadge}>
                    <Text> 🔥 {streak} </Text>
                    <Text> Current </Text>
                  </View>
                  <View style={styles.statBadgeGold}>
                    <Text style={styles.statBadgeText}> 🏆 {bestStreak} </Text>
                    <Text style={styles.statLabel}> Best </Text>
                  </View>
                  <View style={styles.statBadgeGreen}>
                    <Text style={styles.statBadgeText}> ✅ {total} </Text>
                    <Text style={styles.statLabel}> Total </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>))}
        </ScrollView>
      )}
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16
  },

  title: {
    fontWeight: "bold",
    marginBottom: 16,
  },

  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0"
  },

  firstCard: {
    borderWidth: 2,
    borderColor: "#7c4dff"
  },

  habitTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2
  },

  habitDescription: {
    color: "#6c6c80",
    marginBottom: 8
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8
  },

  statBadge: {
    backgroundColor: "#fff3e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },

  statBadgeGold: {
    backgroundColor: "#fffde7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },

  statBadgeGreen: {
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },

  statBadgeText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#22223b"
  },

  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    fontWeight: "500"
  }
})