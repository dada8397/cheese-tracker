import { useState, useRef, useEffect } from 'react';
import { Heart, Calendar, Home, Layers, CheckCircle, Camera, Image, Upload, AlertTriangle, X, Plus } from 'lucide-react';
import { importData, extractFormDataFromSettings } from '../utils/dataIO';
import { formatDateTaipei, getTaipeiDateString } from '../utils/dateUtils';

export default function Welcome({ onComplete, theme, onImportData, onImportBackup, onImportSettings, onImportBackupComplete, hamsters = [], onSelectHamster, currentHamsterId, isNewHamster = false, onCancel }) {
    const [mode, setMode] = useState(hamsters.length > 0 && !isNewHamster ? 'select' : 'new'); // 'select' or 'new'
    
    // Reset mode when isNewHamster changes
    useEffect(() => {
        if (isNewHamster) {
            setMode('new');
            setStep(1); // Reset to first step when adding new hamster
        } else if (hamsters.length > 0) {
            setMode('select');
        }
    }, [isNewHamster, hamsters.length]);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        hamsterName: '',
        hamsterPhoto: '',
        hamsterBirthday: '',
        arrivalDate: '',
        beddingType: '',
        lastBeddingChange: ''
    });
    const [showImportModal, setShowImportModal] = useState(false);
    const fileInputRef = useRef(null);
    const importFileInputRef = useRef(null);

    const {
        cardBg = 'bg-white',
        cardBorder = 'border-pink-200',
        cardText = 'text-gray-800',
        labelText = 'text-pink-600',
        mutedText = 'text-gray-500',
        inputBorder = 'border-gray-300',
        inputFocus = 'focus:ring-pink-500 focus:border-pink-500',
        buttonBg = 'bg-pink-500',
        buttonHover = 'hover:bg-pink-600',
        buttonText = 'text-white',
        subHeaderText = 'text-pink-700',
        accentSoftBg = 'bg-pink-50'
    } = theme || {};

    const handleNext = () => {
        if (step < 7) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleComplete = () => {
        onComplete(formData);
    };

    const handleImportData = async (e) => {
        const file = e?.target?.files?.[0];
        if (!file) return;

        const result = await importData(
            file,
            (data) => {
                // Import old format data array - create default hamster if needed
                if (onImportData) {
                    const success = onImportData(data);
                    // If no hamsters exist and this is first time (onboarding), create a default one
                    if (success && hamsters.length === 0 && onImportSettings) {
                        // Create a default hamster for the imported data
                        // This will be the first hamster
                        onImportSettings({
                            hamsterName: '我的倉鼠',
                            hamsterPhoto: '',
                            hamsterBirthday: '',
                            arrivalDate: '',
                            beddingType: '',
                            lastBeddingChange: '',
                            hamsterBackground: ''
                        });
                    }
                    return success;
                }
                return false;
            },
            (settings) => {
                // Import old format settings - create first hamster
                // Fill form with imported settings
                const formDataFromSettings = extractFormDataFromSettings(settings);
                Object.keys(formDataFromSettings).forEach(key => {
                    if (formDataFromSettings[key]) {
                        updateFormData(key, formDataFromSettings[key]);
                    }
                });
                
                // Import settings as first hamster
                if (onImportSettings) {
                    onImportSettings(settings);
                    return true;
                }
                return false;
            },
            (backup) => {
                // Handle backup import
                if (onImportBackup) {
                    if (onImportBackup(backup)) {
                        if (onImportBackupComplete) {
                            onImportBackupComplete();
                        }
                        return true;
                    }
                }
                return false;
            }
        );

        if (result.success) {
            alert(result.message || '資料匯入成功');
            setShowImportModal(false);
            // If backup was imported, reload will happen in onImportBackupComplete
            // If old format was imported and created first hamster, reload to show dashboard
            if (result.type === 'data' || result.type === 'settings') {
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } else {
            alert(result.message || '匯入失敗');
        }
        
        e.target.value = '';
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('圖片大小不能超過 5MB');
                return;
            }
            
            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('請選擇圖片檔案');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                updateFormData('hamsterPhoto', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const canProceed = () => {
        if (mode === 'select' && step === 1) {
            // In select mode, can proceed if a hamster is selected or new mode is chosen
            return true;
        }
        switch (step) {
            case 1:
                return formData.hamsterName.trim() !== '';
            case 2:
                return formData.hamsterBirthday !== '';
            case 3:
                // Photo is optional
                return true;
            case 4:
                return formData.arrivalDate !== '';
            case 5:
                return formData.beddingType !== '';
            case 6:
                return formData.lastBeddingChange !== '';
            default:
                return true;
        }
    };

    const getStepContent = () => {
        const name = formData.hamsterName || '你的倉鼠';
        
        // Show hamster selection if there are existing hamsters
        if (mode === 'select' && step === 1) {
            return (
                <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                        <Heart className={`${labelText}`} size={48} />
                    </div>
                    <h2 className={`text-2xl font-bold ${subHeaderText} text-center mb-2`}>
                        選擇倉鼠
                    </h2>
                    <p className={`${cardText} text-center mb-6`}>
                        選擇要追蹤的倉鼠，或新增一隻新的
                    </p>
                    <div className="space-y-2">
                        {hamsters.map(hamster => (
                            <button
                                key={hamster.id}
                                onClick={() => {
                                    if (onSelectHamster) {
                                        onSelectHamster(hamster.id);
                                    }
                                }}
                                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                                    hamster.id === currentHamsterId
                                        ? `${buttonBg} ${buttonText} border-transparent`
                                        : `${cardBg} ${cardText} ${inputBorder} hover:border-pink-300`
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {hamster.photo ? (
                                        <img 
                                            src={hamster.photo} 
                                            alt={hamster.name}
                                            className="w-12 h-12 object-cover rounded-full border-2 border-pink-200"
                                        />
                                    ) : (
                                        <div className={`w-12 h-12 rounded-full ${accentSoftBg} flex items-center justify-center`}>
                                            <Heart size={24} className={labelText} />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="font-semibold">{hamster.name}</div>
                                        {hamster.birthday && (
                                            <div className="text-sm opacity-80">
                                                {formatDateTaipei(hamster.birthday, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                        <button
                            onClick={() => setMode('new')}
                            className={`w-full p-4 border-2 border-dashed ${inputBorder} rounded-lg text-left transition-all hover:border-pink-300 flex items-center gap-3`}
                        >
                            <div className={`w-12 h-12 rounded-full ${accentSoftBg} flex items-center justify-center`}>
                                <Plus size={24} className={labelText} />
                            </div>
                            <div className="font-semibold">新增倉鼠</div>
                        </button>
                    </div>
                    <div className="pt-2">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className={`w-full flex items-center justify-center gap-2 ${cardBg} ${cardText} border-2 ${inputBorder} font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors`}
                        >
                            <Upload size={18} />
                            匯入資料
                        </button>
                    </div>
                </div>
            );
        }
        
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <Heart className={`${labelText}`} size={48} />
                        </div>
                        <h2 className={`text-2xl font-bold ${subHeaderText} text-center mb-2`}>
                            {isNewHamster ? '新增倉鼠' : '歡迎使用倉鼠追蹤器！'}
                        </h2>
                        <p className={`${cardText} text-center mb-6`}>
                            {isNewHamster ? '讓我們認識一下新朋友吧！' : '讓我們先認識一下你的小夥伴吧！'}
                        </p>
                        <div>
                            <label className={`block text-sm font-medium ${labelText} mb-2`}>
                                你的倉鼠叫什麼名字呢？
                            </label>
                            <input
                                type="text"
                                value={formData.hamsterName}
                                onChange={(e) => updateFormData('hamsterName', e.target.value)}
                                className={`w-full p-3 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus} text-lg`}
                                placeholder="輸入名字..."
                                autoFocus
                            />
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className={`w-full flex items-center justify-center gap-2 ${cardBg} ${cardText} border-2 ${inputBorder} font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors`}
                            >
                                <Upload size={18} />
                                匯入資料
                            </button>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <Calendar className={`${labelText}`} size={48} />
                        </div>
                        <h2 className={`text-2xl font-bold ${subHeaderText} text-center mb-2`}>
                            好可愛的名字！
                        </h2>
                        <p className={`${cardText} text-center mb-6`}>
                            {name}是什麼時候出生的呢？
                        </p>
                        <div>
                            <label className={`block text-sm font-medium ${labelText} mb-2`}>
                                {name}的生日
                            </label>
                            <input
                                type="date"
                                value={formData.hamsterBirthday}
                                onChange={(e) => updateFormData('hamsterBirthday', e.target.value)}
                                className={`w-full p-3 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus} text-lg`}
                                max={getTaipeiDateString()}
                            />
                            <p className={`text-xs ${mutedText} mt-2`}>
                                如果不確定確切日期，可以選擇大概的日期
                            </p>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <Camera className={`${labelText}`} size={48} />
                        </div>
                        <h2 className={`text-2xl font-bold ${subHeaderText} text-center mb-2`}>
                            來幫{name}拍張照吧！
                        </h2>
                        <p className={`${cardText} text-center mb-6`}>
                            上傳{name}的大頭貼，讓我們記住{name}可愛的樣子
                        </p>
                        <div className="space-y-4">
                            {formData.hamsterPhoto ? (
                                <div className="relative">
                                    <img 
                                        src={formData.hamsterPhoto} 
                                        alt={name}
                                        className="w-full h-64 object-cover rounded-lg border-2 border-dashed border-gray-300"
                                    />
                                    <button
                                        onClick={() => {
                                            updateFormData('hamsterPhoto', '');
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                        className={`absolute top-2 right-2 ${buttonBg} ${buttonText} px-3 py-1 rounded-lg text-sm font-medium ${buttonHover}`}
                                    >
                                        重新選擇
                                    </button>
                                </div>
                            ) : (
                                <label className={`block cursor-pointer border-2 border-dashed ${inputBorder} rounded-lg p-8 text-center hover:border-pink-300 transition-colors`}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <Image className={`${labelText} mx-auto mb-2`} size={48} />
                                    <p className={`${cardText} font-medium mb-1`}>點擊上傳照片</p>
                                    <p className={`text-xs ${mutedText}`}>支援 JPG、PNG 格式，最大 5MB</p>
                                </label>
                            )}
                            {!formData.hamsterPhoto && (
                                <p className={`text-xs ${mutedText} text-center`}>
                                    也可以稍後再上傳
                                </p>
                            )}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <Home className={`${labelText}`} size={48} />
                        </div>
                        <h2 className={`text-2xl font-bold ${subHeaderText} text-center mb-2`}>
                            記住重要的日子
                        </h2>
                        <p className={`${cardText} text-center mb-6`}>
                            {name}是什麼時候來到你身邊的呢？
                        </p>
                        <div>
                            <label className={`block text-sm font-medium ${labelText} mb-2`}>
                                {name}到家的日期
                            </label>
                            <input
                                type="date"
                                value={formData.arrivalDate}
                                onChange={(e) => updateFormData('arrivalDate', e.target.value)}
                                className={`w-full p-3 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus} text-lg`}
                                max={getTaipeiDateString()}
                            />
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <Layers className={`${labelText}`} size={48} />
                        </div>
                        <h2 className={`text-2xl font-bold ${subHeaderText} text-center mb-2`}>
                            關於{name}的居住環境
                        </h2>
                        <p className={`${cardText} text-center mb-6`}>
                            {name}的籠子是用厚鋪還是薄鋪呢？
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => updateFormData('beddingType', 'thick')}
                                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                                    formData.beddingType === 'thick'
                                        ? `${buttonBg} ${buttonText} border-transparent`
                                        : `${cardBg} ${cardText} ${inputBorder} hover:border-pink-300`
                                }`}
                            >
                                <div className="font-semibold mb-1">厚鋪</div>
                                <div className="text-sm opacity-80">墊材較厚，適合挖掘和打洞</div>
                            </button>
                            <button
                                onClick={() => updateFormData('beddingType', 'thin')}
                                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                                    formData.beddingType === 'thin'
                                        ? `${buttonBg} ${buttonText} border-transparent`
                                        : `${cardBg} ${cardText} ${inputBorder} hover:border-pink-300`
                                }`}
                            >
                                <div className="font-semibold mb-1">薄鋪</div>
                                <div className="text-sm opacity-80">墊材較薄，方便觀察和清潔</div>
                            </button>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <Calendar className={`${labelText}`} size={48} />
                        </div>
                        <h2 className={`text-2xl font-bold ${subHeaderText} text-center mb-2`}>
                            最後一個問題
                        </h2>
                        <p className={`${cardText} text-center mb-6`}>
                            上次幫{name}大更換墊材是什麼時候呢？
                        </p>
                        <div>
                            <label className={`block text-sm font-medium ${labelText} mb-2`}>
                                上次大更換墊材日期
                            </label>
                            <input
                                type="date"
                                value={formData.lastBeddingChange}
                                onChange={(e) => updateFormData('lastBeddingChange', e.target.value)}
                                className={`w-full p-3 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus} text-lg`}
                                max={getTaipeiDateString()}
                            />
                            <p className={`text-xs ${mutedText} mt-2`}>
                                這有助於我們追蹤墊材更換的頻率
                            </p>
                        </div>
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className={`${labelText}`} size={48} />
                        </div>
                        <h2 className={`text-2xl font-bold ${subHeaderText} text-center mb-2`}>
                            太好了！讓我們確認一下
                        </h2>
                        {formData.hamsterPhoto && (
                            <div className="flex justify-center mb-4">
                                <img 
                                    src={formData.hamsterPhoto} 
                                    alt={formData.hamsterName}
                                    className="w-32 h-32 object-cover rounded-full border-4 border-pink-200"
                                />
                            </div>
                        )}
                        <div className={`${cardBg} border ${cardBorder} rounded-lg p-4 space-y-3`}>
                            <div>
                                <span className={`text-sm font-medium ${labelText}`}>名字：</span>
                                <span className={`${cardText} ml-2`}>{formData.hamsterName}</span>
                            </div>
                            {formData.hamsterPhoto && (
                                <div>
                                    <span className={`text-sm font-medium ${labelText}`}>大頭貼：</span>
                                    <span className={`${cardText} ml-2`}>已上傳</span>
                                </div>
                            )}
                            <div>
                                <span className={`text-sm font-medium ${labelText}`}>生日：</span>
                                <span className={`${cardText} ml-2`}>
                                    {formData.hamsterBirthday ? new Date(formData.hamsterBirthday).toLocaleDateString('zh-TW') : '未設定'}
                                </span>
                            </div>
                            <div>
                                <span className={`text-sm font-medium ${labelText}`}>到家日期：</span>
                                <span className={`${cardText} ml-2`}>
                                    {formData.arrivalDate ? new Date(formData.arrivalDate).toLocaleDateString('zh-TW') : '未設定'}
                                </span>
                            </div>
                            <div>
                                <span className={`text-sm font-medium ${labelText}`}>墊材類型：</span>
                                <span className={`${cardText} ml-2`}>
                                    {formData.beddingType === 'thick' ? '厚鋪' : formData.beddingType === 'thin' ? '薄鋪' : '未設定'}
                                </span>
                            </div>
                            <div>
                                <span className={`text-sm font-medium ${labelText}`}>上次大更換墊材：</span>
                                <span className={`${cardText} ml-2`}>
                                    {formData.lastBeddingChange ? new Date(formData.lastBeddingChange).toLocaleDateString('zh-TW') : '未設定'}
                                </span>
                            </div>
                        </div>
                        <p className={`${cardText} text-center text-sm mt-4`}>
                            確認無誤後，就可以開始追蹤{formData.hamsterName}的日常了！
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <div className={`${cardBg} ${cardText} p-6 rounded-xl shadow-lg border ${cardBorder} space-y-6`}>
                {/* Progress Indicator - Hide in select mode */}
                {mode !== 'select' && (
                    <div className="flex justify-between items-center mb-4">
                        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                        <div key={s} className="flex-1 flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    s < step
                                        ? `${buttonBg} ${buttonText}`
                                        : s === step
                                        ? `${buttonBg} ${buttonText}`
                                        : `${inputBorder} border-2 ${cardText}`
                                }`}
                            >
                                {s < step ? '✓' : s}
                            </div>
                            {s < 7 && (
                                <div
                                    className={`flex-1 h-1 mx-1 ${
                                        s < step ? buttonBg : 'bg-gray-200'
                                    }`}
                                />
                            )}
                        </div>
                        ))}
                    </div>
                )}

                {/* Step Content */}
                {getStepContent()}

                {/* Navigation Buttons */}
                {mode !== 'select' || step > 1 ? (
                    <div className="flex gap-3 pt-4">
                        {isNewHamster && step === 1 && onCancel ? (
                            <button
                                onClick={onCancel}
                                className={`flex-1 ${cardBg} ${cardText} border-2 ${inputBorder} font-semibold py-3 rounded-lg hover:bg-gray-50 transition-all`}
                            >
                                取消
                            </button>
                        ) : step > 1 && (
                            <button
                                onClick={handleBack}
                                className={`flex-1 ${cardBg} ${cardText} border-2 ${inputBorder} font-semibold py-3 rounded-lg hover:bg-gray-50 transition-all`}
                            >
                                上一步
                            </button>
                        )}
                        {step < 7 ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className={`flex-1 ${buttonBg} ${buttonHover} ${buttonText} font-semibold py-3 rounded-lg transition-all ${
                                    !canProceed() ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                下一步
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                className={`flex-1 ${buttonBg} ${buttonHover} ${buttonText} font-semibold py-3 rounded-lg`}
                            >
                                {isNewHamster ? '完成新增' : '完成設定'}
                            </button>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Import Data Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setShowImportModal(false)}>
                    <div className={`${cardBg} rounded-xl shadow-xl max-w-md w-full p-6`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-bold ${subHeaderText} flex items-center gap-2`}>
                                <Upload className={labelText} size={20} />
                                匯入資料
                            </h3>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className={`p-2 ${cardText} hover:bg-gray-100 rounded-full transition-colors`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className={`mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200`}>
                            <p className="text-blue-600 text-sm mb-2">
                                您可以匯入之前匯出的資料或設定檔案
                            </p>
                            <ul className="text-blue-600 text-xs ml-4 list-disc space-y-1">
                                <li>支援匯入追蹤記錄（JSON 陣列格式）</li>
                                <li>支援匯入設定檔（包含倉鼠資訊）</li>
                                <li>匯入設定檔會自動填入表單</li>
                            </ul>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className={`flex-1 ${cardBg} ${cardText} border-2 ${inputBorder} font-semibold py-2 rounded-lg hover:bg-gray-50`}
                            >
                                取消
                            </button>
                            <label className={`flex-1 ${buttonBg} ${buttonHover} ${buttonText} font-semibold py-2 rounded-lg cursor-pointer text-center`}>
                                選擇檔案
                                <input
                                    ref={importFileInputRef}
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={handleImportData}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

