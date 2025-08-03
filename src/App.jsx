import React, { useState } from 'react';
import { Heart, Activity, User, FlaskConical, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';

function App() {
  const [formData, setFormData] = useState({
    age: 65,
    anaemia: false,
    creatinine_phosphokinase: 582,
    diabetes: false,
    ejection_fraction: 38,
    high_blood_pressure: false,
    platelets: 265000,
    serum_creatinine: 1.9,
    serum_sodium: 136,
    sex: true, // true for male, false for female  
    smoking: false,
    time: 4
  });

  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

  // Backend API URL - change this to your Flask server URL
  const API_BASE_URL = 'http://127.0.0.1:5000';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const callBackendAPI = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const processBackendResult = (backendResult, inputData) => {
    const deathProbability = backendResult.confidence / 100;
    const isHighRisk = backendResult.death_event === 1;
    
    // Convert backend result to our frontend format
    let risk_category;
    let recommendations;
    let risk_score = backendResult.confidence;

    // Determine risk category based on death event prediction and confidence
    if (isHighRisk) {
      if (deathProbability > 0.7) {
        risk_category = 'Critical';
        recommendations = [
          'Emergency medical evaluation needed',
          'Consider ICU admission', 
          'Aggressive treatment protocol',
          'Daily monitoring essential',
          'Advanced heart failure team consultation'
        ];
      } else {
        risk_category = 'High';
        recommendations = [
          'Immediate medical attention required',
          'Consider hospitalization',
          'Optimize heart failure medications', 
          'Weekly monitoring recommended',
          'Cardiology consultation needed'
        ];
      }
    } else {
      if (deathProbability < 0.3) {
        risk_category = 'Low';
        recommendations = [
          'Continue regular monitoring',
          'Maintain healthy lifestyle',
          'Follow up in 6 months',
          'Focus on preventive care'
        ];
      } else {
        risk_category = 'Moderate';
        recommendations = [
          'Increase monitoring frequency',
          'Consider lifestyle modifications',
          'Follow up in 3 months',
          'Monitor blood pressure regularly',
          'Optimize medication adherence'
        ];
      }
    }

    // Generate feature importance based on clinical knowledge
    let top_features = [];
    
    if (inputData.ejection_fraction < 40) {
      top_features.push({ feature: 'Ejection Fraction', importance: 85 });
    }
    if (inputData.serum_creatinine > 1.4) {
      top_features.push({ feature: 'Serum Creatinine', importance: 72 });
    }
    if (inputData.age > 65) {
      top_features.push({ feature: 'Age', importance: 68 });
    }
    if (inputData.anaemia) {
      top_features.push({ feature: 'Anaemia', importance: 65 });
    }
    if (inputData.time < 30) {
      top_features.push({ feature: 'Follow-up Time', importance: 60 });
    }

    // Sort and take top 3
    top_features = top_features.sort((a, b) => b.importance - a.importance).slice(0, 3);

    return {
      risk_score: Math.round(risk_score),
      risk_category,
      confidence: Math.round(backendResult.confidence),
      recommendations,
      top_features,
      death_event: backendResult.death_event
    };
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setShowResults(false);
    setError(null);
    
    try {
      // Call the backend API
      const backendResult = await callBackendAPI(formData);
      
      // Process the result to match our frontend format
      const processedResult = processBackendResult(backendResult, formData);
      
      setPrediction(processedResult);
      setShowResults(true);
    } catch (err) {
      setError(`Failed to get prediction: ${err.message}`);
      console.error('Prediction failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (category) => {
    switch (category) {
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Heart Failure Risk Predictor</h1>
              <p className="text-gray-600 mt-1">Machine Learning-Powered Clinical Decision Support</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Calculator className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Patient Data Input</h2>
              </div>

              <div className="space-y-8">
                {/* Demographic Information */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">Demographic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age (years)
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="120"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sex
                      </label>
                      <select
                        value={formData.sex ? 'male' : 'female'}
                        onChange={(e) => handleInputChange('sex', e.target.value === 'male')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Clinical Parameters */}
                <div className="border-l-4 border-teal-500 pl-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Activity className="h-5 w-5 text-teal-600" />
                    <h3 className="text-lg font-medium text-gray-900">Clinical Parameters</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ejection Fraction (%)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="80"
                        value={formData.ejection_fraction}
                        onChange={(e) => handleInputChange('ejection_fraction', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Follow-up Time (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Boolean Clinical Parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {[
                      { key: 'anaemia', label: 'Anaemia' },
                      { key: 'diabetes', label: 'Diabetes' },
                      { key: 'high_blood_pressure', label: 'High Blood Pressure' },
                      { key: 'smoking', label: 'Smoking' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={key}
                          checked={formData[key]}
                          onChange={(e) => handleInputChange(key, e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor={key} className="text-sm font-medium text-gray-700">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Laboratory Values */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <FlaskConical className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-medium text-gray-900">Laboratory Values</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Creatinine Phosphokinase (mcg/L)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.creatinine_phosphokinase}
                        onChange={(e) => handleInputChange('creatinine_phosphokinase', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platelets (kiloplatelets/mL)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.platelets}
                        onChange={(e) => handleInputChange('platelets', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Serum Creatinine (mg/dL)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.serum_creatinine}
                        onChange={(e) => handleInputChange('serum_creatinine', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Serum Sodium (mEq/L)
                      </label>
                      <input
                        type="number"
                        min="120"
                        max="160"
                        value={formData.serum_sodium}
                        onChange={(e) => handleInputChange('serum_sodium', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="h-5 w-5" />
                      <span>Predict Heart Failure Risk</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Prediction Results</h2>
              
              {!showResults && !isLoading && !error && (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Enter patient data and click predict to see results</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Prediction Error</h3>
                      <p className="mt-2 text-sm text-red-700">{error}</p>
                      <p className="mt-2 text-xs text-red-600">
                        Make sure the Flask backend is running on {API_BASE_URL}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Connecting to ML model...</p>
                </div>
              )}

              {showResults && prediction && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Risk Score */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {prediction.risk_score}%
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(prediction.risk_category)}`}>
                      {prediction.risk_category === 'Low' ? <CheckCircle className="h-4 w-4 mr-1" /> : <AlertTriangle className="h-4 w-4 mr-1" />}
                      {prediction.risk_category} Risk
                    </div>
                  </div>

                  {/* Model Prediction */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Model Confidence</span>
                      <span className="text-sm font-bold text-gray-900">{prediction.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Death Event Prediction: {prediction.death_event === 1 ? 'Yes' : 'No'}
                    </p>
                  </div>

                  {/* Top Contributing Features */}
                  {prediction.top_features && prediction.top_features.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Risk Factors</h3>
                      <div className="space-y-2">
                        {prediction.top_features.map((feature, index) => (
                          <div key={index} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                            <span className="text-sm font-medium text-blue-900">{feature.feature}</span>
                            <span className="text-sm font-bold text-blue-700">{feature.importance}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical Recommendations</h3>
                    <ul className="space-y-2">
                      {prediction.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-xs text-yellow-800">
                      <strong>Disclaimer:</strong> This ML prediction is for educational purposes only and should not replace professional medical advice. Always consult with a healthcare professional for medical decisions.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;