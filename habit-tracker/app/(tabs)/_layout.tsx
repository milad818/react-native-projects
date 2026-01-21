import { Tabs } from "expo-router";
// import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{tabBarActiveTintColor: "green",
                          tabBarActiveBackgroundColor: "lightgray"}}>
      
      <Tabs.Screen name="index"
                   options={{ title: "Home",
                              tabBarIcon: ({color, focused}) => {
                              return focused ?
                                (<Fontisto name="home" size={22} color={color} />) :
                                (<AntDesign name="home" size={24} color="black" />)
                              }
                                
                            }} />
      <Tabs.Screen name="login" options={{ title: "Login" }} />
    </Tabs>
  );
}
