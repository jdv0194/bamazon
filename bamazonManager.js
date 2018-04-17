var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3308,
  user: "root",
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  start();
});

function start() {
  inquirer
    .prompt({
      name: "menuOptions",
      type: "list",
      message: "Hello. What would you like to do?",
      choices: [
        "View Products For Sale",
        "View Low Inventory",
        "Add to Inventory",
        "Add New Product",
        "Quit"
      ]
    })
    .then(function(answer) {
      if (answer.menuOptions === "View Products For Sale") {
        viewProducts();
      } else if (answer.menuOptions === "View Low Inventory") {
        viewLowInventory();
      } else if (answer.menuOptions === "Add to Inventory") {
        addInventory();
      } else if (answer.menuOptions === "Add New Product") {
        addProduct();
      } else if (answer.menuOptions === "Quit") {
        connection.end();
      }
    });
}

function viewProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log("Bamazon Products");
    console.log("========================");
    for (i = 0; i < res.length; i++) {
      console.log("Product ID: " + res[i].item_id);
      console.log("Product Name: " + res[i].product_name);
      console.log("Price: $" + res[i].price);
      console.log("Quantity: " + res[i].stock_quantity);
      console.log("----------------------");
    }
    start();
  });
}

function viewLowInventory() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      if (res[i].stock_quantity < 5) {
        console.log("Product ID: " + res[i].item_id);
        console.log("Product Name: " + res[i].product_name);
        console.log("Price: $" + res[i].price);
        console.log("Quantity: " + res[i].stock_quantity);
        console.log("----------------------");
      }
    }
    start();
  });
}

function addInventory() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "productChoice",
          type: "list",
          choices: function() {
            var productArray = [];
            for (i = 0; i < res.length; i++) {
              productArray.push(res[i].product_name);
            }
            return productArray;
          },
          message: "Which product would you like to add inventory to?"
        },
        {
          name: "addInventory",
          type: "input",
          message: "How many would you like to add?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        }
      ])
      .then(function(answers) {
        var chosenProduct;
        for (var i = 0; i < res.length; i++) {
          if (res[i].product_name === answers.productChoice) {
            chosenProduct = res[i];
          }
        }

        var newQuantity =
          chosenProduct.stock_quantity + parseInt(answers.addInventory);

        connection.query(
          "UPDATE products SET ? WHERE ?",
          [
            {
              stock_quantity: newQuantity
            },
            {
              item_id: chosenProduct.item_id
            }
          ],
          function(err) {
            if (err) throw err;
            console.log(
              chosenProduct.product_name +
                " now has a quantity of " +
                newQuantity
            );
            start();
          }
        );
      });
  });
}

function addProduct() {
  inquirer
    .prompt([
      {
        name: "product",
        type: "input",
        message: "What is the product you would like to add?"
      },
      {
        name: "department",
        type: "input",
        message: "What department should this product be added to?"
      },
      {
        name: "price",
        type: "input",
        message: "What is the price of this product?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "quantity",
        type: "input",
        message: "How many of this product should be added to the inventory?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answers) {
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answers.product,
          department_name: answers.department,
          price: answers.price,
          stock_quantity: answers.quantity
        },
        function(err) {
          if (err) throw err;
          console.log(
            "You successfully added " +
              answers.quantity +
              " " +
              answers.product +
              "s to the " +
              answers.department +
              " Department. Each one has a price of $" +
              answers.price +
              "."
          );
          start();
        }
      );
    });
}
