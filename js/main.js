/**
 * Royal Photowaala - Main JavaScript
 * Handles IndexedDB, gallery, slideshow, booking form, and reviews
 */

// API Configuration - update this to point to your backend
const API_BASE_URL =
  import.meta?.env?.VITE_API_URL ||
  "https://backend-4hva.onrender.com";


document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  // 🌗 Dark / Light Theme Toggle
  // ==========================
  const themeToggle = document.getElementById("theme-toggle");

  if (themeToggle) {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
      themeToggle.textContent = "☀️";
    } else {
      themeToggle.textContent = "🌙";
    }

    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      themeToggle.textContent = isLight ? "☀️" : "🌙";
      localStorage.setItem("theme", isLight ? "light" : "dark");
    });
  }

  // ==========================
  // 📱 Mobile Menu Toggle
  // ==========================
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.getElementById("primary-nav");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      navLinks.classList.toggle("show");
      menuToggle.setAttribute("aria-expanded", !isExpanded);
    });
  }

  // ==========================
  // 🗄️ IndexedDB Setup
  // ==========================
  const dbName = "RoyalPhotowaalaDB";
  let db;
  const request = indexedDB.open(dbName, 1);

  request.onerror = () => console.error("IndexedDB open error");

  request.onsuccess = () => {
    db = request.result;
    loadLogo();
    loadGallery();
    loadSlideshow();
  };

  request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("galleryImages"))
      db.createObjectStore("galleryImages", { keyPath: "id", autoIncrement: true });
    if (!db.objectStoreNames.contains("homeImages"))
      db.createObjectStore("homeImages", { keyPath: "id", autoIncrement: true });
    if (!db.objectStoreNames.contains("websiteLogo"))
      db.createObjectStore("websiteLogo", { keyPath: "id" });
  };

  // Load Logo
  function loadLogo() {
    if (!db) return;
    const transaction = db.transaction("websiteLogo", "readonly");
    const store = transaction.objectStore("websiteLogo");
    const request = store.get(1);
    request.onsuccess = () => {
      const container = document.getElementById("logo-container");
      if (!container) return;
      container.innerHTML = "";
      if (request.result && request.result.data) {
        const img = document.createElement("img");
        img.src = request.result.data;
        img.alt = "Royal Photowaala Logo";
        img.style.height = "80px";
        img.style.marginRight = "10px";
        img.loading = "eager";
        container.appendChild(img);
      }
    };
  }

  // Load Gallery
  function loadGallery() {
    if (!db) return;
    const transaction = db.transaction("galleryImages", "readonly");
    const store = transaction.objectStore("galleryImages");
    const request = store.getAll();
    request.onsuccess = () => {
      const gallery = document.getElementById("gallery");
      if (!gallery) return;
      gallery.innerHTML = "";
      const images = request.result || [];
      if (images.length === 0) {
        gallery.innerHTML = "<p>No images available. Admin can add images in dashboard.</p>";
        return;
      }
      images.slice(0, 50).forEach((img, i) => {
        const imageEl = document.createElement("img");
        imageEl.src = img.data;
        imageEl.alt = `Gallery Image ${i + 1}`;
        imageEl.loading = "lazy";
        imageEl.decoding = "async";
        gallery.appendChild(imageEl);
      });
    };
  }

  // Load Slideshow
  function loadSlideshow() {
    if (!db) return;
    const transaction = db.transaction("homeImages", "readonly");
    const store = transaction.objectStore("homeImages");
    const request = store.getAll();
    request.onsuccess = () => {
      const home = document.querySelector(".home");
      if (!home) return;
      const images = request.result || [];
      if (images.length === 0) {
        home.style.backgroundImage = "url('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e')";
        return;
      }
      let current = 0;
      home.style.backgroundImage = `url('${images[current].data}')`;
      setInterval(() => {
        current = (current + 1) % images.length;
        home.style.backgroundImage = `url('${images[current].data}')`;
      }, 4000);
    };
  }

  // ==========================
  // ✅ Form Validation
  // ==========================
  function validateForm() {
    const form = document.getElementById("bookingForm");
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    let isFirstError = true;

    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    inputs.forEach(input => {
      const value = input.value.trim();

      if (input.required && !value) {
        showError(input, 'This field is required');
        isValid = false;
        return;
      }

      if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          showError(input, 'Please enter a valid email address');
          isValid = false;
          return;
        }
      }

      if (input.name === 'phone' && value) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(value)) {
          showError(input, 'Please enter a valid 10-digit phone number');
          isValid = false;
          return;
        }
      }

      if (input.type === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          showError(input, 'Please select a future date');
          isValid = false;
          return;
        }
      }
    });

    return isValid;
  }

  function showError(input, message) {
    const parent = input.parentElement;
    input.classList.add('error');
    
    if (!parent.querySelector('.error-message')) {
      const error = document.createElement('div');
      error.className = 'error-message';
      error.textContent = message;
      error.style.color = '#ff4444';
      error.style.fontSize = '0.8em';
      error.style.marginTop = '5px';
      parent.appendChild(error);
    }

    if (isFirstError) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      isFirstError = false;
    }
  }

  // ==========================
  // 📅 Booking Form Submission
  // ==========================
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const submitBtn = bookingForm.querySelector("button[type='submit']");
      const existingMessages = bookingForm.querySelectorAll('.form-message');
      existingMessages.forEach(msg => msg.remove());
      
      if (!validateForm()) {
        return false;
      }
      
      const formData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        package: document.getElementById("package").value,
        date: document.getElementById("date").value,
        details: document.getElementById("details").value.trim()
      };
      
      try {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
        
        const response = await fetch(`${API_BASE_URL}/api/book`, {
            method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',   // ✅ ADD THIS LINE
          body: JSON.stringify(formData)
        });

        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to process booking');
        }
        
        if (!data.wa_link) {
          throw new Error('No WhatsApp link received from server');
        }
        
        const successMsg = document.createElement('div');
        successMsg.className = 'form-message success';
        successMsg.innerHTML = '✅ Booking successful! Redirecting to WhatsApp...';
        bookingForm.appendChild(successMsg);
        successMsg.scrollIntoView({ behavior: 'smooth' });
        
        try {
          const newWindow = window.open(data.wa_link, '_blank');
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            showWhatsAppFallback(bookingForm, data.wa_link);
          }
        } catch (error) {
          console.error('Error opening WhatsApp:', error);
          showWhatsAppFallback(bookingForm, data.wa_link);
        }
        
        bookingForm.reset();
        
      } catch (error) {
        console.error('Booking error:', error);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'form-message error';
        errorMsg.innerHTML = `❌ ${error.message || 'An error occurred. Please try again or contact us directly.'}`;
        bookingForm.appendChild(errorMsg);
        errorMsg.scrollIntoView({ behavior: 'smooth' });
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = 'Check Availability Now';
      }
    });
  }

  function showWhatsAppFallback(form, waLink) {
    const messageText = decodeURIComponent(waLink.split('text=')[1] || '').replace(/\+/g, ' ');
    
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'form-message info';
    fallbackDiv.innerHTML = `
      <p>Could not open WhatsApp automatically. Please click the button below:</p>
      <div class="whatsapp-fallback">
        <a href="${waLink}" class="btn btn-whatsapp" target="_blank" rel="noopener">
          💬 Open in WhatsApp
        </a>
        <div class="message-preview">
          <p><strong>Message to send:</strong></p>
          <pre>${messageText}</pre>
        </div>
      </div>
    `;
    
    form.appendChild(fallbackDiv);
    fallbackDiv.scrollIntoView({ behavior: 'smooth' });
  }

  // ==========================
  // ⭐ Reviews Section
  // ==========================
  // Load Reviews
