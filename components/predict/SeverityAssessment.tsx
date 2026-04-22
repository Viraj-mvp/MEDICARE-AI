import { motion } from 'framer-motion';
import { symptoms } from '@/data/symptoms';

interface SeverityAssessmentProps {
    selectedSymptoms: { id?: string; name: string }[]; // Updated to accept our symptom objects
    severities: Record<string, number>;
    onSeverityChange: (symptomId: string, severity: number) => void;
}

export const SeverityAssessment = ({ selectedSymptoms, severities, onSeverityChange }: SeverityAssessmentProps) => {
    // Helper to find full symptom data including icons/descriptions
    const getFullSymptomData = (symptomName: string) => {
        return symptoms.find(s => s.name === symptomName) || {
            id: symptomName,
            name: symptomName,
            description: 'Custom symptom',
            icon: '🏥'
        };
    };

    const getSeverityLabel = (severity: number): string => {
        const labels = ['Mild', 'Slight', 'Moderate', 'Significant', 'Severe'];
        return labels[severity - 1] || 'Moderate';
    };

    const getSeverityColor = (severity: number): string => {
        if (severity <= 2) return 'bg-emerald-500';
        if (severity === 3) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-display font-semibold mb-2">
                    Rate Your Symptom Severity
                </h3>
                <p className="text-muted-foreground">
                    Help us better understand your condition by rating how severe each symptom feels
                </p>
            </div>

            <div className="space-y-4">
                {selectedSymptoms.map((symptomItem, index) => {
                    // Use name as ID if ID is missing (backward compatibility)
                    const symptomId = symptomItem.id || symptomItem.name;
                    const symptomData = getFullSymptomData(symptomItem.name);
                    const severity = severities[symptomId] || 3;

                    return (
                        <div
                            key={symptomId}
                            className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm animate-in slide-in-from-right duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-3xl">{symptomData.icon}</span>
                                <div>
                                    <h4 className="font-semibold text-lg">{symptomData.name}</h4>
                                    <p className="text-sm text-muted-foreground">{symptomData.description}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Severity Level</span>
                                    <span className={`text-sm font-semibold ${severity <= 2 ? 'text-emerald-500' : severity === 3 ? 'text-yellow-500' : 'text-red-500'
                                        }`}>
                                        {getSeverityLabel(severity)}
                                    </span>
                                </div>

                                {/* Custom Slider */}
                                <div className="relative h-6 flex items-center">
                                    <input
                                        type="range"
                                        min={1}
                                        max={5}
                                        step={1}
                                        value={severity}
                                        onChange={e => onSeverityChange(symptomId, parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-medical-blue"
                                        style={{
                                            background: `linear-gradient(to right, 
                            ${severity <= 2 ? '#10b981' : severity === 3 ? '#eab308' : '#ef4444'} 0%, 
                            ${severity <= 2 ? '#10b981' : severity === 3 ? '#eab308' : '#ef4444'} ${(severity - 1) * 25}%, 
                            #374151 ${(severity - 1) * 25}%, 
                            #374151 100%)`
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>Mild</span>
                                    <span>Moderate</span>
                                    <span>Severe</span>
                                </div>

                                {/* Severity Indicator Dots */}
                                <div className="flex justify-center gap-3 mt-4">
                                    {[1, 2, 3, 4, 5].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => onSeverityChange(symptomId, level)}
                                            type="button"
                                            className={`w-4 h-4 rounded-full transition-all duration-300 ${level <= severity
                                                    ? getSeverityColor(level)
                                                    : 'bg-gray-700'
                                                } ${level === severity ? 'scale-125 ring-2 ring-offset-2 ring-offset-black ring-white' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
