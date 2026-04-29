-- Parola este 'admin123'
INSERT INTO users (id, email, name, password, role)
SELECT 
    gen_random_uuid(), 
    'admin@gmail.com', 
    'Admin User', 
    '$2a$10$F/mhWdu3fKivrr6DmjFlvOwccSb/eGsLX2tfA8WiLr/7LoFjUL6Gi', 
    'ADMIN'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@gmail.com'
);