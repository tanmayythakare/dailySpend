-- =====================================================
-- Migration V8: Add user_id for multi-user isolation
-- =====================================================

-- Add user_id column to accounts
ALTER TABLE accounts
ADD COLUMN user_id BIGINT;

-- Add user_id column to transactions
ALTER TABLE transactions
ADD COLUMN user_id BIGINT;

-- Add user_id column to people
ALTER TABLE people
ADD COLUMN user_id BIGINT;

-- Add user_id column to categories
ALTER TABLE categories
ADD COLUMN user_id BIGINT;

-- Add foreign key constraints (after data migration)
-- Note: We'll make these NOT NULL after assigning a default user

-- Add indexes for performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_people_user_id ON people(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Optional: Add foreign key constraints to users table
ALTER TABLE accounts
ADD CONSTRAINT fk_accounts_user
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_user
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE people
ADD CONSTRAINT fk_people_user
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE categories
ADD CONSTRAINT fk_categories_user
FOREIGN KEY (user_id) REFERENCES users(id);