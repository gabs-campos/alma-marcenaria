CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories (name, slug, created_at, updated_at)
SELECT 'Sob medida', 'sob-medida', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sob-medida');

INSERT INTO categories (name, slug, created_at, updated_at)
SELECT 'Pronta entrega', 'pronta-entrega', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'pronta-entrega');

INSERT INTO categories (name, slug, created_at, updated_at)
SELECT src.category_name, CONCAT('cat-', LOWER(HEX(CRC32(src.category_name)))), NOW(), NOW()
FROM (
  SELECT DISTINCT TRIM(category) AS category_name
  FROM products
  WHERE category IS NOT NULL AND TRIM(category) <> ''
) AS src
LEFT JOIN categories c ON c.name = src.category_name
WHERE c.id IS NULL;

SET @has_category_id := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'category_id'
);
SET @sql_add_category_id := IF(
  @has_category_id = 0,
  'ALTER TABLE products ADD COLUMN category_id INT UNSIGNED NULL AFTER price',
  'SELECT 1'
);
PREPARE stmt_add_category_id FROM @sql_add_category_id;
EXECUTE stmt_add_category_id;
DEALLOCATE PREPARE stmt_add_category_id;

UPDATE products p
LEFT JOIN categories c_slug ON c_slug.slug = p.category
LEFT JOIN categories c_name ON c_name.name = p.category
SET p.category_id = COALESCE(
  c_slug.id,
  c_name.id,
  (SELECT id FROM categories WHERE slug = 'sob-medida' LIMIT 1)
)
WHERE p.category_id IS NULL;

SET @sql_category_not_null := IF(
  EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'category_id'
      AND IS_NULLABLE = 'YES'
  ),
  'ALTER TABLE products MODIFY category_id INT UNSIGNED NOT NULL',
  'SELECT 1'
);
PREPARE stmt_category_not_null FROM @sql_category_not_null;
EXECUTE stmt_category_not_null;
DEALLOCATE PREPARE stmt_category_not_null;

SET @has_idx_products_category_id := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_category_id'
);
SET @sql_add_products_category_idx := IF(
  @has_idx_products_category_id = 0,
  'ALTER TABLE products ADD INDEX idx_products_category_id (category_id)',
  'SELECT 1'
);
PREPARE stmt_add_products_category_idx FROM @sql_add_products_category_idx;
EXECUTE stmt_add_products_category_idx;
DEALLOCATE PREPARE stmt_add_products_category_idx;

SET @has_fk_products_category := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND CONSTRAINT_NAME = 'fk_products_category'
);
SET @sql_add_products_category_fk := IF(
  @has_fk_products_category = 0,
  'ALTER TABLE products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT',
  'SELECT 1'
);
PREPARE stmt_add_products_category_fk FROM @sql_add_products_category_fk;
EXECUTE stmt_add_products_category_fk;
DEALLOCATE PREPARE stmt_add_products_category_fk;

CREATE TABLE IF NOT EXISTS product_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  sort_order TINYINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT uq_product_images_slot UNIQUE (product_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO product_images (product_id, image_path, sort_order, created_at)
SELECT p.id, p.image, 1, NOW()
FROM products p
LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.sort_order = 1
WHERE p.image IS NOT NULL AND TRIM(p.image) <> '' AND pi.id IS NULL;
