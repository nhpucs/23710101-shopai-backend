// Ảnh lấy từ CDN của CellphoneS (riêng Dell XPS lấy từ FPT Shop), cỡ 358px cho nhẹ.
// Ảnh minh hoạ cho bài tập, bản quyền thuộc các cửa hàng/nhà sản xuất.
const IMG = 'https://cdn2.cellphones.com.vn/358x/media/catalog/product';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export const PRODUCTS: Product[] = [
  { id: '1', name: 'iPhone Duo 256GB (màn hình gập)', price: 64999000, image: `${IMG}/i/p/iphone-duo-01_1.jpg` },
  { id: '2', name: 'iPhone 18 Pro Max 256GB', price: 41999000, image: `${IMG}/i/p/iphone-18-pro-01_2.jpg` },
  { id: '3', name: 'iPhone 18 Pro 256GB', price: 38999000, image: `${IMG}/i/p/iphone-18-pro-01.jpg` },
  { id: '4', name: 'iPhone 17 Pro Max 256GB', price: 37999000, image: `${IMG}/i/p/iphone-17-pro-max_3.jpg` },
  { id: '5', name: 'iPhone 17 Pro 256GB', price: 34999000, image: `${IMG}/i/p/iphone-17-pro-256-gb.png` },
  { id: '6', name: 'iPhone Air 256GB', price: 31999000, image: `${IMG}/i/p/iphone_air-3_2.jpg` },
  { id: '7', name: 'iPhone 17 256GB', price: 24999000, image: `${IMG}/i/p/iphone_17_256gb-3_2.jpg` },
  { id: '8', name: 'iPhone 16 Pro Max 256GB', price: 30990000, image: `${IMG}/i/p/iphone-16-pro-max.png` },
  { id: '9', name: 'iPhone 16 Pro 128GB', price: 25990000, image: `${IMG}/i/p/iphone-16-pro_1.png` },
  { id: '10', name: 'iPhone 16 Plus 128GB', price: 22490000, image: `${IMG}/i/p/iphone-16-plus-1.png` },
  { id: '11', name: 'iPhone 16 128GB', price: 19990000, image: `${IMG}/i/p/iphone-16-1.png` },
  { id: '12', name: 'iPhone 16e 128GB', price: 15990000, image: `${IMG}/i/p/iphone-16e-128gb.png` },
  { id: '13', name: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', price: 29490000, image: `${IMG}/i/p/iphone-15-pro-max_3.png` },
  { id: '14', name: 'iPhone 15 Pro 128GB', price: 24490000, image: `${IMG}/i/p/iphone-15-pro-max_4.png` },
  { id: '15', name: 'iPhone 15 Plus 128GB', price: 18990000, image: `${IMG}/i/p/iphone-15-plus_1_.png` },
  { id: '16', name: 'iPhone 15 128GB', price: 16490000, image: `${IMG}/i/p/iphone-15-plus_1__1.png` },
  { id: '17', name: 'MacBook Air 13.6 inch M3 (16GB / 512GB)', price: 27890000, image: `${IMG}/m/a/macbook_2__5.png` },
  { id: '18', name: 'Tai nghe Chống ồn Sony WH-1000XM5', price: 6990000, image: `${IMG}/f/r/frame_428_2.png` },
  { id: '19', name: 'Đồng hồ Apple Watch Series 9 GPS 41mm', price: 9490000, image: `${IMG}/a/p/apple_lte_4__1.png` },
  { id: '20', name: 'iPad Mini 6 Wi-Fi 64GB Starlight', price: 11990000, image: `${IMG}/i/p/ipad-mini-6_2.png` },
  { id: '21', name: 'Samsung Galaxy S24 Ultra 256GB', price: 26990000, image: `${IMG}/s/s/ss-s24-ultra-xam-222.png` },
  { id: '22', name: 'Laptop Dell XPS 13 9340 (16GB / 512GB)', price: 32990000, image: 'https://cdn2.fptshop.com.vn/unsafe/384x0/filters:quality(90)/dell_xps_13_9340_1_0bb806700c.png' },
  { id: '23', name: 'Tai nghe Apple AirPods Pro 2 USB-C', price: 5490000, image: `${IMG}/a/p/apple-airpods-pro-2-usb-c_1_.png` },
  { id: '24', name: 'Samsung Galaxy Tab S9 Plus 256GB', price: 19990000, image: `${IMG}/s/s/ss-tab-s9-plus_1__1.png` },
  { id: '25', name: 'Loa thông minh Apple HomePod Mini', price: 2490000, image: `${IMG}/h/o/homepod-mini-select-white-202010_fv1_1_.jpg` },
  { id: '26', name: 'Laptop Asus Zenbook Pro Duo 14 OLED', price: 38990000, image: `${IMG}/1/_/1_325_2.png` },
  { id: '27', name: 'Sạc dự phòng Apple MagSafe Battery Pack', price: 2190000, image: `${IMG}/g/r/group_2003_3_.png` },
  { id: '28', name: 'OPPO Reno11 F 5G 256GB', price: 8490000, image: `${IMG}/d/i/dien-thoai-oppo-reno-11-f-2.png` },
  { id: '29', name: 'Laptop Lenovo Yoga Slim 7 (16GB / 512GB)', price: 21990000, image: `${IMG}/l/a/laptop-lenovo-yoga-slim-7_1_.jpg` },
];
