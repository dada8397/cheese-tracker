import { Activity, Utensils, Gauge, Plus } from 'lucide-react';

const StatusBadge = ({ entry, theme }) => {
    const status = entry.activity === 'Low' || entry.foodIntake < 1 ? '關注' :
        entry.activity === 'High' && entry.foodIntake > 3 ? '良好' : '正常';
    const {
        statusAttentionBg = 'bg-rose-100',
        statusAttentionText = 'text-rose-700',
        statusGoodBg = 'bg-pink-100',
        statusGoodText = 'text-pink-700',
        statusNeutralBg = 'bg-gray-100',
        statusNeutralText = 'text-gray-700'
    } = theme || {};
    const color = status === '關注'
        ? `${statusAttentionBg} ${statusAttentionText}`
        : status === '良好'
            ? `${statusGoodBg} ${statusGoodText}`
            : `${statusNeutralBg} ${statusNeutralText}`;
    return <span className={`text-xs px-2 py-1 rounded-full font-medium ${color}`}>{status}</span>;
};

export default function HistoryFeed({ data, theme, onSupplementData }) {
    const t = theme || {};
    const cardBg = t.cardBg || 'bg-white';
    const cardBorder = t.cardBorder || 'border-pink-200';
    const subHeaderText = t.subHeaderText || 'text-pink-700';
    const noteBorder = t.noteBorder || 'border-pink-100';
    const noteText = t.noteText || 'text-gray-600';
    const iconFood = t.iconFood || 'text-pink-500';
    const iconWheel = t.iconWheel || 'text-rose-500';
    const iconActivity = t.iconActivity || 'text-pink-400';
    const timestampText = t.timestampText || 'text-gray-400';
    const mutedText = t.mutedText || 'text-gray-500';
    const emptyStateText = t.emptyStateText || 'text-gray-400';
    const cardText = t.cardText || 'text-gray-900';
    return (

        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className={`text-sm font-bold ${subHeaderText} uppercase tracking-wide`}>歷史紀錄</h2>
                {onSupplementData && (
                    <button
                        onClick={onSupplementData}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${t.buttonBg || 'bg-pink-500'} ${t.buttonText || 'text-white'} ${t.buttonHover || 'hover:bg-pink-600'}`}
                    >
                        <Plus size={14} />
                        補充數據
                    </button>
                )}
            </div>
            {data.length === 0 ? (
                <p className={`${emptyStateText} text-sm text-center py-8`}>尚無紀錄</p>
            ) : (
                data.map(entry => (
                    <div key={entry.id} className={`${cardBg} ${cardText} p-4 rounded-xl shadow-sm border ${cardBorder} flex flex-col gap-2`}>
                        <div className="flex justify-between items-start">
                            <span className={`text-xs font-medium ${timestampText}`}>
                                {new Date(entry.timestamp).toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' })}
                            </span>
                            <StatusBadge entry={entry} theme={theme} />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                                <Utensils size={14} className={iconFood} />
                                <span className="font-semibold">{entry.foodIntake ? `${entry.foodIntake}g` : '--'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Gauge size={14} className={iconWheel} />
                                <span className="font-semibold">{entry.wheelTurns || '--'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Activity size={14} className={iconActivity} />
                                <span className={`text-xs ${mutedText}`}>{entry.activity}</span>
                            </div>
                        </div>

                        {entry.notes && (
                            <p className={`text-xs ${noteText} mt-1 border-t ${noteBorder} pt-2 whitespace-pre-line`}>{entry.notes}</p>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
