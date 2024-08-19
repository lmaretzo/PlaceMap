const fs = require('fs');
require('dotenv').config();
const Database = require('dbcmps369');

class PlacesDB {
    constructor() {
        this.dbPath = './places.db';
        this.db = new Database(this.dbPath); // pass the database path to the constructor
    }
    async initialize() {
        // Check if the database file exists
        const dbExists = fs.existsSync(this.dbPath);
        if (!dbExists) {
            // If the database does not exist, create it and initialize the schema
            await this.db.connect();
            await this.db.schema('Place', [
                { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true }, // Ensure the 'id' field auto increments
                { name: 'label', type: 'TEXT' },
                { name: 'address', type: 'TEXT' },
                { name: 'lat', type: 'REAL' },
                { name: 'lng', type: 'REAL' }
            ], 'id');
        } else {
            // If the database exists, connect to
            await this.db.connect();
        }
    }
    async findPlaces() {
        return await this.db.read('Place', []);
    }
    async createPlace(label, address, lat, lng) {
        const id = await this.db.create('Place', [
            { column: 'label', value: label },
            { column: 'address', value: address },
            { column: 'lat', value: lat },
            { column: 'lng', value: lng }
        ]);
        return id;
    }

    async deletePlace(id) {
        await this.db.delete('Place', [{ column: 'id', value: id }]);
    }
}

module.exports = PlacesDB;
