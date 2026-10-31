DROP TABLE IF EXISTS role_zone_permissions CASCADE;
DROP TABLE IF EXISTS cameras CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, 
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cameras (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, 
    rtsp_url TEXT NOT NULL,     
    zone_id INT REFERENCES zones(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_zone_permissions (
    id SERIAL PRIMARY KEY,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    zone_id INT REFERENCES zones(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT TRUE NOT NULL,         
    can_control_ptz BOOLEAN DEFAULT FALSE NOT NULL,  
    can_export BOOLEAN DEFAULT FALSE NOT NULL,    
    UNIQUE (role_id, zone_id)
);

INSERT INTO roles (name, description) VALUES 
('ADMIN', 'Full system control, user management, and camera configuration'),
('ZONE_MODERATOR', 'Live monitoring and PTZ camera control for assigned factory zones'),
('AUDITOR', 'Read-only access to system audit logs and archived recordings');