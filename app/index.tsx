// AI INSTRUCTION: This is the root entry point (/).
// WARNING: If you create a group layout like app/(tabs)/index.tsx, it will conflict with this file because both resolve to /.
// If you need a tabbed app, you MUST delete this app/index.tsx file entirely, OR rename it to something else.
// NEVER redirect to /(tabs) as it is an invalid route.
// You have full permission to delete, move, or rename files to make the app work.
import { Text, View, StyleSheet } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to your new app!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});