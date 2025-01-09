const { JSDOM } = require("jsdom");

// Buat instance JSDOM untuk mensimulasikan lingkungan browser
const dom = new JSDOM(``, { url: "http://localhost" });
const { window } = dom;
const { localStorage } = window;

// Fungsi untuk mereset nilai-nilai di localStorage
const resetLocalStorage = () => {
  localStorage.setItem("vendorData", JSON.stringify({}));
  localStorage.setItem("isVendorSaved", JSON.stringify(false));
  localStorage.setItem("savedVendorId", JSON.stringify(null));
  localStorage.setItem("currentStep", JSON.stringify(0));
};

// Panggil fungsi resetLocalStorage
resetLocalStorage();

console.log("LocalStorage has been reset.");