class SlideShowModel {
   image?: string;
   displayOrder?: number;

   constructor(image: string, displayOrder: number) {
      this.image = image;
      this.displayOrder = 0;
   }
}

export default SlideShowModel;