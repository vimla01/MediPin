let map;
let markers = [];
let hospitals = [];
let userLocation = null;

const API_BASE = "http://localhost:8080/api";
const HOSPITAL_URL = `${API_BASE}/facilities/hospitals`;
const REVIEW_URL = `${API_BASE}/review`;
const AUTH_URL = `${API_BASE}/auth/user`;

// -----------------------------------------------------------
// 🌍 Initialize Map
// -----------------------------------------------------------
async function initHospitalMap() {
  const defaultLocation = [19.0760, 72.8777]; // Mumbai
  map = L.map("map").setView(defaultLocation, 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  hospitals = await fetchHospitals();
  loadHospitals(hospitals);
}

// -----------------------------------------------------------
// 🏥 Fetch Hospitals
// -----------------------------------------------------------
async function fetchHospitals() {
  try {
    const res = await fetch(HOSPITAL_URL);
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
      showNearbyHospitals(5);
    },
    (err) => {
      alert("Location error: " + err.message);
    },
    { enableHighAccuracy: true }
  );
}

// -----------------------------------------------------------
// 🎯 Show Nearby Hospitals within radius
// -----------------------------------------------------------
function showNearbyHospitals(radiusKm = 5) {
  if (!userLocation) {
    alert("⚠️ Please allow location access first.");
    return;
  }

  const [userLat, userLng] = userLocation;

  const nearby = hospitals.filter((h) => {
    if (!h.latitude || !h.longitude) return false;
    const d = getDistance(userLat, userLng, h.latitude, h.longitude);
    return d <= radiusKm;
  });

  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  // Circle + User Marker
  L.circle(userLocation, {
    color: "#2563eb",
    fillColor: "#3b82f6",
    fillOpacity: 0.2,
    radius: radiusKm * 1000,
  }).addTo(map);

  const userMarker = L.marker(userLocation, {
    icon: L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    }),
  }).addTo(map).bindPopup("<b>You are here</b>").openPopup();

  markers.push(userMarker);

  loadHospitals(nearby);
}

// -----------------------------------------------------------
// 📏 Distance formula
// -----------------------------------------------------------
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// -----------------------------------------------------------
// 🧭 Load Hospitals on Map + List
// -----------------------------------------------------------
function loadHospitals(list) {
  markers = markers.filter(
    (m) => m.getPopup()?.getContent() === "<b>You are here</b>"
  );

  const container = document.getElementById("hospitalList");
  container.innerHTML = "";
  document.getElementById("count").textContent = list.length;

  list.forEach((h) => {
    if (!h.latitude || !h.longitude) return;

    const icon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      iconSize: [32, 42],
      iconAnchor: [16, 42],
    });

    const marker = L.marker([h.latitude, h.longitude], { icon })
      .addTo(map)
      .bindPopup(`
        <b>${h.name}</b><br>
        Type: ${h.type}<br>
        Address: ${h.address || "N/A"}<br>
        Contact: ${h.contact || "N/A"}<br>
        Hours: ${h.hours || "N/A"}
      `);

    markers.push(marker);

    const card = document.createElement("div");
    card.className =
      "p-4 rounded-2xl shadow-md border border-gray-200 bg-white hover:shadow-lg cursor-pointer mb-4";
    card.innerHTML = `
      <h4 class="font-semibold text-primary-dark">${h.name}</h4>
      <p class="text-sm text-gray-700"><strong>Type:</strong> ${h.type}</p>
      <p class="text-sm text-gray-700"><strong>Address:</strong> ${h.address || "N/A"}</p>
      <p class="text-sm text-gray-700"><strong>Contact:</strong> ${h.contact || "N/A"}</p>
      <p class="text-sm text-gray-700"><strong>Hours:</strong> ${h.hours || "N/A"}</p>

      <div class="flex flex-wrap gap-2 mt-3">
        <button onclick="focusHospital(${h.latitude}, ${h.longitude})"
          class="text-sm bg-primary-blue hover:bg-primary-dark text-white px-3 py-1.5 rounded-xl">
          View on Map
        </button>
        <button onclick="openReviewModal(${h.facilityId}, '${h.name.replace(/'/g, "\\'")}')"
          class="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl">
          Add Review
        </button>
        <button onclick="viewReviews(${h.facilityId}, '${h.name.replace(/'/g, "\\'")}')"
          class="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-xl">
          View Reviews
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  if (markers.length > 1) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.15));
  }
}

function focusHospital(lat, lng) {
  map.setView([lat, lng], 16, { animate: true });
  const marker = markers.find(
    (m) => m.getLatLng().lat === lat && m.getLatLng().lng === lng
  );
  if (marker) marker.openPopup();
}

// -----------------------------------------------------------
// 🔍 Search + Filter
// -----------------------------------------------------------
function filterBySearch() {
  const q = document.getElementById("searchCity").value.toLowerCase();
  if (!q) {
    loadHospitals(hospitals);
    return;
  }

  const filtered = hospitals.filter((h) => {
    const name = h.name?.toLowerCase() || "";
    const address = h.address?.toLowerCase() || "";
    const type = h.type?.toLowerCase() || "";
    const spec = h.specialization?.toLowerCase() || "";
    return name.includes(q) || address.includes(q) || type.includes(q) || spec.includes(q);
  });

  document.getElementById("specialization").value = "";
  loadHospitals(filtered);
}

function filterBySpecialization() {
  const selected = document.getElementById("specialization").value.toLowerCase();
  if (!selected) {
    loadHospitals(hospitals);
    return;
  }

  const filtered = hospitals.filter((h) => {
    const type = h.type?.toLowerCase() || "";
    const spec = h.specialization?.toLowerCase() || "";
    return type.includes(selected) || spec.includes(selected);
  });

  document.getElementById("searchCity").value = "";
  loadHospitals(filtered);
}

// -----------------------------------------------------------
// 🎯 Event Listeners
// -----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchCity").addEventListener("input", filterBySearch);
  document.getElementById("specialization").addEventListener("change", filterBySpecialization);
});

window.onload = () => {
  initHospitalMap();
  loadAuthUI();

  const searchSection = document.querySelector(".search-input-group").parentNode;
  const nearbyBtn = document.createElement("button");
  nearbyBtn.textContent = "Nearby (5 km)";
  nearbyBtn.className =
    "bg-primary-blue hover:bg-primary-dark text-white px-6 py-3 rounded-xl shadow-md text-base font-medium ml-2";
  nearbyBtn.onclick = locateUser;
  searchSection.appendChild(nearbyBtn);
};


// -----------------------------------------------------------
// 🧭 ROUTE FROM USER TO HOSPITAL (Leaflet Routing Machine)
// -----------------------------------------------------------

// Load the routing library
const routingScript = document.createElement("script");
routingScript.src = "https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js";
document.head.appendChild(routingScript);

let routingControl = null;

// Function to draw route between user and selected hospital
function showRouteToHospital(hospitalLat, hospitalLng) {
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
      L.latLng(hospitalLat, hospitalLng),
    ],
    lineOptions: {
      styles: [{ color: "#2563eb", weight: 5 }],
    },
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    createMarker: function () {
      return null; // disable default route markers
    },
  }).addTo(map);
}

// Modify existing focusHospital() to include routing
const oldFocusHospital = focusHospital;
focusHospital = function (lat, lng) {
  oldFocusHospital(lat, lng);
  showRouteToHospital(lat, lng);
};

