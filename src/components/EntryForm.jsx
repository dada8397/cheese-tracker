import { useState } from 'react';
import { Save, X } from 'lucide-react';

export default function EntryForm({ onSave, onCancel, theme }) {
    const [formData, setFormData] = useState({
        weight: '',
        foodIntake: '',
        wheelTurns: '',
        poop: 'Normal',
        activity: 'Normal',
        interaction: 'None',
        environment: 'Normal',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert numeric fields
        const entry = {
            ...formData,
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
                <h3 className="text-lg font-semibold">新增紀錄</h3>
                <button type="button" onClick={onCancel} className={iconMuted}>
                    <X size={24} />
                </button>
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

            <button
                type="submit"
                className={`w-full flex items-center justify-center gap-2 ${buttonBg} ${buttonHover} ${buttonText} font-semibold py-3 rounded-lg transition-colors`}
            >
                <Save size={20} />
                Save Entry
            </button>
        </form>
    );
}
