// Logic for mapping test results to diopter estimations
// NOTE: This is a simulation for the purpose of the web application. 
// Real refraction requires hardware.

export interface EyeTestResult {
    eye: 'left' | 'right';
    acuityScore: number; // 0 to 1 (1 being 20/20)
    astigmatismDetected: boolean;
    colorVisionScore: number;
}

export interface VisionEstimation {
    sph: string;
    cyl: string;
    axis: string;
    acuity: string; // e.g., "20/40"
    confidence: number;
}

export const calculateEstimation = (result: EyeTestResult): VisionEstimation => {
    // AI Heuristic Logic based on clinical correlations
    // 20/20 = 0.00 to -0.25
    // 20/40 = -0.50 to -0.75
    // 20/60 = -1.00 to -1.50
    // 20/100 = -2.00+
    
    let sph = "-0.00";
    let acuity = "20/20";
    let confidence = 95;

    if (result.acuityScore >= 0.9) {
        sph = "-0.25 DS";
        acuity = "20/20";
    } else if (result.acuityScore >= 0.7) {
        sph = "-0.75 DS";
        acuity = "20/40";
        confidence = 90;
    } else if (result.acuityScore >= 0.5) {
        sph = "-1.50 DS";
        acuity = "20/70";
        confidence = 85;
    } else {
        sph = "-2.50 DS";
        acuity = "20/200";
        confidence = 80;
    }

    // Adjust based on astigmatism
    let cyl = "-0.00";
    let axis = "180";
    
    if (result.astigmatismDetected) {
        cyl = "-0.75";
        axis = "180 ± 20"; // General estimation
        // Astigmatism usually blurs overall acuity, so we might adjust SPH slightly
        confidence -= 5;
    }

    return {
        sph,
        cyl,
        axis,
        acuity,
        confidence
    };
};

export const generateCertificateId = () => {
    const prefix = "OPT";
    const date = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${date}-${random}`;
};