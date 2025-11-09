// ===============================
// Nearby Hospital Route Example
// ===============================

// Wait for the page to load before initializing the map
window.onload = function () {

  // Initialize map centered on Mumbai by default
  const map = L.map('map').setView([19.0760, 72.8777], 13);

  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Hospital marker coordinates (example)
  const hospitalLat = 19.1040;
  const hospitalLng = 72.8888;
  const hospitalMarker = L.marker([hospitalLat, hospitalLng])
    .addTo(map)
    .bindPopup('🏥 Hospital')
    .openPopup();

  let routingControl; // store route control to remove later if needed

  // Function to show route
  function showRoute(userLat, userLng, hospitalLat, hospitalLng) {
    if (routingControl) {
      map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLat, userLng),
        L.latLng(hospitalLat, hospitalLng)
      ],
      lineOptions: {
        styles: [{ color: 'blue', weight: 5 }]
      },
      routeWhileDragging: false,
      show: false, // hides the routing panel
      createMarker: function () { return null; } // disable extra default markers
    }).addTo(map);
  }

  // Try to get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Add user's marker
        L.marker([userLat, userLng])
          .addTo(map)
          .bindPopup('📍 You are here')
          .openPopup();

        map.setView([userLat, userLng], 14);

        // Draw route between user and hospital
        showRoute(userLat, userLng, hospitalLat, hospitalLng);
      },
      (error) => {
        alert('Unable to fetch location. Showing default view.');
      }
    );
  } else {
    alert('Geolocation not supported by your browser.');
  }
};
