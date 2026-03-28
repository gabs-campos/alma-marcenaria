import type { Product, ProductCategory } from "@prisma/client";

export type ProductDTO = Pick<
  Product,
  "id" | "name" | "description" | "priceCents" | "category" | "imageUrl"
>;

export const productCategories: Array<{
  value: ProductCategory;
  label: string;
}> = [
  { value: "MOVEIS", label: "Móveis" },
  { value: "DECORACAO", label: "Decoração" },
  { value: "MATERIAIS", label: "Materiais" },
];

export function categoryLabel(category: ProductCategory): string {
  return (
    productCategories.find((c) => c.value === category)?.label ?? category
  );
}

const categorySet = new Set<ProductCategory>([
  "MOVEIS",
  "DECORACAO",
  "MATERIAIS",
]);

export function parseCategoryParam(
  value: string | undefined,
): ProductCategory | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase() as ProductCategory;
  return categorySet.has(upper) ? upper : undefined;
}

