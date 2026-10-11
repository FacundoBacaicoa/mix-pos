import type { Mix } from "@/lib/types"

export const mixes: Mix[] = [
  {
    slug: "energia",
    name: "Mix Energía",
    weightLabel: "250 g",
    price: 8900,
    summary: "Almendra, nuez, cacao nibs y dátil.",
    description:
      "Para la media mañana, cuando el café ya no alcanza. El dátil endulza y el cacao nibs corta. Sale del lote tostado de la semana.",
    ingredients: ["Almendra tostada", "Nuez", "Cacao nibs", "Dátil"],
    allergens: ["Frutos secos"],
    initialStock: 18,
    pigment: "#c4654a",
  },
  {
    slug: "antioxidante",
    name: "Mix Antioxidante",
    weightLabel: "250 g",
    price: 9600,
    summary: "Arándano, goji, semilla de calabaza y avellana.",
    description:
      "Ácido y dulce, sin cobertura de azúcar. El arándano va deshidratado, no confitado, y la avellana le da cuerpo.",
    ingredients: ["Arándano deshidratado", "Goji", "Semilla de calabaza", "Avellana"],
    allergens: ["Frutos secos"],
    initialStock: 7,
    pigment: "#7d3c5a",
  },
  {
    slug: "verde",
    name: "Mix Verde",
    weightLabel: "200 g",
    price: 8400,
    summary: "Semilla de zapallo, coco, pistacho y matcha.",
    description:
      "Apenas salado, verde de verdad. El matcha va en polvo, mezclado con el coco para que no quede seco en el fondo de la bolsa.",
    ingredients: ["Semilla de zapallo", "Coco rallado", "Pistacho", "Matcha"],
    allergens: ["Frutos secos"],
    initialStock: 4,
    pigment: "#3f6b4a",
  },
  {
    slug: "sin-azucar",
    name: "Mix Sin azúcar",
    weightLabel: "250 g",
    price: 9200,
    summary: "Nuez, almendra, girasol y cacao, sin fruta agregada.",
    description:
      "El dulce, si aparece, sale del fruto. No lleva pasas, dátiles ni miel. Es el mix más seco de la mesa.",
    ingredients: ["Nuez", "Almendra", "Semilla de girasol", "Cacao nibs"],
    allergens: ["Frutos secos"],
    initialStock: 11,
    pigment: "#8a6a3b",
  },
  {
    slug: "sendero",
    name: "Mix Sendero",
    weightLabel: "300 g",
    price: 7800,
    summary: "Maní, pasa de uva, semillas y banana chips.",
    description:
      "El de la mochila. Este lote se terminó: la ficha sigue en la tienda para que se vea que hoy no hay bolsas.",
    ingredients: ["Maní tostado", "Pasa de uva", "Semilla de girasol", "Banana chips"],
    allergens: ["Maní"],
    initialStock: 0,
    pigment: "#a68452",
  },
  {
    slug: "cacao",
    name: "Mix Cacao amargo",
    weightLabel: "250 g",
    price: 9100,
    summary: "Cacao nibs, almendra, avellana y sal marina.",
    description:
      "Quedan pocas bolsas de este lote. Es el más amargo de la mesa, con un punto de sal marina sobre la avellana.",
    ingredients: ["Cacao nibs", "Almendra", "Avellana", "Sal marina"],
    allergens: ["Frutos secos"],
    initialStock: 2,
    pigment: "#4a342c",
  },
  {
    slug: "granola",
    name: "Granola de horno",
    weightLabel: "400 g",
    price: 6900,
    summary: "Avena, miel, nuez y semilla de lino.",
    description:
      "Horneada en el taller, en placas chicas. Queda en racimos crocantes, no en polvo. Lleva miel, así que no es el mix sin azúcar.",
    ingredients: ["Avena arrollada", "Miel", "Nuez", "Semilla de lino"],
    allergens: ["Gluten", "Frutos secos"],
    initialStock: 15,
    pigment: "#c4893a",
  },
  {
    slug: "citrico",
    name: "Mix Cítrico",
    weightLabel: "200 g",
    price: 8800,
    summary: "Ananá, almendra, coco y cáscara de naranja.",
    description:
      "Dulce de fruta y perfume cítrico. La cáscara va deshidratada, en tiras chicas, y el ananá no lleva azúcar agregada.",
    ingredients: ["Ananá deshidratado", "Almendra", "Coco rallado", "Cáscara de naranja"],
    allergens: ["Frutos secos"],
    initialStock: 9,
    pigment: "#d08a2c",
  },
]

export function getMix(slug: string): Mix | undefined {
  return mixes.find((mix) => mix.slug === slug)
}
