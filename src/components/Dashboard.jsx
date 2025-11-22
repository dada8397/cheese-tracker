import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Weight, Utensils, Gauge, PlusCircle } from 'lucide-react';

export default function Dashboard({ data, onAddClick, theme }) {
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
        chartStrokeFood = '#f472b6'
    } = theme || {};

    // Prepare chart data (last 7 days)
    const chartData = [...data].reverse().slice(-7);

    const latest = data[0] || {};
    const latestWeight = data.find(d => d.weight !== null && d.weight !== undefined)?.weight;

    return (
        <div className="space-y-6">
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
        </div>
    );
}
