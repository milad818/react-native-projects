import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SegmentedButtons, TextInput, Button } from "react-native-paper";


const FREQUENCIES = [ "daily", "weekly", "monthly"]

// Define Frequency as a type made up of all possible values inside the FREQUENCIES array
// It creates a union type from all values in the FREQUENCIES array, ensuring variables can only use one of those exact values.
type Frequency = (typeof FREQUENCIES)[number]

export default function AddHabitScreen() {

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");

  
  return (
    <View style={styles.container}> 
      <TextInput style={styles.input} label="Title" mode="outlined" onChangeText={setTitle}/>
      <TextInput style={styles.input} label="Description" mode="outlined" onChangeText={setDescription}/>
      <View style={styles.FrequencyContainer}>
        <SegmentedButtons
          style={styles.SegmentedButtons}
          value={frequency}
          onValueChange={(value) => setFrequency(value as Frequency)}
          buttons = {FREQUENCIES.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))}
        />
      </View>
      <Button mode="contained" disabled={!title || !description}>Add Habit</Button>
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