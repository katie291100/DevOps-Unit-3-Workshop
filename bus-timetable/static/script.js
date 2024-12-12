document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    const stopSelect = document.getElementById('stop_id');
    const postcodeInput = document.getElementById('postcode');

    function fetchStops(lon, lat) {
        console.log(`Fetching stops for longitude: ${lon}, latitude: ${lat}`);
        fetch(`/api/allStops?lon=${lon}&lat=${lat}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log(`Response status: ${response.status}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(stops => {
            console.log('Stops fetched:', stops);
            stopSelect.innerHTML = '<option value="" disabled selected class="">Select a stop</option>'; // Clear previous options
            stops["stopPoints"].forEach(stop => {
                const option = document.createElement('option');
                option.value = stop.id; // Replace with actual field name
                option.textContent = stop.commonName; // Replace with actual field name
                stopSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.log('An error occurred:', error);
            document.getElementById('message').innerText = `An error occurred while fetching stops. Please try again. ${error}`;
        });
    }

    function fetchCoordinates(postcode) {
        console.log(`Fetching coordinates for postcode: ${postcode}`);
        fetch(`https://api.postcodes.io/postcodes/${postcode}`)
        .then(response => {
            console.log(`Response status: ${response.status}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Coordinates fetched:', data);
            const { longitude, latitude } = data.result;
            fetchStops(longitude, latitude);
        })
        .catch(error => {
            console.log('An error occurred:', error);
            document.getElementById('message').innerText = `An error occurred while fetching coordinates. Please try again. ${error}`;
        });
    }

    // Fetch stops when the postcode input loses focus
    postcodeInput.addEventListener('blur', function() {
        const postcode = postcodeInput.value.trim();
        if (postcode) {
            fetchCoordinates(postcode);
        } else {
            console.log('No postcode entered');
            document.getElementById('message').innerText = 'Please enter a postcode.';
        }
    });

    // Auto-submit the form when an option is selected
    stopSelect.addEventListener('change', function() {
        const form = document.getElementById('selectStop');
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    document.getElementById('selectStop').addEventListener('submit', function(event) {
        event.preventDefault();
        const stopId = stopSelect.value;
        console.log(`Selected stop ID: ${stopId}`);
        
        if (!stopId) {
            console.log('No stop selected');
            document.getElementById('message').innerText = 'Please select a stop.';
            return;
        }
            
        fetch(`/api/arrivals/${stopId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(response => {
            console.log('Arrivals fetched:', response);
            const tableBody = document.querySelector('#data-table tbody');
            tableBody.innerHTML = ''; // Clear previous data

            response.forEach(item => {
                const row = document.createElement('tr');
                const cell1 = document.createElement('td');
                const cell2 = document.createElement('td');
                const cell3 = document.createElement('td');
                
                const formattedTime = new Date(item.expectedArrival).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                cell1.textContent = formattedTime; // Replace with actual field names
                cell2.textContent = item.lineName; // Replace with actual field names
                cell3.textContent = item.destinationName; // Replace with actual field names

                cell1.className = "px-6 py-3";
                cell2.className = "px-6 py-3";
                cell3.className = "px-6 py-3";

                row.appendChild(cell1);
                row.appendChild(cell2);
                row.appendChild(cell3);
                tableBody.appendChild(row);
            });

            console.log('Table updated with new arrivals');
        })
        .catch(error => {
            console.log('An error occurred:', error);
            document.getElementById('message').innerText = 'An error occurred. Please try again.';
        });
    });
});