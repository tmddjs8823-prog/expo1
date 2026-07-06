import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AdminUserListDto {
  @Expose() id: number;
  @Expose() username: string;
  @Expose() role: string;
  @Expose() status: string;
  @Expose() provider?: string;
  @Expose() createdAt: string;
}