fetch(`${API_BASE_URL}/api/reviews`, {
  credentials: 'include'   // ✅ ADD
})
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("reviewList");
      if (!list) return;
      
      list.innerHTML = "";
      if (data.length === 0) {
        list.innerHTML = "<p>No reviews yet. Be the first to review!</p>";
        return;
      }

      data.forEach(r => {
        const reviewCard = document.createElement("div");
        reviewCard.className = "review-card";
        reviewCard.innerHTML = `
          <strong>${r.name}</strong> – ${"⭐".repeat(r.rating)}
          <p>${r.comment}</p>
        `;
        list.appendChild(reviewCard);
      });
    })
    .catch(error => {
      console.error('Error loading reviews:', error);
      const list = document.getElementById("reviewList");
      if (list) {
        list.innerHTML = "<p>Unable to load reviews. Please try again later.</p>";
      }
    });

  // Submit Review
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById("reviewName").value.trim(),
        rating: parseInt(document.getElementById("reviewRating").value),
        comment: document.getElementById("reviewComment").value.trim()
      };

      fetch(`${API_BASE_URL}/api/reviews`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: 'include',   // ✅ ADD
  body: JSON.stringify(formData)
})

      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Review submitted for approval!");
          reviewForm.reset();
        } else {
          alert("Error submitting review. Please try again.");
        }
      })
      .catch(error => {
        console.error('Error submitting review:', error);
        alert("Error submitting review. Please try again.");
      });
    });
  }

  // ==========================
  // 🔗 Smooth Scroll
  // ==========================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
});




