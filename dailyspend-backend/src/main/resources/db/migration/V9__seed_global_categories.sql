-- =====================================================
-- Migration V9: Seed global (shared) categories
-- =====================================================

INSERT INTO categories (name, type, user_id, created_at)
VALUES
    ('Groceries', 'EXPENSE', NULL, NOW()),
    ('Transport', 'EXPENSE', NULL, NOW()),
    ('Utilities', 'EXPENSE', NULL, NOW()),
    ('Entertainment', 'EXPENSE', NULL, NOW()),
    ('Healthcare', 'EXPENSE', NULL, NOW()),
    ('Education', 'EXPENSE', NULL, NOW()),
    ('Shopping', 'EXPENSE', NULL, NOW()),
    ('Dining Out', 'EXPENSE', NULL, NOW()),
    ('Salary', 'INCOME', NULL, NOW()),
    ('Freelance', 'INCOME', NULL, NOW()),
    ('Investment', 'INCOME', NULL, NOW())
ON CONFLICT DO NOTHING;