import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello and welcome to Habit Tracker project!</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25292e"
  },

  text: {
    color: "white"
  },

  navButton: {
    width: 60,
    height: 20,
    backgroundColor: "coral",
    borderRadius: 5,
    textAlign: "center"
  }
})