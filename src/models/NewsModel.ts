export interface NewsModel {
  id?: string | number;
  title: string;
  summary: string;
  content: string;
  author: string;
  image: string;
  createdAt?: string;
}
