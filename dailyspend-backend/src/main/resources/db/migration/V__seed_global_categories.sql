-- =====================================================
-- V10__seed_global_categories.sql
-- Seed global (shared) categories for all users
-- =====================================================

INSERT INTO categories (name, type, user_id, created_at)
VALUES
    ('Groceries',      'EXPENSE', NULL, NOW()),
    ('Transport',      'EXPENSE', NULL, NOW()),
    ('Utilities',      'EXPENSE', NULL, NOW()),
    ('Food',           'EXPENSE', NULL, NOW()),
    ('Dining Out',     'EXPENSE', NULL, NOW()),
    ('Entertainment',  'EXPENSE', NULL, NOW()),
    ('Healthcare',     'EXPENSE', NULL, NOW()),
    ('Education',      'EXPENSE', NULL, NOW()),
    ('Shopping',       'EXPENSE', NULL, NOW()),
    ('Rent',           'EXPENSE', NULL, NOW()),
    
    ('Salary',         'INCOME',  NULL, NOW()),
    ('Freelance',      'INCOME',  NULL, NOW()),
    ('Investment',     'INCOME',  NULL, NOW()),
    ('Interest',       'INCOME',  NULL, NOW())

ON CONFLICT (name, user_id) DO NOTHING;
