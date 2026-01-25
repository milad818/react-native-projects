import { useAuth } from "@/lib/auth-context";
import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

export default function Index() {

  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello and welcome to Habit Tracker project!</Text>
      <Button mode="text" onPress={signOut} icon={"logout"}>
        Sign Out
      </Button>
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