import { useState, useEffect } from 'react';
import { Settings, Download, Upload } from 'lucide-react';

export default function SettingsPage({ settings, onUpdate, onImport, onClose, theme }) {
    const [apiKey, setApiKey] = useState(settings.apiKey || '');
    const [hamsterBackground, setHamsterBackground] = useState(settings.hamsterBackground || '');

    useEffect(() => {
        setApiKey(settings.apiKey || '');
        setHamsterBackground(settings.hamsterBackground || '');
    }, [settings]);

    const {
        cardBg = 'bg-white',
        cardBorder = 'border-gray-100',
        cardText = 'text-gray-800',
        labelText = 'text-gray-800',
        mutedText = 'text-gray-500',
        inputBorder = 'border-gray-300',
        inputFocus = 'focus:ring-amber-500 focus:border-amber-500',
        selectFocus = 'focus:ring-amber-500 focus:border-amber-500',
        divider = 'border-gray-100',
        infoButtonBg = 'bg-indigo-50',
        infoButtonBorder = 'border-indigo-200',
        infoButtonText = 'text-indigo-600',
        infoButtonHover = 'hover:bg-indigo-100',
        neutralButtonBg = 'bg-white',
        neutralButtonBorder = 'border-gray-300',
        neutralButtonText = 'text-gray-600',
        neutralButtonHover = 'hover:bg-gray-50',
        accentSoftBg = 'bg-amber-50',
        accentSoftBorder = 'border-amber-200',
        accentSoftText = 'text-amber-600',
        accentSoftHover = 'hover:bg-amber-100',
        buttonBg = 'bg-amber-500',
        buttonHover = 'hover:bg-amber-600',
        buttonText = 'text-white',
        subHeaderText = 'text-gray-800'
    } = theme || {};

    const handleSave = () => {
        onUpdate({ apiKey, hamsterBackground });
        onClose();
    };

    return (
        <div className={`${cardBg} ${cardText} p-6 rounded-xl shadow-sm border ${cardBorder} space-y-6`}>
            <div className="flex justify-between items-center">
                <h3 className={`text-lg font-semibold ${labelText} flex items-center gap-2`}>
                    <Settings size={20} /> 設定
                </h3>
            </div>

            {/* Theme Selection */}
            <div className="mb-4">
                <label className={`block text-sm font-medium ${labelText} mb-1`}>主題風格</label>
                <select
                    value={settings.theme || 'cherry'}
                    onChange={(e) => onUpdate({ theme: e.target.value })}
                    className={`w-full p-2 border ${inputBorder} rounded-lg focus:ring-2 ${selectFocus}`}
                >
                    <option value="cherry">櫻花粉</option>
                    <option value="cheese">倉鼠黃</option>
                    <option value="mint">薄荷綠</option>
                    <option value="lavender">薰衣草紫</option>
                    <option value="ocean">海洋藍</option>
                </select>
            </div>

            <div>
                <label className={`block text-sm font-medium ${labelText} mb-1`}>
                    OpenAI API 金鑰
                </label>
                <p className={`text-xs ${mutedText} mb-2`}>
                    需要此金鑰才能使用 AI 分析功能。金鑰僅儲存在您的瀏覽器中。
                </p>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className={`w-full p-2 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                    placeholder="sk-..."
                />
            </div>

            <div>
                <label className={`block text-sm font-medium ${labelText} mb-1`}>
                    倉鼠背景資訊
                </label>
                <p className={`text-xs ${mutedText} mb-2`}>
                    描述您的倉鼠的個性、習慣、健康狀況等背景資訊，這些資訊將用於 AI 分析。
                </p>
                <textarea
                    value={hamsterBackground}
                    onChange={(e) => setHamsterBackground(e.target.value)}
                    rows="5"
                    className={`w-full p-2 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus} resize-none`}
                    placeholder="例如：他是「天然穀物派」，不吃壓縮飼料。他超愛小米和玉米（但這會導致挑食）。他對光線敏感（開燈就不跑輪）。他有囤糧在頰囊的習慣（會影響體重）。"
                />
            </div>

            {/* Data Management */}
            <div className={`pt-4 border-t ${divider}`}>
                <h4 className={`text-sm font-semibold ${subHeaderText} mb-3`}>資料管理</h4>
                <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={() => {
                            const blob = new Blob([localStorage.getItem('cheese_tracker_data')], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'hamster_data.json';
                            a.click();
                        }}
                        className={`flex items-center justify-center gap-2 ${infoButtonBg} ${infoButtonText} ${infoButtonHover} font-semibold py-2 rounded-lg border ${infoButtonBorder}`}
                    >
                        <Download size={18} /> 匯出資料 (JSON)
                    </button>

                    <label className={`flex items-center justify-center gap-2 ${neutralButtonBg} ${neutralButtonText} ${neutralButtonHover} font-semibold py-2 rounded-lg border ${neutralButtonBorder} cursor-pointer`}>
                        <Upload size={18} /> 匯入資料 (JSON)
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        try {
                                            const json = JSON.parse(event.target.result);
                                            if (onImport(json)) {
                                                alert('匯入成功！');
                                            } else {
                                                alert('匯入失敗：格式錯誤');
                                            }
                                        } catch (err) {
                                            alert('匯入失敗：JSON 解析錯誤');
                                        }
                                    };
                                    reader.readAsText(file);
                                }
                            }}
                        />
                    </label>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    onClick={handleSave}
                    className={`flex-1 ${buttonBg} ${buttonHover} ${buttonText} font-semibold py-2 rounded-lg`}
                >
                    儲存
                </button>
                <button
                    onClick={onClose}
                    className={`flex-1 ${neutralButtonBg} ${neutralButtonHover} ${neutralButtonText} font-semibold py-2 rounded-lg border ${neutralButtonBorder}`}
                >
                    取消
                </button>
            </div>
        </div>
    );
}
