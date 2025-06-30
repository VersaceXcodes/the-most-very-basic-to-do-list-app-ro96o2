CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(255) PRIMARY KEY,
    description VARCHAR(256) NOT NULL,
    completed BOOLEAN DEFAULT FALSE NOT NULL
);

INSERT INTO tasks (id, description, completed) VALUES
('1678901234567', 'Buy groceries', TRUE),
('1678901234789', 'Call mom', FALSE),
('1678901234999', 'Book dental appointment', FALSE),
('1678901235111', 'Finish NexTask DRD', TRUE),
('1678901235222', 'Workout for 30 minutes', FALSE),
('1678901235333', 'Read a chapter of "Dune"', FALSE),
('1678901235444', 'Plan weekend trip', FALSE),
('1678901235555', 'Respond to emails', TRUE),
('1678901235666', 'Prepare presentation slides', FALSE),
('1678901235777', 'Water the plants', TRUE);