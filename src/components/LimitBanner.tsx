import { StyleSheet, Text, View } from "react-native";

type Props = {
  reached: boolean;
  maxProducts: number;
};

export const LimitBanner = ({ reached, maxProducts }: Props) => {
  if (!reached) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Upload limit reached. Maximum {maxProducts} products allowed.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffe8e6",
    borderColor: "#d93025",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  text: {
    color: "#8c1d18",
    fontSize: 14,
    fontWeight: "600",
  },
});
