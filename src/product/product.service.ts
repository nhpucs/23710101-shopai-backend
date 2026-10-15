import { Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCTS, Product } from './product.data';

// @Injectable() biến Class này thành một Service có thể Tiêm (Inject) được.
@Injectable()
export class ProductService {
  // Hàm xử lý nghiệp vụ trả về danh sách sản phẩm.
  // Hiện lấy từ product.data.ts; Bước 7d đổi sang đọc Database qua Prisma.
  getAllProducts(): Product[] {
    return PRODUCTS;
  }
    // tìm 1 sản phẩm theo id
  getProductById(id: string): Product {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) {
      //  KHÔNG return null, phải ném đúng mã 404
      throw new NotFoundException(`Không tìm thấy sản phẩm có id = ${id}`);
    }
    return product;
  }

  // dùng lại ở Orders API để Server tự tra giá thật
  findRawById(id: string): Product | null {
    return PRODUCTS.find((p) => p.id === id) ?? null;
  }

}
