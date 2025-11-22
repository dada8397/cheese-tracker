import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function QuickUpdate({ onUpdate, theme }) {
    const {
        cardBg = 'bg-white',
        cardBorder = 'border-pink-200',
        cardText = 'text-slate-900',
        labelText = 'text-gray-700',
        inputBorder = 'border-pink-300',
        inputFocus = 'focus:ring-pink-500',
        buttonBg = 'bg-pink-500',
        buttonHover = 'hover:bg-pink-600',
        buttonText = 'text-white',
        subHeaderText = 'text-pink-800',
    } = theme || {};
    const [foodAdd, setFoodAdd] = useState('');
    const [wheelAdd, setWheelAdd] = useState('');
    const [noteAdd, setNoteAdd] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const updates = {};
        if (foodAdd) updates.foodIntake = parseFloat(foodAdd);
        if (wheelAdd) updates.wheelTurns = parseInt(wheelAdd);
        if (noteAdd) updates.note = noteAdd;

        if (Object.keys(updates).length > 0) {
            onUpdate(updates);
            setFoodAdd('');
            setWheelAdd('');
            setNoteAdd('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`${cardBg} ${cardText} p-4 rounded-xl border ${cardBorder}`}>
            <h3 className={`text-sm font-semibold ${subHeaderText} mb-3 flex items-center gap-2`}>
                <Plus size={16} /> 快速更新今日
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label className={`block text-xs font-medium ${labelText} mb-1`}>又吃了 (g)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={foodAdd}
                        onChange={(e) => setFoodAdd(e.target.value)}
                        className={`w-full p-2 text-sm border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                        placeholder="0.5"
                    />
                </div>
                <div>
                    <label className={`block text-xs font-medium ${labelText} mb-1`}>又跑了 (圈)</label>
                    <input
                        type="number"
                        value={wheelAdd}
                        onChange={(e) => setWheelAdd(e.target.value)}
                        className={`w-full p-2 text-sm border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                        placeholder="500"
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className={`block text-xs font-medium ${labelText} mb-1`}>又做了什麼</label>
                <input
                    type="text"
                    value={noteAdd}
                    onChange={(e) => setNoteAdd(e.target.value)}
                    className={`w-full p-2 text-sm border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                    placeholder="例如：出來喝水、探索客廳..."
                />
            </div>

            <button
                type="submit"
                className={`w-full ${buttonBg} ${buttonHover} ${buttonText} font-semibold py-2 rounded-lg text-sm transition-all`}
            >
                更新
            </button>
        </form>
    );
}
