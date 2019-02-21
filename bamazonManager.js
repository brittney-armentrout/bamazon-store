var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
var colors = require("colors");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to id: " + connection.threadId + "\n");
    console.log("---------------------------------------------------------------------".rainbow);
    console.log("~ ~ ~ ~ ~ ~ WELCOME".yellow.bold + " to the".cyan.bold + " BAMAZON".green.bold + " STORE! ~ ~ ~ ~ ~ ~".magenta.bold);
    console.log("---------------------------------------------------------------------".rainbow);
    console.log("\n**VIEWING AT MANAGER LEVEL**".red.bold)
    begin();
});

function begin() {
    inquirer.prompt({
            name: "action",
            type: "list",
            message: "Hi there! What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View Products for Sale":
                    displayProducts();
                    break;

                case "View Low Inventory":
                    lowInventory();
                    break;

                case "Add to Inventory":
                    addInventory();
                    break;

                case "Add New Product":
                    addNewProduct();
                    break;

                case "Exit":
                    console.log("Thanks, Manager! Your session has ended".cyan);
                    connection.end();
            }
        })
}


function displayProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        var table = new Table({
            head: ["ID".cyan, "Product".green, "Department".green, "Price".green, "Quantity".green],
            colWidths: [10, 35, 25, 12, 10]
        });

        console.log("\n*Available BAMAZON STORE Products*".rainbow);
        console.log("---------------------------------------------------------------------");

        for (var i = 0; i < res.length; i++) {
            //push data to the table
            table.push(
                [res[i].item_id, res[i].product_name, res[i].dept_name, "$" + res[i].price, res[i].stock]
            );
        };
        console.log(table.toString());
        goBack();
    })
};

function goBack() {
    inquirer.prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: ["Back to Main Menu", "Exit"]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Back to Main Menu":
                    begin();
                    break;

                case "Exit":
                    console.log("Thanks, Manager! Your session has ended.".cyan);
                    connection.end();
            }
        })
};

function lowInventory() {
    connection.query("SELECT * FROM products WHERE stock < 5", function (err, res) {
        if (err) throw err;

        var table = new Table({
            head: ["ID".red, "Product".red, "Quantity".red],
            colWidths: [10, 35, 10]
        });

        console.log("\n*LOW INVENTORY ALERT*".red.bold);
        console.log("---------------------------------------------------------------------");

        for (var i = 0; i < res.length; i++) {
            //push data to the table
            table.push(
                [res[i].item_id, res[i].product_name, res[i].stock]
            );
        };
        console.log(table.toString());
        goBack();
    })
};


function addInventory() {
    inquirer.prompt([{
            name: "productId",
            type: "input",
            message: "What product number would you like to increase inventory for?\nProduct #:".grey
        },
        {
            name: "quantity",
            type: "input",
            message: "How many units will you be increasing the inventory?\nQuantity:".grey
        }
    ]).then(function (answer) {
        var item = answer.productId;
        var stockquan = answer.quantity;
        var query = "SELECT * FROM products WHERE item_id = ?";

        connection.query(query, [item], function (err, res) {
            if (err) throw err;

            var product = res[0];
            console.log(res[0]);

            var updateDatabase = "UPDATE products SET ? WHERE ?";
            connection.query(updateDatabase,
                [{
                    stock: (parseInt(product.stock) + parseInt(stockquan))
                }, {
                    item_id: item
                }],
                function (err, res) {
                    if (err) throw err;
                    console.log("New inventory has been added for " + product.product_name + ".");

                    console.log("Stock Quantity has increased by " + stockquan + ".");
                    console.log(("Current Product Inventory: " + product.product_name + " ~ " + product.stock + " units").green);
                    console.log("------------------------------------------------------------------------");
                    goBack();
                }

            );
        });
    });
};

function addNewProduct() {
    console.log("\nPlease answer the following set of questions to enter a new product into the system.\n".yellow)

    inquirer.prompt([{
            name: "productName",
            type: "input",
            message: "What is the product name?".grey
        },
        {
            name: "department",
            type: "input",
            message: "In which department will this product be sold?".grey
        },
        {
            name: "price",
            type: "input",
            message: "How much will each unit sell for?".grey
        },
        {
            name: "inventory",
            type: "input",
            message: "What is the starting inventory for this product?".grey
        }
    ]).then(function (answer) {

        var product = answer.productName;
        var department = answer.department;
        var price = answer.price;
        var stockquan = answer.inventory;

        connection.query(

            "INSERT INTO products SET ? ", {
                product_name: product,
                dept_name: department,
                price: price,
                stock: stockquan,
            },
            function (err, res) {
                if (err) throw err;

                console.log("New Product has been added to the Inventory: ");
                console.log((product + " | " + department + " | " + "$" + price + " | " + stockquan).cyan);
                console.log("------------------------------------------------------------------------");
                goBack();
            })
    })
};