import { useState, useEffect, useRef } from 'react';
import { Settings, Download, Upload, Trash2, AlertTriangle, X } from 'lucide-react';
import { exportData, exportBackup, importData } from '../utils/dataIO';

export default function SettingsPage({ settings, onUpdate, onImport, onClearAll, onClose, theme }) {
    const [apiKey, setApiKey] = useState(settings.apiKey || '');
    const [hamsterBackground, setHamsterBackground] = useState(settings.hamsterBackground || '');
    const [showImportModal, setShowImportModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const fileInputRef = useRef(null);

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

    const handleImportConfirm = async (file) => {
        const result = await importData(
            file, 
            onImport, // Import data
            (settings) => {
                // Import settings (including all welcome screen data)
                onUpdate(settings);
            }
        );
        if (result.success) {
            alert(result.message || '資料匯入成功');
            setShowImportModal(false);
        } else {
            alert(result.message || '匯入失敗');
        }
    };

    const handleClearConfirm = () => {
        onClearAll();
        setShowClearModal(false);
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
                        onClick={() => exportBackup()}
                        className={`flex items-center justify-center gap-2 ${infoButtonBg} ${infoButtonText} ${infoButtonHover} font-semibold py-2 rounded-lg border ${infoButtonBorder}`}
                    >
                        <Download size={18} /> 匯出資料 (JSON)
                    </button>

                    <button
                        onClick={() => setShowImportModal(true)}
                        className={`flex items-center justify-center gap-2 ${neutralButtonBg} ${neutralButtonText} ${neutralButtonHover} font-semibold py-2 rounded-lg border ${neutralButtonBorder}`}
                    >
                        <Upload size={18} /> 匯入資料 (JSON)
                    </button>

                    <button
                        onClick={() => setShowClearModal(true)}
                        className={`w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-2 rounded-lg border border-red-200 transition-all`}
                    >
                        <Trash2 size={18} /> 清空所有資料
                    </button>
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

            {/* Import Data Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setShowImportModal(false)}>
                    <div className={`${cardBg} rounded-xl shadow-xl max-w-md w-full p-6`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-bold ${subHeaderText} flex items-center gap-2`}>
                                <AlertTriangle className={accentSoftText} size={20} />
                                匯入資料警告
                            </h3>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className={`p-2 ${cardText} hover:bg-gray-100 rounded-full transition-colors`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className={`mb-4 p-4 rounded-lg ${accentSoftBg} border ${accentSoftBorder}`}>
                            <p className={`${accentSoftText} text-sm mb-2 font-medium`}>
                                ⚠️ 警告：匯入資料將會覆蓋所有現有資料！
                            </p>
                            <p className={`${accentSoftText} text-xs`}>
                                此操作將會：
                            </p>
                            <ul className={`${accentSoftText} text-xs mt-2 ml-4 list-disc space-y-1`}>
                                <li>覆蓋所有現有的追蹤記錄</li>
                                <li>覆蓋所有設定（包含倉鼠資訊、主題等）</li>
                                <li>無法復原現有資料</li>
                            </ul>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className={`flex-1 ${neutralButtonBg} ${neutralButtonHover} ${neutralButtonText} font-semibold py-2 rounded-lg border ${neutralButtonBorder}`}
                            >
                                取消
                            </button>
                            <label className={`flex-1 ${buttonBg} ${buttonHover} ${buttonText} font-semibold py-2 rounded-lg cursor-pointer text-center`}>
                                確認匯入
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            await handleImportConfirm(file);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear All Data Modal */}
            {showClearModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setShowClearModal(false)}>
                    <div className={`${cardBg} rounded-xl shadow-xl max-w-md w-full p-6`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-bold text-red-600 flex items-center gap-2`}>
                                <AlertTriangle className="text-red-600" size={20} />
                                清空資料警告
                            </h3>
                            <button
                                onClick={() => setShowClearModal(false)}
                                className={`p-2 ${cardText} hover:bg-gray-100 rounded-full transition-colors`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-red-600 text-sm mb-2 font-medium">
                                ⚠️ 警告：此操作將清除所有資料和設定！
                            </p>
                            <p className="text-red-600 text-xs mb-2">
                                此操作將會清除：
                            </p>
                            <ul className="text-red-600 text-xs ml-4 list-disc space-y-1">
                                <li>所有追蹤記錄</li>
                                <li>倉鼠資訊（名字、生日、照片等）</li>
                                <li>所有設定（主題、API 金鑰等）</li>
                            </ul>
                            <p className="text-red-600 text-xs mt-3 font-medium">
                                此操作無法復原，並會回到首次使用狀態！
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearModal(false)}
                                className={`flex-1 ${neutralButtonBg} ${neutralButtonHover} ${neutralButtonText} font-semibold py-2 rounded-lg border ${neutralButtonBorder}`}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleClearConfirm}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-all"
                            >
                                確認清空
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
