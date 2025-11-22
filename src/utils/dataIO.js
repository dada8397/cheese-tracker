import { getTaipeiTimestamp } from './dateUtils';

const STORAGE_KEY = 'cheese_tracker_data';
const SETTINGS_KEY = 'cheese_tracker_settings';
const HAMSTERS_KEY = 'cheese_tracker_hamsters';
const CURRENT_HAMSTER_KEY = 'cheese_tracker_current_hamster';

/**
 * Export tracking data to JSON file (for current hamster or all hamsters)
 * @param {string} filename - Optional filename (default: 'hamster_data.json')
 * @param {string} hamsterId - Optional hamster ID to export data for specific hamster
 */
export const exportData = (filename = 'hamster_data.json', hamsterId = null) => {
    try {
        const hamsters = localStorage.getItem(HAMSTERS_KEY);
        if (!hamsters) {
            alert('沒有資料可以匯出');
            return false;
        }

        const parsedHamsters = JSON.parse(hamsters);
        let dataToExport = [];
        
        if (hamsterId) {
            // Export data for specific hamster
            const hamster = parsedHamsters.find(h => h.id === hamsterId);
            if (hamster && hamster.data) {
                dataToExport = hamster.data;
            }
        } else {
            // Export all data from all hamsters (with hamsterId for backward compatibility)
            dataToExport = parsedHamsters.flatMap(h => 
                (h.data || []).map(entry => ({ ...entry, hamsterId: h.id }))
            );
        }

        if (dataToExport.length === 0) {
            alert('沒有資料可以匯出');
            return false;
        }

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Export failed:', error);
        alert('匯出失敗：' + error.message);
        return false;
    }
};

/**
 * Export settings to JSON file
 * @param {string} filename - Optional filename (default: 'hamster_settings.json')
 */
export const exportSettings = (filename = 'hamster_settings.json') => {
    try {
        const settings = localStorage.getItem(SETTINGS_KEY);
        if (!settings) {
            alert('沒有設定可以匯出');
            return false;
        }

        const blob = new Blob([settings], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Export settings failed:', error);
        alert('匯出失敗：' + error.message);
        return false;
    }
};

/**
 * Export complete backup (hamsters with data + settings) to JSON file
 * @param {string} filename - Optional filename (default: 'hamster_backup.json')
 */
export const exportBackup = (filename = 'hamster_backup.json') => {
    try {
        const settings = localStorage.getItem(SETTINGS_KEY);
        const hamsters = localStorage.getItem(HAMSTERS_KEY);
        const currentHamsterId = localStorage.getItem(CURRENT_HAMSTER_KEY);
        
        if (!hamsters) {
            alert('沒有資料可以匯出');
            return false;
        }

        const backup = {
            version: '3.0', // New format: data is inside each hamster
            exportDate: getTaipeiTimestamp(),
            settings: settings ? JSON.parse(settings) : {},
            hamsters: hamsters ? JSON.parse(hamsters) : [],
            currentHamsterId: currentHamsterId || null
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Export backup failed:', error);
        alert('匯出失敗：' + error.message);
        return false;
    }
};

/**
 * Detect the type of imported JSON data
 * @param {any} json - Parsed JSON data
 * @returns {'data'|'settings'|'backup'|'unknown'} - Type of data
 */
export const detectDataType = (json) => {
    // Check if it's a complete backup (contains hamsters and/or settings)
    if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
        // New format (v3.0): has hamsters array (data is inside each hamster)
        // Old format (v2.0): has data array and/or hamsters array
        if (json.hamsters !== undefined || 
            (json.data !== undefined && json.settings !== undefined) ||
            (json.version !== undefined && (json.hamsters !== undefined || json.data !== undefined))) {
            return 'backup';
        }
        
        // Check if it's a settings object
        if (json.hamsterName !== undefined || 
            json.onboardingCompleted !== undefined || 
            json.theme !== undefined ||
            json.apiKey !== undefined) {
            return 'settings';
        }
    }
    
    // Check if it's a data array
    if (Array.isArray(json)) {
        return 'data';
    }
    
    return 'unknown';
};

/**
 * Parse and validate imported data
 * @param {any} json - Parsed JSON data
 * @returns {{type: string, data: any, settings?: any, valid: boolean, error?: string}}
 */
export const parseImportedData = (json) => {
    try {
        const type = detectDataType(json);
        
        if (type === 'backup') {
            // Validate backup format
            if (typeof json !== 'object' || json === null) {
                return { type: 'unknown', data: null, valid: false, error: '備份格式錯誤：必須是物件' };
            }
            // Data is optional (can be empty array)
            if (json.data !== undefined && !Array.isArray(json.data)) {
                return { type: 'unknown', data: null, valid: false, error: '備份格式錯誤：data 必須是陣列' };
            }
            // Settings is optional
            if (json.settings !== undefined && (typeof json.settings !== 'object' || json.settings === null)) {
                return { type: 'unknown', data: null, valid: false, error: '備份格式錯誤：settings 必須是物件' };
            }
            // Hamsters is optional
            if (json.hamsters !== undefined && !Array.isArray(json.hamsters)) {
                return { type: 'unknown', data: null, valid: false, error: '備份格式錯誤：hamsters 必須是陣列' };
            }
            return { 
                type: 'backup', 
                data: json.data || [], 
                settings: json.settings || {}, 
                hamsters: json.hamsters || [],
                currentHamsterId: json.currentHamsterId || null,
                valid: true 
            };
        }
        
        if (type === 'data') {
            // Validate data array
            if (!Array.isArray(json)) {
                return { type: 'unknown', data: null, valid: false, error: '資料格式錯誤：必須是陣列' };
            }
            return { type: 'data', data: json, valid: true };
        }
        
        if (type === 'settings') {
            // Validate settings object
            if (typeof json !== 'object' || json === null) {
                return { type: 'unknown', data: null, valid: false, error: '設定格式錯誤：必須是物件' };
            }
            return { type: 'settings', data: json, valid: true };
        }
        
        // Check if it's a backup with hamsters array
        if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
            if (json.hamsters && Array.isArray(json.hamsters)) {
                return { type: 'backup', data: json.data || [], settings: json.settings || {}, hamsters: json.hamsters, currentHamsterId: json.currentHamsterId, valid: true };
            }
        }
        
        return { type: 'unknown', data: null, valid: false, error: '無法識別的檔案格式' };
    } catch (error) {
        return { type: 'unknown', data: null, valid: false, error: '解析錯誤：' + error.message };
    }
};

