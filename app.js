const express = require('express');
const path = require('path');
const { visitorLogger, readVisitors } = require('./visitorLogger');

const app = express();
const port = 5000;


app.use(visitorLogger);


app.get('/visitors', (req, res) => {
    try {
        const visitors = readVisitors(); 
        const totalVisits = Object.values(visitors).reduce((sum, visitor) => {
            return sum + (visitor.visitCount || 0);
        }, 0);

        res.send(totalVisits.toString());
    } catch (err) {
        console.error('Visitor Error:', err);
        res.send('0');
    }
});



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
