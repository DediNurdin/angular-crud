export interface Category {
  id: number;
  name: string;
  image?: string;
}

export interface Product {
  id?: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category?: Category;
  creationAt?: string;
  updatedAt?: string;
}

// Payload shape required by the Platzi API for create/update.
export interface ProductPayload {
  title: string;
  price: number;
  description: string;
  categoryId: number;
  images: string[];
}
