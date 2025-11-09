// -----------------------------------------------------------
// 💬 Review Modals
// -----------------------------------------------------------

// 🟢 Open "Add Review" Modal
function openReviewModal(facilityId, facilityName) {
  document.getElementById("reviewFacilityId").value = facilityId;
  document.getElementById("reviewModalTitle").textContent = `Add Review for ${facilityName}`;
  document.getElementById("reviewForm").reset();
  document.getElementById("review-modal").classList.remove("hidden");
  document.getElementById("review-modal").classList.add("flex");
}

// ❌ Close "Add Review" Modal
function closeReviewModal() {
  document.getElementById("review-modal").classList.add("hidden");
  document.getElementById("review-modal").classList.remove("flex");
}

// 🟢 Submit Review
document.getElementById("reviewForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const facilityId = document.getElementById("reviewFacilityId").value;
  const stars = document.getElementById("reviewStars").value;
  const reviewText = document.getElementById("reviewText").value;

  if (!stars || !reviewText.trim()) {
    alert("Please fill all fields!");
    return;
  }

  try {
    const res = await fetch(`${REVIEW_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        facilityId: parseInt(facilityId),
        stars: parseInt(stars),
        reviewText: reviewText.trim(),
      }),
    });

    if (!res.ok) throw new Error("Failed to submit review");

    alert("✅ Review submitted successfully!");
    closeReviewModal();
  } catch (err) {
    console.error("Review error:", err);
    alert("⚠️ Error submitting review. Try again later.");
  }
});

// -----------------------------------------------------------
// 👁️ View Reviews Modal
// -----------------------------------------------------------

async function viewReviews(facilityId, facilityName) {
  document.getElementById("reviewsModalTitle").textContent = `Reviews for ${facilityName}`;
  const modal = document.getElementById("view-reviews-modal");
  const reviewsList = document.getElementById("reviewsList");
  reviewsList.innerHTML = `<p class="text-gray-500 text-sm italic">Loading reviews...</p>`;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  try {
    const res = await fetch(`${REVIEW_URL}/${facilityId}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const reviews = await res.json();

    if (reviews.length === 0) {
      reviewsList.innerHTML = `<p class="text-gray-500 italic">No reviews yet.</p>`;
      return;
    }

    reviewsList.innerHTML = reviews
      .map(
        (r) => `
        <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div class="flex items-center justify-between">
            <span class="text-yellow-500 text-sm">${"⭐".repeat(r.stars)}</span>
            <span class="text-xs text-gray-500">${new Date(r.date).toLocaleDateString()}</span>
          </div>
          <p class="text-sm mt-1 text-gray-800">${r.reviewText}</p>
          ${
            r.userName
              ? `<p class="text-xs text-gray-500 mt-1">— ${r.userName}</p>`
              : ""
          }
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
    reviewsList.innerHTML = `<p class="text-red-500 text-sm">Error loading reviews.</p>`;
  }
}

// ❌ Close "View Reviews" Modal
function closeReviewsModal() {
  document.getElementById("view-reviews-modal").classList.add("hidden");
  document.getElementById("view-reviews-modal").classList.remove("flex");
}

fetch("http://localhost:8080/api/review/add", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`, // user’s JWT
  },
  body: JSON.stringify({
    stars: 5,
    reviewText: "Great hospital experience!",
    facilityId: 2
  })
});


