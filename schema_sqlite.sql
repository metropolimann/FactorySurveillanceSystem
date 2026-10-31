PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS role_zone_permissions;
DROP TABLE IF EXISTS cameras;
DROP TABLE IF EXISTS zones;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Accommodates bcrypt hashes securely
    is_active INTEGER DEFAULT 1 NOT NULL, -- 1 = True, 0 = False
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cameras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rtsp_url TEXT NOT NULL,
    zone_id INTEGER REFERENCES zones(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ACTIVE' NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_zone_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    zone_id INTEGER REFERENCES zones(id) ON DELETE CASCADE,
    can_view INTEGER DEFAULT 1 NOT NULL,          -- 1 = True, 0 = False
    can_control_ptz INTEGER DEFAULT 0 NOT NULL,
    can_export INTEGER DEFAULT 0 NOT NULL,
    UNIQUE (role_id, zone_id)
);

INSERT INTO roles (name, description) VALUES 
('ADMIN', 'Full system control, user management, and camera configuration'),
('ZONE_MODERATOR', 'Live monitoring and PTZ camera control for assigned factory zones'),
('AUDITOR', 'Read-only access to system audit logs and archived recordings');