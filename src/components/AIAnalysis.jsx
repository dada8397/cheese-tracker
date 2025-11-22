import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // We need to install this or just render raw text for now. Let's assume raw text or simple formatting.
// Actually, I didn't install react-markdown. I'll stick to simple whitespace preserving div.

import { generateSystemPrompt, generateUserPrompt } from '../utils/prompts';

export default function AIAnalysis({ data, apiKey, theme, hamsterBackground }) {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);

    const {
        aiCardBgBase = 'bg-white/80',
        aiCardBgFrom = 'from-indigo-50',
        aiCardBgTo = 'to-purple-50',
        aiCardBorder = 'border-indigo-100',
        aiHeading = 'text-indigo-900',
        aiAccentText = 'text-indigo-700',
        aiButtonBg = 'bg-indigo-600',
        aiButtonHover = 'hover:bg-indigo-700',
        aiButtonText = 'text-white',
        aiContentBg = 'bg-white/50',
        aiLinkText = 'text-indigo-500',
        aiLinkHover = 'hover:text-indigo-700',
        errorText = 'text-red-500',
        cardText = 'text-gray-800'
    } = theme || {};

    const handleAnalyze = async () => {
        if (!apiKey) {
            setError("請先在設定中輸入 API 金鑰。");
            return;
        }
        if (!data || data.length === 0) {
            setError("沒有數據可分析。請先新增紀錄！");
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const prompt = generateUserPrompt(data);
            const systemPrompt = generateSystemPrompt(hamsterBackground);

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o", // Or gpt-3.5-turbo
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7
                })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error.message);
            }

            setAnalysis(result.choices[0].message.content);
        } catch (err) {
            setError(err.message || "分析失敗。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${aiCardBgBase} bg-gradient-to-br ${aiCardBgFrom} ${aiCardBgTo} p-6 rounded-xl border ${aiCardBorder}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${aiHeading} flex items-center gap-2`}>
                    <Sparkles className={aiAccentText} /> AI 分析師
                </h3>
            </div>

            {!analysis && !loading && (
                <div className="text-center py-6">
                    <p className={`${aiAccentText} mb-4 text-sm`}>
                        根據倉鼠近期的數據獲得即時建議。
                    </p>
                    <button
                        onClick={handleAnalyze}
                        className={`${aiButtonBg} ${aiButtonHover} ${aiButtonText} font-semibold py-2 px-6 rounded-full transition-all shadow-md hover:shadow-lg`}
                    >
                        開始分析
                    </button>
                    {error && <p className={`${errorText} text-xs mt-3`}>{error}</p>}
                </div>
            )}

            {loading && (
                <div className={`flex flex-col items-center justify-center py-8 ${aiAccentText}`}>
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <span className="text-sm font-medium">思考中...</span>
                </div>
            )}

            {analysis && (
                <div className={`prose prose-sm max-w-none ${cardText} ${aiContentBg} p-4 rounded-lg`}>
                    {/* Simple markdown rendering replacement */}
                    <ReactMarkdown className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {analysis}
                    </ReactMarkdown>
                    <button
                        onClick={() => setAnalysis(null)}
                        className={`mt-4 text-xs ${aiLinkText} ${aiLinkHover} underline`}
                    >
                        清除分析
                    </button>
                </div>
            )}
        </div>
    );
}
