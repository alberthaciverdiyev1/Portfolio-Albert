const express = require('express');
const path = require('path');

const app = express();
const port = 5000;

app.use(express.static(path.join(__dirname, 'pages')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'home.html'));
});
app.get('/haqqimda', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'about.html'));
});
app.get('/elaqe', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'contact.html'));
});
app.get('/layiheler', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'projects.html'));
});
app.listen(port, () => {
    console.log(`Application started at http://localhost:${port}`);
});

