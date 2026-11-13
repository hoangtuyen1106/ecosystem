import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  @ApiProperty()
  id: string | number;

  @ApiProperty({ type: String, example: '14/11/2026 01:22:35' })
  createdAt: string;

  @ApiProperty({ type: String, example: '14/11/2026 01:22:35' })
  updatedAt: string;
}
