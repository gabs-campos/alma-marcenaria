CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  category_id INT UNSIGNED NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'sob-medida',
  image VARCHAR(255) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  sort_order TINYINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT uq_product_images_slot UNIQUE (product_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(190) NOT NULL,
  customer_phone VARCHAR(40) NOT NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS about (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  image VARCHAR(255) NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS home_content (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hero_eyebrow VARCHAR(190) NOT NULL,
  hero_title VARCHAR(255) NOT NULL,
  hero_description TEXT NOT NULL,
  hero_image VARCHAR(255) NULL,
  hero_image_caption VARCHAR(255) NULL,
  feature_1_title VARCHAR(120) NOT NULL,
  feature_1_description TEXT NOT NULL,
  feature_2_title VARCHAR(120) NOT NULL,
  feature_2_description TEXT NOT NULL,
  feature_3_title VARCHAR(120) NOT NULL,
  feature_3_description TEXT NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO about (content, image, updated_at)
SELECT 'A Alma Marcenaria cria móveis autorais com foco em funcionalidade, estética e durabilidade.', NULL, NOW()
WHERE NOT EXISTS (SELECT 1 FROM about);

INSERT INTO categories (name, slug, created_at, updated_at)
SELECT 'Sob medida', 'sob-medida', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sob-medida');

INSERT INTO categories (name, slug, created_at, updated_at)
SELECT 'Pronta entrega', 'pronta-entrega', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'pronta-entrega');

INSERT INTO home_content (
  hero_eyebrow,
  hero_title,
  hero_description,
  hero_image,
  hero_image_caption,
  feature_1_title,
  feature_1_description,
  feature_2_title,
  feature_2_description,
  feature_3_title,
  feature_3_description,
  updated_at
)
SELECT
  'MARCENARIA AUTORAL EM SÃO PAULO',
  'Móveis sob medida com alma de madeira.',
  'Peças únicas com acabamento artesanal e desenho contemporâneo.',
  NULL,
  'Textura & proporção',
  'Sob medida',
  'Projetos pensados para o seu espaço.',
  'Marcenaria fina',
  'Encaixes, textura e proporção com atenção total.',
  'Peças prontas',
  'Linha com entrega mais rápida para seu ambiente.',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM home_content);
