const canvas = document.getElementById('tattoo-canvas');
const ctx = canvas?.getContext('2d');
const appointmentForm = document.getElementById('appointment-form');
const uploadInput = document.getElementById('customer-design-upload');
const previewGallery = document.getElementById('customer-preview-gallery');

let base64Image = "";

// 1. IMAGE UPLOAD & BASE64 CONVERSION
if (uploadInput) {
    uploadInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                base64Image = event.target.result;
                const img = document.createElement('img');
                img.src = base64Image;
                img.style.width = "120px";
                img.style.borderRadius = "8px";
                previewGallery.innerHTML = "";
                previewGallery.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
}

// 2. DRAWING TOOL
if (canvas && ctx) {
    let isDrawing = false;
    canvas.addEventListener('mousedown', () => isDrawing = true);
    window.addEventListener('mouseup', () => { isDrawing = false; ctx.beginPath(); });
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = document.getElementById('color-picker').value;
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });
    document.getElementById('clear').onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 3. BOOKING LOGIC (PHONE NUMBER)
appointmentForm?.addEventListener('submit', function (e) {
    e.preventDefault();

    const apptData = {
        user_name: document.getElementById('name').value,
        user_phone: document.getElementById('phone').value, // PHONE INSTEAD OF EMAIL
        booking_date: document.getElementById('date').value,
        booking_time: document.getElementById('time').value,
        description: document.getElementById('tattoo-description').value,
        user_image: base64Image
    };

    emailjs.send("service_bmhafjm", "template_oztapjd", apptData)
        .then(() => {
            alert("✅ Booking sent! We will contact you at " + apptData.user_phone);

            // Local persistence for customer records
            const localAppts = JSON.parse(localStorage.getItem('appointments')) || [];
            localAppts.push({ ...apptData, id: Date.now() });
            localStorage.setItem('appointments', JSON.stringify(localAppts));

            appointmentForm.reset();
            previewGallery.innerHTML = "";
            base64Image = "";
        })
        .catch((err) => {
            alert("❌ Failed. Image might be too large for a free EmailJS account.");
        });
});

// 4. MANAGE BOOKINGS BY PHONE
function loadAppointments() {
    const userPhone = document.getElementById('manage-phone')?.value.trim();
    const list = document.getElementById('appointments');
    const appts = JSON.parse(localStorage.getItem('appointments')) || [];

    if (!userPhone) { alert("Please enter your phone number."); return; }

    const filtered = appts.filter(a => a.user_phone === userPhone);
    list.innerHTML = filtered.length === 0
        ? '<li>No bookings found for this number.</li>'
        : filtered.map(a => `
            <li class="appointment-card">
                ${a.booking_date} @ ${a.booking_time}
                <button class="delete-btn" onclick="deleteBooking(${a.id})">Cancel</button>
            </li>`).join('');
}

function deleteBooking(id) {
    let appts = JSON.parse(localStorage.getItem('appointments')) || [];
    appts = appts.filter(a => a.id !== id);
    localStorage.setItem('appointments', JSON.stringify(appts));
    loadAppointments();
}
