import { Text, View } from "react-native";
import Config from "./config";


export default function App() {
  return (
    <View>
      <Text>{Config.APP_NAME}</Text>
    </View>
  );
}
