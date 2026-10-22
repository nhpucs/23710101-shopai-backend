import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs'; // bcryptjs: viết bằng JS thuần, không cần biên dịch C++ như bcrypt

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10); // 10 = độ phức tạp (salt rounds)

  await prisma.user.upsert({
    where: { email: 'demo@shopai.com' },
    update: {},
    create: {
      email: 'demo@shopai.com',
      password: hashedPassword, // Lưu bản ĐÃ HASH, không bao giờ lưu '123456' dạng thường
      name: 'Học viên Demo',
    },
  });

  console.log('Đã seed User demo: demo@shopai.com / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
