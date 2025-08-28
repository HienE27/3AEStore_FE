// ProductShippingInfo.ts
export class ProductShippingInfoModel {
    id: string;
    productId: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    volume: number;

    constructor(id: string, productId: string, weight: number, length: number, width: number, height: number, volume: number) {
        this.id = id;
        this.productId = productId;
        this.weight = weight;
        this.length = length;
        this.width = width;
        this.height = height;
        this.volume = volume;
    }
}
