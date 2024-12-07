// Mapping of diseases to their API endpoints
// This object stores disease names as keys and their corresponding API URLs as values
const apiEndpoints = {
  "covid-19": "https://disease.sh/v3/covid-19/all"
};

/**
 * Fetch disease data dynamically based on user input
 * @param {string} query - The name of the disease to query
 * @returns {Promise<Object>} - A promise resolving to the fetched disease data
 */
function fetchDiseaseData(query) {
  if (apiEndpoints[query]) {
    return fetch(apiEndpoints[query])
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch data");
        return response.json();
      });
  } else {
    return Promise.reject(`No data available for "${query}".`);
  }
}

/**
 * Format large numbers with commas for better readability
 * Example: 1234567 -> 1,234,567
 * @param {number} num - The number to be formatted
 * @returns {string} - The formatted number as a string
 */
function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Render disease data to the result section in the popup
 * Dynamically updates the HTML content with fetched disease data
 * @param {Object} data - The disease data object fetched from the API
 */
function renderDiseaseData(data) {
  const resultElement = document.getElementById("result");
  resultElement.innerHTML = `
    <strong>Disease Data:</strong>
    <br><strong>Total Cases:</strong> ${formatNumber(data.cases)}
    <br><strong>Total Deaths:</strong> ${formatNumber(data.deaths)}
    <br><strong>Total Recovered:</strong> ${formatNumber(data.recovered)}
    <br><strong>Active Cases:</strong> ${formatNumber(data.active)}
    <br><strong>Critical Cases:</strong> ${formatNumber(data.critical)}
    <br><strong>Affected Countries:</strong> ${data.affectedCountries}
  `;
}

/**
 * Save the query result to Chrome's local storage
 * This allows data to persist for offline access or caching
 * @param {string} query - The disease name used for the query
 * @param {Object} data - The data to be saved
 */
function saveQueryToStorage(query, data) {
  chrome.storage.local.set({ [query]: data }, () => {
    console.log(`Query for "${query}" saved to storage.`);
  });
}

/**
 * Load a previously saved query result from Chrome's local storage
 * @param {string} query - The disease name used to fetch data from storage
 * @param {Function} callback - A function to execute with the retrieved data
 */
function loadQueryFromStorage(query, callback) {
  chrome.storage.local.get(query, (result) => {
    if (result[query]) {
      callback(result[query]);
    } else {
      callback(null);
    }
  });
}

/**
 * Display supported diseases dynamically in the popup
 * Updates the HTML to show a list of all supported diseases from apiEndpoints
 */
function displaySupportedDiseases() {
  const supportedDiseases = Object.keys(apiEndpoints).join(", ");
  document.getElementById("supported-diseases").textContent = 
  `Supported diseases: ${supportedDiseases}`;
}

/**
 * Event listener for the search button
 * Fetches and renders disease data based on user input
 */
document.getElementById("search").addEventListener("click", () => {
  const query = document.getElementById("query").value.toLowerCase();
  const resultElement = document.getElementById("result");

  fetchDiseaseData(query)
    .then(data => {
      renderDiseaseData(data);
      saveQueryToStorage(query, data);
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      resultElement.textContent = error;
    });
});

/**
 * Event listener for the refresh button
 * Refreshes the data for the currently queried disease
 */
document.getElementById("refresh").addEventListener("click", () => {
  const query = document.getElementById("query").value.toLowerCase();
  const resultElement = document.getElementById("result");

  fetchDiseaseData(query)
    .then(data => {
      renderDiseaseData(data);
      saveQueryToStorage(query, data);
    })
    .catch(error => {
      console.error("Error refreshing data:", error);
      resultElement.textContent = "Error refreshing data.";
    });
});

/**
 * Initialize the popup by displaying the list of supported diseases
 * Runs automatically when the popup page is fully loaded
 */
document.addEventListener("DOMContentLoaded", displaySupportedDiseases);
