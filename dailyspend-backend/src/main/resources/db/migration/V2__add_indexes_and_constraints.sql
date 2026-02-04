/* =========================
   INDEXES (PERFORMANCE)
   ========================= */

-- Foreign key indexes
CREATE INDEX idx_transactions_account_id
    ON transactions(account_id);

CREATE INDEX idx_transactions_category_id
    ON transactions(category_id);

CREATE INDEX idx_transactions_person_id
    ON transactions(person_id);

-- Frequently queried columns
CREATE INDEX idx_transactions_transaction_date
    ON transactions(transaction_date);

CREATE INDEX idx_categories_type
    ON categories(type);

/* =========================
   CONSTRAINTS (SAFETY)
   ========================= */

-- Amount must be positive
ALTER TABLE transactions
ADD CONSTRAINT chk_transactions_amount_positive
CHECK (amount > 0);

-- Category type constraint
ALTER TABLE categories
ADD CONSTRAINT chk_categories_type
CHECK (type IN ('INCOME', 'EXPENSE'));

-- Account type constraint (example values)
ALTER TABLE accounts
ADD CONSTRAINT chk_accounts_type
CHECK (type IN ('CASH', 'BANK', 'CREDIT'));

-- Prevent empty names
ALTER TABLE accounts
ALTER COLUMN name SET NOT NULL;

ALTER TABLE categories
ALTER COLUMN name SET NOT NULL;

ALTER TABLE people
ALTER COLUMN name SET NOT NULL;
