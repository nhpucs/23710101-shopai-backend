import { PRODUCTS } from '../product/product.data';
import { SHIPPING_POLICY, WARRANTY_POLICY, formatPrice } from './ai.prompt';

/**
 * "Quầy lễ tân" trả lời NGAY các câu hỏi quen thuộc mà không cần gọi Gemini:
 * giá một sản phẩm trong bảng giá, chính sách ship, chính sách bảo hành, câu cảm ơn.
 *
 * Vì sao cần: Gemini bản miễn phí lúc 1 giây, lúc 7 giây, lại tốn quota. Mấy câu này
 * server đã có sẵn dữ liệu chính xác (PRODUCTS, *_POLICY) nên tự trả lời vừa nhanh vừa
 * đúng. Câu nào KHÔNG chắc chắn -> trả về null để AiService chuyển cho Gemini.
 * (Chương 8 đặt file này ở app; Chương 9 chuyển xuống server cùng với Gemini.)
 */

/** Bỏ dấu tiếng Việt + viết thường, để "Giao trong bao lâu" và "giao trong bao lau" là một. */
const normalize = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

/** Tách thành các "từ" chỉ gồm chữ và số: "WH-1000XM5 giá sao?" -> [wh, 1000xm5, gia, sao] */
const tokenize = (text: string) => normalize(text).match(/[a-z0-9]+/g) ?? [];

const hasPhrase = (tokens: string[], phrase: string) =>
  ` ${tokens.join(' ')} `.includes(` ${phrase} `);

const PRICE_PHRASES = ['gia', 'bao nhieu', 'nhieu tien', 'may tien'];
const SHIPPING_PHRASES = ['ship', 'freeship', 'giao', 'van chuyen'];
const WARRANTY_PHRASES = ['bao hanh'];
const THANKS = [
  'ok',
  'oke',
  'okay',
  'okie',
  'cam on',
  'cam on ban',
  'cam on shop',
  'thanks',
  'tks',
];

// Tách sẵn tên sản phẩm một lần lúc nạp file, không tách lại mỗi câu hỏi
const CATALOG_TOKENS = PRODUCTS.map((p) => new Set(tokenize(p.name)));

// Các hãng hay được hỏi tới — phát hiện câu hỏi nhắc một hãng KHÁC với sản phẩm khớp được
const BRANDS = new Set(
  'apple samsung sony dell asus oppo lenovo xiaomi redmi huawei honor vivo realme nokia google pixel hp acer msi lg jbl bose garmin microsoft surface anker logitech razer'.split(
    ' ',
  ),
);

const hasLetter = (token: string) => /[a-z]/.test(token);
const hasDigit = (token: string) => /[0-9]/.test(token);

/**
 * Tìm ĐÚNG MỘT sản phẩm mà câu hỏi nhắc tới. Chấm điểm = số từ của tên sản phẩm
 * xuất hiện trong câu hỏi. Thà trả null (để Gemini lo) còn hơn báo nhầm giá:
 *   1. Hoà điểm -> null. Vd "tai nghe giá bao nhiêu" trúng cả Sony lẫn AirPods.
 *   2. Chỉ trùng mỗi con số -> không tính. Vd "Xiaomi 14" không được khớp "Zenbook ... 14".
 *   3. Câu hỏi có mã máy hoặc tên hãng mà sản phẩm khớp được KHÔNG có -> null.
 * Riêng khi hoà điểm mà câu hỏi CÓ số đời máy ("iPhone 17 Pro" trúng cả 17 Pro lẫn
 * 17 Pro Max) thì chọn sản phẩm có tên GỌN nhất.
 */
const findProduct = (tokens: string[]) => {
  const candidates = CATALOG_TOKENS.map((nameTokens, index) => {
    const matched = tokens.filter((t) => nameTokens.has(t));
    return {
      index,
      score: matched.some(hasLetter) ? matched.length : 0,
      hasModelNumber: matched.some(hasDigit),
      extra: nameTokens.size - new Set(matched).size, // số từ trong tên mà khách KHÔNG nhắc
    };
  });
  const best = Math.max(...candidates.map((c) => c.score));
  if (best === 0) {
    return null;
  }
  let top = candidates.filter((c) => c.score === best);
  if (top.length > 1 && top.every((c) => c.hasModelNumber)) {
    const fewestExtra = Math.min(...top.map((c) => c.extra));
    top = top.filter((c) => c.extra === fewestExtra);
  }
  if (top.length > 1) {
    return null;
  }

  const index = top[0].index;
  const nameTokens = CATALOG_TOKENS[index];
  const mentionsSomethingElse = tokens.some(
    (t) => (hasDigit(t) || BRANDS.has(t)) && !nameTokens.has(t),
  );
  return mentionsSomethingElse ? null : PRODUCTS[index];
};

/** Trả về câu trả lời có sẵn, hoặc null nếu câu hỏi cần tới Gemini. */
export const getQuickAnswer = (question: string): string | null => {
  const tokens = tokenize(question);
  if (tokens.length === 0) {
    return null;
  }

  // Câu cảm ơn / kết thúc: chỉ nhận khi CẢ CÂU đúng là lời cảm ơn, tránh bắt nhầm "ok vậy giá sao?"
  if (THANKS.includes(tokens.join(' '))) {
    return 'Dạ không có gì ạ! Nếu cần thêm thông tin gì về sản phẩm hoặc đặt hàng, bạn cứ nhắn cho Shop nhé! Chúc bạn một ngày mua sắm vui vẻ ❤️';
  }

  const asksPrice = PRICE_PHRASES.some((p) => hasPhrase(tokens, p));
  const asksShipping = SHIPPING_PHRASES.some((p) => hasPhrase(tokens, p));
  const asksWarranty = WARRANTY_PHRASES.some((p) => hasPhrase(tokens, p));

  // Hỏi giá: phải xác định được đúng một sản phẩm, và không hỏi lẫn chuyện khác
  if (asksPrice && !asksShipping && !asksWarranty) {
    const product = findProduct(tokens);
    return product
      ? `Dạ, ${product.name} có giá chính hãng tại ShopAI là ${formatPrice(product.price)} ạ. Hàng mới 100%, nguyên seal, bảo hành 12 tháng và hỗ trợ giao hàng tận nơi!`
      : null;
  }

  if (asksPrice) {
    return null; // Vừa hỏi giá vừa hỏi ship/bảo hành -> câu ghép, để Gemini trả lời
  }

  const parts: string[] = [];
  if (asksWarranty) {
    parts.push(
      `Dạ, chính sách bảo hành của ShopAI như sau ạ:\n${WARRANTY_POLICY}`,
    );
  }
  if (asksShipping) {
    parts.push(
      `${asksWarranty ? 'Còn' : 'Dạ,'} chính sách vận chuyển của ShopAI như sau ạ:\n${SHIPPING_POLICY}`,
    );
  }
  return parts.length > 0 ? parts.join('\n\n') : null;
};
