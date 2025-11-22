const STORAGE_KEY = 'cheese_tracker_data';
const SETTINGS_KEY = 'cheese_tracker_settings';

/**
 * Export tracking data to JSON file
 * @param {string} filename - Optional filename (default: 'hamster_data.json')
 */
export const exportData = (filename = 'hamster_data.json') => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            alert('沒有資料可以匯出');
            return false;
        }

        const blob = new Blob([data], { type: 'application/json' });
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
 * Export complete backup (data + settings) to JSON file
 * @param {string} filename - Optional filename (default: 'hamster_backup.json')
 */
export const exportBackup = (filename = 'hamster_backup.json') => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const settings = localStorage.getItem(SETTINGS_KEY);
        
        if (!data && !settings) {
            alert('沒有資料可以匯出');
            return false;
        }

        const backup = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: data ? JSON.parse(data) : [],
            settings: settings ? JSON.parse(settings) : {}
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
    // Check if it's a complete backup (contains both data and settings)
    if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
        if (json.data !== undefined && json.settings !== undefined) {
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
            if (!Array.isArray(json.data)) {
                return { type: 'unknown', data: null, valid: false, error: '備份格式錯誤：data 必須是陣列' };
            }
            if (typeof json.settings !== 'object' || json.settings === null) {
                return { type: 'unknown', data: null, valid: false, error: '備份格式錯誤：settings 必須是物件' };
            }
            return { type: 'backup', data: json.data, settings: json.settings, valid: true };
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
 * @returns {Promise<{success: boolean, type?: string, message?: string}>}
 */
export const importData = async (file, onImportData, onImportSettings) => {
    const readResult = await readJsonFile(file);
    
    if (!readResult.success) {
        return { success: false, message: readResult.error };
    }

    const parseResult = parseImportedData(readResult.data);
    
    if (!parseResult.valid) {
        return { success: false, message: parseResult.error };
    }

    // Handle complete backup (data + settings)
    if (parseResult.type === 'backup') {
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

    // Handle data only
    if (parseResult.type === 'data') {
        if (onImportData && onImportData(parseResult.data)) {
            return { success: true, type: 'data', message: '資料匯入成功' };
        } else {
            return { success: false, message: '匯入失敗：格式錯誤' };
        }
    }

    // Handle settings only
    if (parseResult.type === 'settings') {
        if (onImportSettings) {
            onImportSettings(parseResult.data);
            return { success: true, type: 'settings', message: '資料匯入成功' };
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

