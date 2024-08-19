const express = require('express');
const router = express.Router();
const NodeGeocoder = require('node-geocoder');

const geocoder = NodeGeocoder({ provider: 'openstreetmap' });
router.get('/', async (req, res) => {
    try {
        const places = await req.db.findPlaces();
        res.json(places);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching places' });
    }
});
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await req.db.deletePlace(id);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/', async (req, res) => {
    const { label, address } = req.body;

    // Check to see if address is undefined or empty or less than 3 characters.
    if (typeof address !== 'string' || address.trim().length < 3) {
        return res.status(400).json({ error: 'Invalid address provided. Address must be at least 3 characters long.' });
    }
    // Checking if the address is composed only of digits
    if (/^\d+$/.test(address.trim())) {
        return res.status(400).json({ error: 'Invalid address provided. Address should not be purely numeric.' });
    }
    try {
        const geocodeResults = await geocoder.geocode(address);
        if (geocodeResults.length > 0) {
            const { latitude, longitude, formattedAddress } = geocodeResults[0];
            const newPlaceId = await req.db.createPlace(label, formattedAddress, latitude, longitude);
            res.json({
                id: newPlaceId,
                label,
                address: formattedAddress,
                lat: latitude,
                lng: longitude
            });
        } else {
            res.status(404).json({ error: 'No geocoding results found for the provided address' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during geocoding' });
    }
});


module.exports = router;
