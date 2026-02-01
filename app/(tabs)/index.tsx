import { DATABASE_ID, databases, HABITS_COLLECTION_ID, client, RealtimeResponse } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.type";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import ReanimatedSwipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { Button, Surface, Text } from "react-native-paper";


export default function Index() {

  const { signOut, user } = useAuth();
  // NOTE! The state defined below is a list of Habit objects
  const [habits, setHabits] = useState<Habit[]>();

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  // Fetch habits every time the user navigates to this screen (Today's Habits)
  // And it will reload only if the user changes passing the user to the dependency array
  useEffect(() => {
    if (user) {
      // Build the realtime channel string for listening to document changes
      // in the Habits collection of the specified database
      const channel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`

      // Subscribe to realtime events on the Habits collection
      const habitsSubscription = client.subscribe(
        channel,
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

      // Initial fetch when the component mounts
      // or when the `user` dependency changes
      fetchHabits();

      // Cleanup function:
      // unsubscribe from realtime updates when the component unmounts
      // or before re-running the effect
      return () => {
        habitsSubscription();
      };
    }
  }, [user]) // Re-run effect when the user changes. [Why wouldn't add habits to dependency array to fetch the most recent?]

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

  // In case of inserting a delete button
  // const deleteHabit = async (id: string) => {

  //   try {
  //     await databases.deleteDocument(
  //       DATABASE_ID,
  //       HABITS_COLLECTION_ID,
  //       id
  //     )
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       return error.message;
  //     }

  //     return "An error occured during habit deletion!"
  //   }
  // };

  const handleDeleteHabit = async (id: string) => {
    try {

      console.log("Swipeable Refs (BEFORE DELETING): \n", swipeableRefs)

      await databases.deleteDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        id
      )
      console.log("Swipeable Refs (AFTER DELETING): \n", swipeableRefs)
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      return "An error occured deleting a record/entry!"
    }
  }

  const renderRightActions = () => (
    <View style={styles.swipeActionRight}>
      <MaterialCommunityIcons name="check-circle-outline"
        size={32}
        color={"#fff"} />
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.swipeActionLeft}>
      <MaterialCommunityIcons name="trash-can-outline"
        size={32}
        color={"#fff"} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} variant="headlineSmall">Today&apos;s Habit</Text>
        <Button mode="text" onPress={signOut} icon={"logout"}>
          Sign Out
        </Button>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {habits?.length === 0 ? (
          <View style={styles.emptyState} >
            <Text style={styles.emptyStateText}>No habits yet. Add your first habit!</Text>
          </View>
        ) : (
          // "?" below/above prevents a crash if habits is still undefined
          // unless initialized with and empty array []
          habits?.map((habit, key) => (
            <Swipeable  ref={(ref) => {
              swipeableRefs.current[habit.$id] = ref;
              }}
              key={key}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={renderLeftActions}
              renderRightActions={renderRightActions}
              onSwipeableOpen={(direction) => {
                if (direction === "left") {
                  // swipeableRefs.current[habit.$id]?.close();
                  handleDeleteHabit(habit.$id);
                }
                // Set timeout to make sure deletion takes place before closing
                setTimeout(() => {
                  swipeableRefs.current[habit.$id]?.close();
                }, 400)            
              }}  
            >
              <Surface style={styles.card} elevation={2}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}> {habit.title} </Text>
                  <Text style={styles.cardDescription}> {habit.description} </Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.streakBadge}>
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color={"#ff8d23"} />
                      <Text style={styles.streakText}>
                        {habit.streak_count} day streak
                      </Text>
                    </View>
                    <View style={styles.frequencyBadge}>
                      <Text style={styles.frequencyText}> {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}</Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },

  header: {
    color: "brown",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },

  title: {
    fontWeight: "bold"
  },

  heading: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  // In case of using delete button
  // deleteButton: {
  //   paddingTop: 5,
  //   paddingRight: 3,
  //   textDecorationLine: "underline"
  // },

  emptyState: {

  },

  emptyStateText: {

  },

  card: {
    marginBottom: 18,
    borderRadius: 5,
    backgroundColor: "#e1ecff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  cardContent: {
    padding: 10
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#303071"
  },

  cardDescription: {
    fontSize: 15,
    marginBottom: 15,
    color: "#58585e"
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffd65c",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3
  },

  streakText: {
    marginLeft: 5,
    marginRight: 5,
    color: "#e94904",
    fontWeight: "bold",
    fontSize: 13
  },

  frequencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#62fe77",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3
  },

  frequencyText: {
    marginLeft: 3,
    marginRight: 3,
    color: "#e86d39",
    fontWeight: "bold",
    fontSize: 13,
    // textTransform: "uppercase"
  },

  swipeActionRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#4caf50",
    borderRadius: 5,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16
  },

  swipeActionLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#e53935",
    borderRadius: 5,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16
  }
})