const express =  require('express')
const cors = require('cors')
const mysql = require('mysql2')
const PORT = process.env.PORT ||5650


const app = express()
const connection = mysql.createConnection({
    host : 'nuskkyrsgmn5rw8c.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    port : '3306',
    user : 'yiug93rqc06uv6b9',
    password :'o484r6hic3ucztw3',
    database : 'xjitsmw3rigrqcu2',

})

app.get('/', function(req, res, next){
    res.json({msg: 'Hello World'})
})

// แสดงสินค้าทั้งหมด
app.get('/products', (req, res) => {
    let sql = 'SELECT * FROM products';
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });
  
  // เพิ่มสินค้าใหม่
  app.post('/products', (req, res) => {
    const { ProductName, BrandID, CategoryID, Price, StockQuantity } = req.body;
    let sql = `INSERT INTO products (ProductName, BrandID, CategoryID, Price, StockQuantity) VALUES ('${ProductName}', ${BrandID}, ${CategoryID}, ${Price}, ${StockQuantity})`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json({ message: 'Product added successfully' });
    });
  });
  
  // แก้ไขสินค้า
  app.put('/products/:id', (req, res) => {
    const productId = req.params.id;
    const { ProductName, BrandID, CategoryID, Price, StockQuantity } = req.body;
    let sql = `UPDATE products SET ProductName = '${ProductName}', BrandID = ${BrandID}, CategoryID = ${CategoryID}, Price = ${Price}, StockQuantity = ${StockQuantity} WHERE ProductID = ${productId}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json({ message: 'Product updated successfully' });
    });
  });
  
  // ลบสินค้า
  app.delete('/products/:id', (req, res) => {
    const productId = req.params.id;
    let sql = `DELETE FROM products WHERE ProductID = ${productId}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json({ message: 'Product deleted successfully' });
    });
  });
  
  // แสดงหมวดหมู่ทั้งหมด
  app.get('/categories', (req, res) => {
    let sql = 'SELECT * FROM categories';
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });
  
  // เพิ่มหมวดหมู่ใหม่
  app.post('/categories', (req, res) => {
    const { CategoryName } = req.body;
    let sql = `INSERT INTO categories (CategoryName) VALUES ('${CategoryName}')`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json({ message: 'Category added successfully' });
    });
  });
  
  // แสดงแบรนด์ทั้งหมด
  app.get('/brand', (req, res) => {
    let sql = 'SELECT * FROM brand';
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });
  
  // เพิ่มแบรนด์ใหม่
  app.post('/brand', (req, res) => {
    const { BrandName } = req.body;
    let sql = `INSERT INTO brand (BrandName) VALUES ('${BrandName}')`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json({ message: 'Brand added successfully' });
    });
  });
  
  // แสดงลูกค้าทั้งหมด
  app.get('/customers', (req, res) => {
    let sql = 'SELECT * FROM customers';
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });
  
  // เพิ่มลูกค้าใหม่
  app.post('/customers', (req, res) => {
    const { FirstName, LastName, Email, Phone, Address } = req.body;
    let sql = `INSERT INTO customers (FirstName, LastName, Email, Phone, Address) VALUES ('${FirstName}', '${LastName}', '${Email}', '${Phone}', '${Address}')`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json({ message: 'Customer added successfully' });
    });
  });
  
  // แสดงรายการสั่งซื้อทั้งหมด
  app.get('/orders', (req, res) => {
    let sql = 'SELECT * FROM orders';
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });
  
  // เพิ่มรายการสั่งซื้อใหม่
  app.post('/orders', (req, res) => {
    const { OrderDate, CustomerID } = req.body;
    let sql = `INSERT INTO orders (OrderDate, CustomerID) VALUES ('${OrderDate}', ${CustomerID})`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json({ message: 'Order added successfully' });
    });
  });
  
  // แสดงรายละเอียดรายการสั่งซื้อทั้งหมด
  app.get('/orderdetails', (req, res) => {
    let sql = 'SELECT * FROM orderdetails';
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });
  
  // เพิ่มรายละเอียดรายการสั่งซื้อใหม่
  app.post('/orderdetails', (req, res) => {
    const { OrderID, ProductID, Quantity } = req.body;
    let sql = `SELECT products.Price, products.StockQuantity FROM products WHERE products.ProductID = ${ProductID}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      const { Price, StockQuantity } = result[0];
      if (StockQuantity >= Quantity) {
        const TotalPrice = Price * Quantity;
        let sql = `INSERT INTO orderdetails (OrderID, ProductID, Quantity, Price, TotalPrice) VALUES (${OrderID}, ${ProductID}, ${Quantity}, ${Price}, ${TotalPrice})`;
        connection.query(sql, (err, result) => {
          if (err) throw err;
          updateOrderTotalAmount(OrderID);
          updateProductStock(ProductID, Quantity);
          res.json({ message: 'Order detail added successfully' });
        });
      } else {
        res.status(400).json({ message: 'Not enough stock available for this product' });
      }
    });
  });
  
  // อัพเดทรายละเอียดรายการสั่งซื้อ
  app.put('/orderdetails/:id', (req, res) => {
    const orderDetailId = req.params.id;
    const { OrderID, ProductID, Quantity } = req.body;
    let sql = `SELECT products.Price, products.StockQuantity FROM products WHERE products.ProductID = ${ProductID}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      const { Price, StockQuantity } = result[0];
      if (StockQuantity >= Quantity) {
        const TotalPrice = Price * Quantity;
        let sql = `UPDATE orderdetails SET OrderID = ${OrderID}, ProductID = ${ProductID}, Quantity = ${Quantity}, Price = ${Price}, TotalPrice = ${TotalPrice} WHERE OrderDetailID = ${orderDetailId}`;
        connection.query(sql, (err, result) => {
          if (err) throw err;
          updateOrderTotalAmount(OrderID);
          updateProductStock(ProductID, Quantity);
          res.json({ message: 'Order detail updated successfully' });
        });
      } else {
        res.status(400).json({ message: 'Not enough stock available for this product' });
      }
    });
  });
  
  // ลบรายละเอียดรายการสั่งซื้อ
  app.delete('/orderdetails/:id', (req, res) => {
    const orderDetailId = req.params.id;
    let sql = `SELECT * FROM orderdetails WHERE OrderDetailID = ${orderDetailId}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      const { OrderID, ProductID, Quantity } = result[0];
      let sql = `DELETE FROM orderdetails WHERE OrderDetailID = ${orderDetailId}`;
      connection.query(sql, (err, result) => {
        if (err) throw err;
        updateOrderTotalAmount(OrderID);
        updateProductStock(ProductID, -Quantity);
        res.json({ message: 'Order detail deleted successfully' });
      });
    });
  });
  
  // แสดงรายการสั่งซื้อของลูกค้าเดียว
  app.get('/orders/:id', (req, res) => {
    const customerId = req.params.id;
    let sql = `SELECT * FROM orders WHERE CustomerID = ${customerId}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });
  
  // อัพเดทรายการสั่งซื้อ
  app.put('/orders/:id', (req, res) => {
    const orderId = req.params.id;
    const { OrderDate, CustomerID } = req.body;
    let sql = `UPDATE orders SET OrderDate = '${OrderDate}', CustomerID = ${CustomerID} WHERE OrderID = ${orderId}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json({ message: 'Order updated successfully' });
    });
  });
  
  // ลบรายการสั่งซื้อ
  app.delete('/orders/:id', (req, res) => {
    const orderId = req.params.id;
    let sql = `SELECT * FROM orderdetails WHERE OrderID = ${orderId}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      result.forEach((orderDetail) => {
        updateProductStock(orderDetail.ProductID, -orderDetail.Quantity);
      });
      let sql = `DELETE FROM orders WHERE OrderID = ${orderId}`;
      connection.query(sql, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Order deleted successfully' });
      });
    });
  });
  
  // แสดงรายละเอียดของลูกค้า
  app.get('/customers/:id', (req, res) => {
    const customerId = req.params.id;
    let sql = `SELECT * FROM customers WHERE CustomerID = ${customerId}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });
  
  // อัพเดทข้อมูลของลูกค้า
  app.put('/customers/:id', (req, res) => {
    const customerId = req.params.id;
    const { FirstName, LastName, Email, Phone, Address } = req.body;
    let sql = `UPDATE customers SET FirstName = '${FirstName}', LastName = '${LastName}', Email = '${Email}', Phone = '${Phone}', Address = '${Address}' WHERE CustomerID = ${customerId}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json({ message: 'Customer updated successfully' });
    });
  });
  
  // ลบข้อมูลของลูกค้า
  app.delete('/customers/:id', (req, res) => {
    const customerId = req.params.id;
    let sql = `DELETE FROM customers WHERE CustomerID = ${customerId}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      res.json({ message: 'Customer deleted successfully' });
    });
  });
  
  // ฟังก์ชันอัพเดทยอดรวมในรายการสั่งซื้อ
  function updateOrderTotalAmount(orderId) {
    let sql = `SELECT SUM(TotalPrice) AS TotalAmount FROM orderdetails WHERE OrderID = ${orderId}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      const { TotalAmount } = result[0];
      let sql = `UPDATE orders SET TotalAmount = ${TotalAmount} WHERE OrderID = ${orderId}`;
      connection.query(sql, (err, result) => {
        if (err) throw err;
      });
    });
  }
  
  // ฟังก์ชันอัพเดทจำนวนสินค้าในสต็อก
  function updateProductStock(productId, quantity) {
    let sql = `UPDATE products SET StockQuantity = StockQuantity + (${quantity}) WHERE ProductID = ${productId}`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
    });
  }

app.listen(PORT, function(){
    console.log('cors-enabled web server listening on port'+PORT)
})