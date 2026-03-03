import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store } from "./src/app/store";
import { AppConfigProvider } from "./src/context/AppConfigContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <Provider store={store}>
      <AppConfigProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AppConfigProvider>
    </Provider>
  );
}
