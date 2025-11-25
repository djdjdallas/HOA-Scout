import React, { useState, useEffect } from 'react';
import { Home, Search, FileText, Users, DollarSign, MapPin, CheckCircle, Loader2 } from 'lucide-react';

interface LoadingStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // milliseconds
  status: 'pending' | 'loading' | 'complete' | 'error';
}

const LoadingScreen = ({ hoaName = "Willowbrook HOA" }: { hoaName?: string }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<LoadingStep[]>([
    {
      id: 'search',
      label: 'Searching public records',
      description: 'Accessing county and state databases',
      icon: <Search className="h-5 w-5" />,
      duration: 3000,
      status: 'loading'
    },
    {
      id: 'financial',
      label: 'Analyzing financials',
      description: 'Reviewing budgets and reserve funds',
      icon: <DollarSign className="h-5 w-5" />,
      duration: 4000,
      status: 'pending'
    },
    {
      id: 'documents',
      label: 'Reading HOA documents',
      description: 'Extracting rules and restrictions',
      icon: <FileText className="h-5 w-5" />,
      duration: 3500,
      status: 'pending'
    },
    {
      id: 'community',
      label: 'Gathering community feedback',
      description: 'Analyzing reviews and resident sentiment',
      icon: <Users className="h-5 w-5" />,
      duration: 3000,
      status: 'pending'
    },
    {
      id: 'neighborhood',
      label: 'Getting neighborhood context',
      description: 'Fetching local amenities from Yelp',
      icon: <MapPin className="h-5 w-5" />,
      duration: 2500,
      status: 'pending'
    }
  ]);

  const [tipIndex, setTipIndex] = useState(0);
  const tips = [
    "25% of HOAs have hidden special assessments",
    "The average HOA fee in the US is $250/month",
    "Well-funded reserves prevent surprise costs",
    "HOA boards must hold regular public meetings",
    "You can request 3 years of financial records"
  ];

  // Simulate step progression
  useEffect(() => {
    if (currentStepIndex >= steps.length) return;

    const currentStep = steps[currentStepIndex];

    // Mark current step as loading
    setSteps(prev => prev.map((step, index) => {
      if (index === currentStepIndex) return { ...step, status: 'loading' };
      return step;
    }));

    // Complete current step and move to next
    const timer = setTimeout(() => {
      setSteps(prev => prev.map((step, index) => {
        if (index === currentStepIndex) return { ...step, status: 'complete' };
        if (index === currentStepIndex + 1) return { ...step, status: 'loading' };
        return step;
      }));
      setCurrentStepIndex(prev => prev + 1);
    }, currentStep.duration);

    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  // Rotate tips
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(tipTimer);
  }, []);

  const completedPercentage = Math.round(((steps.filter(s => s.status === 'complete').length) / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">HOA Scout</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* HOA Name and Progress */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analyzing {hoaName}
            </h1>
            <p className="text-gray-600 mb-6">
              This usually takes about 30 seconds
            </p>

            {/* Overall Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{completedPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completedPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Steps Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 ${
                    step.status === 'loading' ? 'bg-blue-50 border-2 border-blue-200' :
                    step.status === 'complete' ? 'bg-green-50 border-2 border-green-200' :
                    'bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  {/* Step Icon/Status */}
                  <div className="flex-shrink-0 mt-1">
                    {step.status === 'complete' ? (
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    ) : step.status === 'loading' ? (
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        {React.cloneElement(step.icon as React.ReactElement, {
                          className: "h-5 w-5 text-gray-600"
                        })}
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      step.status === 'loading' ? 'text-blue-900' :
                      step.status === 'complete' ? 'text-green-900' :
                      'text-gray-500'
                    }`}>
                      {step.label}
                      {step.status === 'loading' && (
                        <span className="ml-2 text-sm font-normal text-blue-600 animate-pulse">
                          Processing...
                        </span>
                      )}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      step.status === 'pending' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">💡</span>
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Did you know?
                </h4>
                <p className="text-sm text-blue-800 transition-opacity duration-500">
                  {tips[tipIndex]}
                </p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>After analysis completes, you'll receive:</p>
            <div className="flex justify-center items-center space-x-6 mt-3">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Overall score
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Red/Yellow/Green flags
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Action items
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;