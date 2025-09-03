const express = require("express"); // memanggil express
const app = express(); // memasukkan express ke variabel app
const port = 3200; // mau di running di port berapa

// membuat endpoint
app.get('/', (req, res) => {
    res.send("Hello world!");
});