// Person Model
export interface Person {
  id?: number;
  name: string;
  userId?: number;
  balance?: number;
  transactionCount?: number;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
}

// Person Request DTO (for creating/updating)
export interface PersonRequest {
  name: string;
}

// Person Response DTO (from backend)
export interface PersonResponse {
  id: number;
  name: string;
  userId: number;
  balance: number;
  transactionCount: number;
  createdAt: string;
  updatedAt: string;
}