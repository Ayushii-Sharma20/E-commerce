import { Product } from "@/lib/types";

type RawProduct = Partial<Product> & {
  _id?: string;
  name?: string;
  price?: number;
  image?: string;
  category?: string;
  description?: string;
  variants?: Array<{
    color?: string;
    image?: string;
  }>;
};

export const normalizeProduct = (product: RawProduct): Product => {
  const normalizedVariants = Array.isArray(product.variants)
    ? product.variants
        .map((variant) => ({
          color: String(variant?.color || "").trim(),
          image: String(variant?.image || "").trim(),
        }))
        .filter((variant) => variant.color && variant.image)
    : [];

  const normalizedColors =
    normalizedVariants.length > 0
      ? normalizedVariants.map((variant) => variant.color)
      : Array.isArray(product.colors) && product.colors.length > 0
        ? product.colors
        : ["Black", "Blue"];

  return {
    _id: String(product._id || ""),
    name: product.name || "Untitled Product",
    price: Number(product.price || 0),
    image: normalizedVariants[0]?.image || product.image || "/placeholder.jpg",
    category: product.category || "General",
    rating: Number(product.rating || 4.5),
    reviews: Number(product.reviews || 0),
    description: product.description || "No description available.",
    sizes:
      Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes
        : ["S", "M", "L"],
    colors: normalizedColors,
    variants: normalizedVariants,
    inStock: typeof product.inStock === "boolean" ? product.inStock : true,
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    featured: Boolean(product.featured),
    trending: Boolean(product.trending),
  };
};