/**
 * Read file and parse JSON
 * @param {File} file - File to read
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const readJsonFile = (file) => {
    return new Promise((resolve) => {
        if (!file) {
            resolve({ success: false, error: '沒有選擇檔案' });
            return;
        }

        // Check file type
        if (!file.name.endsWith('.json') && file.type !== 'application/json') {
            resolve({ success: false, error: '請選擇 JSON 檔案' });
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                resolve({ success: true, data: json });
            } catch (error) {
                resolve({ success: false, error: 'JSON 解析錯誤：' + error.message });
            }
        };
        
        reader.onerror = () => {
            resolve({ success: false, error: '讀取檔案失敗' });
        };
        
        reader.readAsText(file);
    });
};

/**
 * Import data from file
 * @param {File} file - File to import
 * @param {Function} onImportData - Callback for data array import
 * @param {Function} onImportSettings - Callback for settings import
 * @param {Function} onImportBackup - Callback for complete backup import
 * @returns {Promise<{success: boolean, type?: string, message?: string}>}
 */
export const importData = async (file, onImportData, onImportSettings, onImportBackup) => {
    const readResult = await readJsonFile(file);
    
    if (!readResult.success) {
        return { success: false, message: readResult.error };
    }

    const parseResult = parseImportedData(readResult.data);
    
    if (!parseResult.valid) {
        return { success: false, message: parseResult.error };
    }

    // Handle complete backup (data + settings + hamsters)
    if (parseResult.type === 'backup') {
        if (onImportBackup) {
            const backupData = {
                data: parseResult.data || [],
                settings: parseResult.settings || {},
                hamsters: parseResult.hamsters || [],
                currentHamsterId: parseResult.currentHamsterId || null
            };
            if (onImportBackup(backupData)) {
                return { success: true, type: 'backup', message: '資料匯入成功' };
            } else {
                return { success: false, message: '匯入失敗：備份處理錯誤' };
            }
        } else {
            // Fallback to old method if no backup handler
            let dataSuccess = false;
            let settingsSuccess = false;
            
            // Import data
            if (parseResult.data && parseResult.data.length > 0) {
                if (onImportData && onImportData(parseResult.data)) {
                    dataSuccess = true;
                }
            } else {
                dataSuccess = true; // No data to import is also success
            }
            
            // Import settings
            if (parseResult.settings) {
                if (onImportSettings) {
                    onImportSettings(parseResult.settings);
                    settingsSuccess = true;
                } else {
                    return { success: false, message: '匯入失敗：缺少設定處理函數' };
                }
            } else {
                settingsSuccess = true; // No settings to import is also success
            }
            
            if (dataSuccess && settingsSuccess) {
                return { success: true, type: 'backup', message: '資料匯入成功' };
            } else {
                return { success: false, message: '匯入失敗：部分資料匯入失敗' };
            }
        }
    }

    // Handle data only
    if (parseResult.type === 'data') {
        if (onImportData) {
            const success = onImportData(parseResult.data);
            if (success) {
                return { success: true, type: 'data', message: '資料匯入成功' };
            } else {
                return { success: false, message: '匯入失敗：格式錯誤' };
            }
        } else {
            return { success: false, message: '匯入失敗：缺少資料處理函數' };
        }
    }

    // Handle settings only
    if (parseResult.type === 'settings') {
        if (onImportSettings) {
            const success = onImportSettings(parseResult.data);
            if (success) {
                return { success: true, type: 'settings', message: '資料匯入成功' };
            } else {
                return { success: false, message: '匯入失敗：設定處理錯誤' };
            }
        } else {
            return { success: false, message: '匯入失敗：缺少設定處理函數' };
        }
    }

    return { success: false, message: '無法識別的檔案格式' };
};

/**
 * Extract form data from settings object
 * @param {object} settings - Settings object
 * @returns {object} Form data object
 */
export const extractFormDataFromSettings = (settings) => {
    return {
        hamsterName: settings.hamsterName || '',
        hamsterPhoto: settings.hamsterPhoto || '',
        hamsterBirthday: settings.hamsterBirthday || '',
        arrivalDate: settings.arrivalDate || '',
        beddingType: settings.beddingType || '',
        lastBeddingChange: settings.lastBeddingChange || ''
    };
};

