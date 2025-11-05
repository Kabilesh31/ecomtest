export interface Feature {
  title: string
  image: string
}

export interface Product {
  id: number
  name: string
  price: number
  image: string   // bottle
  mainImage:string
  descriptionItems?: Feature[]
  features?: Feature[]   // new features array
}

export const products: Product[] = [
  { 
    id: 1, 
    name: "Sambarani Stick", 
    price: 99, 
    image: "/creame.png", 
    mainImage:"/coin.png",
    descriptionItems: [
      { title: "High Quality & Elegant Design Crafted for Premium Experience", image: "/coin1.png" },
      { title: "Made from Premium Ingredients to Ensure Top-notch Performance", image: "/coin2.png" },
      { title: "Eco-Friendly and Sustainable Packaging for a Greener Planet", image: "/coin3.png" },
      { title: "Dedicated 24/7 Customer Support to Assist You Anytime", image: "/coin4.png" },
    ],
    features: [
      { title: "High Quality & Elegant Design Crafted for Premium Experience", image: "/coin1.png" },
      { title: "Made from Premium Ingredients to Ensure Top-notch Performance", image: "/coin2.png" },
      { title: "Eco-Friendly and Sustainable Packaging for a Greener Planet", image: "/coin3.png" },
      { title: "Dedicated 24/7 Customer Support to Assist You Anytime", image: "/coin4.png" },
    ]
  },

]
