
// Logic for mapping test results to diopter estimations
// NOTE: This is a simulation for the purpose of the web application. 

export interface EyeTestResult {
    eye: 'left' | 'right';
    acuityScore: number; // 0 to 1 (1 being 20/20)
    astigmatismDetected: boolean;
    colorVisionScore: number;
    nearVisionScore?: boolean;
    contrastScore?: number;
}

export interface AdvancedVisionProfile {
    leftEye: VisionEstimation;
    rightEye: VisionEstimation;
    dominance: 'left' | 'right' | 'none';
    binocularFunction: 'normal' | 'suppression' | 'diplopia' | 'untested';
    colorVision: 'normal' | 'protan' | 'deutan' | 'unknown';
    contrastSensitivity: 'high' | 'normal' | 'low';
    symptoms: string[];
    testDuration: number;
    systemConfidence: number;
}

export interface VisionEstimation {
    sph: string;
    cyl: string;
    axis: string;
    acuity: string; // e.g., "20/40"
    confidence: number;
    status: 'Excellent' | 'Good' | 'Needs Attention' | 'Consult Doctor';
}

export const calculateEstimation = (result: EyeTestResult): VisionEstimation => {
    // AI Heuristic Logic based on clinical correlations
    let sph = "-0.00";
    let acuity = "20/20";
    let confidence = 95;
    let status: VisionEstimation['status'] = 'Excellent';

    if (result.acuityScore >= 0.95) {
        sph = "Plano";
        acuity = "20/20";
        status = 'Excellent';
    } else if (result.acuityScore >= 0.8) {
        sph = "-0.25 to -0.50";
        acuity = "20/25";
        status = 'Good';
    } else if (result.acuityScore >= 0.6) {
        sph = "-0.75 to -1.25";
        acuity = "20/40";
        confidence = 90;
        status = 'Needs Attention';
    } else if (result.acuityScore >= 0.4) {
        sph = "-1.50 to -2.00";
        acuity = "20/70";
        confidence = 85;
        status = 'Consult Doctor';
    } else {
        sph = "-2.25+";
        acuity = "20/100+";
        confidence = 80;
        status = 'Consult Doctor';
    }

    // Adjust based on astigmatism
    let cyl = "0.00";
    let axis = "---";
    
    if (result.astigmatismDetected) {
        cyl = "-0.50 to -1.00";
        axis = "180 ± 20"; // General estimation
        confidence -= 10;
        if(status === 'Excellent') status = 'Good';
    }

    return {
        sph,
        cyl,
        axis,
        acuity,
        confidence,
        status
    };
};

export const generateCertificateId = () => {
    const prefix = "OPTI-CLINICAL";
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${random}`;
};
