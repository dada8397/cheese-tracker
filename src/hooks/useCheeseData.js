import { useState, useEffect } from 'react';
import { getTaipeiTimestamp, getTaipeiDateString } from '../utils/dateUtils';

const SETTINGS_KEY = 'cheese_tracker_settings';
const HAMSTERS_KEY = 'cheese_tracker_hamsters';
const CURRENT_HAMSTER_KEY = 'cheese_tracker_current_hamster';
const OLD_DATA_KEY = 'cheese_tracker_data'; // For migration

// Migrate old settings to new structure
const migrateOldSettings = (oldSettings) => {
    if (!oldSettings || !oldSettings.hamsterName) return null;
    
    return {
        id: Date.now().toString(),
        name: oldSettings.hamsterName || '',
        photo: oldSettings.hamsterPhoto || '',
        birthday: oldSettings.hamsterBirthday || '',
        arrivalDate: oldSettings.arrivalDate || '',
        beddingType: oldSettings.beddingType || '',
        lastBeddingChange: oldSettings.lastBeddingChange || '',
        hamsterBackground: oldSettings.hamsterBackground || '',
        data: [], // Initialize with empty data array
        createdAt: getTaipeiTimestamp()
    };
};

// Migrate old data format (global data array with hamsterId) to new format (data in each hamster)
const migrateOldDataFormat = (oldData, hamsters) => {
    if (!Array.isArray(oldData) || oldData.length === 0) {
        return hamsters;
    }
    
    // Group data by hamsterId
    const dataByHamsterId = {};
    oldData.forEach(entry => {
        const hamsterId = entry.hamsterId || null;
        if (!dataByHamsterId[hamsterId]) {
            dataByHamsterId[hamsterId] = [];
        }
        // Remove hamsterId from entry since it's now in the hamster's data array
        const { hamsterId: _, ...entryWithoutId } = entry;
        dataByHamsterId[hamsterId].push(entryWithoutId);
    });
    
    // Assign data to each hamster
    return hamsters.map(hamster => ({
        ...hamster,
        data: dataByHamsterId[hamster.id] || hamster.data || []
    }));
};

