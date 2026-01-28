import { Tabs } from "expo-router";
// import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{tabBarActiveTintColor: "#6200ee",
                          tabBarInactiveTintColor: "#666666",
                          tabBarActiveBackgroundColor: "lightgray",
                          headerStyle: {backgroundColor: "beige"},
                          headerShadowVisible: false,
                          tabBarStyle: {backgroundColor: "#f5f5f5",
                                        borderTopWidth: 0,
                                        elevation: 0,
                                        shadowOpacity: 0
                                        },
                          }}>
      
      <Tabs.Screen name="index"
                   options={{ title: "Today's Habits",
                              tabBarIcon: ({color, size}) => (
                                <MaterialCommunityIcons 
                                  name="calendar"
                                  size={size}
                                  color={color}/>
                              )
                            }}/>
      <Tabs.Screen name="streaks"
                   options={{ title: "Streaks",
                              tabBarIcon: ({color, size}) => (
                                <MaterialCommunityIcons 
                                  name="fire"
                                  size={size}
                                  color={color}/>
                              )
                            }}/>
      <Tabs.Screen name="add-habit"
                   options={{ title: "Add Habit",
                            tabBarIcon: ({color, size}) => (
                              <MaterialCommunityIcons 
                                name="plus-circle"
                                size={size}
                                color={color}/>
                            )
                          }}/>
    </Tabs>
  );
}
