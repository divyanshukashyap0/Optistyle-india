import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, CheckCircle, AlertTriangle, Monitor, Download, Loader, Sparkles, Volume2, VolumeX, ArrowRight, RefreshCcw, Grid, Sun, ArrowUp, ArrowDown, ArrowLeft, Info } from 'lucide-react';
import { Button } from '../components/Button';
import { calculateEstimation, generateCertificateId } from '../services/eyeTestLogic';
import { getEyeTestAnalysis } from '../services/aiService';
import { generateEyeTestCertificate } from '../services/pdfService';
import axios from 'axios';

type TestStep = 'intro' | 'calibration' | 'color_vision' | 'contrast_sensitivity' | 'prep_left' | 'left_eye_acuity' | 'prep_right' | 'right_eye_acuity' | 'astigmatism' | 'amsler_grid' | 'result';

// Use local API or deployed one
const API_URL = 'http://localhost:5000/api';

export const EyeTest: React.FC = () => {
  const [step, setStep] = useState<TestStep>('intro');
  const [sliderValue, setSliderValue] = useState(50);
  const [userInfo, setUserInfo] = useState({ name: '', age: '', gender: 'Male' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const [scores, setScores] = useState({
    leftEye: { score: 0 }, // 0 to 1
    rightEye: { score: 0 }, // 0 to 1
    astigmatism: false,
    colorVision: 0, // 0 to 1
    contrast: 0, // 0 to 1
    amslerIssue: false
  });

  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // --- Voice Assistant ---
  const speak = useCallback((text: string) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    }
  }, [voiceEnabled]);

  useEffect(() => {
    // Announce step changes
    const timeout = setTimeout(() => {
        switch (step) {
          case 'intro': speak("Welcome to the AI Vision Screening. Please enter your details."); break;
          case 'calibration': speak("Let's calibrate your screen. Adjust the slider until the box matches the width of a standard credit card."); break;
          case 'color_vision': speak("First, let's check your color perception. Identify the number inside the circle."); break;
          case 'contrast_sensitivity': speak("Now for contrast sensitivity. Select the circle that contains the fading letter."); break;
          case 'prep_left': speak("Get ready. Please cover your Right eye with your hand. Keep both eyes open, but block the right one."); break;
          case 'left_eye_acuity': speak("Indicate which direction the letter E is facing. You can use the arrow keys on your keyboard."); break;
          case 'prep_right': speak("Great job. Now switch hands. Cover your Left eye."); break;
          case 'right_eye_acuity': speak("Indicate the direction of the E."); break;
          case 'astigmatism': speak("Look at the wheel with both eyes. Do all lines appear equally dark and sharp?"); break;
          case 'amsler_grid': speak("Focus on the center dot. Do any of the grid lines look wavy, blurred, or missing?"); break;
          case 'result': speak("Test complete. We are analyzing your results."); break;
        }
    }, 500);
    return () => clearTimeout(timeout);
  }, [step, speak]);

  const handleNext = () => {
    switch (step) {
      case 'intro': setStep('calibration'); break;
      case 'calibration': setStep('color_vision'); break;
      case 'color_vision': setStep('contrast_sensitivity'); break;
      case 'contrast_sensitivity': setStep('prep_left'); break;
      case 'prep_left': setStep('left_eye_acuity'); break;
      case 'left_eye_acuity': setStep('prep_right'); break;
      case 'prep_right': setStep('right_eye_acuity'); break;
      case 'right_eye_acuity': setStep('astigmatism'); break;
      case 'astigmatism': setStep('amsler_grid'); break;
      case 'amsler_grid': 
        setStep('result'); 
        runAnalysis();
        break;
      case 'result': break;
    }
  };

  const recordColorScore = (score: number) => {
      setScores(prev => ({ ...prev, colorVision: score }));
      handleNext();
  };

  const recordContrastScore = (score: number) => {
      setScores(prev => ({ ...prev, contrast: score }));
      handleNext();
  };

  const recordAcuityScore = (finalScore: number) => {
    const eye = step === 'left_eye_acuity' ? 'leftEye' : 'rightEye';
    setScores(prev => ({
      ...prev,
      [eye]: { score: finalScore }
    }));
    handleNext();
  };

  const runAnalysis = async () => {
    setLoadingAnalysis(true);
    
    // Prepare Data
    const leftEst = calculateEstimation({ eye: 'left', acuityScore: scores.leftEye.score, astigmatismDetected: scores.astigmatism, colorVisionScore: scores.colorVision });
    const rightEst = calculateEstimation({ eye: 'right', acuityScore: scores.rightEye.score, astigmatismDetected: scores.astigmatism, colorVisionScore: scores.colorVision });
    const overallConf = Math.round((leftEst.confidence + rightEst.confidence) / 2);

    const analysisPayload = {
      leftEye: leftEst,
      rightEye: rightEst,
      overallConfidence: overallConf,
      colorVisionScore: scores.colorVision,
      contrastScore: scores.contrast,
      astigmatism: scores.astigmatism,
      amslerGridIssue: scores.amslerIssue
    };

    try {
      const explanation = await getEyeTestAnalysis(analysisPayload);
      setAiExplanation(explanation);
    } catch (error) {
      console.error("AI Analysis failed", error);
      setAiExplanation("Analysis unavailable. Please consult an optometrist.");
    } finally {
      setLoadingAnalysis(false);
    }
  };
  
  const downloadOfficialCertificate = async () => {
    setIsGenerating(true);
    
    const leftEst = calculateEstimation({ eye: 'left', acuityScore: scores.leftEye.score, astigmatismDetected: scores.astigmatism, colorVisionScore: scores.colorVision });
    const rightEst = calculateEstimation({ eye: 'right', acuityScore: scores.rightEye.score, astigmatismDetected: scores.astigmatism, colorVisionScore: scores.colorVision });
    const overallConf = Math.round((leftEst.confidence + rightEst.confidence) / 2);
    const certId = generateCertificateId();

    try {
      const response = await axios.post(`${API_URL}/certificate`, {
        name: userInfo.name || "Guest",
        age: userInfo.age,
        gender: userInfo.gender,
        date: new Date().toISOString(),
        leftEye: leftEst,
        rightEye: rightEst,
        confidence: overallConf,
        certId
      }, {
        responseType: 'blob',
        timeout: 2000 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `OptiStyle_Cert_${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.warn("Backend unavailable, falling back to client-side PDF generation.");
      try {
        generateEyeTestCertificate(
          userInfo.name || "Guest",
          userInfo.age,
          userInfo.gender,
          leftEst,
          rightEst,
          certId,
          overallConf
        );
      } catch (clientError) {
        alert("Could not generate certificate.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Progress calculation
  const getProgress = () => {
    const steps: TestStep[] = ['intro', 'calibration', 'color_vision', 'contrast_sensitivity', 'prep_left', 'left_eye_acuity', 'prep_right', 'right_eye_acuity', 'astigmatism', 'amsler_grid', 'result'];
    const idx = steps.indexOf(step);
    return ((idx + 1) / steps.length) * 100;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-brand-100">
      <div className="max-w-4xl mx-auto relative">
        
        {/* Voice Toggle */}
        <button 
            onClick={() => { setVoiceEnabled(!voiceEnabled); if(!voiceEnabled) speak("Voice guidance enabled."); }}
            className="absolute top-0 right-0 p-2 text-slate-400 hover:text-brand-600 transition-colors z-10"
            title={voiceEnabled ? "Mute Voice Guidance" : "Enable Voice Guidance"}
        >
            {voiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        {/* Progress Header */}
        <div className="mb-8 pt-8">
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${getProgress()}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-center text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold">
             Step {step.replace(/_/g, " ")}
          </p>
        </div>

        <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-xl p-6 md:p-12 border border-slate-100 min-h-[500px] flex flex-col justify-center items-center text-center relative overflow-hidden"
        >
          {/* Background Decor */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600"></div>

          {step === 'intro' && (
            <div className="w-full max-w-lg space-y-8">
              <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-600 ring-4 ring-brand-100">
                <Eye className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">AI Vision Screening</h1>
                <p className="text-lg text-slate-500">
                  A comprehensive digital eye test powered by AI.
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-left flex gap-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0" />
                <div>
                    <h3 className="font-bold text-yellow-800 text-sm mb-1">Medical Disclaimer</h3>
                    <p className="text-sm text-yellow-700 leading-relaxed">
                    This is a screening tool, not a medical diagnosis. Results are estimates. If you experience pain or sudden vision loss, see a doctor immediately.
                    </p>
                </div>
              </div>

              <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                    <input 
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" 
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                        placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="flex gap-4">
                     <div className="w-1/3">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Age</label>
                        <input 
                            type="number"
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            value={userInfo.age}
                            onChange={(e) => setUserInfo({...userInfo, age: e.target.value})}
                        />
                     </div>
                     <div className="w-2/3">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Gender</label>
                        <select 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            value={userInfo.gender}
                            onChange={(e) => setUserInfo({...userInfo, gender: e.target.value})}
                        >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                     </div>
                  </div>
              </div>

              <Button size="lg" className="w-full py-4 text-lg shadow-lg shadow-brand-200" onClick={handleNext} disabled={!userInfo.name}>
                  Start Screening
              </Button>
            </div>
          )}

          {step === 'calibration' && (
            <div className="w-full max-w-lg space-y-8">
              <h2 className="text-3xl font-bold font-serif">Screen Calibration</h2>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-left flex gap-3">
                 <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                 <p className="text-blue-800 text-sm">
                    <strong>Why?</strong> This ensures images are displayed at the correct physical size on your screen for accuracy.
                 </p>
              </div>
              <p className="text-slate-600 text-lg">
                  Place a standard credit card (or ID) against the screen. Adjust the slider until the blue box matches the width of your card.
              </p>
              
              <div className="flex justify-center my-8">
                 <div 
                    className="bg-brand-600 rounded-xl shadow-2xl flex flex-col justify-end p-4 text-white font-mono text-sm relative transition-all duration-200"
                    style={{ height: '180px', width: `${300 + (sliderValue * 4)}px` }}
                 >
                    <div className="absolute top-4 left-4 w-12 h-8 bg-brand-400/50 rounded"></div>
                    <div className="text-xl tracking-widest opacity-80 mb-1">#### #### #### ####</div>
                    <div className="flex justify-between text-xs opacity-60">
                        <span>VALID THRU 12/28</span>
                        <span>JOHN DOE</span>
                    </div>
                 </div>
              </div>
              
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderValue} 
                onChange={(e) => setSliderValue(Number(e.target.value))} 
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600" 
              />
              <Button onClick={handleNext} className="w-full py-4 text-lg">Confirm Size</Button>
            </div>
          )}

          {(step === 'prep_left' || step === 'prep_right') && (
            <div className="space-y-8 animate-in zoom-in duration-300 max-w-lg mx-auto">
                <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200">
                    <Eye className="w-16 h-16 text-slate-400" />
                </div>
                <div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">
                        Cover Your {step === 'prep_left' ? <span className="text-brand-600">Right</span> : <span className="text-brand-600">Left</span>} Eye
                    </h2>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-left space-y-2">
                        <p className="flex items-start gap-2 text-yellow-800 font-medium">
                            <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                            Keep both eyes open.
                        </p>
                        <p className="flex items-start gap-2 text-yellow-800 font-medium">
                            <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                            Use your hand or a card to block the {step === 'prep_left' ? 'Right' : 'Left'} eye completely.
                        </p>
                        <p className="flex items-start gap-2 text-yellow-800 font-medium">
                            <span className="bg-yellow-200 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                            Do not squint or press on your eyelid.
                        </p>
                    </div>
                </div>
                <div className="pt-4">
                    <Button size="lg" className="px-12 py-4 text-xl w-full" onClick={handleNext}>I'm Ready</Button>
                </div>
            </div>
          )}
          
          {step === 'color_vision' && (
              <ColorTestPhase onComplete={recordColorScore} />
          )}

          {step === 'contrast_sensitivity' && (
              <ContrastTestPhase onComplete={recordContrastScore} />
          )}

          {(step === 'left_eye_acuity' || step === 'right_eye_acuity') && (
             <AcuityTestPhase 
                eye={step === 'left_eye_acuity' ? 'Left' : 'Right'} 
                onComplete={recordAcuityScore}
             />
          )}

          {step === 'astigmatism' && (
             <div className="text-center space-y-8 w-full max-w-2xl">
                <div className="inline-block bg-brand-50 border border-brand-100 px-4 py-1.5 rounded-full text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
                    Step: Astigmatism
                </div>
                <h2 className="text-3xl font-bold font-serif">Do lines look different?</h2>
                <p className="text-slate-600 text-lg">
                    Look at the wheel below with <strong>both eyes open</strong>. <br/>
                    Do any of the lines appear darker, bolder, or sharper than others?
                </p>
                
                <div className="w-72 h-72 mx-auto bg-white border-4 border-slate-900 rounded-full relative overflow-hidden shadow-2xl">
                   {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute inset-0 border-t-[6px] border-black top-1/2" 
                        style={{ transform: `rotate(${i * 15}deg)` }} 
                      />
                   ))}
                   <div className="absolute inset-0 m-auto w-4 h-4 bg-white rounded-full z-10" />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                   <Button variant="outline" size="lg" onClick={() => { setScores({...scores, astigmatism: true}); handleNext(); }} className="border-red-200 hover:bg-red-50 text-red-700 py-4 px-8 text-lg">Yes, some are darker</Button>
                   <Button size="lg" onClick={() => { setScores({...scores, astigmatism: false}); handleNext(); }} className="bg-green-600 hover:bg-green-700 py-4 px-8 text-lg">No, all look equal</Button>
                </div>
             </div>
          )}

          {step === 'amsler_grid' && (
             <div className="text-center space-y-8 w-full max-w-2xl">
                <div className="inline-block bg-brand-50 border border-brand-100 px-4 py-1.5 rounded-full text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
                    Step: Macular Health
                </div>
                <h2 className="text-3xl font-bold font-serif">Amsler Grid Test</h2>
                <p className="text-slate-600 text-lg">
                    Focus on the <strong>center dot</strong>. Without moving your eyes, observe the grid lines around it.
                </p>
                
                <div className="flex justify-center">
                    <div className="w-80 h-80 bg-white border-[4px] border-black grid grid-cols-10 grid-rows-10 relative shadow-2xl">
                        {/* Grid lines */}
                        {[...Array(9)].map((_, i) => (
                            <React.Fragment key={i}>
                                <div className="absolute w-full h-[2px] bg-black" style={{ top: `${(i + 1) * 10}%` }}></div>
                                <div className="absolute h-full w-[2px] bg-black" style={{ left: `${(i + 1) * 10}%` }}></div>
                            </React.Fragment>
                        ))}
                        {/* Center Dot */}
                        <div className="absolute inset-0 m-auto w-4 h-4 bg-black rounded-full z-10"></div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <p className="font-bold text-slate-900 text-xl">Do any lines look wavy, blurred, or missing?</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Button variant="outline" size="lg" onClick={() => { setScores({...scores, amslerIssue: true}); handleNext(); }} className="border-red-200 hover:bg-red-50 text-red-700 py-4 px-8 text-lg">Yes, I see distortion</Button>
                        <Button size="lg" onClick={() => { setScores({...scores, amslerIssue: false}); handleNext(); }} className="bg-green-600 hover:bg-green-700 py-4 px-8 text-lg">No, grid looks perfect</Button>
                    </div>
                </div>
             </div>
          )}

          {step === 'result' && (
             <div className="text-center space-y-6 w-full max-w-2xl">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 ring-4 ring-green-50 mb-4">
                   <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-slate-900">Screening Complete</h2>
                <p className="text-lg text-slate-600">
                   Your vision profile has been analyzed successfully.
                </p>

                {/* AI Explanation Section */}
                {loadingAnalysis ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl border border-slate-100 w-full">
                    <Sparkles className="w-10 h-10 text-brand-500 animate-pulse mb-4" />
                    <p className="text-slate-500 font-medium animate-pulse">AI is generating your vision summary...</p>
                  </div>
                ) : (
                  aiExplanation && (
                    <div className="bg-brand-50 rounded-2xl p-8 text-left border border-brand-100 relative overflow-hidden shadow-sm w-full">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles className="w-48 h-48 text-brand-600" />
                      </div>
                      <div className="flex items-center gap-3 mb-4 text-brand-800 font-bold relative z-10 text-lg">
                          <Sparkles className="w-6 h-6" /> 
                          <h3>AI Interpretation</h3>
                      </div>
                      <div className="prose prose-slate text-slate-700 relative z-10 leading-relaxed text-base">
                          <p>{aiExplanation}</p>
                      </div>
                    </div>
                  )
                )}

                <div className="flex flex-col gap-4 mt-8 w-full">
                   <Button size="lg" onClick={downloadOfficialCertificate} disabled={isGenerating} className="w-full flex items-center justify-center gap-3 py-4 text-lg font-bold">
                      {isGenerating ? <Loader className="animate-spin w-6 h-6" /> : <Download className="w-6 h-6" />}
                      Download Official Certificate (PDF)
                   </Button>
                   <Button variant="outline" onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-3 py-4 text-slate-600">
                      <RefreshCcw className="w-5 h-5" /> Restart Test
                   </Button>
                   <p className="text-xs text-slate-400 mt-2">
                      *Encrypted & HIPAA Compliant Processing
                   </p>
                </div>
             </div>
          )}
        </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const ColorTestPhase: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    // Simulating Ishihara plates with CSS radial gradients
    const PLATES = [
        { id: 1, color: 'bg-red-100', number: 12, options: [12, 8, 3] },
        { id: 2, color: 'bg-green-100', number: 74, options: [21, 74, 14] },
        { id: 3, color: 'bg-blue-100', number: 6, options: [5, 9, 6] }
    ];
    const [index, setIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    const handleAnswer = (num: number) => {
        const isCorrect = num === PLATES[index].number;
        const newCorrect = correctCount + (isCorrect ? 1 : 0);
        
        if (index < PLATES.length - 1) {
            setCorrectCount(newCorrect);
            setIndex(index + 1);
        } else {
            // Finished
            onComplete((newCorrect) / PLATES.length); // 0 to 1 score
        }
    };

    const currentPlate = PLATES[index];

    return (
        <div className="text-center space-y-8 animate-in fade-in duration-500 w-full max-w-lg">
            <div className="inline-block bg-brand-50 border border-brand-100 px-4 py-1.5 rounded-full text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
                Step: Color Vision
            </div>
            <h2 className="text-3xl font-bold">What number do you see?</h2>
            <p className="text-slate-500 text-lg">Identify the number hidden in the pattern below.</p>
            
            <div className="flex justify-center my-8">
                {/* Improved Simulated Ishihara Plate */}
                <div className={`w-64 h-64 rounded-full ${currentPlate.color} flex items-center justify-center relative overflow-hidden shadow-inner ring-8 ring-slate-50`}>
                    {/* Noise texture background */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '12px 12px' }}></div>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #555 4px, transparent 4px)', backgroundSize: '20px 20px', transform: 'rotate(45deg)' }}></div>
                    
                    <span className="text-8xl font-bold text-slate-900/30 tracking-tighter mix-blend-multiply select-none scale-150 blur-[1px]" style={{ fontFamily: 'Georgia' }}>
                        {currentPlate.number}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {currentPlate.options.map(opt => (
                    <Button key={opt} variant="outline" onClick={() => handleAnswer(opt)} className="text-2xl py-6 h-auto font-bold hover:bg-brand-50 hover:border-brand-200">
                        {opt}
                    </Button>
                ))}
            </div>
             <p className="text-sm text-slate-400 mt-4">Plate {index + 1} of {PLATES.length}</p>
        </div>
    );
};

const ContrastTestPhase: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    // 3 rounds of decreasing contrast
    const ROUNDS = [
        { opacity: 'opacity-40', answer: 0 },
        { opacity: 'opacity-10', answer: 2 },
        { opacity: 'opacity-[0.03]', answer: 1 }
    ];
    const [round, setRound] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    const handleSelect = (idx: number) => {
        const isCorrect = idx === ROUNDS[round].answer;
        const newCorrect = correctCount + (isCorrect ? 1 : 0);

        if (round < ROUNDS.length - 1) {
            setCorrectCount(newCorrect);
            setRound(round + 1);
        } else {
            onComplete(newCorrect / ROUNDS.length);
        }
    };

    return (
        <div className="text-center space-y-8 animate-in fade-in duration-500 w-full max-w-2xl">
            <div className="inline-block bg-brand-50 border border-brand-100 px-4 py-1.5 rounded-full text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
                Step: Contrast Check
            </div>
            <h2 className="text-3xl font-bold">Contrast Sensitivity</h2>
            <p className="text-slate-500 text-lg">Select the circle that contains a <strong>very faint letter</strong>.</p>
            
            <div className="flex justify-center gap-4 sm:gap-8 my-12">
                {[0, 1, 2].map(i => (
                    <button 
                        key={i}
                        onClick={() => handleSelect(i)}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-50 hover:bg-slate-100 transition-all flex items-center justify-center border-2 border-slate-200 hover:border-brand-300 shadow-sm active:scale-95"
                    >
                        {i === ROUNDS[round].answer && (
                            <span className={`text-5xl sm:text-6xl font-sans font-bold text-black ${ROUNDS[round].opacity} select-none`}>
                                C
                            </span>
                        )}
                    </button>
                ))}
            </div>
             <div className="flex items-center justify-center gap-2 text-yellow-700 bg-yellow-50 py-2 px-6 rounded-full inline-block text-sm font-bold">
                <Sun className="w-4 h-4" /> 
                <span>Round {round + 1} / {ROUNDS.length}</span>
             </div>
        </div>
    );
};

const AcuityTestPhase: React.FC<{ eye: string, onComplete: (score: number) => void }> = ({ eye, onComplete }) => {
   // Game Logic: Tumbling E - Increased Sizes
   const LEVELS = [300, 200, 130, 80, 35]; // Larger targets for better visibility
   const [levelIndex, setLevelIndex] = useState(0);
   const [orientation, setOrientation] = useState<'up'|'down'|'left'|'right'>('right');
   const [fails, setFails] = useState(0);
   const [flash, setFlash] = useState<'none' | 'correct' | 'wrong'>('none');

   // Randomize orientation on mount
   useEffect(() => {
       randomize();
       
       // Keyboard listener
       const handleKeyDown = (e: KeyboardEvent) => {
           if(e.key === "ArrowUp") handleInput('up');
           if(e.key === "ArrowDown") handleInput('down');
           if(e.key === "ArrowLeft") handleInput('left');
           if(e.key === "ArrowRight") handleInput('right');
       };
       window.addEventListener('keydown', handleKeyDown);
       return () => window.removeEventListener('keydown', handleKeyDown);
   }, []); // eslint-disable-line react-hooks/exhaustive-deps

   const randomize = () => {
       const dirs: any[] = ['up', 'down', 'left', 'right'];
       let next = dirs[Math.floor(Math.random() * dirs.length)];
       // Ensure rotation actually changes sometimes, or just pure random is fine
       setOrientation(next);
   };

   const handleInput = (dir: string) => {
       const isCorrect = dir === orientation;
       
       // Visual Feedback
       setFlash(isCorrect ? 'correct' : 'wrong');
       setTimeout(() => setFlash('none'), 300);

       if (isCorrect) {
           if (levelIndex < LEVELS.length - 1) {
               setTimeout(() => {
                   setLevelIndex(l => l + 1);
                   setFails(0); 
                   randomize();
               }, 300);
           } else {
               // Finished all levels perfectly
               setTimeout(() => onComplete(1.0), 300);
           }
       } else {
           const newFails = fails + 1;
           setFails(newFails);
           if (newFails >= 1) { 
               // Strict fail condition
               const score = levelIndex / LEVELS.length;
               setTimeout(() => onComplete(score), 300);
           }
       }
   };

   const rotateMap = {
       'up': '-90deg',
       'down': '90deg',
       'left': '180deg',
       'right': '0deg'
   };

   return (
      <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-lg">
         <div>
            <div className="inline-block bg-brand-50 border border-brand-100 px-4 py-1.5 rounded-full text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
                Step: {eye} Eye Acuity
            </div>
            <h2 className="text-3xl font-bold">Which way is the E open?</h2>
            <p className="text-slate-500 hidden md:block">
                Identify the direction of the open side. Use arrow keys or click buttons.
                <br /><span className="text-xs text-slate-400">Keep your head straight and device at arm's length.</span>
            </p>
         </div>
         
         {/* Increased container height to accommodate larger E */}
         <div className={`h-96 w-full md:w-[450px] mx-auto flex items-center justify-center bg-white rounded-3xl border-4 relative overflow-hidden transition-colors duration-300 shadow-inner ${
             flash === 'correct' ? 'border-green-500 bg-green-50' : 
             flash === 'wrong' ? 'border-red-500 bg-red-50' : 'border-slate-900'
         }`}>
             {/* The E - Using SVG for sharpness */}
             <div 
                style={{ 
                    width: `${LEVELS[levelIndex]}px`, 
                    height: `${LEVELS[levelIndex]}px`,
                    transform: `rotate(${rotateMap[orientation]})`,
                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                className="select-none text-slate-900"
             >
                 <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                     <path d="M0 0 H100 V20 H20 V40 H80 V60 H20 V80 H100 V100 H0 Z" />
                 </svg>
             </div>
             
             <div className="absolute top-4 right-4 text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                 Level {levelIndex + 1}/{LEVELS.length}
             </div>
         </div>

         {/* Directional Pad */}
         <div className="grid grid-cols-3 gap-3 max-w-[200px] mx-auto pt-4">
             <div />
             <Button variant="outline" onClick={() => handleInput('up')} className="h-16 w-16 rounded-2xl border-2 hover:border-brand-500 hover:bg-brand-50"><ArrowUp className="w-8 h-8" /></Button>
             <div />
             <Button variant="outline" onClick={() => handleInput('left')} className="h-16 w-16 rounded-2xl border-2 hover:border-brand-500 hover:bg-brand-50"><ArrowLeft className="w-8 h-8" /></Button>
             <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mt-2" /> {/* Center pivot visual */}
             <Button variant="outline" onClick={() => handleInput('right')} className="h-16 w-16 rounded-2xl border-2 hover:border-brand-500 hover:bg-brand-50"><ArrowRight className="w-8 h-8" /></Button>
             <div />
             <Button variant="outline" onClick={() => handleInput('down')} className="h-16 w-16 rounded-2xl border-2 hover:border-brand-500 hover:bg-brand-50"><ArrowDown className="w-8 h-8" /></Button>
             <div />
         </div>
      </div>
   );
};