-- ============================================================
-- DATABASE PANDUAN: Kerajaan Islam Nusantara
-- ============================================================

CREATE DATABASE IF NOT EXISTS mataram_kingdom
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mataram_kingdom;

-- Tabel komentar utama
CREATE TABLE diskusi (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama       VARCHAR(100)  NOT NULL,
  komentar   TEXT          NOT NULL,
  waktu      BIGINT        NOT NULL  -- Unix timestamp (ms), sama seperti Date.now()
);

-- Tabel balasan komentar
CREATE TABLE balasan (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  diskusi_id INT UNSIGNED  NOT NULL,
  nama       VARCHAR(100)  NOT NULL,
  komentar   TEXT          NOT NULL,
  waktu      BIGINT        NOT NULL,
  FOREIGN KEY (diskusi_id) REFERENCES diskusi(id) ON DELETE CASCADE
);

-- ============================================================
-- Contoh data
-- ============================================================

INSERT INTO diskusi (nama, komentar, waktu) VALUES
  ('Faris',  'Kerajaan Mataram Islam sangat menarik untuk dipelajari!', 1700000000000),
  ('Fikri',  'Apakah ada info lebih lanjut tentang Sultan Agung?',       1700000100000);

INSERT INTO balasan (diskusi_id, nama, komentar, waktu) VALUES
  (1, 'Dzikrul', 'Setuju! Terutama masa kejayaan Sultan Agung.', 1700000050000),
  (2, 'Rizal',   'Sultan Agung memerintah 1613–1645, banyak pencapaian besar.', 1700000200000);
