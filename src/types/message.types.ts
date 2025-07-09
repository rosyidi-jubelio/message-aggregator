export interface OrderMessage {
  tenantId: string;
  companyId: number;
  storeId: string;
  channelId: number;
  refNos: string[];
}
