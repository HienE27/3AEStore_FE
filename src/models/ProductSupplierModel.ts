export class ProductSupplierModel  {
    id: string;
    supplierId: string;
    productId: string;
    supplierName: string;
    supplierAddress: string;
    contactNumber: string;

    constructor(id: string, supplierId: string, productId: string, supplierName: string, supplierAddress: string, contactNumber: string) {
        this.id = id;
        this.supplierId = supplierId;
        this.productId = productId;
        this.supplierName = supplierName;
        this.supplierAddress = supplierAddress;
        this.contactNumber = contactNumber;
    }
}
