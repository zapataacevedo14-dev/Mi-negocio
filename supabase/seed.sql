-- =============================================================================
-- ALABASTRO ALTA PERFUMERÍA — DATOS SEMILLA ESTÁNDAR SUPABASE (seed.sql)
-- Incluye: Cuenta Maestra Admin, 22 Fragancias Árabes Originales,
-- Configuración Comercial, Pedidos, Suscriptores y Reseñas Verificadas.
-- =============================================================================

BEGIN;

-- 1. Usuario Maestro en auth.users (si las políticas del motor lo permiten) y public.users
DO $$
BEGIN
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at, role, aud,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@alabastro.com',
    '$2a$10$pfX7DsKQo1mXbCrm7AZD4OxrpNLg82cOpIABE4.hUCBPec0Janzpm',
    timezone('utc'::text, now()),
    'authenticated',
    'authenticated',
    '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
    '{"legacy_id": "usr-admin-master-001", "name": "Director Alabastro", "phone": "+57 311 254 9053", "role": "admin"}'::jsonb
  );
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END
$$;

INSERT INTO public.users (
  id, auth_user_id, name, email, phone, password_hash, role
) VALUES (
  'usr-admin-master-001',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Director Alabastro',
  'admin@alabastro.com',
  '+57 311 254 9053',
  '$2a$10$pfX7DsKQo1mXbCrm7AZD4OxrpNLg82cOpIABE4.hUCBPec0Janzpm',
  'admin'
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  auth_user_id = COALESCE(public.users.auth_user_id, EXCLUDED.auth_user_id);

-- 2. Catálogo Oficial de 22 Fragancias Árabes Originales
INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'lattafa-asad', 'Lattafa Asad', 'Lattafa Asad Eau de Parfum 100ml', 'Lattafa', 'hombre', 'Hombre',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/lattafa-asad.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'oriental', 'Oriental Especiada Cálida',
  195000, 45, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum (Alta Fijación)', 'La fragancia masculina árabe más reconocida a nivel mundial. Inicia con un estallido magnético de pimienta negra crujiente, piña caramelizada y hojas de tabaco rubio curado. En su evolución emerge un corazón reconfortante de café arábico tostado, pachulí e iris aterciopelado, reposando sobre un fondo rico y duradero de vainilla bourbon, ámbar cálido, benjuí y cedro seco.',
  '["Pimienta Negra","Piña Jugosa","Tabaco Maduro"]'::jsonb, '["Café Arábico Tostado","Pachulí de Indonesia","Iris Sedoso"]'::jsonb, '["Vainilla Bourbon","Ámbar Cálido","Benjuí de Siam","Madera de Cedro"]'::jsonb,
  '+12 a 14 Horas garantizadas en piel', 'Intensa, envolvente y distinguida', 'Noches templadas, citas, oficina ejecutiva y eventos de alta presencia', '{"liquid1":"#261C14","liquid2":"#120B07","accent":"#D4AF7A","cap":"#C5A059"}'::jsonb, '{"occasions":["noche","gala","diario"],"sensations":["seduccion","confort"],"intensities":["notable","intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'lattafa-yara', 'Lattafa Yara', 'Lattafa Yara Eau de Parfum 100ml', 'Lattafa', 'mujer', 'Mujer',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/lattafa-yara.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'gourmand', 'Dulce Gourmand Frutal',
  189000, 50, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum', 'El fenómeno viral femenino de Lattafa que conquistó la perfumería internacional. Una composición dulce, cremosa y etérea que recuerda a un batido de fresas silvestres y orquídeas con crema batida. Abre con toques luminosos de heliotropo y mandarina, fusionándose con frutas tropicales maduras sobre un manto de vainilla pura de Madagascar, almizcle blanco y sándalo sedoso.',
  '["Heliotropo","Orquídea","Mandarina Dulce"]'::jsonb, '["Acorde Gourmand Cremoso","Frutas Tropicales Maduras"]'::jsonb, '["Vainilla de Madagascar","Almizcle Blanco","Sándalo Cremoso"]'::jsonb,
  '8 a 10 Horas en piel y ropa', 'Moderada a notable, dulce y encantadora', 'Uso diario, primavera, citas románticas y salidas casuales', '{"liquid1":"#6E2A36","liquid2":"#331017","accent":"#E8A7B5","cap":"#D4AF7A"}'::jsonb, '{"occasions":["diario","noche"],"sensations":["romance","confort"],"intensities":["moderada","notable"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'lattafa-khamrah', 'Lattafa Khamrah', 'Lattafa Khamrah Eau de Parfum 100ml', 'Lattafa', 'unisex', 'Unisex',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/lattafa-khamrah.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'oriental', 'Oriental Especiada Gourmand',
  235000, 35, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum de Lujo', 'La joya gourmet más prestigiosa de Lattafa, envasada en un frasco de cristal tallado estilo licorera de lujo. Una opulenta danza de canela dulce de Ceilán y nuez moscada con dátiles del desierto y praliné tostado. El secado es pura calidez aristocrática con vainilla bourbon, haba tonka tostada, resinas de benjuí y mirra sagrada.',
  '["Canela de Ceilán","Nuez Moscada","Bergamota"]'::jsonb, '["Dátiles del Desierto","Praliné Tostado","Nardos Nobles","Mahonial"]'::jsonb, '["Vainilla Bourbon","Haba Tonka Negra","Benjuí","Madera de Ámbar","Mirra"]'::jsonb,
  '+14 Horas de fijación excepcional', 'Pesada, hipnótica y memorable', 'Noches frías, celebraciones de gala, veladas inolvidables', '{"liquid1":"#5A3515","liquid2":"#281507","accent":"#ECC88F","cap":"#B28A56"}'::jsonb, '{"occasions":["noche","gala"],"sensations":["seduccion","confort"],"intensities":["notable","intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'lattafa-badee-al-oud', 'Lattafa Bade''e Al Oud', 'Lattafa Bade''e Al Oud (Oud for Glory) 100ml', 'Lattafa', 'unisex', 'Unisex',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/lattafa-badee-al-oud.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'amaderada', 'Oriental Amaderada Misteriosa',
  215000, 28, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum Intenso', 'Conocido mundialmente como "Oud for Glory", este perfume representa el lujo oscuro y majestuoso de Oriente Medio. Abre con acordes preciosos de azafrán, lavanda y nuez moscada, dando paso a una madera de Oud natural envolvente fusionada con pachulí terroso y almizcle negro.',
  '["Azafrán Noble","Nuez Moscada","Lavanda Francesa"]'::jsonb, '["Madera de Oud Natural","Pachulí Oscuro"]'::jsonb, '["Oud Resinoso","Pachulí Macerado","Almizcle Negro"]'::jsonb,
  '+14 a 16 Horas de fijación garantizada', 'Poderosa, profunda y dominante', 'Galas nocturnas, clima fresco, eventos de alta distinción', '{"liquid1":"#3D2214","liquid2":"#140A06","accent":"#ECC88F","cap":"#B28A56"}'::jsonb, '{"occasions":["noche","gala"],"sensations":["seduccion"],"intensities":["intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'afnan-9pm', 'Afnan 9 PM', 'Afnan 9 PM Eau de Parfum 100ml', 'Afnan', 'hombre', 'Hombre',
  'Emiratos Árabes Unidos', 'assets/perfumes/afnan-9pm.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'oriental', 'Oriental Fougère Dulce Especiada',
  229000, 38, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum', 'El rey de la noche y de los cumplidos. Afnan 9 PM abre con una salida irresistible de manzana silvestre dulce, canela cálida, bergamota y lavanda aromática, evolucionando hacia un corazón de flor de azahar y asentándose sobre una base seductora de vainilla negra, haba tonka y ámbar gris.',
  '["Manzana Silvestre","Canela Cálida","Lavanda Salvaje","Bergamota"]'::jsonb, '["Flor de Azahar del Naranjo","Lirio de los Valles"]'::jsonb, '["Vainilla Negra","Haba Tonka","Ámbar Gris","Pachulí"]'::jsonb,
  '+12 Horas de proyección continua', 'Envolvente, seductora y sumamente atractiva', 'Fiestas nocturnas, salidas nocturnas, citas y clima templado', '{"liquid1":"#1F2A38","liquid2":"#0D131B","accent":"#B4C7DC","cap":"#D4AF7A"}'::jsonb, '{"occasions":["noche","diario"],"sensations":["seduccion","confort"],"intensities":["notable","intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'armaf-club-de-nuit-intense-man', 'Armaf Club de Nuit Intense Man', 'Armaf Club de Nuit Intense Man EDT 105ml', 'Armaf', 'hombre', 'Hombre',
  'Emiratos Árabes Unidos', 'assets/perfumes/armaf-club-de-nuit-intense-man.jpg', 'Eau de Toilette — 105ml / 3.6 FL. OZ.', 'citrica', 'Cítrica Amaderada Ahumada',
  219000, 40, '105 ml / 3.6 FL. OZ.', 'Eau de Toilette Concentrado', 'El perfume más influyente de la casa Armaf. Su salida chispeante de limón siciliano, piña y grosellas negras evoluciona hacia un corazón ahumado de madera de abedul y jazmín blanco, con un fondo icónico de almizcle, ámbar gris y pachulí que proyecta poder y confianza.',
  '["Limón Siciliano","Piña Fresca","Grosellas Negras","Bergamota","Manzana"]'::jsonb, '["Madera de Abedul Ahumada","Jazmín Blanco","Rosa de Damasco"]'::jsonb, '["Almizcle Sensual","Ámbar Gris Mineral","Pachulí Terroso","Vainilla"]'::jsonb,
  '+10 a 12 Horas de duración', 'Muy alta, firma inmediatamente reconocible', 'Oficina ejecutiva, uso diario versátil, eventos formales y todas las estaciones', '{"liquid1":"#1E1E1E","liquid2":"#0A0A0A","accent":"#C0C0C0","cap":"#8A8A8A"}'::jsonb, '{"occasions":["diario","gala","noche"],"sensations":["seduccion","frescura"],"intensities":["notable","intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'armaf-club-de-nuit-woman', 'Armaf Club de Nuit Woman', 'Armaf Club de Nuit Woman EDP 105ml', 'Armaf', 'mujer', 'Mujer',
  'Emiratos Árabes Unidos', 'assets/perfumes/armaf-club-de-nuit-woman.png', 'Eau de Parfum — 105ml / 3.6 FL. OZ.', 'floral', 'Floral Frutal Chipre Elegante',
  209000, 32, '105 ml / 3.6 FL. OZ.', 'Eau de Parfum', 'Una fragancia femenina refinada de estirpe chipre floral. Combina acordes cítricos luminosos de naranja y toronja con un ramo opulento de rosas, jazmín y durazno melocotón, cerrando con la sensualidad limpia del pachulí macerado, vainilla y vetiver.',
  '["Naranja Dulce","Bergamota","Toronja","Durazno Melocotón"]'::jsonb, '["Rosa Romántica","Jazmín Sambac","Lichi Jugoso","Geranio"]'::jsonb, '["Pachulí Radiante","Vainilla Bourbon","Almizcle Limpio","Vetiver"]'::jsonb,
  '+9 a 11 Horas de fijación', 'Moderada a notable, elegante y femenina', 'Eventos diurnos, cócteles, oficina, primavera y ocasiones formales', '{"liquid1":"#4A3B2C","liquid2":"#241B12","accent":"#E8D5B5","cap":"#D4AF7A"}'::jsonb, '{"occasions":["diario","gala"],"sensations":["romance","seduccion"],"intensities":["moderada","notable"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'rasasi-hawas-for-him', 'Rasasi Hawas for Him', 'Rasasi Hawas for Him Eau de Parfum 100ml', 'Rasasi', 'hombre', 'Hombre',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/rasasi-hawas-for-him.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'acuatica', 'Acuática Marina Aromática Especiada',
  295000, 22, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum de Alta Proyección', 'La cumbre de la frescura acuática y especiada de Rasasi. Una explosión vibrante de notas marinas, ciruela violeta, manzana crujiente y limón de Amalfi se combinan con cardamomo y azahar sobre una base oceánica de ámbar gris mineral y maderas flotantes.',
  '["Manzana Crujiente","Bergamota Italiana","Limón","Canela"]'::jsonb, '["Notas Acuáticas Marinas","Ciruela Violeta","Cardamomo","Flor de Azahar"]'::jsonb, '["Ámbar Gris Mineral","Almizcle Limpio","Madera Flotante","Pachulí"]'::jsonb,
  '+10 a 12 Horas con excelente rendimiento', 'Fuerte, fresca y de largo alcance', 'Verano, clima tropical, salidas informales, calor y momentos activos', '{"liquid1":"#263B4D","liquid2":"#101B24","accent":"#8ABFD4","cap":"#B28A56"}'::jsonb, '{"occasions":["calor","diario"],"sensations":["frescura","seduccion"],"intensities":["notable","intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'al-haramain-amber-oud-gold', 'Al Haramain Amber Oud Gold Edition', 'Al Haramain Amber Oud Gold Edition 120ml', 'Al Haramain', 'unisex', 'Unisex',
  'Emiratos Árabes Unidos', 'assets/perfumes/al-haramain-amber-oud-gold.png', 'Eau de Parfum — 120ml / 4.0 FL. OZ.', 'oriental', 'Oriental Frutal Ambarada de Lujo',
  345000, 18, '120 ml / 4.0 FL. OZ.', 'Eau de Parfum', 'Una fragancia icónica de puro prestigio. Notas dulces y jugosas de melón maduro y piña fresca se funden con bergamota y un acorde ambarado suntuoso, descansando sobre una base de maderas nobles, almizcle blanco y vainilla cremosa. Fijación insuperable y estela opulenta.',
  '["Bergamota de Calabria","Notas Verdes Frescas"]'::jsonb, '["Melón Dulce","Piña Exótica","Notas Ámbar","Acorde Gourmand"]'::jsonb, '["Vainilla Cremosa","Almizcle Puro","Maderas Nobles Orientales"]'::jsonb,
  '+16 Horas de fijación extrema en piel', 'Pesada, opulenta y radiante', 'Ocasiones de lujo, eventos de gala y noches especiales', '{"liquid1":"#5E411B","liquid2":"#2B1B09","accent":"#ECC88F","cap":"#D4AF7A"}'::jsonb, '{"occasions":["gala","noche"],"sensations":["seduccion","confort"],"intensities":["intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'swiss-arabian-shaghaf-oud', 'Swiss Arabian Shaghaf Oud', 'Swiss Arabian Shaghaf Oud EDP 75ml', 'Swiss Arabian', 'unisex', 'Unisex',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/swiss-arabian-shaghaf-oud.png', 'Eau de Parfum — 75ml / 2.5 FL. OZ.', 'amaderada', 'Oriental Amaderada Gourmand con Oud',
  249000, 25, '75 ml / 2.5 FL. OZ.', 'Eau de Parfum Oro Puro', 'La fragancia más emblemática de la histórica casa suizo-árabe Swiss Arabian. Azafrán precioso abre paso a un corazón apasionado de rosa damascena y madera de Oud natural, bañado en praliné dulce y vainilla dorada. Calidez, pasión y lujo en un frasco dorado.',
  '["Azafrán Imperial de Persia"]'::jsonb, '["Rosa de Damasco Macerada","Madera de Agar (Oud)"]'::jsonb, '["Praliné Dulce","Vainilla Cálida","Oud Dorado"]'::jsonb,
  '+14 a 16 Horas de rendimiento', 'Intensa, cálida, dulce y envolvente', 'Noches frías, celebraciones invernales y amantes del Oud gourmet', '{"liquid1":"#523A1B","liquid2":"#24180A","accent":"#F5DC9A","cap":"#B28A56"}'::jsonb, '{"occasions":["noche","gala"],"sensations":["seduccion","confort"],"intensities":["intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'maison-alhambra-kismet-magic', 'Maison Alhambra Kismet Magic', 'Maison Alhambra Kismet Magic EDP 100ml', 'Maison Alhambra', 'unisex', 'Unisex',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/maison-alhambra-kismet-magic.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'gourmand', 'Oriental Gourmand Licorosa',
  195000, 30, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum', 'Una experiencia olfativa adictiva y licorosa. Apertura de coñac añejo y canela dulce que da paso a notas tostadas de haba tonka y roble maduro, coronadas con un fondo delicioso de praliné crocante, vainilla bourbon y sándalo cremoso.',
  '["Coñac Francés Licoroso","Canela Dulce"]'::jsonb, '["Haba Tonka Negra","Madera de Roble","Caramelo Tostado"]'::jsonb, '["Vainilla Bourbon","Praliné Crocante","Sándalo Cremoso"]'::jsonb,
  '+10 a 12 Horas de duración', 'Cálida, magnética y sensual', 'Citas nocturnas, otoño/invierno, veladas íntimas y cenas elegantes', '{"liquid1":"#4F2E1B","liquid2":"#231209","accent":"#ECC88F","cap":"#B28A56"}'::jsonb, '{"occasions":["noche","diario"],"sensations":["seduccion","confort"],"intensities":["notable","intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'fragrance-world-signature', 'Fragrance World Signature', 'Fragrance World Signature EDP 80ml', 'Fragrance World', 'unisex', 'Unisex',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/fragrance-world-signature.png', 'Eau de Parfum — 80ml / 2.7 FL. OZ.', 'amaderada', 'Amaderada Aromática Especiada',
  185000, 26, '80 ml / 2.7 FL. OZ.', 'Eau de Parfum', 'La creación insignia de Fragrance World. Destaca por su frescura herbal de albahaca y pimienta rosa, con un corazón elegante de vetiver y maderas ahumadas, y un fondo distinguido de cedro del Atlas, pachulí y ámbar seco.',
  '["Albahaca Fresca","Pimienta Rosa"]'::jsonb, '["Vetiver de Haití","Maderas Nobles Ahumadas"]'::jsonb, '["Cedro Atlas","Pachulí Terroso","Ámbar Seco"]'::jsonb,
  '8 a 10 Horas de fijación', 'Elegante, equilibrada y pulcra', 'Oficina, reuniones de negocios y uso diario sofisticado', '{"liquid1":"#36402E","liquid2":"#1A2116","accent":"#A8C99B","cap":"#D4AF7A"}'::jsonb, '{"occasions":["diario","calor"],"sensations":["frescura","confort"],"intensities":["moderada","notable"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'lattafa-fakhar-black', 'Fakhar Black', 'Lattafa Fakhar Black Eau de Parfum 100ml', 'Lattafa', 'hombre', 'Hombre',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/lattafa-fakhar-black.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'amaderada', 'Aromático / Amaderado',
  165000, 40, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum', 'La icónica fragancia masculina de Lattafa que combina la frescura aromática de la manzana verde, bergamota y lavanda con un corazón de flor de naranja y geranio, culminando en un fondo profundo de haba tonka, vetiver, cedro y ámbar sedoso.',
  '["Manzana Verde","Bergamota","Lavanda Francesa"]'::jsonb, '["Flor de Naranja","Geranio","Salvia"]'::jsonb, '["Haba Tonka","Madera de Cedro","Vetiver","Ámbar"]'::jsonb,
  '+10 a 12 Horas de duración', 'Notable, elegante y versátil', 'Oficina, eventos de día, salidas casuales y cenas', '{"liquid1":"#1A1A1A","liquid2":"#0D0D0D","accent":"#D4AF7A","cap":"#C0C0C0"}'::jsonb, '{"occasions":["diario","noche"],"sensations":["frescura","seduccion"],"intensities":["moderada","notable"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'afnan-supremacy-not-only-intense', 'Supremacy Not Only Intense', 'Afnan Supremacy Not Only Intense Extrait de Parfum 100ml', 'Afnan', 'hombre', 'Hombre',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/afnan-supremacy-not-only-intense.png', 'Extrait de Parfum — 100ml / 3.4 FL. OZ.', 'amaderada', 'Frutal / Musgo',
  280000, 35, '100 ml / 3.4 FL. OZ.', 'Extrait de Parfum', 'Extrait de Parfum chipre frutal de altísima concentración. Abre con una explosión jugosa de grosella negra, bergamota y manzana fresca, evolucionando hacia un corazón de musgo de roble, pachulí y lavanda, anclado en ámbar gris, almizcle y azafrán.',
  '["Grosellas Negras","Bergamota","Manzana Crujiente"]'::jsonb, '["Musgo de Roble","Pachulí Terroso","Lavanda"]'::jsonb, '["Ámbar Gris","Almizcle Blanco","Azafrán"]'::jsonb,
  '+14 a 16 Horas de fijación extrema', 'Poderosa, imponente y aristocrática', 'Reuniones ejecutivas, galas, climas templados a fríos', '{"liquid1":"#2D3134","liquid2":"#16191B","accent":"#E0E0E0","cap":"#A0A0A0"}'::jsonb, '{"occasions":["gala","noche","diario"],"sensations":["seduccion","confort"],"intensities":["intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'lattafa-nebras', 'Nebras', 'Lattafa Nebras Eau de Parfum 100ml', 'Lattafa', 'unisex', 'Unisex',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/lattafa-nebras.png', 'Eau de Parfum de Lujo — 100ml / 3.4 FL. OZ.', 'gourmand', 'Dulce / Gourmand',
  210000, 45, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum', 'Un homenaje a la dulzura sensual y gourmand. Abre con bayas rojas jugosas y mandarina madura, fundiéndose en un corazón irresistible de cacao intenso, vainilla cremosa y rosa suave, sobre una base de azúcar morena, haba tonka y ámbar cálido.',
  '["Bayas Rojas","Mandarina Jugosa"]'::jsonb, '["Cacao Puro","Vainilla Cremosa","Rosa Damascena"]'::jsonb, '["Azúcar Morena","Haba Tonka","Ámbar Cálido","Almizcle"]'::jsonb,
  '+12 a 14 Horas de presencia', 'Envolvente, cálida y deliciosa', 'Citas románticas, noches frías, momentos íntimos', '{"liquid1":"#5E381A","liquid2":"#281406","accent":"#ECC88F","cap":"#D4AF7A"}'::jsonb, '{"occasions":["noche","diario"],"sensations":["seduccion","confort"],"intensities":["notable"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'maison-alhambra-porto-neroli', 'Porto Neroli', 'Maison Alhambra Porto Neroli Eau de Parfum 80ml', 'Maison Alhambra', 'unisex', 'Unisex',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/maison-alhambra-porto-neroli.png', 'Eau de Parfum — 80ml / 2.7 FL. OZ.', 'citrica', 'Cítricos / Fresco',
  160000, 40, '80 ml / 2.7 FL. OZ.', 'Eau de Parfum', 'Evocación luminosa de la Riviera y la brisa mediterránea. Destaca por sus notas vivaces de neroli de Túnez, flor de azahar, bergamota italiana y limón siciliano, suavizadas por una caricia de lavanda, romero, ámbar y mirto fresco.',
  '["Neroli de Túnez","Limón Siciliano","Mandarina"]'::jsonb, '["Flor de Azahar","Jazmín Marino","Lavanda"]'::jsonb, '["Ámbar Blanco","Almizcle Puro","Madera de Cedro"]'::jsonb,
  '7 a 9 Horas de frescura radiante', 'Moderada, limpia y revitalizante', 'Días soleados, verano, oficina, paseos al aire libre', '{"liquid1":"#0E7C86","liquid2":"#05383E","accent":"#5CE1E6","cap":"#D4AF7A"}'::jsonb, '{"occasions":["diario"],"sensations":["frescura"],"intensities":["moderada"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'al-haramain-laventure', 'L''Aventure', 'Al Haramain L''Aventure Eau de Parfum 100ml', 'Al Haramain', 'hombre', 'Hombre',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/al-haramain-laventure.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'amaderada', 'Cítricos / Amaderados',
  220000, 50, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum', 'Una joya emiratí aclamada por su apertura cítrica electrizante de bergamota y limón con elemí, transitando con maestría hacia notas de lirio de los valles, jazmín y maderas nobles, reposando en pachulí, ámbar y almizcle blanco.',
  '["Bergamota Chispeante","Limón","Elemí"]'::jsonb, '["Lirio de los Valles","Jazmín Suave","Maderas Blancas"]'::jsonb, '["Pachulí","Ámbar Seco","Almizcle"]'::jsonb,
  '+11 Horas de rendimiento', 'Marcada, pulcra y sofisticada', 'Uso profesional diario, firmas de contratos, ocasiones distinguidas', '{"liquid1":"#3A3F44","liquid2":"#1C1F22","accent":"#E8E8E8","cap":"#C0C0C0"}'::jsonb, '{"occasions":["diario","gala"],"sensations":["frescura","seduccion"],"intensities":["notable"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'swiss-arabian-casablanca', 'Casablanca', 'Swiss Arabian Casablanca Eau de Parfum 100ml', 'Swiss Arabian', 'mujer', 'Mujer',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/swiss-arabian-casablanca.png', 'Eau de Parfum de Lujo — 100ml / 3.4 FL. OZ.', 'gourmand', 'Dulce / Frutal',
  260000, 40, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum', 'Inspirada en el misterio y la elegancia de la mítica ciudad marroquí. Abre con manzanas crujientes y uvas maduras, entrelazadas con caramelo dorado y pachulí aterciopelado, reposando sobre un lecho sensual de ámbar líquido, gamuza y almizcle blanco.',
  '["Manzana Madura","Uvas Jugosas"]'::jsonb, '["Caramelo Tostado","Pachulí Aterciopelado","Lirio"]'::jsonb, '["Ámbar Líquido","Gamuza Suave","Almizcle Blanco"]'::jsonb,
  '+12 Horas de encanto garantizado', 'Sensual, envolvente y adictiva', 'Citas especiales, noches templadas, tardes elegantes', '{"liquid1":"#6E4518","liquid2":"#2F1A06","accent":"#ECC88F","cap":"#C5A059"}'::jsonb, '{"occasions":["noche","diario"],"sensations":["seduccion","romance"],"intensities":["notable","intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'armaf-tres-nuit', 'Tres Nuit', 'Armaf Tres Nuit Eau de Parfum 100ml', 'Armaf', 'hombre', 'Hombre',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/armaf-tres-nuit.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'floral', 'Floral / Fresco',
  155000, 45, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum', 'Una oda a la frescura verde aristocrática. Abre con notas limpias de verbena de limón, iris empolvado y lavanda, desplegando un corazón floral de violetas silvestres y toques especiados, finalizando en un fondo de sándalo y ámbar gris refinado.',
  '["Verbena de Limón","Iris Noble","Limón"]'::jsonb, '["Hojas de Violeta","Lavanda","Toques Especiados"]'::jsonb, '["Ámbar Gris","Madera de Sándalo"]'::jsonb,
  '8 a 10 Horas en piel', 'Agradable, pulcra y caballerosa', 'Primavera, verano, oficina, eventos de día', '{"liquid1":"#1E293B","liquid2":"#0F172A","accent":"#94A3B8","cap":"#CBD5E1"}'::jsonb, '{"occasions":["diario"],"sensations":["frescura"],"intensities":["moderada"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'fragrance-world-barakkat-rouge-540', 'Barakkat Rouge 540', 'Fragrance World Barakkat Rouge 540 Eau de Parfum 100ml', 'Fragrance World', 'unisex', 'Unisex',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/fragrance-world-barakkat-rouge-540.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'amaderada', 'Dulce / Amaderado',
  145000, 55, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum', 'El aclamado tributo al brillo del cristal y el ámbar mineral. Inicia con azafrán resplandeciente y jazmín aéreo, transformándose en una estela de madera de cedro dulce, ámbar gris mineral y toques algodonados de azúcar caramelizada.',
  '["Azafrán Radiante","Jazmín Grandiflorum"]'::jsonb, '["Madera de Ámbar","Ámbar Gris Mineral"]'::jsonb, '["Resina de Abeto","Cedro Rojo de Virginia"]'::jsonb,
  '+12 Horas de presencia hipnótica', 'Inolvidable, etérea y magnética', 'Celebraciones, galas, cualquier época del año', '{"liquid1":"#7A1C20","liquid2":"#350A0C","accent":"#F0C068","cap":"#ECC88F"}'::jsonb, '{"occasions":["gala","noche"],"sensations":["seduccion"],"intensities":["intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'paris-corner-emir-celestial', 'Emir Celestial', 'Paris Corner Emir Celestial Eau de Parfum 100ml', 'Paris Corner', 'unisex', 'Unisex',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/paris-corner-emir-celestial.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'amaderada', 'Cuero / Especiado',
  195000, 35, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum', 'Composición futurista y vanguardista con matices minerales y de cuero suave. Despliega notas fascinantes de hojas de violeta, mandarina italiana y flor de siempreviva, complementadas con cuero fino, gamuza y un fondo mineral magnético de Akigalawood.',
  '["Mandarina Italiana","Flor de Siempreviva","Azafrán"]'::jsonb, '["Hojas de Violeta","Gamuza Fina","Osmanthus"]'::jsonb, '["Madera de Akigala","Cuero Suave","Notas Minerales"]'::jsonb,
  '+12 a 14 Horas de fijación', 'Distinguida, única y vanguardista', 'Noches cosmopolitas, clima templado a fresco, arte y diseño', '{"liquid1":"#142850","liquid2":"#081226","accent":"#D4AF7A","cap":"#C5A059"}'::jsonb, '{"occasions":["noche","gala"],"sensations":["seduccion","confort"],"intensities":["notable"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

INSERT INTO public.products (
  id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
  family, family_display, price, stock, size, concentration, description,
  top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
) VALUES (
  'lattafa-ameer-al-oudh-intense-oud', 'Ameer Al Oudh Intense Oud', 'Lattafa Ameer Al Oudh Intense Oud 100ml', 'Lattafa', 'unisex', 'Unisex',
  'Dubái, Emiratos Árabes Unidos', 'assets/perfumes/lattafa-ameer-al-oudh-intense-oud.png', 'Eau de Parfum — 100ml / 3.4 FL. OZ.', 'oriental', 'Oriental / Dulce',
  185000, 45, '100 ml / 3.4 FL. OZ.', 'Eau de Parfum', 'El aroma de una chimenea aristocrática en una noche árabe de invierno. Un abrazo cálido de maderas tostadas, azúcar morena caramelizada y vainilla bourbon, enriquecido con madera de oud especiada, ládano y notas balsámicas profundamente reconfortantes.',
  '["Madera de Oud Especiada","Maderas Tostadas"]'::jsonb, '["Vainilla Bourbon","Azúcar Caramelizada"]'::jsonb, '["Oud Puro","Sándalo","Resinas de Benjuí"]'::jsonb,
  '+14 Horas de fijación acogedora', 'Cálida, generosa y envolvente', 'Climas fríos, invierno, veladas nocturnas junto al fuego', '{"liquid1":"#542E10","liquid2":"#201004","accent":"#ECC88F","cap":"#B28A56"}'::jsonb, '{"occasions":["noche","diario"],"sensations":["confort","seduccion"],"intensities":["intensa"]}'::jsonb,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  gender_display = EXCLUDED.gender_display,
  origin = EXCLUDED.origin,
  image = EXCLUDED.image,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  family_display = EXCLUDED.family_display,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

-- 3. Configuración Global de Tienda
INSERT INTO public.settings (key, value, description)
VALUES (
  'store_config',
  '{"storeName":"ALABASTRO — Alta Perfumería","contactPhone":"+57 311 254 9053","contactEmail":"concierge@alabastro.com.co","whatsappSales":"573112549053","freeShippingThreshold":350000,"bannerNotice":"Envíos Nacionales Asegurados sin costo en compras superiores a $350.000 COP","enableStoreOrders":true}'::jsonb,
  'Configuración comercial principal de ALABASTRO'
)
ON CONFLICT (key) DO NOTHING;




-- 4. Clientes Registrados
INSERT INTO public.users (id, name, email, phone, password_hash, role, created_at)
VALUES (
  'usr-customer-001',
  'Santiago Zapata',
  'santiago@alabastro.co',
  '+57 311 254 9053',
  '$2a$10$pfX7DsKQo1mXbCrm7AZD4Od4K07kW/zkg4FctPTlKCfP4C5WbFpK2',
  'customer',
  '2026-10-26T03:27:29.703Z'
)
ON CONFLICT (email) DO NOTHING;

-- 5. Pedidos Históricos Verificados
INSERT INTO public.orders (
  id, user_id, customer_name, customer_email, customer_phone, shipping_address,
  city, payment_method, status, subtotal, shipping_cost, total, gift_packaging,
  notes, items, created_at
) VALUES (
  'ORD-2026-9041', NULL, 'Valeria Restrepo', 'valeria.restrepo@luxury.co', '+57 312 458 9912',
  'Cra 43A # 1-50, Edificio Santillana Apto 902', 'Medellín', 'transferencia', 'entregado',
  470000, 0, 470000, TRUE, 'Fragancia empacada con cinta dorada de lujo para obsequio.',
  '[{"id":"lattafa-khamrah","name":"Lattafa Khamrah","price":235000,"quantity":2}]'::jsonb,
  '2026-10-24T03:27:29.525Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.orders (
  id, user_id, customer_name, customer_email, customer_phone, shipping_address,
  city, payment_method, status, subtotal, shipping_cost, total, gift_packaging,
  notes, items, created_at
) VALUES (
  'ORD-2026-9042', NULL, 'Camilo Echeverri', 'camilo.ech@bogota.co', '+57 300 891 2244',
  'Calle 116 # 9-45, Chicó Norte', 'Bogotá', 'contraentrega', 'en_preparacion',
  195000, 15000, 210000, FALSE, 'Favor timbrar en recepción.',
  '[{"id":"lattafa-asad","name":"Lattafa Asad","price":195000,"quantity":1}]'::jsonb,
  '2026-10-25T22:27:29.525Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.orders (
  id, user_id, customer_name, customer_email, customer_phone, shipping_address,
  city, payment_method, status, subtotal, shipping_cost, total, gift_packaging,
  notes, items, created_at
) VALUES (
  'ORD-2026-9043', NULL, 'Mariana Zuluaga', 'mariana.z@cali.co', '+57 315 780 1234',
  'Avenida Colombia # 4N-20, Ciudad Jardín', 'Cali', 'wompi', 'confirmado',
  378000, 0, 378000, TRUE, 'Regalo especial de aniversario.',
  '[{"id":"lattafa-yara","name":"Lattafa Yara","price":189000,"quantity":2}]'::jsonb,
  '2026-10-26T02:27:29.525Z'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Suscriptores del Círculo Privado
INSERT INTO public.subscribers (email, active, created_at)
VALUES ('sofia.duque@luxury.com', TRUE, '2026-10-26T03:27:29.703Z')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.subscribers (email, active, created_at)
VALUES ('felipe.arias@inversionistas.co', TRUE, '2026-10-26T03:27:29.703Z')
ON CONFLICT (email) DO NOTHING;

-- 7. Reseñas Verificadas
INSERT INTO public.reviews (id, product_id, author_name, rating, comment, verified_purchase, status, created_at)
VALUES (
  1, 'lattafa-asad', 'Andrés Felipe M.', 5,
  'La mejor compra de perfumería nicho que he hecho en Colombia. Dura fácilmente 14 horas en mi piel y la estela es imponente.',
  TRUE, 'aprobada', '2026-10-26T03:27:29.703Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, product_id, author_name, rating, comment, verified_purchase, status, created_at)
VALUES (
  2, 'lattafa-khamrah', 'Carolina V.', 5,
  'Un licor de canela y dátiles sumamente refinado. El frasco de cristal tallado y la presentación deslumbran tanto como el aroma.',
  TRUE, 'aprobada', '2026-10-26T03:27:29.703Z'
)
ON CONFLICT (id) DO NOTHING;

-- 8. Registro Inicial de Auditoría
INSERT INTO public.activity_logs (user_id, user_name, action, details)
VALUES (
  'usr-admin-master-001', 'Director Alabastro', 'SISTEMA_INIT',
  'Base de datos ALABASTRO sincronizada y activada con 22 fragancias árabes originales y seguridad RLS.'
);


-- 4. Clientes Registrados
INSERT INTO public.users (id, name, email, phone, password_hash, role, created_at)
VALUES ('usr-customer-001', 'Santiago Zapata', 'santiago@alabastro.co', '+57 311 254 9053', '$2a$10$pfX7DsKQo1mXbCrm7AZD4Od4K07kW/zkg4FctPTlKCfP4C5WbFpK2', 'customer', '2026-10-26T03:27:29.703Z')
ON CONFLICT (email) DO NOTHING;

-- 5. Pedidos Históricos
INSERT INTO public.orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, city, payment_method, status, subtotal, shipping_cost, total, gift_packaging, notes, items, created_at)
VALUES ('ORD-2026-2954', NULL, 'Cliente Alabastro', 'cliente.web@alabastro.com', '+57 311 254 9053', 'Carrera 7 # 116-50', 'Bogotá D.C.', 'Tarjeta de Crédito / PSE', 'confirmado', 693000, 0, 693000, FALSE, 'Pedido web verificado.', '[{"id":"swiss-arabian-shaghaf-oud","name":"Swiss Arabian Shaghaf Oud","price":249000,"quantity":2},{"id":"maison-alhambra-kismet-magic","name":"Maison Alhambra Kismet Magic","price":195000,"quantity":1}]'::jsonb, '2026-10-26T04:17:12.053Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, city, payment_method, status, subtotal, shipping_cost, total, gift_packaging, notes, items, created_at)
VALUES ('ORD-2026-9041', NULL, 'Valeria Restrepo', 'valeria.restrepo@luxury.co', '+57 312 458 9912', 'Cra 43A # 1-50, Edificio Santillana Apto 902', 'Medellín', 'transferencia', 'entregado', 470000, 0, 470000, TRUE, 'Fragancia empacada con cinta dorada de lujo para obsequio.', '[{"id":"lattafa-khamrah","name":"Lattafa Khamrah","price":235000,"quantity":2}]'::jsonb, '2026-10-24T03:27:29.525Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, city, payment_method, status, subtotal, shipping_cost, total, gift_packaging, notes, items, created_at)
VALUES ('ORD-2026-9042', NULL, 'Camilo Echeverri', 'camilo.ech@bogota.co', '+57 300 891 2244', 'Calle 116 # 9-45, Chicó Norte', 'Bogotá', 'contraentrega', 'en_preparacion', 195000, 15000, 210000, FALSE, 'Favor timbrar en recepción.', '[{"id":"lattafa-asad","name":"Lattafa Asad","price":195000,"quantity":1}]'::jsonb, '2026-10-25T22:27:29.525Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, city, payment_method, status, subtotal, shipping_cost, total, gift_packaging, notes, items, created_at)
VALUES ('ORD-2026-9043', NULL, 'Mariana Zuluaga', 'mariana.z@cali.co', '+57 315 780 1234', 'Avenida Colombia # 4N-20, Ciudad Jardín', 'Cali', 'wompi', 'confirmado', 378000, 0, 378000, TRUE, 'Regalo especial de aniversario.', '[{"id":"lattafa-yara","name":"Lattafa Yara","price":189000,"quantity":2}]'::jsonb, '2026-10-26T02:27:29.525Z')
ON CONFLICT (id) DO NOTHING;

-- 6. Suscriptores del Círculo Privado
INSERT INTO public.subscribers (email, active, created_at)
VALUES ('sofia.duque@luxury.com', TRUE, '2026-10-26T03:27:29.703Z')
ON CONFLICT (email) DO NOTHING;
INSERT INTO public.subscribers (email, active, created_at)
VALUES ('felipe.arias@inversionistas.co', TRUE, '2026-10-26T03:27:29.703Z')
ON CONFLICT (email) DO NOTHING;

-- 7. Reseñas Verificadas
INSERT INTO public.reviews (id, product_id, author_name, rating, comment, verified_purchase, status, created_at)
VALUES (1, 'lattafa-asad', 'Andrés Felipe M.', 5, 'La mejor compra de perfumería nicho que he hecho en Colombia. Dura fácilmente 14 horas en mi piel y la estela es imponente.', TRUE, 'aprobada', '2026-10-26T03:27:29.703Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reviews (id, product_id, author_name, rating, comment, verified_purchase, status, created_at)
VALUES (2, 'lattafa-khamrah', 'Carolina V.', 5, 'Un licor de canela y dátiles sumamente refinado. El frasco de cristal tallado y la presentación deslumbran tanto como el aroma.', TRUE, 'aprobada', '2026-10-26T03:27:29.703Z')
ON CONFLICT (id) DO NOTHING;

COMMIT;
