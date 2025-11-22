/**
 * Get current date/time in +8 timezone (Asia/Taipei)
 * @returns {Date} Current date in +8 timezone
 */
export const getTaipeiDate = () => {
    const now = new Date();
    // Get time in Taipei timezone
    const taipeiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
    return taipeiTime;
};

/**
 * Get current date string in YYYY-MM-DD format in +8 timezone
 * @returns {string} Current date string
 */
export const getTaipeiDateString = () => {
    const date = getTaipeiDate();
    return date.toISOString().split('T')[0];
};

/**
 * Get current timestamp in ISO format using +8 timezone
 * @returns {string} ISO timestamp string
 */
export const getTaipeiTimestamp = () => {
    const now = new Date();
    // Convert to Taipei timezone and get ISO string
    const taipeiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
    // Get the offset to create proper ISO string
    const offset = 8 * 60; // +8 hours in minutes
    const localTime = taipeiTime.getTime();
    const utcTime = localTime - (offset * 60 * 1000);
    return new Date(utcTime).toISOString();
};

/**
 * Format date string to locale date string in +8 timezone
 * @param {string} dateString - Date string to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDateTaipei = (dateString, options = {}) => {
    if (!dateString) return null;
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Taipei'
    };
    return new Date(dateString).toLocaleDateString('zh-TW', { ...defaultOptions, ...options });
};

/**
 * Calculate days difference between date and today in +8 timezone
 * @param {string} dateString - Date string to compare
 * @returns {number|null} Number of days difference, or null if invalid
 */
export const calculateDaysFromToday = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = getTaipeiDate();
    // Set both to midnight for accurate day calculation
    const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = todayMidnight - dateMidnight;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