export const useCheeseData = () => {
    const [hamsters, setHamsters] = useState([]);
    const [currentHamsterId, setCurrentHamsterId] = useState(null);
    const [globalSettings, setGlobalSettings] = useState({ 
        apiKey: '', 
        theme: 'cherry'
    });

    useEffect(() => {
        // Load hamsters
        const storedHamsters = localStorage.getItem(HAMSTERS_KEY);
        let loadedHamsters = [];
        
        if (storedHamsters) {
            try {
                loadedHamsters = JSON.parse(storedHamsters);
                // Ensure each hamster has a data array
                loadedHamsters = loadedHamsters.map(h => ({
                    ...h,
                    data: h.data || []
                }));
            } catch (e) {
                console.error("Failed to parse hamsters", e);
            }
        }
        
        // Check for old data format and migrate
        const oldData = localStorage.getItem(OLD_DATA_KEY);
        if (oldData && loadedHamsters.length > 0) {
            try {
                const parsedOldData = JSON.parse(oldData);
                if (Array.isArray(parsedOldData) && parsedOldData.length > 0) {
                    // Migrate old format to new format
                    loadedHamsters = migrateOldDataFormat(parsedOldData, loadedHamsters);
                    // Save migrated data
                    setHamsters(loadedHamsters);
                    localStorage.setItem(HAMSTERS_KEY, JSON.stringify(loadedHamsters));
                    // Remove old data key
                    localStorage.removeItem(OLD_DATA_KEY);
                }
            } catch (e) {
                console.error("Failed to migrate old data", e);
            }
        }
        
        // If no hamsters, try to migrate from old settings
        if (loadedHamsters.length === 0) {
            const oldSettings = localStorage.getItem(SETTINGS_KEY);
            if (oldSettings) {
                try {
                    const parsed = JSON.parse(oldSettings);
                    const migratedHamster = migrateOldSettings(parsed);
                    if (migratedHamster) {
                        // Check if there's old data to migrate
                        if (oldData) {
                            try {
                                const parsedOldData = JSON.parse(oldData);
                                if (Array.isArray(parsedOldData)) {
                                    // Assign all old data to migrated hamster
                                    migratedHamster.data = parsedOldData.map(({ hamsterId: _, ...entry }) => entry);
                                }
                            } catch (e) {
                                console.error("Failed to migrate old data to hamster", e);
                            }
                        }
                        loadedHamsters = [migratedHamster];
                        setHamsters(loadedHamsters);
                        setCurrentHamsterId(migratedHamster.id);
                        localStorage.setItem(HAMSTERS_KEY, JSON.stringify(loadedHamsters));
                        localStorage.setItem(CURRENT_HAMSTER_KEY, migratedHamster.id);
                        localStorage.removeItem(OLD_DATA_KEY);
                    }
                } catch (e) {
                    console.error("Failed to migrate old settings", e);
                }
            }
        } else {
            setHamsters(loadedHamsters);
        }

        // Load current hamster ID
        const storedCurrentId = localStorage.getItem(CURRENT_HAMSTER_KEY);
        
        if (storedCurrentId && loadedHamsters.find(h => h.id === storedCurrentId)) {
            setCurrentHamsterId(storedCurrentId);
        } else if (loadedHamsters.length > 0) {
            // Set first hamster as current if none selected
            setCurrentHamsterId(loadedHamsters[0].id);
            localStorage.setItem(CURRENT_HAMSTER_KEY, loadedHamsters[0].id);
        }

        // Load global settings
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            try {
                const parsed = JSON.parse(storedSettings);
                setGlobalSettings({
                    apiKey: parsed.apiKey || '',
                    theme: parsed.theme || 'cherry'
                });
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }, []);

    // Get current hamster
    const currentHamster = hamsters.find(h => h.id === currentHamsterId) || null;

    // Get data for current hamster
    const currentHamsterData = currentHamster?.data || [];

    const addEntry = (entry) => {
        if (!currentHamsterId) return;
        
        const newEntry = {
            id: Date.now().toString(),
            timestamp: getTaipeiTimestamp(),
            ...entry
        };
        
        const updated = hamsters.map(h => 
            h.id === currentHamsterId 
                ? { ...h, data: [newEntry, ...(h.data || [])] }
                : h
        );
        setHamsters(updated);
        localStorage.setItem(HAMSTERS_KEY, JSON.stringify(updated));
    };

    const addHamster = (hamsterData) => {
        const newHamster = {
            id: Date.now().toString(),
            name: hamsterData.hamsterName || '',
            photo: hamsterData.hamsterPhoto || '',
            birthday: hamsterData.hamsterBirthday || '',
            arrivalDate: hamsterData.arrivalDate || '',
            beddingType: hamsterData.beddingType || '',
            lastBeddingChange: hamsterData.lastBeddingChange || '',
            hamsterBackground: hamsterData.hamsterBackground || '',
            data: [], // Initialize with empty data array
            createdAt: getTaipeiTimestamp()
        };
        const updated = [...hamsters, newHamster];
        setHamsters(updated);
        setCurrentHamsterId(newHamster.id);
        localStorage.setItem(HAMSTERS_KEY, JSON.stringify(updated));
        localStorage.setItem(CURRENT_HAMSTER_KEY, newHamster.id);
        
        return newHamster.id;
    };

    const updateHamster = (hamsterId, updates) => {
        const updated = hamsters.map(h => 
            h.id === hamsterId ? { ...h, ...updates } : h
        );
        setHamsters(updated);
        localStorage.setItem(HAMSTERS_KEY, JSON.stringify(updated));
    };

    const deleteHamster = (hamsterId) => {
        const updated = hamsters.filter(h => h.id !== hamsterId);
        setHamsters(updated);
        localStorage.setItem(HAMSTERS_KEY, JSON.stringify(updated));
        
        // Set new current hamster if current was deleted
        if (currentHamsterId === hamsterId) {
            const newCurrentId = updated.length > 0 ? updated[0].id : null;
            setCurrentHamsterId(newCurrentId);
            if (newCurrentId) {
                localStorage.setItem(CURRENT_HAMSTER_KEY, newCurrentId);
            } else {
                localStorage.removeItem(CURRENT_HAMSTER_KEY);
            }
        }
    };

    const setCurrentHamster = (hamsterId) => {
        setCurrentHamsterId(hamsterId);
        localStorage.setItem(CURRENT_HAMSTER_KEY, hamsterId);
    };

    const updateGlobalSettings = (newSettings) => {
        const updated = { ...globalSettings, ...newSettings };
        setGlobalSettings(updated);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    };

    const clearData = () => {
        if (!currentHamsterId) return;
        
        const updated = hamsters.map(h => 
            h.id === currentHamsterId ? { ...h, data: [] } : h
        );
        setHamsters(updated);
        localStorage.setItem(HAMSTERS_KEY, JSON.stringify(updated));
    };

    const clearAllData = () => {
        setHamsters([]);
        setCurrentHamsterId(null);
        setGlobalSettings({ apiKey: '', theme: 'cherry' });
        localStorage.removeItem(HAMSTERS_KEY);
        localStorage.removeItem(CURRENT_HAMSTER_KEY);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ apiKey: '', theme: 'cherry' }));
    };

    const importData = (newData) => {
        if (!currentHamsterId || !Array.isArray(newData)) return false;
        
        // Remove hamsterId from imported data if present (not needed in new format)
        const cleanedData = newData.map(({ hamsterId: _, ...entry }) => entry);
        
        const updated = hamsters.map(h => 
            h.id === currentHamsterId 
                ? { ...h, data: [...(h.data || []), ...cleanedData] }
                : h
        );
        setHamsters(updated);
        localStorage.setItem(HAMSTERS_KEY, JSON.stringify(updated));
        return true;
    };

    const importBackup = (backup) => {
        try {
            let importedHamsters = [];
            let migratedHamster = null;
            
            // Import hamsters or create from old format settings
            if (backup.hamsters !== undefined && Array.isArray(backup.hamsters) && backup.hamsters.length > 0) {
                // New format: has hamsters array with data
                importedHamsters = backup.hamsters.map(h => ({
                    ...h,
                    data: h.data || [] // Ensure data array exists
                }));
                setHamsters(importedHamsters);
                localStorage.setItem(HAMSTERS_KEY, JSON.stringify(importedHamsters));
            } else if (backup.settings && backup.settings.hamsterName) {
                // Old format: create first hamster from settings
                migratedHamster = migrateOldSettings(backup.settings);
                if (migratedHamster) {
                    importedHamsters = [migratedHamster];
                    setHamsters(importedHamsters);
                    localStorage.setItem(HAMSTERS_KEY, JSON.stringify(importedHamsters));
                }
            }
            
            // Import data and assign to hamster if needed
            if (backup.data !== undefined && Array.isArray(backup.data) && backup.data.length > 0) {
                // If we created a hamster from old format, assign data to it
                if (migratedHamster) {
                    // Remove hamsterId from old format data
                    const cleanedData = backup.data.map(({ hamsterId: _, ...entry }) => entry);
                    migratedHamster.data = cleanedData;
                    importedHamsters = [migratedHamster];
                    setHamsters(importedHamsters);
                    localStorage.setItem(HAMSTERS_KEY, JSON.stringify(importedHamsters));
                } else if (importedHamsters.length > 0) {
                    // If hamsters already exist, try to match data by hamsterId
                    const dataByHamsterId = {};
                    backup.data.forEach(entry => {
                        const hamsterId = entry.hamsterId || importedHamsters[0].id;
                        if (!dataByHamsterId[hamsterId]) {
                            dataByHamsterId[hamsterId] = [];
                        }
                        const { hamsterId: _, ...entryWithoutId } = entry;
                        dataByHamsterId[hamsterId].push(entryWithoutId);
                    });
                    
                    importedHamsters = importedHamsters.map(h => ({
                        ...h,
                        data: [...(h.data || []), ...(dataByHamsterId[h.id] || [])]
                    }));
                    setHamsters(importedHamsters);
                    localStorage.setItem(HAMSTERS_KEY, JSON.stringify(importedHamsters));
                }
            }
            
            // Import global settings (API key, theme)
            if (backup.settings !== undefined && typeof backup.settings === 'object') {
                setGlobalSettings({
                    apiKey: backup.settings.apiKey || '',
                    theme: backup.settings.theme || 'cherry'
                });
                localStorage.setItem(SETTINGS_KEY, JSON.stringify({
                    apiKey: backup.settings.apiKey || '',
                    theme: backup.settings.theme || 'cherry'
                }));
            }
            
            // Set current hamster
            if (backup.currentHamsterId && importedHamsters.find(h => h.id === backup.currentHamsterId)) {
                setCurrentHamsterId(backup.currentHamsterId);
                localStorage.setItem(CURRENT_HAMSTER_KEY, backup.currentHamsterId);
            } else if (importedHamsters.length > 0) {
                setCurrentHamsterId(importedHamsters[0].id);
                localStorage.setItem(CURRENT_HAMSTER_KEY, importedHamsters[0].id);
            }
            
            return true;
        } catch (error) {
            console.error('Import backup failed:', error);
            return false;
        }
    };

    const updateTodayEntry = (updates) => {
        if (!currentHamsterId) return false;
        
        const currentHamster = hamsters.find(h => h.id === currentHamsterId);
        if (!currentHamster || !currentHamster.data || currentHamster.data.length === 0) {
            return false;
        }
        
        // Find today's entry (most recent)
        const today = currentHamster.data[0];
        if (!today) return false;

        const updatedEntry = { ...today };

        // Add to existing values
        if (updates.foodIntake) {
            const newValue = (updatedEntry.foodIntake || 0) + updates.foodIntake;
            updatedEntry.foodIntake = Math.round(newValue * 10) / 10; // Round to 1 decimal place
        }
        if (updates.wheelTurns) {
            updatedEntry.wheelTurns = (updatedEntry.wheelTurns || 0) + updates.wheelTurns;
        }
        if (updates.note) {
            updatedEntry.notes = updatedEntry.notes
                ? `${updatedEntry.notes}\n${updates.note}`
                : updates.note;
        }

        const updated = hamsters.map(h => 
            h.id === currentHamsterId 
                ? { ...h, data: h.data.map(d => d.id === today.id ? updatedEntry : d) }
                : h
        );
        setHamsters(updated);
        localStorage.setItem(HAMSTERS_KEY, JSON.stringify(updated));
        return true;
    };

    // Backward compatibility: settings object for components that still use it
    const settings = currentHamster ? {
        ...globalSettings,
        hamsterName: currentHamster.name,
        hamsterPhoto: currentHamster.photo,
        hamsterBirthday: currentHamster.birthday,
        arrivalDate: currentHamster.arrivalDate,
        beddingType: currentHamster.beddingType,
        lastBeddingChange: currentHamster.lastBeddingChange,
        hamsterBackground: currentHamster.hamsterBackground,
        onboardingCompleted: hamsters.length > 0
    } : {
        ...globalSettings,
        hamsterName: '',
        hamsterPhoto: '',
        hamsterBirthday: '',
        arrivalDate: '',
        beddingType: '',
        lastBeddingChange: '',
        hamsterBackground: '',
        onboardingCompleted: false
    };

    // Get all data for backward compatibility (used in some components)
    const allData = hamsters.flatMap(h => (h.data || []).map(entry => ({
        ...entry,
        hamsterId: h.id // Add hamsterId for components that need it
    })));

    return { 
        data: currentHamsterData, 
        allData,
        hamsters,
        currentHamster,
        currentHamsterId,
        addEntry, 
        settings, 
        updateSettings: (newSettings) => {
            // Update current hamster if hamster-specific fields
            if (currentHamsterId && (newSettings.hamsterName || newSettings.hamsterPhoto || 
                newSettings.hamsterBirthday || newSettings.arrivalDate || 
                newSettings.beddingType || newSettings.lastBeddingChange || 
                newSettings.hamsterBackground)) {
                updateHamster(currentHamsterId, {
                    name: newSettings.hamsterName,
                    photo: newSettings.hamsterPhoto,
                    birthday: newSettings.hamsterBirthday,
                    arrivalDate: newSettings.arrivalDate,
                    beddingType: newSettings.beddingType,
                    lastBeddingChange: newSettings.lastBeddingChange,
                    hamsterBackground: newSettings.hamsterBackground
                });
            }
            // Update global settings
            if (newSettings.apiKey !== undefined || newSettings.theme !== undefined) {
                updateGlobalSettings({
                    apiKey: newSettings.apiKey,
                    theme: newSettings.theme
                });
            }
        },
        addHamster,
        updateHamster,
        deleteHamster,
        setCurrentHamster,
        updateGlobalSettings,
        clearData, 
        clearAllData, 
        importData,
        importBackup, 
        updateTodayEntry 
    };
};
