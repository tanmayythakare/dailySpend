export interface Transaction {
  id: number;
  amount: number;
  type: 'EXPENSE' | 'MONEY_GIVEN' | 'MONEY_TAKEN';
  description?: string;
  transactionDate: string;
}
