document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([41.0826, -74.1766], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    let markers = {};

    const addMarker = (place) => {
        const marker = L.marker([place.lat, place.lng]).addTo(map)
            .bindPopup(`<b>${place.label}</b><br>${place.address}`);
        markers[place.id] = marker;
        return marker;
    };
    const moveToMarker = (marker) => {
        if (map.getBounds().contains(marker.getLatLng())) {
            map.flyTo(marker.getLatLng(), map.getZoom(), { duration: 1 });
        } else {
            map.flyTo(marker.getLatLng(), 13, { duration: 1 });
        }
        marker.openPopup();
    };
    const addRow = (place) => {
        const table = document.querySelector('table.table tbody');
        const row = table.insertRow();
        row.setAttribute('data-id', place.id);
        const labelCell = row.insertCell();
        labelCell.textContent = place.label;
        const addressCell = row.insertCell();
        addressCell.textContent = place.address;
        addressCell.style.cursor = 'pointer';
        addressCell.addEventListener('click', () => moveToMarker(markers[place.id]));
        const actionsCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.addEventListener('click', function () { deletePlace(place.id, row); });
        actionsCell.appendChild(deleteButton);
    };

    const deletePlace = async (id, row) => {
        const response = await fetch(`/api/places/${id}`, { method: 'DELETE' });
        if (response.ok) {
            map.removeLayer(markers[id]);
            delete markers[id];
            row.remove();
        } else {

            console.error('Failed to delete the place.');

        }
    };

    const loadPlaces = async () => {
        const response = await fetch('/api/places');
        const places = await response.json();
        Object.values(markers).forEach(marker => map.removeLayer(marker));
        markers = {};
        const table = document.querySelector('table.table tbody');
        table.innerHTML = '';
        places.forEach(place => {
            const marker = addMarker(place);
            addRow(place);
            moveToMarker(marker);  // This is to make the last place is centered on the map upon loading
        });
    };

    document.getElementById('addPlaceForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const label = document.getElementById('label').value;
        const address = document.getElementById('address').value;
        const response = await fetch('/api/places', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ label, address })
        });
        if (response.ok) 
        
        {
            const newPlace = await response.json();
            const marker = addMarker(newPlace);
            addRow(newPlace);
            moveToMarker(marker);  // go to the new marker
            document.getElementById('label').value = '';
            document.getElementById('address').value = '';
        } else {
            console.error('Failed to add the place.');
        }
    });

    loadPlaces();
});
