// Backend AccountType enum: CASH, BANK, CREDIT only — no WALLET
export enum AccountType {
  CASH   = 'CASH',
  BANK   = 'BANK',
  CREDIT = 'CREDIT'
}

export interface Account {
  id?:      number;
  name:     string;
  type:     AccountType;
  balance?: number;
}