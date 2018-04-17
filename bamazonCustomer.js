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
  showProducts();
});

function showProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log("Bamazon Products\n");
    console.log("========================\n");
    for (i = 0; i < res.length; i++) {
      console.log("Product ID: " + res[i].item_id);
      console.log("Product Name: " + res[i].product_name);
      console.log("Price: $" + res[i].price + "\n");
      console.log("----------------------\n");
    }
  });
  startPurchase();
}

function startPurchase() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "id",
          type: "input",
          message:
            "What is the Product ID of the item you would like to purchase?",
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
          message: "How many would you like to purchase?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        }
      ])
      .then(function(answers) {
        var product = res[answers.id - 1];

        var stock = product.stock_quantity;

        var currentStock = stock - answers.quantity;

        if (stock > answers.quantity) {
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: currentStock
              },
              {
                item_id: answers.id
              }
            ],
            function(err) {
              if (err) throw err;
              console.log(
                "\nThe total cost of your purchase was $" +
                  product.price * answers.quantity +
                  ". Thank you for shopping with us!"
              );
            }
          );
          connection.end();
        } else {
          console.log(
            "We only have " +
              stock +
              " in stock. Your order can not be fulfilled."
          );
          connection.end();
        }
      });
  });
}
