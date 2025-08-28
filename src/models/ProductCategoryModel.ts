export class ProductCategoryModel {
    id: string;
    name: string;
    description: string;
    image: string;
    active: boolean;

    constructor(id: string, name: string, description: string, image: string, active: boolean) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.image = image;
        this.active = active;
    }
}
