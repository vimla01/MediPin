let map;
let markers = [];
let clinics = [];
let userLocation = null;

const API_BASE = "http://localhost:8080/api";
const CLINIC_URL = `${API_BASE}/facilities/clinics`;
const REVIEW_URL = `${API_BASE}/review`;
const AUTH_URL = `${API_BASE}/auth/user`;

// -----------------------------------------------------------
// 🌍 Initialize Map
// -----------------------------------------------------------
async function initMap() {
  const defaultLocation = [19.0760, 72.8777]; // Mumbai
  map = L.map("map").setView(defaultLocation, 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  clinics = await fetchClinics();
  loadFacilities(clinics);
}

// -----------------------------------------------------------
// 🏥 Fetch Clinics
// -----------------------------------------------------------
async function fetchClinics() {
  try {
    const res = await fetch(CLINIC_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    return [];
  }
}

// -----------------------------------------------------------
// 📍 Locate User & Show Nearby (5 km)
// -----------------------------------------------------------
function locateUser() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation = [pos.coords.latitude, pos.coords.longitude];
      map.setView(userLocation, 14);
      showNearbyFacilities(5); // ✅ Show within 5 km
    },
    (err) => {
      alert("Location error: " + err.message);
    },
    { enableHighAccuracy: true }
  );
}

// -----------------------------------------------------------
// 🎯 Show Nearby Facilities within given radius (km)
// -----------------------------------------------------------
function showNearbyFacilities(radiusKm = 5) {
  if (!userLocation) {
    alert("⚠️ Please allow location access first.");
    return;
  }

  const [userLat, userLng] = userLocation;

  // ✅ Filter clinics within radiusKm
  const nearbyClinics = clinics.filter((c) => {
    if (!c.latitude || !c.longitude) return false;
    const distance = getDistanceFromLatLonInKm(
      userLat,
      userLng,
      c.latitude,
      c.longitude
    );
    return distance <= radiusKm;
  });

  // 🧹 Clear old user marker/circle if any
  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  // 🔵 Draw visible user location circle (5 km radius)
  L.circle(userLocation, {
    color: "#2563eb",
    fillColor: "#3b82f6",
    fillOpacity: 0.2,
    radius: radiusKm * 1000, // Convert km → meters
  }).addTo(map);

  // 🧍 User Marker
  const userMarker = L.marker(userLocation, {
    icon: L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    }),
  })
    .addTo(map)
    .bindPopup("<b>You are here</b>")
    .openPopup();

  markers.push(userMarker);

  // 🏥 Load the filtered nearby clinics
  loadFacilities(nearbyClinics);
}

