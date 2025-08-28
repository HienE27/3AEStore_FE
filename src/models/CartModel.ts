export interface ShippingInfo {
  id: string;
  weight: number;
  weightUnit: string;
  volume: number;
  volumeUnit: string;
}

export interface Product {
  id: string;
  productName: string;
  buyingPrice: number;
  salePrice: number;
  comparePrice: number;
  shortDescription: string;
  quantity: number;
  galleryImage?: string; // ảnh thumbnail sản phẩm
}

export interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}
