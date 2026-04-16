
  // ─── CLOCK ───
  function updateClock() {
    const now = new Date();
    document.getElementById('clockTime').textContent =
      now.getHours().toString().padStart(2,'0') + ':' +
      now.getMinutes().toString().padStart(2,'0');
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ─── GPS COORDS WOBBLE ───
  function wobbleCoords() {
    const lat = (26.8467 + (Math.random() - 0.5) * 0.0002).toFixed(4);
    const lng = (80.9462 + (Math.random() - 0.5) * 0.0002).toFixed(4);
    document.getElementById('mapCoords').textContent = `${lat}° N, ${lng}° E`;
  }
  setInterval(wobbleCoords, 1000);



  // ─── TOAST ───
  function showToast(msg, color='green') {
    const t = document.getElementById('toast');
    t.textContent = (color === 'green' ? '✓ ' : '⚠ ') + msg;
    t.style.borderColor = color === 'green' ? 'var(--accent-green)' : 'var(--accent-red)';
    t.style.color = color === 'green' ? 'var(--accent-green)' : 'var(--accent-red)';
    t.style.boxShadow = color === 'green' ? '0 0 20px rgba(0,230,118,0.3)' : '0 0 20px rgba(255,23,68,0.3)';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  // ─── TOGGLE FEATURE ───
  function toggleFeature(name, state) {
    showToast(`${name.toUpperCase()} ${state ? 'ON' : 'OFF'}`, state ? 'green' : 'red');
  }

  navigator.geolocation.watchPosition;
  // ─── SHARE LOCATION ───
  function shareLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude: lat, longitude: lng } = pos.coords;
          document.getElementById('mapCoords').textContent = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
          showToast('REAL LOCATION SHARED');
          sendLocationToAPI(lat, lng);
        },
        () => showToast('LOCATION SHARED (DEMO)', 'green')
      );
    } else {
      showToast('LOCATION SHARED (DEMO)', 'green');
    }
  }

  // ─── SOS TRIGGER ───
  let sosTimer = null, sosTriggered = false;
  let holdTimer = null;
  const sosBtn = document.getElementById('sosBtn');

  sosBtn.addEventListener('pointerdown', () => {
    holdTimer = setTimeout(() => {
      startAlertCountdown(3);
    }, 3000);
  });

  sosBtn.addEventListener('pointerup', () => {
    clearTimeout(holdTimer);
  });

  function triggerSOS() {
    startAlertCountdown(10);
  }

  let countdownInterval = null;

  function startAlertCountdown(seconds) {
    if (sosTriggered) return;
    const overlay = document.getElementById('alertOverlay');
    overlay.classList.add('show');
    sosBtn.classList.add('triggered');

    let remaining = seconds;
    const circumference = 2 * Math.PI * 80;
    const circle = document.getElementById('timerCircle');
    document.getElementById('timerCount').textContent = remaining;
    circle.style.strokeDashoffset = 0;

    // Update banner
    const banner = document.getElementById('alertBanner');
    banner.classList.add('active-alert');
    document.getElementById('bannerText').textContent = '⚠ SOS COUNTDOWN ACTIVE';

    countdownInterval = setInterval(() => {
      remaining--;
      document.getElementById('timerCount').textContent = remaining;
      const offset = circumference * (1 - remaining / seconds);
      circle.style.strokeDashoffset = offset;

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        dispatchAlert();
      }
    }, 1000);
  }

  function cancelAlert() {
    clearInterval(countdownInterval);
    document.getElementById('alertOverlay').classList.remove('show');
    sosBtn.classList.remove('triggered');
    const banner = document.getElementById('alertBanner');
    banner.classList.remove('active-alert');
    document.getElementById('bannerText').textContent = 'SYSTEM READY · ALL CONTACTS ACTIVE';
    showToast('ALERT CANCELLED', 'red');
  }

  function dispatchAlert() {
    document.getElementById('alertOverlay').classList.remove('show');
    sosTriggered = true;
    const banner = document.getElementById('alertBanner');
    banner.classList.add('active-alert');
    document.getElementById('bannerText').textContent = '🚨 ALERT DISPATCHED · HELP ON WAY';
    showToast('SOS DISPATCHED TO ALL CONTACTS', 'red');
    sendSOSToAPI();
    setTimeout(() => {
      sosTriggered = false;
      sosBtn.classList.remove('triggered');
    }, 8000);
  }

  // ─── QUICK EMERGENCY CALL ───
  function callEmergency(service) {
    const nums = { POLICE: '100', AMBULANCE: '108', FIRE: '101' };
    showToast(`CALLING ${service} ${nums[service]}`);
    sendAlertToAPI(service);
  }

  // ─── CONTACT ALERT ───
  function alertContact(name) {
    showToast(`ALERTING ${name.toUpperCase()}`);
  }

  // ═══════════════════════════════════════════
  //  API INTEGRATION LAYER
  //  Replace BASE_URL and API_KEY with real values
  // ═══════════════════════════════════════════

  const API_CONFIG = {
    BASE_URL: 'https://your-api-endpoint.com/api/v1',
    API_KEY: 'YOUR_API_KEY_HERE',
    DEVICE_ID: 'device_' + Math.random().toString(36).slice(2,10).toUpperCase()
  };

  function getLocation() {
    return new Promise(resolve => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
          () => resolve({ lat: 26.8467, lng: 80.9462, accuracy: 10, demo: true })
        );
      } else {
        resolve({ lat: 26.8467, lng: 80.9462, accuracy: 10, demo: true });
      }
    });
  }

  async function sendSOSToAPI() {
    const location = await getLocation();
    const payload = {
      type: 'SOS',
      severity: 'CRITICAL',
      device_id: API_CONFIG.DEVICE_ID,
      timestamp: new Date().toISOString(),
      location: { latitude: location.lat, longitude: location.lng, accuracy: location.accuracy },
      contacts_notified: ['Priya Sharma', 'Ravi Kumar', 'Anjali Mishra'],
      silent_mode: true
    };

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/alerts/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_CONFIG.API_KEY,
          'X-Device-ID': API_CONFIG.DEVICE_ID
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      console.log('[SafeAlert] SOS dispatched:', data);
    } catch (err) {
      console.warn('[SafeAlert] API unavailable, running in demo mode:', err.message);
    }
  }

  async function sendLocationToAPI(lat, lng) {
    const payload = {
      type: 'LOCATION_UPDATE',
      device_id: API_CONFIG.DEVICE_ID,
      timestamp: new Date().toISOString(),
      location: { latitude: lat, longitude: lng }
    };

    try {
      await fetch(`${API_CONFIG.BASE_URL}/location/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.API_KEY },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('[SafeAlert] Location API unavailable:', err.message);
    }
  }

  async function sendAlertToAPI(service) {
    const location = await getLocation();
    const payload = {
      type: 'EMERGENCY_CALL',
      service,
      device_id: API_CONFIG.DEVICE_ID,
      timestamp: new Date().toISOString(),
      location: { latitude: location.lat, longitude: location.lng }
    };

    try {
      await fetch(`${API_CONFIG.BASE_URL}/alerts/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_CONFIG.API_KEY },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('[SafeAlert] Emergency API unavailable:', err.message);
    }
  }
