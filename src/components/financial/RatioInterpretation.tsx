import { useState } from 'react';
import { analyzeRatioInterpretation } from '@/data/ratioInterpretations';


export interface RatioInterpretationData {
  good: string;
  bad: string;
  context: string;
  insights: {
    title: string;
    points: string[];
  }[];
  benchmarks?: {
    industry: string;
    range: string;
  }[];
  warningSignals: string[];
  strategies?: string[];
}

interface RatioInterpretationProps {
  data: RatioInterpretationData;
}

export function createRatioInterpretation({
  good,
  bad,
  context,
  insights,
  benchmarks,
  warningSignals,
  strategies,
}: Partial<RatioInterpretationData>): RatioInterpretationData {
  return {
    good: good || "",
    bad: bad || "",
    context: context || "",
    insights: insights || [],
    benchmarks: benchmarks || [],
    warningSignals: warningSignals || [],
    strategies: strategies || [],
  };
}

export function formatRatioInterpretation(data: RatioInterpretationData): string {
  const sections: string[] = [data.context];

  if (data.insights.length > 0) {
    sections.push("\n🔍 Deeper Insights:");
    data.insights.forEach(insight => {
      sections.push(`${insight.title}:`);
      insight.points.forEach(point => sections.push(`- ${point}`));
    });
  }

  if (data.benchmarks && data.benchmarks.length > 0) {
    sections.push("\n💡 Industry Benchmarks:");
    data.benchmarks.forEach(benchmark => {
      sections.push(`- ${benchmark.industry}: ${benchmark.range}`);
    });
  }

  if (data.warningSignals.length > 0) {
    sections.push("\n🚨 Warning Signs:");
    data.warningSignals.forEach(signal => sections.push(`- ${signal}`));
  }

  if (data.strategies && data.strategies.length > 0) {
    sections.push("\n📊 Improvement Strategies:");
    data.strategies.forEach(strategy => sections.push(`- ${strategy}`));
  }

  return sections.join("\n");
}

export function RatioInterpretation({ data }: RatioInterpretationProps) {
  // Analyze the ratio interpretation data
  const analysis = analyzeRatioInterpretation(data);
  
  // State to toggle between different views
  const [view, setView] = useState<'summary' | 'details'>('summary');

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Ratio Interpretation
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setView('summary')}
            className={`px-3 py-1 rounded ${view === 'summary' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white'}`}
          >
            Summary
          </button>
          <button 
            onClick={() => setView('details')}
            className={`px-3 py-1 rounded ${view === 'details' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white'}`}
          >
            Details
          </button>
        </div>
      </div>

      {view === 'summary' ? (
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-green-600 dark:text-green-400">Good Scenario:</p>
            <p className="text-sm">{analysis.summary.goodOutcome}</p>
          </div>
          <div>
            <p className="font-semibold text-red-600 dark:text-red-400">Bad Scenario:</p>
            <p className="text-sm">{analysis.summary.badOutcome}</p>
          </div>
          <div>
            <p className="font-semibold text-blue-600 dark:text-blue-400">Context:</p>
            <p className="text-sm">{analysis.summary.context}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">🔍 Key Insights</h3>
            <ul className="list-disc list-inside space-y-1">
              {analysis.insights.map((insight, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">[{insight.category}]</span> {insight.point}
                </li>
              ))}
            </ul>
          </div>

          {analysis.benchmarks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">📈 Industry Benchmarks</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.benchmarks.map((benchmark, index) => (
                  <li key={index} className="text-sm">{benchmark}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.warningSignals.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-yellow-600">⚠️ Warning Signals</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.warningSignals.map((signal, index) => (
                  <li key={index} className="text-sm">{signal}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.strategies.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-green-600">🚀 Recommended Strategies</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.strategies.map((strategy, index) => (
                  <li key={index} className="text-sm">{strategy}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
