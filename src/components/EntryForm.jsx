import { useState, useEffect } from 'react';
import { Save, X, Trash2 } from 'lucide-react';
import { getTaipeiDateString, getTaipeiTimestamp } from '../utils/dateUtils';

export default function EntryForm({ onSave, onCancel, theme, selectedDate, editingEntry, onDelete }) {
    // Initialize form data from editing entry or defaults
    const getInitialFormData = () => {
        if (editingEntry) {
            // Extract date from timestamp
            const entryDate = new Date(editingEntry.timestamp);
            const dateStr = entryDate.toLocaleDateString('en-CA', {
                timeZone: 'Asia/Taipei',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            
            return {
                date: dateStr,
                weight: editingEntry.weight || '',
                foodIntake: editingEntry.foodIntake || '',
                wheelTurns: editingEntry.wheelTurns || '',
                poop: editingEntry.poop || 'Normal',
                activity: editingEntry.activity || 'Normal',
                interaction: editingEntry.interaction || 'None',
                environment: editingEntry.environment || 'Normal',
                notes: editingEntry.notes || ''
            };
        }
        return {
            date: selectedDate || getTaipeiDateString(),
            weight: '',
            foodIntake: '',
            wheelTurns: '',
            poop: 'Normal',
            activity: 'Normal',
            interaction: 'None',
            environment: 'Normal',
            notes: ''
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());

    // Update form data when editingEntry or selectedDate changes
    useEffect(() => {
        setFormData(getInitialFormData());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingEntry, selectedDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert numeric fields and prepare timestamp
        const { date, ...entryData } = formData;
        
        // Create timestamp from selected date
        let timestamp;
        if (date) {
            // Parse date string (YYYY-MM-DD) and create date at noon in Taipei timezone
            const [year, month, day] = date.split('-').map(Number);
            // Create date object representing noon in Taipei timezone
            const taipeiDate = new Date(Date.UTC(year, month - 1, day, 4, 0, 0)); // UTC+8 means 12:00 Taipei = 04:00 UTC
            timestamp = taipeiDate.toISOString();
        } else {
            timestamp = getTaipeiTimestamp();
        }
        
        const entry = {
            ...entryData,
            timestamp,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            foodIntake: formData.foodIntake ? parseFloat(formData.foodIntake) : null,
            wheelTurns: formData.wheelTurns ? parseInt(formData.wheelTurns) : null,
        };
        onSave(entry);
    };

    const {
        cardBg = 'bg-white',
        cardBorder = 'border-gray-200',
        cardText = 'text-gray-900',
        labelText = 'text-gray-700',
        inputBorder = 'border-gray-300',
        inputFocus = 'focus:ring-amber-500 focus:border-amber-500',
        buttonBg = 'bg-amber-500',
        buttonHover = 'hover:bg-amber-600',
        buttonText = 'text-white',
        iconMuted = 'text-gray-400 hover:text-gray-600'
    } = theme || {};

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${cardBg} ${cardText} p-6 rounded-xl shadow-sm border ${cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{editingEntry ? '編輯紀錄' : '新增紀錄'}</h3>
                <button type="button" onClick={onCancel} className={iconMuted}>
                    <X size={24} />
                </button>
            </div>

            {/* Date Selection */}
            <div>
                <label className={`block text-sm font-medium ${labelText} mb-1`}>日期</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    max={getTaipeiDateString()}
                    className={`w-full p-2 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                />
            </div>

            {/* Quantitative Data */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className={`block text-sm font-medium ${labelText} mb-1`}>體重 (g)</label>
                    <input
                        type="number"
                        step="0.1"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className={`w-full p-2 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                        placeholder="e.g. 35.0"
                    />
                </div>
                <div>
                    <label className={`block text-sm font-medium ${labelText} mb-1`}>食量 (g)</label>
                    <input
                        type="number"
                        step="0.1"
                        name="foodIntake"
                        value={formData.foodIntake}
                        onChange={handleChange}
                        className={`w-full p-2 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                        placeholder="e.g. 3.0"
                    />
                </div>
                <div>
                    <label className={`block text-sm font-medium ${labelText} mb-1`}>滾輪圈數</label>
                    <input
                        type="number"
                        name="wheelTurns"
                        value={formData.wheelTurns}
                        onChange={handleChange}
                        className={`w-full p-2 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                        placeholder="e.g. 5000"
                    />
                </div>
            </div>

            {/* Categorical Data */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={`block text-sm font-medium ${labelText} mb-1`}>便便狀態</label>
                    <select
                        name="poop"
                        value={formData.poop}
                        onChange={handleChange}
                        className={`w-full p-2 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                    >
                        <option value="Normal">正常</option>
                        <option value="Soft">軟便/濕</option>
                        <option value="None">無/便秘</option>
                    </select>
                </div>
                <div>
                    <label className={`block text-sm font-medium ${labelText} mb-1`}>活動力</label>
                    <select
                        name="activity"
                        value={formData.activity}
                        onChange={handleChange}
                        className={`w-full p-2 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                    >
                        <option value="Normal">正常</option>
                        <option value="High">高 (亢奮)</option>
                        <option value="Low">低 (懶洋洋)</option>
                    </select>
                </div>
                <div>
                    <label className={`block text-sm font-medium ${labelText} mb-1`}>互動</label>
                    <select
                        name="interaction"
                        value={formData.interaction}
                        onChange={handleChange}
                        className={`w-full p-2 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                    >
                        <option value="None">無 (不打擾)</option>
                        <option value="Held">上手/玩耍</option>
                        <option value="Stressful">有壓力事件</option>
                    </select>
                </div>
                <div>
                    <label className={`block text-sm font-medium ${labelText} mb-1`}>環境</label>
                    <select
                        name="environment"
                        value={formData.environment}
                        onChange={handleChange}
                        className={`w-full p-2 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                    >
                        <option value="Normal">正常</option>
                        <option value="Bright">太亮</option>
                        <option value="Loud">太吵</option>
                        <option value="Hot">太熱</option>
                        <option value="Cold">太冷</option>
                    </select>
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className={`block text-sm font-medium ${labelText} mb-1`}>筆記</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full p-2 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                    placeholder="例如：只吃小米，躲在角落..."
                />
            </div>

            <div className="flex gap-3">
                {editingEntry && onDelete && (
                    <button
                        type="button"
                        onClick={() => {
                            if (window.confirm('確定要刪除這筆紀錄嗎？')) {
                                onDelete(editingEntry.id);
                            }
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 ${buttonText} font-semibold py-3 rounded-lg transition-colors`}
                    >
                        <Trash2 size={20} />
                        刪除
                    </button>
                )}
                <button
                    type="submit"
                    className={`${editingEntry && onDelete ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 ${buttonBg} ${buttonHover} ${buttonText} font-semibold py-3 rounded-lg transition-colors`}
                >
                    <Save size={20} />
                    {editingEntry ? '儲存' : 'Save Entry'}
                </button>
            </div>
        </form>
    );
}
