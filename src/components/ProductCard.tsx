import { Image, StyleSheet, Text, View } from "react-native";
import type { Product } from "../types/product";

type Props = {
  product: Product;
};

export const ProductCard = ({ product }: Props) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 190,
    backgroundColor: "#f2f2f2",
  },
  content: {
    padding: 12,
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    color: "#444",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#134e4a",
  },
});
