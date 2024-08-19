const express = require('express');
const bodyParser = require('body-parser');
const PlacesDB = require('./db');

const app = express();
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.json());

const db = new PlacesDB();
app.use((req, res, next) => {
    req.db = db;
    next();
});

(async () => {
    try {
        await db.initialize();
        console.log('Database schema initialized');
        const placesRoutes = require('./routes/places');
        app.use('/api/places', placesRoutes);
        app.get('/', (req, res) => {
            res.render('places');
        });
        app.listen(8080, () => {
            console.log('Server is running on port 8080');
        });
    } catch (error) {
        console.error('Error initializing the database:', error);
    }
})();