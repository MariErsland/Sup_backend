DROP DATABASE IF EXISTS sup;
CREATE DATABASE sup;
use sup;
CREATE TABLE user (
    id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);
CREATE TABLE activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    time DATETIME NOT NULL,
    county VARCHAR(255),
    address VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    number_of_participants INT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    title VARCHAR(225) NOT NULL,
    max_participants INT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES user(id)
);
CREATE TABLE activity_participants (
    user_id VARCHAR(255) NOT NULL,
    activity_id INT NOT NULL,
    PRIMARY KEY (user_id, activity_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE
);
CREATE TABLE participants_queue (
    user_id VARCHAR(255) NOT NULL,
    activity_id INT NOT NULL,
    time DATETIME NOT NULL,
    PRIMARY KEY (user_id, activity_id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (activity_id) REFERENCES activity(id)
);
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_first_name VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id)
);
CREATE TABLE valid_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL
);
CREATE TABLE revoked_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL
);