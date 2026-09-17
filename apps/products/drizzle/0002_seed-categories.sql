-- Custom SQL migration file, put your code below! --
INSERT INTO categories (name, charge) VALUES
    ('Electronics', 5),
    ('Apparel', 3),
    ('Home & Kitchen', 4),
    ('Grocery', 2),
    ('Furniture', 6),
    ('Sports & Outdoors', 4),
    ('Health & Beaty', 3),
    ('Office Supplies', 4),
    ('Toys & Game', 3)
ON CONFLICT (name) DO NOTHING;