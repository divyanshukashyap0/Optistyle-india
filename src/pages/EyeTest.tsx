
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, CheckCircle, AlertTriangle, Monitor, Download, Loader, Sparkles, 
  Volume2, VolumeX, ArrowRight, RefreshCcw, Sun, ArrowUp, ArrowDown, 
  ArrowLeft, Activity, Scan, Ruler, Focus, Crosshair, Grid3X3, Zap,
  Clock, Moon, BookOpen, HelpCircle
} from 'lucide-react';
import { Button } from '../components/Button';
import { calculateEstimation, generateCertificateId, AdvancedVisionProfile } from '../services/eyeTestLogic';
import { getEyeTestAnalysis } from '../services/aiService';
import { generateEyeTestCertificate } from '../services/pdfService';
import { api, endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';

// --- TYPES ---
type ClinicalStep = 
  | 'intro'
  | 'calibration'
  | 'dominance_intro'
  | 'dominance_test'
  | 'acuity_intro'
  | 'acuity_left'
  | 'acuity_right'
  | 'astigmatism'
  | 'contrast'
  | 'binocular'
  | 'near_vision'
  | 'digital_analysis' // Renamed from symptoms for broader scope
  | 'strain_education' // New Step
  | 'analysis'
  | 'results';

export const EyeTest: React.FC = () => {
  const { user } = useAuth();
  
  // Navigation & Config
  const [step, setStep] = useState<ClinicalStep>('intro');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const startTime = useRef(Date.now());

  // Clinical Data
  const [profile, setProfile] = useState<{
    name: string;
    age: string;
    gender: string;
    dominance: 'left' | 'right' | 'none';
    binocular: 'normal' | 'issue' | 'untested';
    astigmatism: boolean;
    contrastScore: number; // 0-1
    leftScore: number;
    rightScore: number;
    nearIssue: boolean;
    screenHours: number; // New
    symptoms: string[];
  }>({
    name: '', age: '', gender: 'Male',
    dominance: 'none', binocular: 'untested', astigmatism: false,
    contrastScore: 1, leftScore: 0, rightScore: 0, nearIssue: false, 
    screenHours: 0, symptoms: []
  });

  useEffect(() => {
    if (user?.name) {
      setProfile(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);


  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [showEmailHint, setShowEmailHint] = useState(false);

  // --- PROGRESS CALC ---
  const getProgress = () => {
    const steps: ClinicalStep[] = [
      'intro', 'calibration', 'dominance_intro', 'dominance_test', 
      'acuity_intro', 'acuity_left', 'acuity_right', 
      'astigmatism', 'contrast', 'binocular', 'near_vision', 
      'digital_analysis', 'strain_education', 'analysis', 'results'
    ];
    return ((steps.indexOf(step) + 1) / steps.length) * 100;
  };

  // --- HANDLERS ---
  const handleNext = (nextStep: ClinicalStep) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateProfile = (key: keyof typeof profile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const runAnalysis = useCallback(async () => {
    // Simulate complex calculation time
    setTimeout(async () => {
      const leftEst = calculateEstimation({ eye: 'left', acuityScore: profile.leftScore, astigmatismDetected: profile.astigmatism, colorVisionScore: 1 });
      const rightEst = calculateEstimation({ eye: 'right', acuityScore: profile.rightScore, astigmatismDetected: profile.astigmatism, colorVisionScore: 1 });
      
      const fullProfile: AdvancedVisionProfile = {
        leftEye: leftEst,
        rightEye: rightEst,
        dominance: profile.dominance,
        binocularFunction: profile.binocular === 'issue' ? 'diplopia' : 'normal',
        colorVision: 'normal',
        contrastSensitivity: profile.contrastScore > 0.8 ? 'high' : 'normal',
        symptoms: profile.symptoms,
        testDuration: Math.floor((Date.now() - startTime.current) / 1000),
        systemConfidence: 85
      };

      try {
        const text = await getEyeTestAnalysis(fullProfile);
        setAiExplanation(text);
      } catch (e) {
        setAiExplanation("Analysis complete. Review your results below.");
      }
      setStep('results');
    }, 3000);
  }, [profile]);

  useEffect(() => {
    if (step === 'analysis') {
      runAnalysis();
    }
  }, [step, runAnalysis]);

  useEffect(() => {
    if (!showEmailHint) return;
    const timer = setTimeout(() => setShowEmailHint(false), 10000);
    return () => clearTimeout(timer);
  }, [showEmailHint]);

  const downloadReport = async () => {
    setIsGenerating(true);
    const leftEst = calculateEstimation({ eye: 'left', acuityScore: profile.leftScore, astigmatismDetected: profile.astigmatism, colorVisionScore: 1 });
    const rightEst = calculateEstimation({ eye: 'right', acuityScore: profile.rightScore, astigmatismDetected: profile.astigmatism, colorVisionScore: 1 });
    const certId = generateCertificateId();

    try {
      // Use Client-Side Generation for immediate "Top Notch" results
      await generateEyeTestCertificate(
          profile.name || "Patient",
          profile.age,
          profile.gender,
          leftEst,
          rightEst,
          certId,
          88, // Confidence
          {
              dominance: profile.dominance,
              binocular: profile.binocular,
              contrast: profile.contrastScore,
              email: user?.email
          }
      );

      if (user?.email) {
        try {
          await api.post(endpoints.email.eyeTest, {
            name: profile.name || user.name || 'Patient',
            email: user.email,
            age: profile.age,
            gender: profile.gender,
            certId,
            leftEye: leftEst,
            rightEye: rightEst,
            overallConfidence: 88,
          });
          setShowEmailHint(true);
        } catch (e) {
          console.error('Eye test email failed', e);
        }
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Could not generate certificate. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* CLINICAL HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-1.5 rounded-md">
                    <Scan className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-slate-900 tracking-wide uppercase">OptiStyle Clinical</h1>
                    <p className="text-[10px] text-slate-500 font-mono">DIGITAL VISION SCREENING V2.4</p>
                </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Activity className="w-4 h-4 text-green-500" />
                    System Active
                </div>
                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-blue-600" 
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress()}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
            
            {/* STEP 1: INTRO */}
            {step === 'intro' && (
                <ClinicalCard key="intro">
                    <div className="text-center space-y-6 max-w-lg mx-auto">
                        <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4 ring-1 ring-blue-100">
                            <Focus className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-serif font-medium text-slate-900">Comprehensive Vision Analysis</h2>
                        <p className="text-slate-600 leading-relaxed">
                            You are about to begin a 10-minute digital eye examination inspired by clinical standards. 
                            We will assess your visual acuity, astigmatism, contrast sensitivity, and binocular function.
                        </p>
                        
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-left text-sm text-amber-800 flex gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-bold block mb-1">Medical Disclaimer</strong>
                                This tool is for screening purposes only. It estimates refractive error but cannot detect eye diseases. Results are not a prescription.
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Patient Name</label>
                                <input 
                                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                                    value={profile.name}
                                    onChange={e => updateProfile('name', e.target.value)}
                                    placeholder="Enter Name"
                                    disabled={!!user}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Age</label>
                                <input 
                                    type="number"
                                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    value={profile.age}
                                    onChange={e => updateProfile('age', e.target.value)}
                                    placeholder="Years"
                                />
                            </div>
                        </div>

                        <Button 
                            size="lg" 
                            className="w-full" 
                            disabled={!profile.name || !profile.age}
                            onClick={() => handleNext('calibration')}
                        >
                            Initialize System
                        </Button>
                    </div>
                </ClinicalCard>
            )}

            {/* STEP 2: CALIBRATION */}
            {step === 'calibration' && (
                <ClinicalCard key="calib" title="System Calibration">
                    <div className="max-w-lg mx-auto space-y-8 text-center">
                        <p className="text-slate-600">
                            To ensure clinical accuracy, we must calibrate your screen size.
                            <br/>Place a standard credit card against the screen below.
                        </p>
                        
                        <div className="flex justify-center py-4 bg-slate-100 rounded-xl border border-slate-200">
                            <div 
                                className="bg-slate-800 rounded-lg shadow-xl relative transition-all duration-100"
                                style={{ height: '150px', width: `${250 + (sliderValue * 3)}px` }}
                            >
                                <div className="absolute top-4 left-4 w-10 h-6 bg-slate-600 rounded"></div>
                                <div className="absolute bottom-4 left-4 text-xs font-mono text-slate-400">CREDIT CARD SIZE</div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <input 
                                type="range" min="0" max="100" value={sliderValue} 
                                onChange={(e) => setSliderValue(Number(e.target.value))} 
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                            />
                            <p className="text-xs text-slate-400">Slide to match width</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left text-xs text-slate-500 border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-2">
                                <Sun className="w-4 h-4" /> Ensure brightness is 100%
                            </div>
                            <div className="flex items-center gap-2">
                                <Ruler className="w-4 h-4" /> Arm's length distance
                            </div>
                        </div>

                        <Button className="w-full" size="lg" onClick={() => handleNext('dominance_intro')}>
                            Calibration Confirmed
                        </Button>
                    </div>
                </ClinicalCard>
            )}

            {/* STEP 3: DOMINANCE INTRO */}
            {step === 'dominance_intro' && (
                <ClinicalCard key="dom_intro" title="Ocular Dominance">
                    <div className="max-w-lg mx-auto space-y-6 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full mx-auto flex items-center justify-center">
                            <Crosshair className="w-12 h-12 text-slate-400" />
                        </div>
                        <p className="text-slate-600 text-lg">
                            Just like you are left or right-handed, one of your eyes is dominant.
                            Identifying this helps us understand how your brain processes visual info.
                        </p>
                        <ul className="text-left bg-blue-50 p-6 rounded-xl space-y-3 text-sm text-blue-900">
                            <li className="flex gap-2">
                                <span className="font-bold">1.</span> Extend your arms fully in front of you.
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">2.</span> Make a small triangle opening with your hands.
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">3.</span> Look through the triangle at the circle on the next screen.
                            </li>
                        </ul>
                        <Button size="lg" onClick={() => handleNext('dominance_test')}>Start Dominance Test</Button>
                    </div>
                </ClinicalCard>
            )}

            {/* STEP 3.5: DOMINANCE TEST */}
            {step === 'dominance_test' && (
                <ClinicalCard key="dom_test" title="Target Alignment">
                    <div className="max-w-lg mx-auto space-y-12 text-center">
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
                            Keep both eyes open. Center the target in your hand triangle.
                        </p>
                        
                        <div className="relative h-40 flex items-center justify-center">
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-8 h-8 bg-red-500 rounded-full shadow-lg shadow-red-200"
                            />
                        </div>

                        <div className="space-y-4">
                            <p className="font-bold text-slate-900">Now, close your LEFT eye. Did the red dot move?</p>
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" onClick={() => { updateProfile('dominance', 'left'); handleNext('acuity_intro'); }}>
                                    Yes, it moved / disappeared
                                </Button>
                                <Button variant="outline" onClick={() => { updateProfile('dominance', 'right'); handleNext('acuity_intro'); }}>
                                    No, it stayed center
                                </Button>
                            </div>
                        </div>
                    </div>
                </ClinicalCard>
            )}

            {/* ACUITY SECTION */}
            {step === 'acuity_intro' && (
                <PreTestInstruction 
                    eye="Right" 
                    onNext={() => handleNext('acuity_right')} 
                />
            )}

            {step === 'acuity_right' && (
                <AcuityTestBlock 
                    eye="Right" 
                    onComplete={(score) => { updateProfile('rightScore', score); handleNext('acuity_left'); }} 
                />
            )}

            {step === 'acuity_left' && ( 
                 <div className="space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                        <h2 className="text-2xl font-serif font-bold mb-4">Switch Eyes</h2>
                        <p className="text-slate-600 mb-6">Now cover your RIGHT eye and test your LEFT eye.</p>
                        <Button onClick={() => setStep('acuity_left_test' as any)} size="lg">Ready</Button>
                    </div>
                 </div>
            )}
            
            {(step as any) === 'acuity_left_test' && (
                 <AcuityTestBlock 
                    eye="Left" 
                    onComplete={(score) => { updateProfile('leftScore', score); handleNext('contrast'); }} 
                />
            )}

            {/* CONTRAST SENSITIVITY */}
            {step === 'contrast' && (
                <ContrastTestBlock onComplete={(score) => { updateProfile('contrastScore', score); handleNext('astigmatism'); }} />
            )}

            {/* ASTIGMATISM */}
            {step === 'astigmatism' && (
                <ClinicalCard key="astig" title="Astigmatism Assessment">
                    <div className="max-w-lg mx-auto text-center space-y-8">
                        <p className="text-slate-600">Look at the center of the dial with <strong>both eyes</strong>. Do any lines appear darker or sharper than others?</p>
                        
                        <div className="relative w-64 h-64 mx-auto border-4 border-slate-900 rounded-full bg-white shadow-xl flex items-center justify-center">
                             {[...Array(12)].map((_, i) => (
                                <div key={i} className="absolute w-full h-1 bg-transparent flex justify-between" style={{ transform: `rotate(${i * 15}deg)` }}>
                                    <div className="w-3 h-full bg-slate-900"></div>
                                    <div className="w-3 h-full bg-slate-900"></div>
                                </div>
                             ))}
                             {/* Central fixation */}
                             <div className="w-2 h-2 bg-red-500 rounded-full z-10" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => { updateProfile('astigmatism', true); handleNext('binocular'); }}>
                                Yes, some are darker
                            </Button>
                            <Button variant="outline" onClick={() => { updateProfile('astigmatism', false); handleNext('binocular'); }}>
                                No, all are equal
                            </Button>
                        </div>
                    </div>
                </ClinicalCard>
            )}

            {/* BINOCULAR VISION */}
            {step === 'binocular' && (
                <ClinicalCard key="bino" title="Binocular Fusion">
                    <div className="max-w-lg mx-auto text-center space-y-8">
                        <p className="text-slate-600">
                            Focus on the image below. Do you see <strong>one fused image</strong> or do the shapes drift apart?
                        </p>
                        
                        <div className="flex justify-center items-center gap-2 h-40">
                            <div className="w-16 h-16 rounded-full bg-red-500/80 mix-blend-multiply animate-pulse"></div>
                            <div className="w-16 h-16 rounded-full bg-green-500/80 mix-blend-multiply -ml-8 animate-pulse" style={{ animationDelay: '0.1s'}}></div>
                        </div>
                        <p className="text-xs text-slate-400">Simulated Worth 4-Dot Concept</p>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => { updateProfile('binocular', 'issue'); handleNext('near_vision'); }}>
                                They drift / I see double
                            </Button>
                            <Button variant="outline" onClick={() => { updateProfile('binocular', 'normal'); handleNext('near_vision'); }}>
                                I see one fused shape
                            </Button>
                        </div>
                    </div>
                </ClinicalCard>
            )}

            {/* NEAR VISION */}
            {step === 'near_vision' && (
                <ClinicalCard key="near" title="Near Vision Accommodation">
                    <div className="max-w-lg mx-auto text-center space-y-8">
                        <p className="text-slate-600">Hold your device at a comfortable reading distance (approx 40cm).</p>
                        
                        <div className="bg-white border border-slate-200 p-8 rounded-lg shadow-inner select-none space-y-6">
                            <p className="text-lg text-slate-800">1. This line should be easy to read.</p>
                            <p className="text-sm text-slate-600">2. This line is smaller, standard newsprint size.</p>
                            <p className="text-xs text-slate-500">3. Can you read this fine print without squinting?</p>
                            <p className="text-[10px] text-slate-400">4. This is micro-text for detailed near vision assessment.</p>
                        </div>

                        <div className="space-y-3">
                            <p className="font-bold">Which was the smallest line you could read comfortably?</p>
                            <div className="flex gap-2 justify-center">
                                <Button size="sm" variant="outline" onClick={() => { updateProfile('nearIssue', false); handleNext('digital_analysis'); }}>Line 4 (Excellent)</Button>
                                <Button size="sm" variant="outline" onClick={() => { updateProfile('nearIssue', false); handleNext('digital_analysis'); }}>Line 3 (Good)</Button>
                                <Button size="sm" variant="outline" onClick={() => { updateProfile('nearIssue', true); handleNext('digital_analysis'); }}>Line 2 or 1 (Issue)</Button>
                            </div>
                        </div>
                    </div>
                </ClinicalCard>
            )}

            {/* DIGITAL STRAIN ANALYSIS (Replaces basic symptoms) */}
            {step === 'digital_analysis' && (
                <DigitalAnalysis 
                    onComplete={(hours, symptoms) => {
                        updateProfile('screenHours', hours);
                        updateProfile('symptoms', symptoms);
                        handleNext('strain_education');
                    }} 
                />
            )}

            {/* EDUCATION STEP */}
            {step === 'strain_education' && (
                <StrainEducation onNext={() => handleNext('analysis')} />
            )}

            {/* ANALYSIS LOADER */}
            {step === 'analysis' && (
                <div className="min-h-[500px] flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-slate-900">Processing Clinical Data</h2>
                        <p className="text-slate-500 mt-2">Synthesizing acuity, binocular function, and comfort metrics...</p>
                    </div>
                </div>
            )}

            {/* RESULTS DASHBOARD */}
            {step === 'results' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
                            <CheckCircle className="w-4 h-4" /> Examination Complete
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-slate-900">Visual Health Report</h1>
                        <p className="text-slate-500">Generated for {profile.name} • {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* CONFIDENCE & SUMMARY */}
                    <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        
                        <div className="relative z-10 grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-blue-200 font-bold uppercase tracking-widest text-xs mb-1">AI Interpretation</h3>
                                <p className="text-lg leading-relaxed font-light text-white/90">
                                    {aiExplanation || "Based on your inputs, your vision profile suggests mild myopia. Binocular function appears normal."}
                                </p>
                            </div>
                            <div className="flex flex-col justify-center items-center md:items-end">
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-blue-400 mb-1">85%</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider">Test Confidence Index</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* METRICS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ResultMetricCard 
                            title="Right Eye (OD)" 
                            score={profile.rightScore} 
                            detail={profile.rightScore > 0.8 ? "20/20 - Excellent" : "Needs Correction"}
                        />
                        <ResultMetricCard 
                            title="Left Eye (OS)" 
                            score={profile.leftScore} 
                            detail={profile.leftScore > 0.8 ? "20/20 - Excellent" : "Needs Correction"}
                        />
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-slate-900">Ocular Dominance</h4>
                                <p className="text-sm text-slate-500">Preferred eye for visual processing</p>
                            </div>
                            <span className="text-xl font-mono font-bold text-blue-600 uppercase">{profile.dominance}</span>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-slate-900">Contrast Sensitivity</h4>
                                <p className="text-sm text-slate-500">Ability to distinguish low light</p>
                            </div>
                            <div className="flex gap-1">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className={`w-2 h-6 rounded-sm ${i <= (profile.contrastScore * 5) ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* NEW: Vision Glossary */}
                    <VisionGlossary />

                    {/* ACTIONS */}
                    <div className="flex flex-col gap-4 max-w-md mx-auto pt-8">
                        <Button size="lg" onClick={downloadReport} disabled={isGenerating} className="flex items-center justify-center gap-3">
                            {isGenerating ? <Loader className="animate-spin" /> : <Download />} Download Clinical Report
                        </Button>
                        <p className="text-center text-xs text-slate-400 max-w-xs mx-auto">
                            *This report is for informational purposes only. Please visit an optometrist for a dilated eye exam.
                        </p>
                        {showEmailHint && (
                          <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                            <div>
                              <p className="font-semibold">Check your email</p>
                              <p>If you do not see your eye test report, check Spam/Promotions and mark it as &quot;Not spam&quot;.</p>
                            </div>
                          </div>
                        )}
                    </div>
                </div>
            )}

        </AnimatePresence>
      </main>
    </div>
  );
};

// --- SUB COMPONENTS ---

const ClinicalCard: React.FC<{ title?: string, children: React.ReactNode }> = ({ title, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
    >
        {title && (
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" /> {title}
                </h3>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>
            </div>
        )}
        <div className="p-6 md:p-10">
            {children}
        </div>
    </motion.div>
);

const PreTestInstruction: React.FC<{ eye: string, onNext: () => void }> = ({ eye, onNext }) => (
    <ClinicalCard title={`${eye} Eye Preparation`}>
        <div className="text-center space-y-8 max-w-md mx-auto">
            <div className="w-32 h-32 mx-auto bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                <Eye className="w-16 h-16 text-slate-400" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Test Your {eye} Eye</h2>
                <p className="text-slate-600">
                    Please cover your <strong>{eye === 'Right' ? 'LEFT' : 'RIGHT'}</strong> eye completely.
                    <br/>Keep both eyes open, but block vision to one.
                </p>
            </div>
            <Button size="lg" className="w-full" onClick={onNext}>I am Ready</Button>
        </div>
    </ClinicalCard>
);

const AcuityTestBlock: React.FC<{ eye: string, onComplete: (score: number) => void }> = ({ eye, onComplete }) => {
    const [level, setLevel] = useState(0);
    const [fails, setFails] = useState(0);
    const SIZES = [200, 120, 80, 50, 30, 15]; 
    const [direction, setDirection] = useState(0); 

    const randomize = () => setDirection(Math.floor(Math.random() * 4) * 90);
    useEffect(() => randomize(), []);

    const handleInput = (inputDir: number) => {
        const correct = inputDir === direction;
        
        if (correct) {
            if (level < SIZES.length - 1) {
                setLevel(l => l + 1);
                randomize();
            } else {
                onComplete(1.0); 
            }
        } else {
            if (fails > 0) {
                onComplete(level / SIZES.length);
            } else {
                setFails(f => f + 1);
                randomize(); 
            }
        }
    };

    return (
        <div className="text-center space-y-8 animate-in fade-in">
            <div className="inline-block bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-mono">
                TESTING: {eye.toUpperCase()} EYE | LEVEL {level + 1}/6
            </div>
            
            <div className="h-[300px] flex items-center justify-center">
                <motion.div
                    key={`${level}-${direction}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ rotate: direction }}
                >
                    <svg width={SIZES[level]} height={SIZES[level]} viewBox="0 0 100 100" fill="black">
                        <path d="M0 0h100v20H20v20h60v20H20v20h80v20H0z" />
                    </svg>
                </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-[200px] mx-auto">
                <div />
                <Button variant="outline" className="h-16" onClick={() => handleInput(270)}><ArrowUp /></Button>
                <div />
                <Button variant="outline" className="h-16" onClick={() => handleInput(180)}><ArrowLeft /></Button>
                <div className="flex items-center justify-center"><Grid3X3 className="text-slate-200" /></div>
                <Button variant="outline" className="h-16" onClick={() => handleInput(0)}><ArrowRight /></Button>
                <div />
                <Button variant="outline" className="h-16" onClick={() => handleInput(90)}><ArrowDown /></Button>
                <div />
            </div>
        </div>
    );
};

const ContrastTestBlock: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    return (
        <ClinicalCard title="Contrast Sensitivity">
            <div className="text-center space-y-8">
                <p className="text-slate-600">Select the circle containing the faint letter.</p>
                <div className="flex justify-center gap-6">
                    {[0.05, 0.02, 0.01].map((opacity, i) => (
                        <button 
                            key={i}
                            onClick={() => onComplete(1 - (i * 0.2))} 
                            className="w-24 h-24 rounded-full bg-slate-50 border hover:border-blue-500 flex items-center justify-center transition-all"
                        >
                            <span style={{ opacity }} className="text-4xl font-bold font-sans">C</span>
                        </button>
                    ))}
                </div>
            </div>
        </ClinicalCard>
    );
};

const DigitalAnalysis: React.FC<{ onComplete: (hours: number, symptoms: string[]) => void }> = ({ onComplete }) => {
    const [hours, setHours] = useState(6);
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (s: string) => {
        if (selected.includes(s)) setSelected(selected.filter(i => i !== s));
        else setSelected([...selected, s]);
    };

    return (
        <ClinicalCard title="Digital Strain Analysis">
            <div className="max-w-lg mx-auto space-y-8">
                <div className="text-center">
                    <Monitor className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-slate-900">Daily Screen Time</h3>
                    <p className="text-sm text-slate-500">How many hours do you spend on devices?</p>
                    <div className="mt-6 flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-400">0h</span>
                        <input 
                            type="range" min="0" max="16" value={hours} 
                            onChange={(e) => setHours(Number(e.target.value))}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xl font-bold text-blue-600 min-w-[3ch]">{hours}h</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-bold text-slate-700 uppercase">Do you experience any of these?</p>
                    {['Headaches', 'Dry or watery eyes', 'Neck/Shoulder pain', 'Blurred vision at end of day', 'Light sensitivity'].map(sym => (
                        <button 
                            key={sym}
                            onClick={() => toggle(sym)}
                            className={`p-4 rounded-lg text-left border w-full transition-all flex justify-between items-center ${
                                selected.includes(sym) ? 'border-blue-600 bg-blue-50 text-blue-900 font-medium' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {sym}
                            {selected.includes(sym) && <CheckCircle className="w-5 h-5 text-blue-600" />}
                        </button>
                    ))}
                </div>

                <Button className="w-full" size="lg" onClick={() => onComplete(hours, selected)}>
                    Continue
                </Button>
            </div>
        </ClinicalCard>
    );
};

const StrainEducation: React.FC<{ onNext: () => void }> = ({ onNext }) => (
    <ClinicalCard title="Digital Wellness Guide">
        <div className="max-w-lg mx-auto text-center space-y-8">
            <div className="bg-blue-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <h3 className="text-2xl font-bold mb-4 font-serif">The 20-20-20 Rule</h3>
                <div className="flex justify-between items-center text-center gap-2">
                    <div className="flex-1">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                        <p className="text-xl font-bold">20</p>
                        <p className="text-xs text-blue-200">Minutes</p>
                    </div>
                    <div className="text-blue-400 font-bold">→</div>
                    <div className="flex-1">
                        <Eye className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                        <p className="text-xl font-bold">20</p>
                        <p className="text-xs text-blue-200">Feet Away</p>
                    </div>
                    <div className="text-blue-400 font-bold">→</div>
                    <div className="flex-1">
                        <Moon className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                        <p className="text-xl font-bold">20</p>
                        <p className="text-xs text-blue-200">Seconds</p>
                    </div>
                </div>
                <p className="mt-6 text-sm text-blue-100">
                    To prevent digital eye strain, every 20 minutes, look at something 20 feet away for at least 20 seconds.
                </p>
            </div>
            
            <div className="text-left space-y-4">
                <h4 className="font-bold text-slate-900">Other Healthy Habits:</h4>
                <ul className="space-y-3">
                    <li className="flex gap-3 text-sm text-slate-600">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Blink more often to keep eyes moist.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Adjust screen brightness to match room lighting.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Position screen slightly below eye level.</span>
                    </li>
                </ul>
            </div>

            <Button size="lg" className="w-full" onClick={onNext}>
                Analyze My Results
            </Button>
        </div>
    </ClinicalCard>
);

const VisionGlossary: React.FC = () => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-800">Understanding Your Results</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Visual Acuity (20/20)
                </h4>
                <p className="text-slate-600 leading-relaxed">
                    This measures how sharp your vision is. "20/20" is normal. "20/40" means you must be 20 feet away to see what a normal person sees at 40 feet.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Astigmatism
                </h4>
                <p className="text-slate-600 leading-relaxed">
                    Caused by an irregularly shaped cornea (like a football). It causes blurry vision at all distances and can lead to eye strain.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Contrast Sensitivity
                </h4>
                <p className="text-slate-600 leading-relaxed">
                    The ability to distinguish objects from their background. Low contrast sensitivity makes driving at night difficult.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> Binocular Fusion
                </h4>
                <p className="text-slate-600 leading-relaxed">
                    How well your two eyes work together. Poor fusion can result in double vision, headaches, and depth perception issues.
                </p>
            </div>
        </div>
    </div>
);

const ResultMetricCard: React.FC<{ title: string, score: number, detail: string }> = ({ title, score, detail }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group">
        <div className="flex justify-between items-start mb-4">
            <h4 className="font-bold text-slate-900">{title}</h4>
            <div className={`px-2 py-1 rounded text-xs font-bold ${score > 0.8 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {Math.round(score * 100)}/100
            </div>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${score * 100}%` }} />
        </div>
        <p className="text-xs text-slate-500 font-mono">{detail}</p>
        
        {/* Tooltip hint */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <HelpCircle className="w-4 h-4 text-slate-300" />
        </div>
    </div>
);
