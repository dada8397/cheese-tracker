import { useState, useRef } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Weight, Utensils, Gauge, PlusCircle, Heart, Calendar, Home, Layers, X, Edit2, Image as ImageIcon } from 'lucide-react';

export default function Dashboard({ data, onAddClick, theme, settings, onUpdateSettings }) {
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const fileInputRef = useRef(null);
    const modalFileInputRef = useRef(null);
    // Theme defaults
    const {
        cardBg = 'bg-white',
        cardBorder = 'border-pink-200',
        cardText = 'text-gray-800',
        buttonBg = 'bg-pink-500',
        buttonHover = 'hover:bg-pink-600',
        buttonText = 'text-white',
        labelText = 'text-pink-600',
        subHeaderText = 'text-pink-700',
        chartStrokeWheel = '#ec4899',
        chartStrokeFood = '#f472b6',
        accentSoftBg = 'bg-pink-50'
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

    // Calculate age in days
    const calculateDays = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = today - date;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const ageInDays = hamsterBirthday ? calculateDays(hamsterBirthday) : null;
    const daysAtHome = arrivalDate ? calculateDays(arrivalDate) : null;
    const daysSinceBeddingChange = lastBeddingChange ? calculateDays(lastBeddingChange) : null;

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

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
                <div className={`${cardBg} p-5 rounded-xl shadow-sm border ${cardBorder}`}>
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
                            <h2 className={`text-xl font-bold ${subHeaderText} mb-1`}>
                                {hamsterName}
                            </h2>
                            {ageInDays !== null && (
                                <p className={`text-sm ${cardText} opacity-80`}>
                                    {ageInDays < 30 ? '還是個小寶寶呢！' : ageInDays < 180 ? '正在健康成長中' : '已經是個大孩子了'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {hamsterBirthday && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={16} className={`${labelText} opacity-70`} />
                                <span className={`${cardText} opacity-70`}>生日：</span>
                                <span className={cardText}>{formatDate(hamsterBirthday)}</span>
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
                                <span className={cardText}>{formatDate(arrivalDate)}</span>
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
                                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('zh-TW', {
                                    timeZone: 'Asia/Taipei',
                                    month: 'numeric',
                                    day: 'numeric'
                                })}
                                tick={{ fontSize: 10 }}
                            />
                            <Tooltip
                                labelFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('zh-TW', {
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

            {/* Quick Add Button */}
            <button
                onClick={onAddClick}
                className={`w-full ${buttonBg} ${buttonHover} ${buttonText} font-semibold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2`}
            >
                <PlusCircle size={20} />
                記錄今日數據
            </button>

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
        </div>
    );
}
