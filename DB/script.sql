-- Base de datos para la aplicación de gestión de usuarios del hospital.
CREATE DATABASE IF NOT EXISTS `db_PaulaMoraJhanPiandoy`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_PaulaMoraJhanPiandoy`;

-- Datos personales y credenciales de acceso de los usuarios.
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `identificacion` VARCHAR(30) NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `email` VARCHAR(254) DEFAULT NULL,
  `cargo` ENUM('Doctor', 'Especialista', 'Administrativo') NOT NULL,
  `telefono` VARCHAR(20) DEFAULT NULL,
  `nombre_usuario` VARCHAR(50) NOT NULL,
  `contrasena` VARCHAR(255) NOT NULL COMMENT 'Hash de contraseña generado con bcrypt',
  `estado` ENUM('Activado', 'Desactivado') NOT NULL DEFAULT 'Activado',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_identificacion` (`identificacion`),
  UNIQUE KEY `uq_usuarios_email` (`email`),
  UNIQUE KEY `uq_usuarios_nombre_usuario` (`nombre_usuario`)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Cuentas de prueba. Contraseña en texto plano para cada hash:
-- Dra. Ana Torres: DoctorDemo#2026
-- Carlos Ruiz: AdminDemo#2026
-- Los hashes son bcrypt (coste 12); reemplácelos antes de usar en producción.
INSERT INTO `usuarios`
  (`identificacion`, `nombre`, `apellido`, `email`, `cargo`, `telefono`,
   `nombre_usuario`, `contrasena`, `estado`)
VALUES
  ('TEST-1001', 'Ana', 'Torres', 'ana.torres@example.com', 'Doctor', '3001234567',
   'atorres', '$2b$12$IO7aS0RUsqAZ2Ce6eMJW9.p3JIA0qahV4klBvuUtUlflqqT/dqE.e', 'Activado'),
  ('TEST-1002', 'Carlos', 'Ruiz', 'carlos.ruiz@example.com', 'Administrativo', '3007654321',
   'cruiz', '$2b$12$okSVoT1NEmtBWXvYOzJPJuBodNExmC1fn4N4V8zWplHNwKherr1nW', 'Activado');