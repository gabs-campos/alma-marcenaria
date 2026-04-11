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
