import SlideShowModel from "../models/SlideShowModel";
import { my_request } from "./Request";


interface resultInterface {
   slideShowList: SlideShowModel[];
   slideShow: SlideShowModel;
}

async function get1SlideShow(endpoint: string): Promise<resultInterface> {
   // Gọi phương thức request()
   const response = await my_request(endpoint);

   // Lấy ra danh sách quyển sách
   const slideShowList: any = response._embedded.slideshows.map((slideShowData: any) => ({
      ...slideShowData,
   }))

   return { slideShowList: slideShowList, slideShow: response.slideShow };
}
export async function getAllSlideShow(): Promise<resultInterface> {
   const endpoint = "http://localhost:8080/slideshows";

   return get1SlideShow(endpoint);
}