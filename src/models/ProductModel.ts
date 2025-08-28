import GalleryModel from "./GalleryModel";

interface ProductData {
  id?: string;
  slug: string;
  productName: string;
  sku?: string;
  salePrice: number | string;
  comparePrice?: number;
  buyingPrice?: number;
  quantity: number;
  shortDescription: string;
  productDescription: string;
  productType?: string; // Bạn có khai báo productType trong constructor, nên thêm vào đây
  published: boolean;
  disableOutOfStock: boolean;
  note?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  gallery?: GalleryModel[];
  image?: string;
}

class ProductModel {
  id?: string;
  slug: string;
  productName: string;
  sku?: string;
  salePrice: number;
  comparePrice?: number;
  buyingPrice?: number;
  quantity: number;
  shortDescription: string;
  productDescription: string;
  productType?: string;
  published: boolean;
  disableOutOfStock: boolean;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  gallery?: GalleryModel[];
  image?: string;

  constructor(data: ProductData) {
    this.id = data.id;
    this.slug = data.slug;
    this.productName = data.productName;
    this.sku = data.sku;
    this.salePrice = Number(data.salePrice);
    this.comparePrice = data.comparePrice;
    this.buyingPrice = data.buyingPrice;
    this.quantity = data.quantity;
    this.shortDescription = data.shortDescription;
    this.productDescription = data.productDescription;
    this.productType = data.productType;
    this.published = data.published;
    this.disableOutOfStock = data.disableOutOfStock;
    this.note = data.note;
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
    this.gallery = data.gallery;
    this.image = data.image || '';
  }
}

export default ProductModel;
