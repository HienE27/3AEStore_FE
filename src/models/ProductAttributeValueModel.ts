// ProductAttributeValue.ts
export class ProductAttributeValueModel {
    id: string;
    attributeId: string;
    value: string;

    constructor(id: string, attributeId: string, value: string) {
        this.id = id;
        this.attributeId = attributeId;
        this.value = value;
    }
}
