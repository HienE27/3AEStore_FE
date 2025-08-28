export default class CategoryModel {
  id: string;
  categoryName: string;
  categoryDescription?: string;
  icon?: string;
  image?: string;
  placeholder?: string;
  active: boolean;
  parentId?: string;
  created_at: Date;
  updated_at: Date;

  constructor(data: any) {
    this.id = data.id;
    this.categoryName = data.categoryName;
    this.categoryDescription = data.categoryDescription;
    this.icon = data.icon;
    this.image = data.image;
    this.placeholder = data.placeholder;
    this.active = data.active ?? true;
    this.parentId = data.parent?.id ?? null;
    this.created_at = new Date(data.created_at);
    this.updated_at = new Date(data.updated_at);
  }
}