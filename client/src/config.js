const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? "http://localhost:5000"
  : "https://leave-management-backend-9fwn.onrender.com";

export default API_URL;
