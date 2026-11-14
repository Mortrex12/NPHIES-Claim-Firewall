import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Send,
  RefreshCw,
  FileJson,
  Layers,
  Activity,
  ArrowRight,
  TrendingDown,
  Building2,
  User,
  Clock,
  Sparkles,
  Info,
  Server,
  Lock,
  ChevronRight,
  ChevronDown,
  Check,
  Globe,
  Sliders,
  DollarSign
} from 'lucide-react';
import { SAMPLE_CLAIMS } from './data/sampleClaims';
import { evaluateClaimRules, evaluateAiDenialRisk, autoFixClaim } from './data/rulesEngine';

export default function App() {
  const [lang, setLang] = useState('ar'); // 'ar' | 'en'
  const [activeTab, setActiveTab] = useState('firewall'); // 'firewall' | 'nphies_sim' | 'architecture' | 'custom_json'
  const [claims, setClaims] = useState(SAMPLE_CLAIMS);
  const [selectedClaimId, setSelectedClaimId] = useState(SAMPLE_CLAIMS[0].id);
  const [transmissionLogs, setTransmissionLogs] = useState([]);
  const [recentFixes, setRecentFixes] = useState({});
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [customJsonInput, setCustomJsonInput] = useState('');
  const [ruleFilter, setRuleFilter] = useState('all'); // 'all' | 'failed' | 'passed'

  // Selected claim
  const currentClaim = useMemo(() => {
    return claims.find(c => c.id === selectedClaimId) || claims[0];
  }, [claims, selectedClaimId]);

  // Evaluate current claim
  const ruleResults = useMemo(() => {
    return evaluateClaimRules(currentClaim);
  }, [currentClaim]);

  const failedRulesCount = useMemo(() => {
    return ruleResults.filter(r => !r.passed).length;
  }, [ruleResults]);

  const aiEvaluation = useMemo(() => {
    return evaluateAiDenialRisk(currentClaim, failedRulesCount);
  }, [currentClaim, failedRulesCount]);

  // Overall Batch Metrics
  const batchMetrics = useMemo(() => {
    let totalSAR = 0;
    let sarAtRisk = 0;
    let cleanCount = 0;
    let blockedCount = 0;
    let highRiskCount = 0;

    claims.forEach(c => {
      totalSAR += c.totalAmount || 0;
      const rules = evaluateClaimRules(c);
      const fails = rules.filter(r => !r.passed).length;
      const ai = evaluateAiDenialRisk(c, fails);
      if (ai.verdict === 'RED') {
        blockedCount++;
        sarAtRisk += c.totalAmount || 0;
      } else if (ai.verdict === 'YELLOW') {
        highRiskCount++;
        sarAtRisk += c.totalAmount || 0;
      } else {
        cleanCount++;
      }
    });

    const cleanRate = claims.length > 0 ? Math.round((cleanCount / claims.length) * 100) : 0;

    return {
      totalClaims: claims.length,
      totalSAR,
      sarAtRisk,
      cleanCount,
      blockedCount,
      highRiskCount,
      cleanRate
    };
  }, [claims]);

  // Handler: 1-Click Auto-Fix for Current Claim
  const handleAutoFix = () => {
    const { fixedClaim, fixesApplied } = autoFixClaim(currentClaim);
    setClaims(prev => prev.map(c => c.id === currentClaim.id ? fixedClaim : c));
    setRecentFixes(prev => ({
      ...prev,
      [currentClaim.id]: fixesApplied
    }));
  };

  // Handler: Auto-Fix All Claims in Batch
  const handleAutoFixAll = () => {
    const newFixes = {};
    const updated = claims.map(c => {
      const { fixedClaim, fixesApplied } = autoFixClaim(c);
      if (fixesApplied.length > 0) {
        newFixes[c.id] = fixesApplied;
      }
      return fixedClaim;
    });
    setClaims(updated);
    setRecentFixes(prev => ({ ...prev, ...newFixes }));
  };

  // Handler: Reset Batch to Original
  const handleResetBatch = () => {
    setClaims(SAMPLE_CLAIMS);
    setRecentFixes({});
    setTransmissionLogs([]);
  };

  // Handler: Send to NPHIES Gateway Simulation
  const handleSendToNphies = () => {
    if (aiEvaluation.verdict === 'RED') return;
    setIsTransmitting(true);

    setTimeout(() => {
      const newLog = {
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        claimId: currentClaim.id,
        patientName: currentClaim.patient.name,
        payer: currentClaim.insurance.payerName,
        sar: currentClaim.totalAmount,
        status: 'ACCEPTED_200_OK',
        nphiesReference: `NPH-FHIR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        timestamp: new Date().toLocaleTimeString('ar-SA'),
        outcome: 'تم قبول المطالبة في منصة نفيس وإحالتها للمصادقة المالية الفورية'
      };
      setTransmissionLogs(prev => [newLog, ...prev]);
      setIsTransmitting(false);
    }, 700);
  };

  const isRtl = lang === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white"
    >
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-wide">
                  {lang === 'ar' ? 'جدار حماية مطالبات نفيس' : 'NPHIES Claim Firewall'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {lang === 'ar' ? 'بوابة ما قبل الإرسال' : 'Pre-Submission Gate'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>{lang === 'ar' ? 'المسار الثاني: التحول الرقمي الصحي' : 'Track 2: Healthcare Digital Transformation'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">MEDATHON 2026</span>
              </p>
            </div>
          </div>

          {/* Quick Info & Language Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-mono">
                {lang === 'ar' ? 'بوابة الوكيل الذكي: متصلة (28ms)' : 'Proxy Gateway: Active (28ms)'}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 font-mono">FHIR R4 / CCHI</span>
            </div>

            <button
              onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 border-t border-slate-800/40 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('firewall')}
            className={`py-2.5 px-3.5 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'firewall'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{lang === 'ar' ? 'لوحة تدقيق المطالبات وجدار الحماية' : 'Claims Firewall & Live Inspector'}</span>
          </button>

          <button
            onClick={() => setActiveTab('nphies_sim')}
            className={`py-2.5 px-3.5 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'nphies_sim'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>{lang === 'ar' ? 'محاكي بوابة نفيس وحلقة التعلم' : 'NPHIES Gateway & Retraining Loop'}</span>
            {transmissionLogs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                {transmissionLogs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-2.5 px-3.5 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{lang === 'ar' ? 'المعمارية التقنية والتكامل بدون استبدال HIS' : 'Architecture & Zero-Touch Proxy'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
          {/* Card 1: SAR at Risk */}
          <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-3.5 relative overflow-hidden shadow-lg shadow-rose-950/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between text-xs text-rose-300 mb-1 font-medium">
              <span>{lang === 'ar' ? 'المبالغ المعرضة للرفض (SAR at Risk)' : 'Current SAR at Risk'}</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400">
              {batchMetrics.sarAtRisk.toLocaleString()} <span className="text-xs text-rose-300 font-sans">{lang === 'ar' ? 'ر.س' : 'SAR'}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {lang === 'ar' ? 'محجوزة في حال إرسالها دون تدقيق' : 'Trapped in appeals if submitted now'}
            </div>
          </div>

          {/* Card 2: Clean Claim Target */}
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-3.5 relative overflow-hidden shadow-lg shadow-emerald-950/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between text-xs text-emerald-300 mb-1 font-medium">
              <span>{lang === 'ar' ? 'نسبة المطالبات النظيفة' : 'Clean Claim Rate'}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 flex items-baseline gap-2">
              <span>{batchMetrics.cleanRate}%</span>
              <span className="text-[10px] text-slate-400 font-sans">
                ({lang === 'ar' ? 'المستهدف > 95%' : 'Target > 95%'})
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {batchMetrics.cleanCount} {lang === 'ar' ? 'من أصل' : 'of'} {batchMetrics.totalClaims} {lang === 'ar' ? 'مطالبة آمنة للإرسال' : 'claims ready'}
            </div>
          </div>

          {/* Card 3: Blocked (Red) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
              <span>{lang === 'ar' ? 'حظر إلزامي (مخالفات صريحة)' : 'Hard Block (Deterministic)'}</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {batchMetrics.blockedCount} <span className="text-xs text-slate-500 font-sans">{lang === 'ar' ? 'مطالبة' : 'claims'}</span>
            </div>
            <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <span>🔴 {lang === 'ar' ? 'مرفوضة حتماً بنفيس' : 'Guaranteed NPHIES rejection'}</span>
            </div>
          </div>

          {/* Card 4: High Risk (Yellow) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
              <span>{lang === 'ar' ? 'تنبيه ذكاء اصطناعي (احتمال رفض)' : 'AI Risk Flag (ML Score)'}</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
              {batchMetrics.highRiskCount} <span className="text-xs text-slate-500 font-sans">{lang === 'ar' ? 'مطالبة' : 'claims'}</span>
            </div>
            <div className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
              <span>🟡 {lang === 'ar' ? 'خطر تدقيق شركة التأمين' : 'High probability payer audit'}</span>
            </div>
          </div>

          {/* Card 5: Batch Protection Value */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1 font-medium">
              <span>{lang === 'ar' ? 'إجمالي محفظة الدفعة' : 'Batch Total Volume'}</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {batchMetrics.totalSAR.toLocaleString()} <span className="text-xs text-slate-400 font-sans">{lang === 'ar' ? 'ر.س' : 'SAR'}</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">
              {lang === 'ar' ? 'حماية فورية للتدفقات النقدية' : 'Protecting clinic cash flow'}
            </div>
          </div>
        </section>

        {/* TAB 1: Claims Firewall & Live Inspector */}
        {activeTab === 'firewall' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Claims Queue / Feed (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {/* Batch Controls Bar */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <div>
                  <h3 className="text-xs font-bold text-slate-200">
                    {lang === 'ar' ? 'قائمة مطالبات الدفعة (FHIR R4)' : 'Claims Batch Stream (FHIR R4)'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {claims.length} {lang === 'ar' ? 'مطالبات واردة من نظام العيادة' : 'claims received from clinic HIS'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleAutoFixAll}
                    title={lang === 'ar' ? 'إصلاح جميع مطالبات الدفعة بنقرة واحدة' : 'Auto-Fix all batch claims'}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-all shadow-sm shadow-emerald-700/30"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'إصلاح الكل' : 'Fix All'}</span>
                  </button>
                  <button
                    onClick={handleResetBatch}
                    title={lang === 'ar' ? 'إعادة ضبط الدفعة للحالة الأصلية' : 'Reset batch'}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Claims List */}
              <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {claims.map((claim) => {
                  const rules = evaluateClaimRules(claim);
                  const fails = rules.filter(r => !r.passed).length;
                  const ai = evaluateAiDenialRisk(claim, fails);
                  const isSelected = claim.id === currentClaim.id;

                  return (
                    <div
                      key={claim.id}
                      onClick={() => setSelectedClaimId(claim.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                          : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-300">
                            {claim.id}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                            {claim.insurance.payerName}
                          </span>
                        </div>

                        {/* Status Badge */}
                        {ai.verdict === 'RED' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            <span>{lang === 'ar' ? 'حظر إرسال' : 'BLOCKED'}</span>
                          </span>
                        )}
                        {ai.verdict === 'YELLOW' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{lang === 'ar' ? 'خطر مرتفع' : 'HIGH RISK'}</span>
                          </span>
                        )}
                        {ai.verdict === 'GREEN' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{lang === 'ar' ? 'مطالبة نظيفة' : 'CLEAN'}</span>
                          </span>
                        )}
                      </div>

                      <div className="font-medium text-xs text-white line-clamp-1 mb-1">
                        {lang === 'ar' ? claim.titleAr : claim.titleEn}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-300">{claim.patient.name}</span>
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {claim.totalAmount.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Deep Claim Inspector & Firewall Verdict (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Claim Overview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-emerald-400">{currentClaim.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {lang === 'ar' ? currentClaim.specialtyAr : currentClaim.specialtyEn}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {currentClaim.serviceDate}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-white">
                      {lang === 'ar' ? currentClaim.titleAr : currentClaim.titleEn}
                    </h2>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowJsonModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <FileJson className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'ar' ? 'كود FHIR R4' : 'Raw FHIR'}</span>
                    </button>

                    {failedRulesCount > 0 && (
                      <button
                        onClick={handleAutoFix}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all ring-1 ring-emerald-400/30"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>{lang === 'ar' ? 'إصلاح تلقائي بنقرة واحدة' : '1-Click Auto-Fix'}</span>
                      </button>
                    )}

                    <button
                      disabled={aiEvaluation.verdict === 'RED' || isTransmitting}
                      onClick={handleSendToNphies}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        aiEvaluation.verdict === 'RED'
                          ? 'bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isTransmitting
                          ? (lang === 'ar' ? 'جارٍ الإرسال...' : 'Transmitting...')
                          : (lang === 'ar' ? 'إرسال إلى بوابة نفيس' : 'Transmit to NPHIES')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Patient & Provider Metadata Mini-Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">{lang === 'ar' ? 'المريض' : 'Patient'}</span>
                    <span className="font-medium text-white">{currentClaim.patient.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {currentClaim.patient.gender === 'male' ? (lang === 'ar' ? 'ذكر' : 'Male') : (lang === 'ar' ? 'أنثى' : 'Female')}, {currentClaim.patient.age} {lang === 'ar' ? 'سنة' : 'yrs'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{lang === 'ar' ? 'رقم الهوية / الإقامة' : 'National ID'}</span>
                    <span className="font-mono font-medium text-slate-200">{currentClaim.patient.nationalId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{lang === 'ar' ? 'شركة التأمين والوثيقة' : 'Payer & Policy'}</span>
                    <span className="font-medium text-emerald-400">{currentClaim.insurance.payerName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{currentClaim.insurance.policyNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">{lang === 'ar' ? 'المبلغ الإجمالي' : 'Claim Total'}</span>
                    <span className="font-mono font-bold text-sm text-white">{currentClaim.totalAmount.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                  </div>
                </div>

                {/* Fix History Alert Banner if Auto-Fix was applied */}
                {recentFixes[currentClaim.id] && (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>{lang === 'ar' ? 'سجل المعالجة والإصلاح التلقائي المطبق:' : 'Auto-Fix Applied Successfully:'}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                      {recentFixes[currentClaim.id].map((fix, idx) => (
                        <li key={idx}>{typeof fix === 'object' ? (lang === 'ar' ? fix.ar : fix.en) : fix}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* The Verdict Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  aiEvaluation.verdict === 'RED'
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    : aiEvaluation.verdict === 'YELLOW'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {aiEvaluation.verdict === 'RED' && <ShieldAlert className="w-7 h-7 text-rose-400 shrink-0 mt-0.5" />}
                  {aiEvaluation.verdict === 'YELLOW' && <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0 mt-0.5" />}
                  {aiEvaluation.verdict === 'GREEN' && <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        {lang === 'ar' ? aiEvaluation.verdictAr : aiEvaluation.verdictEn}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-black/40">
                        {lang === 'ar' ? 'معدل خطر الرفض المتوقع:' : 'Predicted Denial Risk:'} {aiEvaluation.denialRiskScore}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {lang === 'ar' ? aiEvaluation.recommendationAr : aiEvaluation.recommendationEn}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-left sm:text-right font-mono">
                  <div className="text-[11px] text-slate-400">{lang === 'ar' ? 'المبلغ المعرض للتجميد' : 'SAR at Risk'}</div>
                  <div className="text-lg font-bold">
                    {aiEvaluation.sarAtRisk.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}
                  </div>
                </div>
              </div>

              {/* Two-Engine Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Engine 1: 15 NPHIES / CCHI Deterministic Rules */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold text-white">
                        {lang === 'ar' ? 'محرك القواعد الحتمية الـ 15 (CCHI & NPHIES)' : '15 Deterministic Rules Engine'}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {15 - failedRulesCount}/15 {lang === 'ar' ? 'ناجحة' : 'passed'}
                    </span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex gap-1.5 mb-3 text-[11px]">
                    <button
                      onClick={() => setRuleFilter('all')}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        ruleFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-800/60 text-slate-400'
                      }`}
                    >
                      {lang === 'ar' ? 'الكل (15)' : 'All (15)'}
                    </button>
                    <button
                      onClick={() => setRuleFilter('failed')}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        ruleFilter === 'failed' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'bg-slate-800/60 text-slate-400'
                      }`}
                    >
                      {lang === 'ar' ? `المخالفات (${failedRulesCount})` : `Failed (${failedRulesCount})`}
                    </button>
                    <button
                      onClick={() => setRuleFilter('passed')}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        ruleFilter === 'passed' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-800/60 text-slate-400'
                      }`}
                    >
                      {lang === 'ar' ? `السليمة (${15 - failedRulesCount})` : `Passed (${15 - failedRulesCount})`}
                    </button>
                  </div>

                  {/* Rules Scrollable List */}
                  <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                    {ruleResults
                      .filter(r => ruleFilter === 'all' ? true : ruleFilter === 'failed' ? !r.passed : r.passed)
                      .map((rule) => (
                        <div
                          key={rule.ruleId}
                          className={`p-2.5 rounded-lg border text-xs transition-colors ${
                            rule.passed
                              ? 'bg-slate-900/50 border-slate-800/80 text-slate-300'
                              : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 font-medium">
                              {rule.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              )}
                              <span className="text-white font-semibold">
                                {lang === 'ar' ? rule.nameAr : rule.nameEn}
                              </span>
                            </div>
                            <span className="font-mono text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                              {rule.ruleId}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 ps-5">
                            {lang === 'ar' ? rule.messageAr : rule.messageEn}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Engine 2: AI Denial Risk Engine (XGBoost + SHAP Waterfall) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-bold text-white">
                        {lang === 'ar' ? 'محرك تنبؤ الرفض بالذكاء الاصطناعي (XGBoost + SHAP)' : 'AI Denial Risk Engine (XGBoost & SHAP)'}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                      {lang === 'ar' ? 'دقة النموذج: 94.6%' : 'Model Accuracy: 94.6%'}
                    </span>
                  </div>

                  {/* Risk Meter Gauge Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{lang === 'ar' ? 'مؤشر احتمالية رفض شركة التأمين للمطالبة:' : 'Payer Denial Probability Score:'}</span>
                      <span className="font-mono font-bold text-amber-400">{aiEvaluation.denialRiskScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-500 ${
                          aiEvaluation.denialRiskScore > 55
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${aiEvaluation.denialRiskScore}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>0% ({lang === 'ar' ? 'آمنة' : 'Safe'})</span>
                      <span className="text-amber-500">55% ({lang === 'ar' ? 'عتبة الخطر' : 'Threshold'})</span>
                      <span>100% ({lang === 'ar' ? 'رفض مؤكد' : 'Denied'})</span>
                    </div>
                  </div>

                  {/* SHAP Feature Contribution Waterfall */}
                  <div className="flex-1 flex flex-col">
                    <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-teal-400" />
                      <span>{lang === 'ar' ? 'تفسير الذكاء الاصطناعي للعوامل المؤثرة (SHAP Attribution):' : 'SHAP Factor Explainability:'}</span>
                    </h4>

                    <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
                      {aiEvaluation.shapFactors.map((factor, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium text-slate-200">
                              {lang === 'ar' ? factor.featureAr : factor.featureEn}
                            </span>
                            <span
                              className={`font-mono font-bold text-[11px] px-1.5 py-0.2 rounded ${
                                factor.direction === 'RISK_INCREASE'
                                  ? 'bg-rose-500/15 text-rose-400'
                                  : 'bg-emerald-500/15 text-emerald-400'
                              }`}
                            >
                              {factor.impact}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {lang === 'ar' ? factor.explanationAr : factor.explanationEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NPHIES Gateway Simulator & Retraining Feedback Loop */}
        {activeTab === 'nphies_sim' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-400" />
                    <span>{lang === 'ar' ? 'سجل عمليات الإرسال الحية لبوابة نفيس (NPHIES FHIR R4 Gateway)' : 'Live NPHIES FHIR Gateway Transmission Log'}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === 'ar'
                      ? 'محاكاة كاملة لإرسال المطالبات النظيفة وردود ClaimResponse الرسمية من المنصة الوطنية'
                      : 'Real-time simulation of clean claim submission and official NPHIES ClaimResponse ingestion'}
                  </p>
                </div>
                <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-mono">
                  {lang === 'ar' ? 'حالة البوابة: متصلة ونشطة' : 'Gateway Status: 200 OK'}
                </div>
              </div>

              {transmissionLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Send className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
                  <p className="text-sm">
                    {lang === 'ar'
                      ? 'لم يتم إرسال أي مطالبات بعد. اختر مطالبة نظيفة (أو أصلحها أولاً) واضغط على زر "إرسال إلى بوابة نفيس".'
                      : 'No claims submitted yet. Select a clean claim and click "Transmit to NPHIES".'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transmissionLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400">{log.nphiesReference}</span>
                          <span className="font-mono text-slate-400">({log.claimId})</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                            {log.status}
                          </span>
                        </div>
                        <div className="text-white font-medium">
                          {log.patientName} • {log.payer} • {log.sar.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}
                        </div>
                        <p className="text-slate-400 text-[11px]">{log.outcome}</p>
                      </div>

                      <div className="text-right text-[11px] text-slate-500 font-mono">
                        <div>{log.timestamp}</div>
                        <div className="text-emerald-400 font-sans mt-0.5">
                          {lang === 'ar' ? '✓ تم تحديث نموذج التعلم للعيادة' : '✓ Feedback loop retrained'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Retraining & Moat Explanation Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white mb-1">
                  {lang === 'ar' ? 'حلقة التعلم المستمرة (Per-Clinic Moat)' : 'Per-Clinic Retraining Moat'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'كل إشعار ClaimResponse يعود من نفيس يعيد تدريب نموذج الذكاء الاصطناعي محلياً ليتعرف على سلوك شركات التأمين الخاصة بالعيادة وتفضيلاتها بدقة متزايدة.'
                    : 'Every returned ClaimResponse retrains the XGBoost model locally on that facility’s specific payer mix, creating a sustainable moat.'}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white mb-1">
                  {lang === 'ar' ? 'التوافق التام مع نظام حماية البيانات (PDPL)' : 'Saudi PDPL & Sovereign Cloud'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'يعمل جدار الحماية داخل السحابة السيادية السعودية أو كخادم محلي (On-Premise). لا تخرج أي بيانات صحية أو شخصية خارج المملكة نهائياً.'
                    : 'Zero patient data leaves the Kingdom. Operates on-premise or within sovereign Saudi cloud environments in full PDPL compliance.'}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white mb-1">
                  {lang === 'ar' ? 'أداء فائق للوكيل (28ms Latency)' : 'Ultra-Low Latency Proxy'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'ar'
                    ? 'فحص 15 قاعدة حتمية مع معالجة نموذج الذكاء الاصطناعي في أقل من 40 ميلي ثانية، مما يجعله غير محسوس لنظام المستشفى ولا يسبب أي تأخير.'
                    : 'Inline proxy latency of under 40ms per claim ensures seamless integration without interrupting existing medical billing workflows.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Architecture & Zero-Touch HIS Proxy Diagram */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-2">
                {lang === 'ar' ? 'معمارية الحل: جدار حماية وسيط بدون استبدال نظام المستشفى' : 'Solution Architecture: Zero-Touch Pre-Submission Firewall'}
              </h2>
              <p className="text-xs text-slate-400 max-w-3xl leading-relaxed mb-6">
                {lang === 'ar'
                  ? 'على عكس الحلول التقليدية (مثل واصيل وكلودبيتال) التي تتطلب استبدال نظام المستشفى بالكامل بتكاليف باهظة، يعمل جدار الحماية لدينا كطبقة شفافة (Inline Proxy / REST Gateway) تفحص حزم FHIR R4 قبل وصولها لمنصة نفيس بنقرة واحدة وبدون أي تعديل على كود نظام المستشفى الحالي.'
                  : 'Unlike legacy solutions that require replacing the entire HIS suite at massive cost, NPHIES Claim Firewall sits as an agnostic, inline proxy inspecting every FHIR R4 payload before submission.'}
              </p>

              {/* Visual Interactive Pipeline Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative py-4">
                {/* Step 1: HIS */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mb-2 font-bold text-sm">
                    1
                  </div>
                  <h4 className="font-bold text-xs text-white mb-1">
                    {lang === 'ar' ? 'أنظمة المستشفيات (HIS)' : 'Clinic HIS'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Epic, Cerner, Cloudpital, local HIS
                  </p>
                  <span className="mt-2 text-[10px] text-slate-500 font-mono">
                    FHIR R4 Claim
                  </span>
                </div>

                {/* Step 2: Ingest & Normalize */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mb-2 font-bold text-sm">
                    2
                  </div>
                  <h4 className="font-bold text-xs text-white mb-1">
                    {lang === 'ar' ? 'الاستقبال والتحقق' : 'Ingest & Normalize'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    FHIR Structure & NPHIES Profile
                  </p>
                  <span className="mt-2 text-[10px] text-emerald-400 font-mono">
                    &lt; 5 ms
                  </span>
                </div>

                {/* Step 3: Rules & AI (Firewall Core) */}
                <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/40 text-center flex flex-col items-center shadow-lg shadow-emerald-950/30">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 font-bold text-sm">
                    3
                  </div>
                  <h4 className="font-bold text-xs text-emerald-300 mb-1">
                    {lang === 'ar' ? 'محرك القواعد والذكاء' : 'Rules & AI Engine'}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    15 CCHI Rules + XGBoost & SHAP
                  </p>
                  <span className="mt-2 text-[10px] text-amber-300 font-mono">
                    🔴 RED / 🟡 YEL / 🟢 GRN
                  </span>
                </div>

                {/* Step 4: Auto-Fix */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mb-2 font-bold text-sm">
                    4
                  </div>
                  <h4 className="font-bold text-xs text-white mb-1">
                    {lang === 'ar' ? 'الإصلاح التلقائي' : 'One-Click Auto-Fix'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Luhn, PreAuth, Unbundling, Math
                  </p>
                  <span className="mt-2 text-[10px] text-emerald-400 font-mono">
                    Auto Clean
                  </span>
                </div>

                {/* Step 5: NPHIES */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mb-2 font-bold text-sm">
                    5
                  </div>
                  <h4 className="font-bold text-xs text-white mb-1">
                    {lang === 'ar' ? 'منصة نفيس (NPHIES)' : 'NPHIES Platform'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    CCHI / Lean / Sovereign Cloud
                  </p>
                  <span className="mt-2 text-[10px] text-emerald-400 font-mono">
                    Clean Claim &gt; 98%
                  </span>
                </div>
              </div>

              {/* Competitive Table from Slide 6 */}
              <div className="mt-8">
                <h3 className="font-bold text-sm text-white mb-3">
                  {lang === 'ar' ? 'المقارنة التنافسية مع حلول السوق (Waseel & Cloudpital):' : 'Competitive Landscape & Moat:'}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300 border-collapse">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3 text-right">{lang === 'ar' ? 'الميزة / الحل' : 'Solution / Capability'}</th>
                        <th className="p-3 text-center">Waseel (واصيل)</th>
                        <th className="p-3 text-center">Cloudpital (كلودبيتال)</th>
                        <th className="p-3 text-center text-emerald-400 bg-emerald-950/20 font-bold">
                          NPHIES Claim Firewall (حلنا)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr>
                        <td className="p-3 font-medium text-white">{lang === 'ar' ? 'طريقة الربط' : 'Integration Mode'}</td>
                        <td className="p-3 text-center text-slate-400">{lang === 'ar' ? 'ربط عميق مكلف' : 'Heavy RCM Suite'}</td>
                        <td className="p-3 text-center text-slate-400">{lang === 'ar' ? 'استبدال كامل للنظام' : 'Full HIS Replacement'}</td>
                        <td className="p-3 text-center text-emerald-400 font-bold bg-emerald-950/20">
                          {lang === 'ar' ? 'وكيل شفاف دون استبدال (Zero-Touch)' : 'Agnostic Inline Proxy (15-min setup)'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-white">{lang === 'ar' ? 'فحص ما قبل الإرسال' : 'Pre-Submission Validation'}</td>
                        <td className="p-3 text-center text-slate-400">{lang === 'ar' ? 'تحقق هيكلي أساسي' : 'Basic syntax checks'}</td>
                        <td className="p-3 text-center text-slate-400">{lang === 'ar' ? 'ترميز فقط' : 'Coding only'}</td>
                        <td className="p-3 text-center text-emerald-400 font-bold bg-emerald-950/20">
                          {lang === 'ar' ? '15 قاعدة حتمية + ذكاء اصطناعي' : '15 Deterministic Rules + XGBoost'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-white">{lang === 'ar' ? 'التفسير والإصلاح بنقرة واحدة' : 'Explainability & 1-Click Auto-Fix'}</td>
                        <td className="p-3 text-center text-rose-400">✗</td>
                        <td className="p-3 text-center text-rose-400">✗</td>
                        <td className="p-3 text-center text-emerald-400 font-bold bg-emerald-950/20">
                          ✓ {lang === 'ar' ? 'SHAP بالعربية والإنجليزية مع Auto-Fix' : 'Bilingual SHAP + 1-Click Auto-Fix'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-white">{lang === 'ar' ? 'حلقة التعلم الخاصة بالعيادة' : 'Per-Clinic Retraining Moat'}</td>
                        <td className="p-3 text-center text-rose-400">✗</td>
                        <td className="p-3 text-center text-rose-400">✗</td>
                        <td className="p-3 text-center text-emerald-400 font-bold bg-emerald-950/20">
                          ✓ {lang === 'ar' ? 'إعادة تدريب مستمر على قرارات شركات التأمين' : 'Retrains on actual ClaimResponses'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Raw FHIR Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm text-white">
                  {lang === 'ar' ? 'كود المطالبة بصيغة FHIR R4 (JSON)' : 'FHIR R4 Claim Resource (JSON)'}
                </span>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <pre className="font-mono text-xs text-emerald-300 bg-slate-950 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                {JSON.stringify(currentClaim, null, 2)}
              </pre>
            </div>
            <div className="p-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          {lang === 'ar'
            ? 'جدار حماية مطالبات نفيس • مشروع هاكاثون ميثاثون (Medathon 2026) • المسار الثاني: التحول الرقمي الصحي'
            : 'NPHIES Claim Firewall • Medathon 2026 • Track 2: Healthcare Digital Transformation'}
        </p>
      </footer>
    </div>
  );
}
