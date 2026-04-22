import { SymptomInput, PredictionResult } from '../db/schemas';

// Enriched disease-symptom mapping with specialist, remedies, and precautions
const DISEASE_DATABASE: Record<string, {
    symptoms: string[];
    severity: string;
    confidence: number;
    specialist: string;
    home_remedies: string[];
    precautions: string[];
    recommendations: string[];
    video_search_query: string;
}> = {
    'Common Cold': {
        symptoms: ['fever', 'cough', 'sore throat', 'runny nose', 'fatigue', 'headache', 'sneezing', 'congestion'],
        severity: 'mild',
        confidence: 75,
        specialist: 'General Practitioner',
        home_remedies: [
            'Drink warm honey-ginger tea to soothe throat',
            'Steam inhalation with eucalyptus oil for congestion',
            'Gargle with warm salt water twice a day',
            'Stay hydrated with warm soups and fluids',
        ],
        precautions: [
            'Avoid cold drinks and ice cream',
            'Wash hands frequently to prevent spreading',
            'Rest and avoid overexertion',
        ],
        recommendations: [
            'Rest and stay hydrated',
            'Take OTC decongestants or antihistamines if needed',
            'Consult a doctor if symptoms worsen after 7 days',
        ],
        video_search_query: 'home remedies common cold fast relief',
    },
    'Influenza (Flu)': {
        symptoms: ['high fever', 'body aches', 'fatigue', 'cough', 'headache', 'chills', 'muscle pain'],
        severity: 'moderate',
        confidence: 80,
        specialist: 'General Practitioner',
        home_remedies: [
            'Rest in a warm, comfortable environment',
            'Drink warm fluids — broth, herbal teas, warm water',
            'Use a cool damp cloth on your forehead for fever',
            'Inhale steam to relieve nasal congestion',
        ],
        precautions: [
            'Isolate yourself to prevent spreading',
            'Avoid going to work or school while symptomatic',
            'Monitor temperature regularly',
        ],
        recommendations: [
            'Antiviral medications (e.g., Oseltamivir) if prescribed within 48 hours',
            'Paracetamol for fever and body aches',
            'Seek emergency care if difficulty breathing develops',
        ],
        video_search_query: 'influenza flu recovery at home remedies',
    },
    'COVID-19': {
        symptoms: ['fever', 'dry cough', 'fatigue', 'loss of taste', 'loss of smell', 'shortness of breath', 'body pain'],
        severity: 'moderate-severe',
        confidence: 78,
        specialist: 'Infectious Disease Specialist',
        home_remedies: [
            'Steam inhalation for 10 minutes twice a day',
            'Kadha (herbal decoction with tulsi, ginger, black pepper)',
            'Turmeric milk at night to boost immunity',
            'Pranayama breathing exercises for lung health',
        ],
        precautions: [
            'Isolate immediately and inform close contacts',
            'Monitor oxygen levels with a pulse oximeter',
            'Wear a mask even at home around others',
        ],
        recommendations: [
            'Get tested (RT-PCR or Rapid Antigen Test)',
            'Monitor oxygen saturation — below 94% requires emergency care',
            'Follow government protocol for treatment',
        ],
        video_search_query: 'COVID-19 home isolation care tips 2024',
    },
    'Migraine': {
        symptoms: ['severe headache', 'nausea', 'sensitivity to light', 'sensitivity to sound', 'visual disturbances', 'pulsating pain', 'vomiting'],
        severity: 'moderate',
        confidence: 82,
        specialist: 'Neurologist',
        home_remedies: [
            'Apply cold or warm compress to your forehead',
            'Rest in a quiet, dark room',
            'Drink peppermint or ginger tea',
            'Gentle scalp/temple massage with peppermint oil',
        ],
        precautions: [
            'Identify and avoid personal triggers (stress, bright lights, certain foods)',
            'Maintain a regular sleep schedule',
            'Stay well hydrated throughout the day',
        ],
        recommendations: [
            'Take prescribed triptans or NSAIDs at onset',
            'Keep a migraine diary to identify triggers',
            'Consult a neurologist for frequent attacks (>4/month)',
        ],
        video_search_query: 'migraine relief home remedies pressure points',
    },
    'Gastroenteritis': {
        symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'fever', 'dehydration', 'stomach cramps'],
        severity: 'moderate',
        confidence: 77,
        specialist: 'Gastroenterologist',
        home_remedies: [
            'ORS (Oral Rehydration Solution) — mix salt, sugar, water',
            'Eat the BRAT diet: bananas, rice, applesauce, toast',
            'Ginger tea to ease nausea and stomach pain',
            'Coconut water to restore electrolytes',
        ],
        precautions: [
            'Avoid dairy, fatty foods, and alcohol until recovered',
            'Wash hands frequently, especially before eating',
            'Avoid solid food for the first few hours if vomiting',
        ],
        recommendations: [
            'Monitor for signs of dehydration (sunken eyes, dry mouth)',
            'Seek care immediately if blood in stool or fever > 39°C',
            'Probiotics may help speed recovery',
        ],
        video_search_query: 'gastroenteritis stomach flu treatment home remedies',
    },
    'Hypertension': {
        symptoms: ['headache', 'dizziness', 'chest pain', 'shortness of breath', 'nosebleeds', 'fatigue', 'blurred vision'],
        severity: 'moderate-severe',
        confidence: 70,
        specialist: 'Cardiologist',
        home_remedies: [
            'Reduce sodium intake: use herbs instead of salt',
            'Eat foods rich in potassium: bananas, spinach',
            'Practice deep breathing and meditation daily',
            'Regular walking for 30 minutes most days',
        ],
        precautions: [
            'Avoid tobacco and limit alcohol consumption',
            'Monitor blood pressure at home regularly',
            'Reduce stress through yoga or mindfulness',
        ],
        recommendations: [
            'Start antihypertensive medications if BP > 140/90 consistently',
            'DASH diet (rich in fruits, vegetables, low-fat dairy)',
            'Regular check-ups with a cardiologist',
        ],
        video_search_query: 'high blood pressure natural remedies lifestyle changes',
    },
    'Type 2 Diabetes': {
        symptoms: ['increased thirst', 'frequent urination', 'fatigue', 'blurred vision', 'slow healing wounds', 'tingling hands feet', 'weight loss'],
        severity: 'chronic',
        confidence: 75,
        specialist: 'Endocrinologist',
        home_remedies: [
            'Cinnamon water: boil cinnamon sticks, drink daily',
            'Bitter gourd (karela) juice on empty stomach',
            'Fenugreek seeds soaked overnight in water',
            'Regular exercise (brisk walking 30 min/day)',
        ],
        precautions: [
            'Avoid refined sugar, white rice, maida products',
            'Check blood sugar levels regularly',
            'Inspect feet daily for wounds or infections',
        ],
        recommendations: [
            'Start with lifestyle changes: diet and exercise',
            'Metformin or insulin if advised by a doctor',
            'Regular HbA1c tests every 3 months',
        ],
        video_search_query: 'type 2 diabetes home remedies blood sugar control',
    },
    'Asthma': {
        symptoms: ['shortness of breath', 'wheezing', 'chest tightness', 'cough', 'difficulty breathing', 'nocturnal cough'],
        severity: 'moderate',
        confidence: 80,
        specialist: 'Pulmonologist',
        home_remedies: [
            'Breathing exercises: pursed-lip breathing, diaphragm breathing',
            'Warm ginger tea with honey to open airways',
            'Keep home dust-free and well-ventilated',
            'Steam inhalation to loosen mucus',
        ],
        precautions: [
            'Identify and avoid triggers (dust, pollen, smoke, cold air)',
            'Always carry your rescue inhaler',
            'Avoid exercising in cold, dry air without warming up',
        ],
        recommendations: [
            'Use prescribed controller inhalers (ICS) daily',
            'Have a written asthma action plan',
            'Consult a pulmonologist for severe or uncontrolled asthma',
        ],
        video_search_query: 'asthma breathing exercises relief at home',
    },
    'Allergic Rhinitis': {
        symptoms: ['sneezing', 'runny nose', 'itchy eyes', 'nasal congestion', 'postnasal drip', 'watery eyes'],
        severity: 'mild',
        confidence: 78,
        specialist: 'ENT Specialist',
        home_remedies: [
            'Neti pot nasal rinse with saline solution',
            'Local honey may reduce seasonal allergy symptoms',
            'Steam inhalation with eucalyptus for congestion',
            'Keep windows closed during high pollen times',
        ],
        precautions: [
            'Avoid known allergens: pollen, dust, pet dander',
            'Keep bedding clean and wash weekly in hot water',
            'Use HEPA air purifiers indoors',
        ],
        recommendations: [
            'Antihistamines (cetirizine, loratadine) for daily control',
            'Intranasal corticosteroids for persistent symptoms',
            'Allergy testing to identify triggers',
        ],
        video_search_query: 'allergic rhinitis home remedies nasal congestion relief',
    },
    'Anxiety Disorder': {
        symptoms: ['excessive worry', 'restlessness', 'fatigue', 'difficulty concentrating', 'sleep disturbances', 'palpitations', 'muscle tension'],
        severity: 'moderate',
        confidence: 72,
        specialist: 'Psychiatrist',
        home_remedies: [
            'Practise 4-7-8 breathing technique twice daily',
            'Regular physical exercise to reduce cortisol',
            'Chamomile or ashwagandha tea before bed',
            'Journaling to express and process thoughts',
        ],
        precautions: [
            'Limit caffeine and alcohol consumption',
            'Establish a consistent sleep routine',
            'Reduce screen time before bed',
        ],
        recommendations: [
            'Cognitive Behavioral Therapy (CBT) is highly effective',
            'SSRI medications if symptoms are severe',
            'Consult a mental health professional promptly',
        ],
        video_search_query: 'anxiety relief techniques breathing exercises mindfulness',
    },
    'Depression': {
        symptoms: ['persistent sadness', 'loss of interest', 'fatigue', 'sleep disturbances', 'appetite changes', 'hopelessness', 'difficulty concentrating'],
        severity: 'moderate-severe',
        confidence: 70,
        specialist: 'Psychiatrist',
        home_remedies: [
            'Sunlight exposure for 15–30 minutes each morning',
            'Regular aerobic exercise (proven antidepressant effect)',
            'Omega-3 rich foods: walnuts, flaxseed, fatty fish',
            'Mindfulness meditation practice',
        ],
        precautions: [
            'Avoid isolation — maintain social connections',
            'Avoid alcohol which worsens depression',
            'Inform a trusted person about your condition',
        ],
        recommendations: [
            'Seek professional psychotherapy immediately',
            'Antidepressants (SSRIs/SNRIs) as prescribed',
            'Do not stop medication abruptly without doctor advice',
        ],
        video_search_query: 'depression natural remedies exercise mood boost',
    },
    'Urinary Tract Infection': {
        symptoms: ['frequent urination', 'burning sensation', 'cloudy urine', 'pelvic pain', 'fever', 'back pain', 'strong smelling urine'],
        severity: 'moderate',
        confidence: 80,
        specialist: 'Urologist',
        home_remedies: [
            'Drink at least 8–10 glasses of water daily',
            'Unsweetened cranberry juice to prevent bacterial adhesion',
            'Warm compress on lower abdomen for pain relief',
            'Probiotics (yoghurt) to restore healthy bacteria',
        ],
        precautions: [
            'Urinate after sexual intercourse',
            'Wipe from front to back after using the toilet',
            'Avoid holding urine for longer than necessary',
        ],
        recommendations: [
            'Antibiotics prescribed by a doctor are necessary',
            'Urine culture to identify the bacteria',
            'Complete the full course of antibiotics',
        ],
        video_search_query: 'UTI home remedies urinary tract infection relief',
    },
    'Bronchitis': {
        symptoms: ['persistent cough', 'mucus production', 'chest discomfort', 'fatigue', 'shortness of breath', 'wheezing', 'low fever'],
        severity: 'moderate',
        confidence: 76,
        specialist: 'Pulmonologist',
        home_remedies: [
            'Hot ginger honey lemon tea to loosen mucus',
            'Steam inhalation with eucalyptus oil',
            'Turmeric milk to reduce inflammation',
            'Stay well hydrated to thin mucus secretions',
        ],
        precautions: [
            'Avoid smoking and second-hand smoke',
            'Wear a mask in dusty or polluted environments',
            'Use a humidifier to keep airways moist',
        ],
        recommendations: [
            'Bronchodilator inhalers for severe wheezing',
            'Antibiotics only if bacterial infection is confirmed',
            'See a doctor if cough lasts more than 3 weeks',
        ],
        video_search_query: 'bronchitis home remedies mucus relief chest congestion',
    },
    'Sinusitis': {
        symptoms: ['facial pain', 'nasal congestion', 'thick nasal discharge', 'headache', 'reduced smell', 'pressure around eyes', 'post nasal drip'],
        severity: 'mild-moderate',
        confidence: 77,
        specialist: 'ENT Specialist',
        home_remedies: [
            'Saline nasal irrigation with a neti pot',
            'Warm compress over face for sinus pressure relief',
            'Steam inhalation with peppermint or eucalyptus',
            'Stay well hydrated to reduce mucus thickness',
        ],
        precautions: [
            'Avoid swimming during sinusitis episodes',
            'Use a humidifier to avoid dry nasal passages',
            'Avoid known allergens and irritants',
        ],
        recommendations: [
            'Saline nasal sprays and decongestants for relief',
            'Antibiotics only if bacterial sinusitis is confirmed',
            'Consult ENT if symptoms persist beyond 12 weeks',
        ],
        video_search_query: 'sinusitis relief home remedies sinus pressure headache',
    },
    'Gastric Reflux (GERD)': {
        symptoms: ['heartburn', 'chest pain', 'difficulty swallowing', 'regurgitation', 'chronic cough', 'sour taste', 'bloating'],
        severity: 'mild-moderate',
        confidence: 79,
        specialist: 'Gastroenterologist',
        home_remedies: [
            'Drink aloe vera juice before meals',
            'Chew sugar-free gum after meals to neutralise acid',
            'Sleep with head of bed elevated 6–8 inches',
            'Apple cider vinegar diluted in water before meals',
        ],
        precautions: [
            'Avoid spicy, fatty, and acidic foods',
            'Do not lie down for 2–3 hours after eating',
            'Eat smaller, more frequent meals',
        ],
        recommendations: [
            'Antacids or H2 blockers for immediate relief',
            'Proton pump inhibitors for long-term management',
            'Endoscopy if symptoms persist or worsen',
        ],
        video_search_query: 'GERD acid reflux home remedies heartburn relief',
    },
};

