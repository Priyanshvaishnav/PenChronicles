## PenChronicle: A Blogging World
This is a simple blog application built using Node.js, HTML, CSS,  MySQL, and JWT for user authentication. The application allows users to sign up, log in, and view the latest blog posts after authentication.


for Creating Database:


install mysql enter the password and create the database usign this 
use:-      mysql -u root -p

CREATE DATABASE blog_app;
USE blog_app;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    passwordHash VARCHAR(255) NOT NULL
);

CREATE TABLE blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);
  SHOW TABLES;


# npm install 

