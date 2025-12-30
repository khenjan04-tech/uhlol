const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

let orders = [];
let products = [
  {id:1,name:'Big Siomai',price:10,stock:50},
  {id:2,name:'Gulaman',price:10,stock:50},
  {id:3,name:'Fishball',price:10,stock:80},
  {id:4,name:'Kikiam',price:10,stock:80}
];

// ---------- SOCKET ----------
io.on('connection', socket => {
  console.log('Client connected');

  socket.emit('init', { orders, products });

  socket.on('newOrder', order => {
    order.id = orders.length + 1;
    order.status = 'Processing';
    order.date = new Date().toISOString();
    orders.push(order);

    io.emit('orderUpdate', orders);
  });

  socket.on('updateStatus', ({id, status}) => {
    const o = orders.find(x => x.id === id);
    if (o) o.status = status;
    io.emit('orderUpdate', orders);
  });

  socket.on('updateStock', updated => {
    products = updated;
    io.emit('stockUpdate', products);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
