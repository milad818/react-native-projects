import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SegmentedButtons, TextInput, Button, Text, useTheme } from "react-native-paper";
import { ID } from "react-native-appwrite";
import { databases, DATABASE_ID, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useRouter } from "expo-router";


const FREQUENCIES = ["daily", "weekly", "monthly"]

// Define Frequency as a type made up of all possible values inside the FREQUENCIES array
// It creates a union type from all values in the FREQUENCIES array, ensuring variables can only use one of those exact values.
type Frequency = (typeof FREQUENCIES)[number]

export default function AddHabitScreen() {

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [error, setError] = useState<string>("");
  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await databases.createDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: user.$id,
          title,
          description,
          frequency,
          streak_count: 0,
          last_completed: new Date().toISOString(),
          // created_at: new Date().toISOString()
        }
      );
      router.back();
      setError("");
      setTitle("");
      setDescription("");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
        return;
      }

      setError("There was an error creating the habit.")
    }

  }


  return (
    <View style={styles.container}>
      <TextInput style={styles.input} label="Title" mode="outlined" onChangeText={setTitle} />
      <TextInput style={styles.input} label="Description" mode="outlined" onChangeText={setDescription} />
      <View style={styles.FrequencyContainer}>
        <SegmentedButtons
          style={styles.SegmentedButtons}
          value={frequency}
          onValueChange={(value) => setFrequency(value as Frequency)}
          buttons={FREQUENCIES.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))}
        />
      </View>
      <Button mode="contained" onPress={handleSubmit} disabled={!title || !description}>Add Habit</Button>
      {error && <Text style={{ color: theme.colors.error, alignSelf: "center", width: "90%" }}>{error}</Text>}

    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5"
  },
  input: {
    marginBottom: 10
  },
  FrequencyContainer: {
    marginBottom: 16,
    marginTop: 6
  },
  SegmentedButtons: {
    marginBottom: 10
  }
});