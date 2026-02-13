// =======================
// Transaction Response
// =======================

export interface Transaction {
  id: number;

  amount: number;

  type: 'EXPENSE' | 'MONEY_GIVEN' | 'MONEY_TAKEN';

  description?: string;

  transactionDate: string;

  account: {
    id: number;
    name: string;
  };

  category?: {
    id: number;
    name: string;
  };

  person?: {
    id: number;
    name: string;
  };

  version: number;
}

// =======================
// Request DTOs
// =======================

export interface ExpenseRequest {
  accountId: number;
  categoryId: number;
  amount: number;
  description?: string;
  transactionDate: string;
}

export interface MoneyGivenRequest {
  accountId: number;
  personId: number;
  amount: number;
  description?: string;
  transactionDate: string;
}

export interface MoneyTakenRequest {
  accountId: number;
  personId: number;
  amount: number;
  description?: string;
  transactionDate: string;
}
