export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  CREDIT = 'CREDIT'
}

export interface Account {
  id?: number;
  name: string;
  type: AccountType;
  balance?: number;
}
