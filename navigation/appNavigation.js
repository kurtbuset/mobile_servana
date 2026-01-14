import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Login";
import ForgotPassword from "../screens/ForgotPassword";
import SignUp from "../screens/SignUp";
import BottomTabs from "../navigation/BottomTabs";
import ResetPassword from "../screens/ResetPassword";
import SignUpVerification from "../screens/SignUpVerification";
import MyProfile from "../screens/MyProfile";
import ChangePassword from "../screens/ChangePassword";
import SuccessScreen from '../screens/SuccessScreen';
import EditProfile from "../screens/EditProfile";
import PersonalInformation from "../screens/PersonalInformation";
import ProfilePicture from "../screens/ProfilePicture";
import SetupComplete from "../screens/SetupComplete";


const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#1F1B24", // Set the background to transparent
  },
};

const AppNavigation = () => {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: "#1F1B24" },
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="HomeScreen" component={BottomTabs} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="SignUpVerification" component={SignUpVerification} />
        {/* <Stack.Screen name="PersonalInformation" component={PersonalInformation} /> */}
        <Stack.Screen name="ProfilePicture" component={ProfilePicture} />
        <Stack.Screen name="SetupComplete" component={SetupComplete} />
        <Stack.Screen name="MyProfile" component={MyProfile} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
        <Stack.Screen name="EditProfile" component={EditProfile} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigation;
const Stack = createNativeStackNavigator();