// -----------------------------------------------------------
// 📏 Distance (Haversine Formula)
// -----------------------------------------------------------
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// -----------------------------------------------------------
// 🧭 Load Facilities (Add Markers + List)
// -----------------------------------------------------------
function loadFacilities(list) {
  // Remove old facility markers (keep user one)
  markers = markers.filter((m) => m.getPopup()?.getContent() === "<b>You are here</b>");

  const container = document.getElementById("clinicList");
  container.innerHTML = "";
  document.getElementById("count").textContent = list.length;

  list.forEach((c) => {
    if (!c.latitude || !c.longitude) return;

     const icon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -35],
    });
    const marker = L.marker([c.latitude, c.longitude], { icon })
      .addTo(map)
      .bindPopup(`
        <b>${c.name}</b><br>
        Type: ${c.type}<br>
        Address: ${c.address || "N/A"}<br>
        Contact: ${c.contact || "N/A"}<br>
        Hours: ${c.hours || "N/A"}<br>
        Coordinates: ${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}
      `);

    markers.push(marker);

    // 📋 Clinic Card
    const card = document.createElement("div");
    card.className =
      "p-4 rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg cursor-pointer mb-4";
    card.innerHTML = `
      <h4 class="font-semibold text-primary-dark">${c.name}</h4>
      <p class="text-sm text-gray-700"><strong>Type:</strong> ${c.type}</p>
      <p class="text-sm text-gray-700"><strong>Address:</strong> ${c.address || "N/A"}</p>
      <p class="text-sm text-gray-700"><strong>Contact:</strong> ${c.contact || "N/A"}</p>
      <p class="text-sm text-gray-700"><strong>Hours:</strong> ${c.hours || "N/A"}</p>

      <div class="flex flex-wrap gap-2 mt-3">
        <button onclick="focusFacility(${c.latitude}, ${c.longitude})"
          class="text-sm bg-primary-blue hover:bg-primary-dark text-white px-3 py-1.5 rounded-xl">
          View on Map
        </button>

        <button onclick="openReviewModal(${c.facilityId}, '${c.name.replace(/'/g, "\\'")}')"
          class="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl">
          Add Review
        </button>

        <button onclick="viewReviews(${c.facilityId}, '${c.name.replace(/'/g, "\\'")}')"
          class="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-xl">
          View Reviews
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Auto-fit map to all markers (if any)
  if (markers.length > 1) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.15));
  }
}

function focusFacility(lat, lng) {
  map.setView([lat, lng], 16, { animate: true });
  const marker = markers.find(
    (m) => m.getLatLng().lat === lat && m.getLatLng().lng === lng
  );
  if (marker) marker.openPopup();
}
// -----------------------------------------------------------
// 🔍 Filter by Search (works independently)
// -----------------------------------------------------------
function filterBySearch() {
  const query = document.getElementById("searchCity").value.toLowerCase();

  if (!query) {
    loadFacilities(clinics);
    return;
  }

  const filtered = clinics.filter(c => {
    const name = c.name?.toLowerCase() || "";
    const address = c.address?.toLowerCase() || "";
    const type = c.type?.toLowerCase() || "";
    const spec = c.specialization?.toLowerCase() || "";

    return (
      name.includes(query) ||
      address.includes(query) ||
      type.includes(query) ||
      spec.includes(query)
    );
  });

  // Reset specialization dropdown when searching
  document.getElementById("specialization").value = "";
  loadFacilities(filtered);
}

// -----------------------------------------------------------
// 🏥 Filter by Specialization (works independently)
// -----------------------------------------------------------
function filterBySpecialization() {
  const selected = document.getElementById("specialization").value.toLowerCase();

  if (!selected) {
    loadFacilities(clinics);
    return;
  }

  const filtered = clinics.filter(c => {
    const type = c.type?.toLowerCase() || "";
    const spec = c.specialization?.toLowerCase() || "";
    return type.includes(selected) || spec.includes(selected);
  });

  // Clear search bar when using dropdown
  document.getElementById("searchCity").value = "";
  loadFacilities(filtered);
}

// -----------------------------------------------------------
// 🎯 Event Listeners
// -----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchCity").addEventListener("input", filterBySearch);
  document.getElementById("specialization").addEventListener("change", filterBySpecialization);
});


window.onload = () => {
  initMap();
  loadAuthUI();

  const searchSection = document.querySelector(".search-input-group").parentNode;
  const nearbyBtn = document.createElement("button");
  nearbyBtn.textContent = "Nearby (5 km)";
  nearbyBtn.className =
    "bg-primary-blue hover:bg-primary-dark text-white px-6 py-3 rounded-xl shadow-md text-base font-medium ml-2";
  nearbyBtn.onclick = locateUser;
  searchSection.appendChild(nearbyBtn);
};


// Load the routing library
const routingScript = document.createElement("script");
routingScript.src = "https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js";
document.head.appendChild(routingScript);

let routingControl = null;

// Generic function to draw route between user and a facility (hospital/clinic)
function showRouteToFacility(facilityLat, facilityLng) {
  if (!userLocation) {
    alert("⚠️ Please allow location access first (click Nearby button).");
    return;
  }

  const [userLat, userLng] = userLocation;

  // Remove previous route if exists
  if (routingControl) {
    map.removeControl(routingControl);
  }

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(userLat, userLng),
      L.latLng(facilityLat, facilityLng),
    ],
    lineOptions: {
      styles: [{ color: "#2563eb", weight: 5 }],
    },
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    createMarker: () => null, // disable default route markers
  }).addTo(map);
}

// -----------------------------------------------------------
// 🏥 Modify focusHospital() to include routing
// -----------------------------------------------------------
const oldFocusHospital = focusHospital;
focusHospital = function (lat, lng) {
  oldFocusHospital(lat, lng);
  showRouteToFacility(lat, lng);
};

// -----------------------------------------------------------
// 🏥 Modify focusClinic() to include routing
// -----------------------------------------------------------
const oldFocusClinic = focusClinic;
focusClinic = function (lat, lng) {
  oldFocusClinic(lat, lng);
  showRouteToFacility(lat, lng);
};
