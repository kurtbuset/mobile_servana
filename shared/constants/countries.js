/**
 * Country data for phone number selection
 */
export const COUNTRIES = [
  { label: "United States", code: "US", callingCode: "1" },
  { label: "Philippines", code: "PH", callingCode: "63" },
  { label: "United Kingdom", code: "GB", callingCode: "44" },
  { label: "Canada", code: "CA", callingCode: "1" },
  { label: "Australia", code: "AU", callingCode: "61" },
  { label: "New Zealand", code: "NZ", callingCode: "64" },
  { label: "India", code: "IN", callingCode: "91" },
  { label: "Singapore", code: "SG", callingCode: "65" },
  { label: "Malaysia", code: "MY", callingCode: "60" },
  { label: "Indonesia", code: "ID", callingCode: "62" },
  { label: "Thailand", code: "TH", callingCode: "66" },
  { label: "Japan", code: "JP", callingCode: "81" },
  { label: "South Korea", code: "KR", callingCode: "82" },
  { label: "China", code: "CN", callingCode: "86" },
  { label: "Germany", code: "DE", callingCode: "49" },
  { label: "France", code: "FR", callingCode: "33" },
  { label: "Spain", code: "ES", callingCode: "34" },
  { label: "Italy", code: "IT", callingCode: "39" },
  { label: "Brazil", code: "BR", callingCode: "55" },
  { label: "South Africa", code: "ZA", callingCode: "27" },
  { label: "United Arab Emirates", code: "AE", callingCode: "971" },
  { label: "Saudi Arabia", code: "SA", callingCode: "966" },
  { label: "Egypt", code: "EG", callingCode: "20" },
  { label: "Nigeria", code: "NG", callingCode: "234" },
];

/**
 * Get flag emoji from country code
 */
export const getFlagEmoji = (countryCode) => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
};

/**
 * Get country by code
 */
export const getCountryByCode = (code) => {
  return COUNTRIES.find((c) => c.code === code);
};

/**
 * Get default country (Philippines)
 */
export const getDefaultCountry = () => {
  return COUNTRIES.find((c) => c.code === "PH") || COUNTRIES[0];
};

export default {
  COUNTRIES,
  getFlagEmoji,
  getCountryByCode,
  getDefaultCountry,
};
