import { useState, useRef } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Weight, Utensils, Gauge, PlusCircle, Heart, Calendar, Home, Layers, X, Edit2, Image as ImageIcon, ChevronDown, Plus } from 'lucide-react';
import { formatDateTaipei, calculateDaysFromToday, getTaipeiDateString } from '../utils/dateUtils';

export default function Dashboard({ data, onAddClick, theme, settings, onUpdateSettings, hamsters = [], currentHamsterId, onSelectHamster, onAddHamster, onEditHamster }) {
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showHamsterModal, setShowHamsterModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        hamsterName: '',
        hamsterPhoto: '',
        hamsterBirthday: '',
        arrivalDate: '',
        beddingType: '',
        lastBeddingChange: ''
    });
    const fileInputRef = useRef(null);
    const modalFileInputRef = useRef(null);
    const editPhotoInputRef = useRef(null);
    // Theme defaults (matching Settings page)
    const {
        cardBg = 'bg-white',
        cardBorder = 'border-gray-100',
        cardText = 'text-gray-800',
        buttonBg = 'bg-amber-500',
        buttonHover = 'hover:bg-amber-600',
        buttonText = 'text-white',
        labelText = 'text-gray-800',
        subHeaderText = 'text-gray-800',
        mutedText = 'text-gray-500',
        chartStrokeWheel = '#ec4899',
        chartStrokeFood = '#f472b6',
        accentSoftBg = 'bg-amber-50',
        accentSoftBorder = 'border-amber-200',
        accentSoftText = 'text-amber-600',
        accentSoftHover = 'hover:bg-amber-100',
        neutralButtonBg = 'bg-white',
        neutralButtonBorder = 'border-gray-300',
        neutralButtonText = 'text-gray-600',
        neutralButtonHover = 'hover:bg-gray-50',
        divider = 'border-gray-100',
        inputBorder = 'border-gray-300',
        inputFocus = 'focus:ring-amber-500 focus:border-amber-500'
    } = theme || {};

    // Prepare chart data (last 7 days)
    const chartData = [...data].reverse().slice(-7);

    const latest = data[0] || {};
    const latestWeight = data.find(d => d.weight !== null && d.weight !== undefined)?.weight;

    // Calculate hamster info
    const hamsterName = settings?.hamsterName || '';
    const hamsterPhoto = settings?.hamsterPhoto || '';
    const hamsterBirthday = settings?.hamsterBirthday;
    const arrivalDate = settings?.arrivalDate;
    const beddingType = settings?.beddingType;
    const lastBeddingChange = settings?.lastBeddingChange;

    // Calculate age in days using +8 timezone
    const ageInDays = hamsterBirthday ? calculateDaysFromToday(hamsterBirthday) : null;
    const daysAtHome = arrivalDate ? calculateDaysFromToday(arrivalDate) : null;
    const daysSinceBeddingChange = lastBeddingChange ? calculateDaysFromToday(lastBeddingChange) : null;

    const getAgeText = (days) => {
        if (days === null) return null;
        if (days < 30) return `${days} 天`;
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        if (months < 12) {
            return remainingDays > 0 ? `${months} 個月又 ${remainingDays} 天` : `${months} 個月`;
        }
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (remainingMonths > 0) {
            return `${years} 歲又 ${remainingMonths} 個月`;
        }
        return `${years} 歲`;
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
                onUpdateSettings({ hamsterPhoto: reader.result });
                setShowPhotoModal(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        if (confirm('確定要移除大頭貼嗎？')) {
            onUpdateSettings({ hamsterPhoto: '' });
            setShowPhotoModal(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Hamster Info Card */}
            {hamsterName && (
                <div className={`${cardBg} p-5 rounded-xl shadow-sm border ${cardBorder} relative`}>
                    {/* Edit Button */}
                    <button
                        onClick={() => {
                            setEditFormData({
                                hamsterName: settings?.hamsterName || '',
                                hamsterPhoto: settings?.hamsterPhoto || '',
                                hamsterBirthday: settings?.hamsterBirthday || '',
                                arrivalDate: settings?.arrivalDate || '',
                                beddingType: settings?.beddingType || '',
                                lastBeddingChange: settings?.lastBeddingChange || ''
                            });
                            setShowEditModal(true);
                        }}
                        className={`absolute top-4 right-4 p-2 rounded-lg ${accentSoftBg} ${accentSoftText} ${accentSoftHover} transition-colors`}
                        title="編輯倉鼠資訊"
                    >
                        <Edit2 size={18} />
                    </button>
                    <div className="flex items-start gap-3 mb-4">
                        {hamsterPhoto ? (
                            <button
                                onClick={() => setShowPhotoModal(true)}
                                className="flex-shrink-0 hover:opacity-80 transition-opacity"
                            >
                                <img 
                                    src={hamsterPhoto} 
                                    alt={hamsterName}
                                    className="w-16 h-16 object-cover rounded-full border-2 border-pink-200 cursor-pointer"
                                />
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    fileInputRef.current?.click();
                                }}
                                className={`p-2 rounded-lg ${accentSoftBg} flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer`}
                            >
                                <Heart size={24} className={labelText} />
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className={`text-xl font-bold ${subHeaderText}`}>
                                    {hamsterName}
                                </h2>
                                {hamsters.length > 0 && (
                                    <button
                                        onClick={() => setShowHamsterModal(true)}
                                        className={`p-1.5 rounded-lg ${accentSoftBg} ${accentSoftText} ${accentSoftHover} transition-colors flex items-center gap-1`}
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                )}
                            </div>
                            {ageInDays !== null && (
                                <p className={`text-sm ${cardText} opacity-80`}>
                                    {ageInDays < 90
                                        ? '還是個小寶寶呢！'
                                        : ageInDays < 365
                                            ? '正在健康成長中'
                                            : ageInDays < 730
                                                ? '已經是個大孩子了'
                                                : '是個長壽寶寶呢！'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {hamsterBirthday && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={16} className={`${labelText} opacity-70`} />
                                <span className={`${cardText} opacity-70`}>生日：</span>
                                <span className={cardText}>{formatDateTaipei(hamsterBirthday)}</span>
                                {ageInDays !== null && (
                                    <span className={`${labelText} ml-auto font-medium`}>
                                        {getAgeText(ageInDays)}
                                    </span>
                                )}
                            </div>
                        )}

                        {arrivalDate && (
                            <div className="flex items-center gap-2 text-sm">
                                <Home size={16} className={`${labelText} opacity-70`} />
                                <span className={`${cardText} opacity-70`}>到家：</span>
                                <span className={cardText}>{formatDateTaipei(arrivalDate)}</span>
                                {daysAtHome !== null && (
                                    <span className={`${labelText} ml-auto font-medium`}>
                                        {daysAtHome === 0 ? '今天剛到家！' : `已經 ${daysAtHome} 天了`}
                                    </span>
                                )}
                            </div>
                        )}

                        {beddingType && (
                            <div className="flex items-center gap-2 text-sm">
                                <Layers size={16} className={`${labelText} opacity-70`} />
                                <span className={`${cardText} opacity-70`}>墊材：</span>
                                <span className={cardText}>{beddingType === 'thick' ? '厚鋪' : '薄鋪'}</span>
                                {lastBeddingChange && daysSinceBeddingChange !== null && (
                                    <span className={`${labelText} ml-auto font-medium`}>
                                        {daysSinceBeddingChange === 0 
                                            ? '今天剛換過' 
                                            : `上次更換：${daysSinceBeddingChange} 天前`}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className={`${cardBg} p-4 rounded-xl shadow-sm border ${cardBorder}`}>
                    <div className={`flex items-center gap-2 ${labelText} mb-1`}>
                        <Weight size={16} />
                        <span className="text-xs font-medium uppercase">體重</span>
                    </div>
                    <div className={`text-2xl font-bold ${cardText}`}>
                        {latestWeight ? `${latestWeight}g` : '--'}
                    </div>
                </div>
                <div className={`${cardBg} p-4 rounded-xl shadow-sm border ${cardBorder}`}>
                    <div className={`flex items-center gap-2 ${labelText} mb-1`}>
                        <Utensils size={16} />
                        <span className="text-xs font-medium uppercase">食量</span>
                    </div>
                    <div className={`text-2xl font-bold ${cardText}`}>
                        {latest.foodIntake ? `${latest.foodIntake}g` : '--'}
                    </div>
                </div>
                <div className={`${cardBg} p-4 rounded-xl shadow-sm border ${cardBorder}`}>
                    <div className={`flex items-center gap-2 ${labelText} mb-1`}>
                        <Gauge size={16} />
                        <span className="text-xs font-medium uppercase">滾輪</span>
                    </div>
                    <div className={`text-2xl font-bold ${cardText}`}>
                        {latest.wheelTurns || '--'}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className={`${cardBg} p-4 rounded-xl shadow-sm border ${cardBorder}`}>
                <h3 className={`text-sm font-bold ${subHeaderText} mb-3 uppercase tracking-wide`}>7 日趨勢</h3>
                <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(timestamp) => formatDateTaipei(timestamp, {
                                    timeZone: 'Asia/Taipei',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                                tick={{ fontSize: 10 }}
                            />
                            <Tooltip
                                labelFormatter={(timestamp) => formatDateTaipei(timestamp, {
                                    timeZone: 'Asia/Taipei'
                                })}
                                formatter={(value, name) => {
                                    const labels = { wheelTurns: '滾輪', foodIntake: '食量' };
                                    return [value, labels[name] || name];
                                }}
                            />
                            <Line type="monotone" dataKey="wheelTurns" stroke={chartStrokeWheel} strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="foodIntake" stroke={chartStrokeFood} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Photo Modal */}
            {showPhotoModal && hamsterPhoto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setShowPhotoModal(false)}>
                    <div className={`${cardBg} rounded-xl shadow-xl max-w-md w-full p-6`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-bold ${subHeaderText}`}>{hamsterName}的大頭貼</h3>
                            <button
                                onClick={() => setShowPhotoModal(false)}
                                className={`p-2 ${cardText} hover:bg-gray-100 rounded-full transition-colors`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <img 
                                src={hamsterPhoto} 
                                alt={hamsterName}
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                        <div className="flex gap-3">
                            <label 
                                onClick={() => modalFileInputRef.current?.click()}
                                className={`flex-1 flex items-center justify-center gap-2 ${buttonBg} ${buttonHover} ${buttonText} font-semibold py-2 rounded-lg cursor-pointer transition-all`}
                            >
                                <Edit2 size={18} />
                                更換照片
                            </label>
                            <input
                                ref={modalFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <button
                                onClick={handleRemovePhoto}
                                className={`flex-1 ${cardBg} ${cardText} border-2 ${cardBorder} font-semibold py-2 rounded-lg hover:bg-gray-50 transition-all`}
                            >
                                移除照片
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hamster Selection Modal */}
            {showHamsterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowHamsterModal(false)}>
                    <div 
                        className={`${cardBg} rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`px-6 py-4 border-b ${divider} flex items-center justify-between`}>
                            <h2 className={`text-xl font-bold ${subHeaderText}`}>選擇倉鼠</h2>
                            <button
                                onClick={() => setShowHamsterModal(false)}
                                className={`p-1 ${mutedText} rounded-full ${neutralButtonHover} transition-colors`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {hamsters.length === 0 ? (
                                <div className={`text-center py-8 ${mutedText}`}>
                                    <p>還沒有倉鼠</p>
                                </div>
                            ) : (
                                hamsters.map(hamster => {
                                    const isSelected = currentHamsterId === hamster.id;
                                    return (
                                        <button
                                            key={hamster.id}
                                            onClick={() => {
                                                if (onSelectHamster) {
                                                    onSelectHamster(hamster.id);
                                                }
                                                setShowHamsterModal(false);
                                            }}
                                            className={`w-full p-4 rounded-lg border-2 transition-all ${
                                                isSelected
                                                    ? `${buttonBg} ${buttonText} border-transparent`
                                                    : `${neutralButtonBorder} ${neutralButtonBg} ${neutralButtonText} ${neutralButtonHover}`
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {hamster.photo ? (
                                                    <img
                                                        src={hamster.photo}
                                                        alt={hamster.name}
                                                        className="w-12 h-12 object-cover rounded-full border-2 border-current"
                                                    />
                                                ) : (
                                                    <div className={`w-12 h-12 rounded-full ${accentSoftBg} flex items-center justify-center`}>
                                                        <span className="text-xl">🐹</span>
                                                    </div>
                                                )}
                                                <div className="flex-1 text-left">
                                                    <div className="font-semibold">{hamster.name}</div>
                                                    {hamster.birthday && (
                                                        <div className={`text-xs mt-0.5 ${isSelected ? 'opacity-80' : mutedText}`}>
                                                            生日：{formatDateTaipei(hamster.birthday, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                                                        </div>
                                                    )}
                                                </div>
                                                {isSelected && (
                                                    <div className="text-lg">✓</div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                        <div className={`px-6 py-4 border-t ${divider}`}>
                            <button
                                onClick={() => {
                                    setShowHamsterModal(false);
                                    if (onAddHamster) {
                                        onAddHamster();
                                    }
                                }}
                                className={`w-full py-3 px-4 rounded-lg ${buttonBg} ${buttonText} ${buttonHover} transition-colors flex items-center justify-center gap-2 font-semibold`}
                            >
                                <Plus size={20} />
                                新增倉鼠
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Hamster Info Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
                    <div 
                        className={`${cardBg} rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`px-6 py-4 border-b ${divider} flex items-center justify-between`}>
                            <h2 className={`text-xl font-bold ${subHeaderText}`}>編輯倉鼠資訊</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className={`p-1 ${mutedText} rounded-full ${neutralButtonHover} transition-colors`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Photo */}
                            <div>
                                <label className={`block text-sm font-medium ${labelText} mb-2`}>大頭貼</label>
                                <div className="flex items-center gap-4">
                                    {editFormData.hamsterPhoto ? (
                                        <img
                                            src={editFormData.hamsterPhoto}
                                            alt="Preview"
                                            className="w-20 h-20 object-cover rounded-full border-2 border-current"
                                        />
                                    ) : (
                                        <div className={`w-20 h-20 rounded-full ${accentSoftBg} flex items-center justify-center`}>
                                            <Heart size={32} className={labelText} />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <label
                                            onClick={() => editPhotoInputRef.current?.click()}
                                            className={`flex items-center justify-center gap-2 ${buttonBg} ${buttonHover} ${buttonText} font-medium py-2 px-4 rounded-lg cursor-pointer transition-all`}
                                        >
                                            <ImageIcon size={18} />
                                            {editFormData.hamsterPhoto ? '更換照片' : '上傳照片'}
                                        </label>
                                        <input
                                            ref={editPhotoInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        alert('圖片大小不能超過 5MB');
                                                        return;
                                                    }
                                                    if (!file.type.startsWith('image/')) {
                                                        alert('請選擇圖片檔案');
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setEditFormData({ ...editFormData, hamsterPhoto: reader.result });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        {editFormData.hamsterPhoto && (
                                            <button
                                                onClick={() => setEditFormData({ ...editFormData, hamsterPhoto: '' })}
                                                className={`w-full ${cardBg} ${cardText} border-2 ${cardBorder} font-medium py-2 rounded-lg ${neutralButtonHover} transition-all`}
                                            >
                                                移除照片
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className={`block text-sm font-medium ${labelText} mb-2`}>名字</label>
                                <input
                                    type="text"
                                    value={editFormData.hamsterName}
                                    onChange={(e) => setEditFormData({ ...editFormData, hamsterName: e.target.value })}
                                    className={`w-full p-3 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                                    placeholder="輸入名字..."
                                />
                            </div>

                            {/* Birthday */}
                            <div>
                                <label className={`block text-sm font-medium ${labelText} mb-2`}>生日</label>
                                <input
                                    type="date"
                                    value={editFormData.hamsterBirthday}
                                    onChange={(e) => setEditFormData({ ...editFormData, hamsterBirthday: e.target.value })}
                                    className={`w-full p-3 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                                    max={getTaipeiDateString()}
                                />
                            </div>

                            {/* Arrival Date */}
                            <div>
                                <label className={`block text-sm font-medium ${labelText} mb-2`}>到家日期</label>
                                <input
                                    type="date"
                                    value={editFormData.arrivalDate}
                                    onChange={(e) => setEditFormData({ ...editFormData, arrivalDate: e.target.value })}
                                    className={`w-full p-3 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                                    max={getTaipeiDateString()}
                                />
                            </div>

                            {/* Bedding Type */}
                            <div>
                                <label className={`block text-sm font-medium ${labelText} mb-2`}>墊材類型</label>
                                <select
                                    value={editFormData.beddingType}
                                    onChange={(e) => setEditFormData({ ...editFormData, beddingType: e.target.value })}
                                    className={`w-full p-3 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                                >
                                    <option value="">選擇墊材類型</option>
                                    <option value="thick">厚鋪</option>
                                    <option value="thin">薄鋪</option>
                                </select>
                            </div>

                            {/* Last Bedding Change */}
                            {editFormData.beddingType && (
                                <div>
                                    <label className={`block text-sm font-medium ${labelText} mb-2`}>上次大更換墊材日期</label>
                                    <input
                                        type="date"
                                        value={editFormData.lastBeddingChange}
                                        onChange={(e) => setEditFormData({ ...editFormData, lastBeddingChange: e.target.value })}
                                        className={`w-full p-3 border ${inputBorder} rounded-lg focus:ring-2 ${inputFocus}`}
                                        max={getTaipeiDateString()}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={`px-6 py-4 border-t ${divider} flex gap-3`}>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className={`flex-1 ${neutralButtonBg} ${neutralButtonText} border-2 ${neutralButtonBorder} font-semibold py-3 rounded-lg ${neutralButtonHover} transition-all`}
                            >
                                取消
                            </button>
                            <button
                                onClick={() => {
                                    if (onUpdateSettings) {
                                        onUpdateSettings(editFormData);
                                    }
                                    if (onEditHamster && currentHamsterId) {
                                        onEditHamster(currentHamsterId, {
                                            name: editFormData.hamsterName,
                                            photo: editFormData.hamsterPhoto,
                                            birthday: editFormData.hamsterBirthday,
                                            arrivalDate: editFormData.arrivalDate,
                                            beddingType: editFormData.beddingType,
                                            lastBeddingChange: editFormData.lastBeddingChange
                                        });
                                    }
                                    setShowEditModal(false);
                                }}
                                className={`flex-1 ${buttonBg} ${buttonHover} ${buttonText} font-semibold py-3 rounded-lg transition-all`}
                            >
                                儲存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
