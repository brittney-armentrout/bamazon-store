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
    begin();
});

function begin() {
    inquirer.prompt({
            name: "action",
            type: "list",
            message: "Hi there! What would you like to do?",
            choices: ["View Available Products", "Exit"]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View Available Products":
                    displayProducts();
                    break;

                case "Exit":
                    console.log("Thanks for stopping by. Come back soon!".cyan);
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

        console.log("\n*Available BAMAZON STORE Products*".rainbow.bold);
        console.log("---------------------------------------------------------------------");

        for (var i = 0; i < res.length; i++) {
            //push data to the table
            table.push(
                [res[i].item_id, res[i].product_name, res[i].dept_name, "$" + res[i].price, res[i].stock]
            );
        };
        console.log(table.toString());
        shopping();
    })
};

function shopping() {
    inquirer.prompt([{
            name: "productId",
            type: "input",
            message: "What product number would you like to purchase?\nProduct #:".grey
        },
        {
            name: "quantity",
            type: "input",
            message: "How many would you like to buy?\nQuantity:".grey
        }
    ]).then(function (answer) {
        var item = answer.productId;
        var stockquan = answer.quantity;
        var query = "SELECT * FROM products WHERE item_id = ?";

        connection.query(query, [item], function (err, res) {
            if (err) throw err;

            var product = res[0];

            if (stockquan <= parseInt(product.stock)) {
                var updateDatabase = "UPDATE products SET ? WHERE ?";
                connection.query(updateDatabase,
                    [{
                        stock: (parseInt(product.stock) - parseInt(stockquan)),
                    }, {
                        item_id: item
                    }],
                    function (err, res) {
                        if (err) throw err;
                        console.log("Great choice!\nYour order total is $" + product.price * stockquan + ".");
                        console.log("---------------------------------------------------------------------");
                        continueShopping();
                    }
                )
            } else {
                console.log("Sorry! We do not have enough inventory to fulfill your order. Please consider revising your order.".red)
                continueShopping();
            }
        })
    })
};


function continueShopping() {
    inquirer.prompt({
            type: "list",
            name: "continue",
            message: "Would you like to keep shopping today?".yellow,
            choices: ["Yes", "No"]
        })

        .then(function (answer) {
            switch (answer.continue) {
                case "Yes":
                    displayProducts();
                    break;

                case "No":
                    console.log("Thanks for stopping by. Come back soon!".rainbow);
                    connection.end();
            }
        });
};