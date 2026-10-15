import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ example: '1' }) 
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 }) 
  @IsNumber()
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] }) // ➕
  @IsArray()
  @IsArray()
  @ArrayNotEmpty({ message: 'Giỏ hàng đang trống, không thể đặt hàng' })
  @ValidateNested({ each: true }) // Kiểm tra TỪNG phần tử bên trong mảng
  @Type(() => OrderItemDto) // BẮT BUỘC: báo cho class-transformer biết kiểu phần tử là gì
  items: OrderItemDto[];

  @ApiProperty({ example: 129998000 }) 
  @IsNumber()
  @Min(0)
  total: number; // Chỉ dùng để ĐỐI CHIẾU, không dùng để ghi vào đơn (Phần 9.12 mục 2)
}
