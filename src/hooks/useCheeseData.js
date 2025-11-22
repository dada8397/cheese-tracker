import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cheese_tracker_data';
const SETTINGS_KEY = 'cheese_tracker_settings';

export const useCheeseData = () => {
    const [data, setData] = useState([]);
    const [settings, setSettings] = useState({ 
        apiKey: '', 
        theme: 'cherry', 
        hamsterBackground: '',
        hamsterName: '',
        hamsterBirthday: '',
        arrivalDate: '',
        beddingType: '',
        lastBeddingChange: '',
        hamsterPhoto: '',
        onboardingCompleted: false
    });

    useEffect(() => {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            try {
                setData(JSON.parse(storedData));
            } catch (e) {
                console.error("Failed to parse data", e);
            }
        }

        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            try {
                setSettings(JSON.parse(storedSettings));
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }, []);

    const addEntry = (entry) => {
        const newEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...entry
        };
        const newData = [newEntry, ...data];
        setData(newData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    };

    const updateSettings = (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    };

    const clearData = () => {
        setData([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const clearAllData = () => {
        setData([]);
        setSettings({ 
            apiKey: '', 
            theme: 'cherry', 
            hamsterBackground: '',
            hamsterName: '',
            hamsterBirthday: '',
            arrivalDate: '',
            beddingType: '',
            lastBeddingChange: '',
            hamsterPhoto: '',
            onboardingCompleted: false
        });
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SETTINGS_KEY);
    };

    const importData = (newData) => {
        // Basic validation
        if (Array.isArray(newData)) {
            setData(newData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            return true;
        }
        return false;
    };

    const updateTodayEntry = (updates) => {
        // Find today's entry (most recent)
        const today = data[0];
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

        const newData = [updatedEntry, ...data.slice(1)];
        setData(newData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        return true;
    };

    return { data, addEntry, settings, updateSettings, clearData, clearAllData, importData, updateTodayEntry };
};
