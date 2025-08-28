import ProductModel from './ProductModel';

export default class GalleryModel {
  id: string;
  image: string;
  placeholder: string;
  isThumbnail?: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.image = data.image;
    this.placeholder = data.placeholder;
    this.isThumbnail = data.isThumbnail;
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
  }
}