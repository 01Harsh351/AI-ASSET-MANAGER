import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Package, 
  DollarSign, 
  ArrowRight, 
  Zap,
  Activity,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AiInsight } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AiInsightsViewProps {
  insights: AiInsight[];
  onApplyInsight: (insight: AiInsight) => void;
  onDismissInsight: (insightId: string) => void;
}

export const AiInsightsView: React.FC<AiInsightsViewProps> = ({
  insights,
  onApplyInsight,
  onDismissInsight
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [appliedInsights, setAppliedInsights] = useState<string[]>([]);

  const filtered = insights.filter(i => 
    filterCategory === 'All' || i.category === filterCategory
  );

  const handleExecute = (insight: AiInsight) => {
    setAppliedInsights(prev => [...prev, insight.id]);
    onApplyInsight(insight);
  };

  const highImpactCount = insights.filter(i => i.impactLevel === 'High').length;
  const totalSavings = insights.reduce((sum, i) => sum + i.estimatedSavings, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Predictive Operations Center</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Sparkles size={12} />
              Enterprise Telemetry Analysis
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Sensor telemetry, automated MTBF degradation models, procurement consolidation, and asset utilization heuristics.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Predictive Failure', 'Cost Optimization', 'Overstock Prevention', 'Asset Reallocation'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active High-Impact Insights</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{highImpactCount} Critical</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Telemetry thresholds exceeded in last 24 hrs</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Projected Cost Avoidance</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(totalSavings)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Via preventive action & supplier consolidation</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Telemetry Confidence Model</span>
            <Activity size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">94.8% Accuracy</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Calibrated against 18-month historical downtime</p>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="space-y-4">
        {filtered.map((insight) => {
          const isApplied = appliedInsights.includes(insight.id);

          return (
            <div 
              key={insight.id}
              className={`p-5 rounded-xl border bg-white shadow-xs transition-all ${
                isApplied ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      insight.impactLevel === 'High' ? 'bg-red-100 text-red-800' :
                      insight.impactLevel === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {insight.impactLevel} Priority
                    </span>

                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {insight.category}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      Detected {insight.dateDetected}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {insight.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-4xl">
                      {insight.description}
                    </p>
                  </div>

                  {/* Meta telemetry details */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                    {insight.estimatedSavings > 0 && (
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Benefit: {formatCurrency(insight.estimatedSavings)}
                      </span>
                    )}
                    {insight.targetAssetOrSku && (
                      <span className="font-mono text-blue-700">
                        Target: {insight.targetAssetOrSku}
                      </span>
                    )}
                    <span className="text-slate-400">
                      Confidence score: {insight.confidenceScore}%
                    </span>
                  </div>

                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  {isApplied ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg">
                      <Check size={14} />
                      <span>Action Initiated</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onDismissInsight(insight.id)}
                        className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleExecute(insight)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                      >
                        <Zap size={14} />
                        <span>Execute Action</span>
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
