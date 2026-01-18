import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
}

const stepTitles = [
  'Account',
  'Vehicle Info',
  'Documents',
  'Permissions',
  'Consent'
];

export default function ProgressIndicator({ currentStep, completedSteps, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={stepNumber} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                isCompleted 
                  ? 'bg-green-600 text-white' 
                  : isCurrent 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-600 text-gray-300'
              }`}>
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              <span className={`text-xs text-center ${
                isCurrent ? 'text-orange-400' : 'text-gray-400'
              }`}>
                {stepTitles[i]}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(completedSteps.length / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}