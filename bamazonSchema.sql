DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
    item_id INTEGER AUTO_INCREMENT NOT NULL, 
    product_name VARCHAR(100),
    dept_name VARCHAR(100),
    price DECIMAL(10,2), 
    stock INTEGER(10),
    PRIMARY KEY (item_id)
);


CREATE TABLE departments (
    dept_id INTEGER AUTO_INCREMENT NOT NULL,
    dept_name VARCHAR(100),
    overhead_costs INTEGER(10),
    PRIMARY KEY (dept_id)
);


