CREATE TABLE IF NOT EXISTS stories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(24) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  points INT NOT NULL DEFAULT 1,
  owner_name VARCHAR(120) NOT NULL,
  owner_tag VARCHAR(8) NOT NULL,
  priority ENUM('Critical', 'High', 'Medium', 'Low') NOT NULL,
  kind ENUM('Feature', 'Bug', 'Task') NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('Backlog', 'In Progress', 'Review', 'Done') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_stories_status (status)
);
