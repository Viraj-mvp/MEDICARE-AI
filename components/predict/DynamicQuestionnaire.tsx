import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DynamicQuestionnaireProps {
    selectedSymptoms: string[]; // receiving IDs or names? Code uses IDs like 'headache'
    answers: Record<string, string>;
    onAnswerChange: (questionId: string, answer: string) => void;
}

interface Question {
    id: string;
    question: string;
    type: 'select' | 'text' | 'number';
    options?: string[];
    symptomBased?: boolean;
}

export function DynamicQuestionnaire({ selectedSymptoms, answers, onAnswerChange }: DynamicQuestionnaireProps) {

    const generateQuestions = useMemo((): Question[] => {
        const questions: Question[] = [];

        // Generic questions
        questions.push({
            id: 'onset_time',
            question: 'When did you first notice these symptoms?',
            type: 'select',
            options: ['Within the last 24 hours', '2-3 days ago', '1-2 weeks ago', 'More than 2 weeks ago', 'Months ago']
        });

        questions.push({
            id: 'duration',
            question: 'How long do the symptoms typically last?',
            type: 'select',
            options: ['A few minutes', 'A few hours', 'All day', 'Constant/Never stops', 'Comes and goes']
        });

        questions.push({
            id: 'triggers',
            question: 'Have you identified any triggers that worsen your symptoms?',
            type: 'text'
        });

        questions.push({
            id: 'alleviating_factors',
            question: 'Is there anything that helps relieve your symptoms?',
            type: 'text'
        });

        // Symptom-specific questions (using toLowerCase to be safe)
        const normalizedSymptoms = selectedSymptoms.map(s => s.toLowerCase());

        if (normalizedSymptoms.includes('headache') || normalizedSymptoms.includes('migraine')) {
            questions.push({
                id: 'headache_location',
                question: 'Where is the pain located?',
                type: 'select',
                options: ['Front of head', 'Back of head', 'One side', 'Both sides', 'Behind eyes', 'Entire head'],
                symptomBased: true
            });
            questions.push({
                id: 'headache_type',
                question: 'How would you describe the pain?',
                type: 'select',
                options: ['Throbbing/Pulsing', 'Dull/Aching', 'Sharp/Stabbing', 'Pressure/Squeezing', 'Burning'],
                symptomBased: true
            });
        }

        if (normalizedSymptoms.includes('fever') || normalizedSymptoms.includes('chills')) {
            questions.push({
                id: 'temperature',
                question: 'What is your current temperature (if known)?',
                type: 'select',
                options: ['Below 99°F (37.2°C)', '99-100°F (37.2-37.8°C)', '100-102°F (37.8-38.9°C)', 'Above 102°F (38.9°C)', 'Unknown'],
                symptomBased: true
            });
        }

        if (normalizedSymptoms.includes('cough') || normalizedSymptoms.includes('sore_throat')) {
            questions.push({
                id: 'cough_type',
                question: 'What type of cough do you have?',
                type: 'select',
                options: ['Dry cough', 'Productive (with mucus)', 'Wheezing cough', 'Barking cough'],
                symptomBased: true
            });
        }

        if (normalizedSymptoms.includes('abdominal_pain') || normalizedSymptoms.includes('nausea')) {
            questions.push({
                id: 'pain_location_stomach',
                question: 'Where is the abdominal pain located?',
                type: 'select',
                options: ['Upper right', 'Upper left', 'Lower right', 'Lower left', 'Center/Around navel', 'General/All over'],
                symptomBased: true
            });
        }

        if (normalizedSymptoms.includes('chest_pain') || normalizedSymptoms.includes('palpitations')) {
            questions.push({
                id: 'chest_pain_onset',
                question: 'Does the chest pain occur during physical activity?',
                type: 'select',
                options: ['Only during activity', 'At rest too', 'Only at rest', 'Random/Unpredictable'],
                symptomBased: true
            });
        }

        if (normalizedSymptoms.includes('joint_pain') || normalizedSymptoms.includes('muscle_pain')) {
            questions.push({
                id: 'pain_joints',
                question: 'Which joints or muscles are affected?',
                type: 'text',
                symptomBased: true
            });
            questions.push({
                id: 'morning_stiffness',
                question: 'Do you experience morning stiffness?',
                type: 'select',
                options: ['No', 'Yes, less than 30 minutes', 'Yes, 30-60 minutes', 'Yes, more than 1 hour'],
                symptomBased: true
            });
        }

        if (normalizedSymptoms.includes('anxiety') || normalizedSymptoms.includes('depression') || normalizedSymptoms.includes('insomnia')) {
            questions.push({
                id: 'stress_level',
                question: 'How would you rate your current stress level?',
                type: 'select',
                options: ['Very low', 'Low', 'Moderate', 'High', 'Very high'],
                symptomBased: true
            });
            questions.push({
                id: 'sleep_quality',
                question: 'How many hours of sleep do you typically get?',
                type: 'select',
                options: ['Less than 4 hours', '4-5 hours', '5-6 hours', '6-7 hours', '7-8 hours', 'More than 8 hours'],
                symptomBased: true
            });
        }

        // Additional contextual questions
        questions.push({
            id: 'medications',
            question: 'Are you currently taking any medications?',
            type: 'text'
        });

        questions.push({
            id: 'medical_history',
            question: 'Do you have any pre-existing medical conditions?',
            type: 'text'
        });

        return questions;
    }, [selectedSymptoms]);

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                    Detailed Assessment
                </h3>
                <p className="text-sm text-muted-foreground p-2">
                    Please answer these questions to help our AI provide a more accurate analysis.
                </p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {generateQuestions.map((question, index) => (
                    <div
                        key={question.id}
                        className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10"
                    >
                        <label className="block mb-3">
                            <span className="font-medium text-lg block mb-1">
                                {question.question}
                            </span>
                            {question.symptomBased && (
                                <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-medical-blue/20 text-medical-blue border border-medical-blue/30">
                                    Based on your symptoms
                                </span>
                            )}
                        </label>

                        {question.type === 'select' && question.options && (
                            <select
                                value={answers[question.id] || ''}
                                onChange={e => onAnswerChange(question.id, e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-medical-blue transition-colors"
                                style={{ colorScheme: 'dark' }}
                            >
                                <option value="" className='text-gray-500'>Select an option...</option>
                                {question.options.map(option => (
                                    <option key={option} value={option} className="bg-gray-900">
                                        {option}
                                    </option>
                                ))}
                            </select>
                        )}

                        {question.type === 'text' && (
                            <input
                                type="text"
                                value={answers[question.id] || ''}
                                onChange={e => onAnswerChange(question.id, e.target.value)}
                                placeholder="Type your answer..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-medical-blue transition-colors placeholder:text-white/20"
                            />
                        )}

                        {question.type === 'number' && (
                            <input
                                type="number"
                                value={answers[question.id] || ''}
                                onChange={e => onAnswerChange(question.id, e.target.value)}
                                placeholder="Enter a number..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-medical-blue transition-colors placeholder:text-white/20"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