export function ruleBasedPrediction(
    symptoms: SymptomInput[],
    age?: number,
    gender?: string
): PredictionResult {
    // Accept both static and custom for rule-based (custom matched by keyword)
    const allSymptoms = symptoms.filter(s => s.source === 'static' || s.source === 'custom');

    if (allSymptoms.length === 0) {
        return {
            primary_diagnosis: 'Insufficient data',
            confidence: 0,
            explanation: 'No symptoms provided for rule-based analysis. Please describe your symptoms.',
            recommendations: ['Visit a General Practitioner'],
            specialist: 'General Practitioner',
            home_remedies: [],
            precautions: ['Monitor your health carefully'],
            emergency_alert: false,
        };
    }

    const symptomNames = allSymptoms.map(s => s.name.toLowerCase());
    const symptomSeverities = allSymptoms.reduce((acc, s) => {
        acc[s.name.toLowerCase()] = s.severity;
        return acc;
    }, {} as Record<string, number>);

    // High severity emergency check
    const maxSeverity = Math.max(...allSymptoms.map(s => s.severity || 0));
    const hasEmergencySymptoms = symptomNames.some(s =>
        ['chest pain', 'shortness of breath', 'difficulty breathing', 'stroke', 'unconscious', 'seizure', 'severe bleeding'].some(e => s.includes(e))
    );

    // Score diseases
    const diseaseScores: Array<{ disease: string; score: number; matchCount: number }> = [];

    for (const [disease, data] of Object.entries(DISEASE_DATABASE)) {
        let matchCount = 0;
        let totalSeverity = 0;

        for (const symptom of symptomNames) {
            if (data.symptoms.some(ds => ds.toLowerCase().includes(symptom) || symptom.includes(ds.toLowerCase()))) {
                matchCount++;
                totalSeverity += symptomSeverities[symptom] || 3;
            }
        }

        if (matchCount > 0) {
            const matchRatio = matchCount / symptomNames.length;
            const severityFactor = totalSeverity / (matchCount * 5);
            const score = matchRatio * data.confidence * (0.7 + severityFactor * 0.3);
            diseaseScores.push({ disease, score, matchCount });
        }
    }

    diseaseScores.sort((a, b) => b.score - a.score);

    if (diseaseScores.length === 0) {
        return {
            primary_diagnosis: 'Unknown condition',
            confidence: 0,
            explanation: 'The provided symptoms do not match known conditions in our database. Please consult a healthcare professional.',
            recommendations: ['Visit a General Practitioner or specialist'],
            specialist: 'General Practitioner',
            home_remedies: ['Rest, hydrate, and monitor symptoms'],
            precautions: ['Do not self-medicate without medical advice'],
            emergency_alert: maxSeverity >= 8 || hasEmergencySymptoms,
        };
    }

    const topDisease = diseaseScores[0];
    if (!topDisease) throw new Error("Unexpected error: empty diseaseScores");
    const topData = DISEASE_DATABASE[topDisease.disease];
    if (!topData) throw new Error("Unexpected error: missing topData");
    const alternatives = diseaseScores.slice(1, 4).map(d => d.disease);
    const confidence = Math.min(Math.round(topDisease.score), 85);

    const explanation =
        `Based on ${topDisease.matchCount} matching symptom${topDisease.matchCount > 1 ? 's' : ''} out of ${symptomNames.length} provided, ` +
        `${topDisease.disease} shows the highest correlation with your reported symptoms. ` +
        `${age ? `Age (${age} years) ` : ''}${gender ? `and gender (${gender}) ` : ''}were considered. ` +
        `This is a rule-based assessment — AI services may be temporarily unavailable. Please consult a doctor for confirmation.`;

    return {
        primary_diagnosis: topDisease.disease,
        confidence,
        alternatives,
        explanation,
        specialist: topData.specialist,
        recommendations: topData.recommendations,
        home_remedies: topData.home_remedies,
        precautions: topData.precautions,
        video_search_query: topData.video_search_query,
        emergency_alert: maxSeverity >= 8 || hasEmergencySymptoms,
    };
}
