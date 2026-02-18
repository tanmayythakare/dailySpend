// Backend PersonResponse: { id, name } only
export interface Person {
  id?:  number;
  name: string;
}

// Backend PersonBalanceDto: { id, name, balance, createdAt }
// Returned by GET /api/v1/people/with-balances
export interface PersonBalanceDto {
  id:        number;
  name:      string;
  balance:   number;
  createdAt: string;
}

export interface PersonRequest {
  name: string;
}