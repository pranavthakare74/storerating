-- ============================================================
--  Store Rating System - MySQL schema
--  Roles: ADMIN | USER | OWNER  (single login system)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(60)  NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  address     VARCHAR(400) NOT NULL,
  role        ENUM('ADMIN', 'USER', 'OWNER') NOT NULL DEFAULT 'USER',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- A store is owned by a user whose role is OWNER (owner_id may be NULL if unassigned).
CREATE TABLE IF NOT EXISTS stores (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(60)  NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  address     VARCHAR(400) NOT NULL,
  owner_id    INT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_store_owner FOREIGN KEY (owner_id)
    REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_stores_owner (owner_id)
) ENGINE=InnoDB;

-- One rating per (user, store). Re-rating updates the existing row.
CREATE TABLE IF NOT EXISTS ratings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  store_id    INT NOT NULL,
  rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_store UNIQUE (user_id, store_id),
  CONSTRAINT fk_rating_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_rating_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  KEY idx_ratings_store (store_id),
  KEY idx_ratings_user  (user_id)
) ENGINE=InnoDB;
