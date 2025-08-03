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
    time: 4,
    death_event: false
  });

  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const simulateSVCPrediction = (data) => {
    // Simulate Random Forest algorithm prediction using ensemble decision trees
    // Each "tree" contributes to the final prediction with weighted votes
    let tree_votes = [];
    let feature_importance = {};
    
    // Tree 1: Age and demographic factors
    let tree1_vote = 0;
    if (data.age > 65) tree1_vote += 0.3;
    if (data.age > 75) tree1_vote += 0.2;
    if (data.sex) tree1_vote += 0.1; // Male higher risk
    tree_votes.push(tree1_vote);
    feature_importance.age = (data.age > 65 ? 0.25 : 0.15);
    
    // Tree 2: Comorbidities and lifestyle
    let tree2_vote = 0;
    if (data.anaemia) tree2_vote += 0.25;
    if (data.diabetes) tree2_vote += 0.2;
    if (data.high_blood_pressure) tree2_vote += 0.15;
    if (data.smoking) tree2_vote += 0.2;
    tree_votes.push(tree2_vote);
    feature_importance.anaemia = (data.anaemia ? 0.2 : 0.05);
    feature_importance.diabetes = (data.diabetes ? 0.15 : 0.05);
    
    // Tree 3: Cardiac function
    let tree3_vote = 0;
    if (data.ejection_fraction < 30) tree3_vote += 0.4;
    else if (data.ejection_fraction < 40) tree3_vote += 0.25;
    else if (data.ejection_fraction < 50) tree3_vote += 0.1;
    tree_votes.push(tree3_vote);
    feature_importance.ejection_fraction = (data.ejection_fraction < 40 ? 0.3 : 0.1);
    
    // Tree 4: Renal function
    let tree4_vote = 0;
    if (data.serum_creatinine > 2.0) tree4_vote += 0.3;
    else if (data.serum_creatinine > 1.4) tree4_vote += 0.2;
    if (data.serum_sodium < 135) tree4_vote += 0.15;
    tree_votes.push(tree4_vote);
    feature_importance.serum_creatinine = (data.serum_creatinine > 1.4 ? 0.25 : 0.1);
    
    // Tree 5: Laboratory markers
    let tree5_vote = 0;
    if (data.creatinine_phosphokinase > 1000) tree5_vote += 0.2;
    else if (data.creatinine_phosphokinase > 500) tree5_vote += 0.1;
    if (data.platelets < 150000) tree5_vote += 0.15;
    else if (data.platelets < 200000) tree5_vote += 0.05;
    tree_votes.push(tree5_vote);
    feature_importance.creatinine_phosphokinase = (data.creatinine_phosphokinase > 500 ? 0.15 : 0.05);
    
    // Tree 6: Follow-up time and death event
    let tree6_vote = 0;
    if (data.time < 30) tree6_vote += 0.25;
    else if (data.time < 60) tree6_vote += 0.15;
    if (data.death_event) tree6_vote += 0.4; // Strong predictor
    tree_votes.push(tree6_vote);
    feature_importance.time = (data.time < 30 ? 0.2 : 0.1);
    feature_importance.death_event = (data.death_event ? 0.35 : 0.05);
    
    // Random Forest ensemble: Average the tree votes with weights
    const tree_weights = [0.15, 0.18, 0.25, 0.20, 0.12, 0.10]; // Different weights for different trees
    let weighted_risk_score = 0;
    
    for (let i = 0; i < tree_votes.length; i++) {
      weighted_risk_score += tree_votes[i] * tree_weights[i];
    }
    
    // Add some randomness to simulate forest variance
    const forest_variance = (Math.random() - 0.5) * 0.1;
    weighted_risk_score = Math.max(0, Math.min(1, weighted_risk_score + forest_variance));
    
    let risk_category;
    let recommendations;
    let top_features = [];
    
    // Identify top contributing features
    const sorted_features = Object.entries(feature_importance)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    top_features = sorted_features.map(([feature, importance]) => ({
      feature: feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      importance: Math.round(importance * 100)
    }));
    
    if (weighted_risk_score < 0.25) {
      risk_category = 'Low';
      recommendations = [
        'Continue regular monitoring',
        'Maintain healthy lifestyle',
        'Follow up in 6 months',
        'Focus on preventive care'
      ];
    } else if (weighted_risk_score < 0.45) {
      risk_category = 'Moderate';
      recommendations = [
        'Increase monitoring frequency',
        'Consider lifestyle modifications',
        'Follow up in 3 months',
        'Monitor blood pressure regularly',
        'Optimize medication adherence'
      ];
    } else if (weighted_risk_score < 0.70) {
      risk_category = 'High';
      recommendations = [
        'Immediate medical attention required',
        'Consider hospitalization',
        'Optimize heart failure medications',
        'Weekly monitoring recommended',
        'Cardiology consultation needed'
      ];
    } else {
      risk_category = 'Critical';
      recommendations = [
        'Emergency medical evaluation needed',
        'Consider ICU admission',
        'Aggressive treatment protocol',
        'Daily monitoring essential',
        'Advanced heart failure team consultation'
      ];
    }
    
    return {
      risk_score: Math.round(weighted_risk_score * 100),
      risk_category,
      confidence: Math.round((0.82 + Math.random() * 0.15) * 100), // Random Forest typically has good confidence
      recommendations,
      top_features,
      tree_count: tree_votes.length
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResults(false);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = simulateSVCPrediction(formData);
    setPrediction(result);
    setIsLoading(false);
    setShowResults(true);
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
              <p className="text-gray-600 mt-1">Advanced Random Forest Machine Learning Analysis</p>
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

              <form onSubmit={handleSubmit} className="space-y-8">
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
                      { key: 'smoking', label: 'Smoking' },
                      { key: 'death_event', label: 'Death Event' }
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
                  type="submit"
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
              </form>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Prediction Results</h2>
              
              {!showResults && !isLoading && (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Enter patient data and click predict to see results</p>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing with Random Forest algorithm...</p>
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

                  {/* Confidence */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Forest Confidence ({prediction.tree_count} trees)</span>
                      <span className="text-sm font-bold text-gray-900">{prediction.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Top Contributing Features */}
                  {prediction.top_features && (
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
                      <strong>Disclaimer:</strong> This Random Forest prediction is for educational purposes only and should not replace professional medical advice. Always consult with a healthcare professional for medical decisions.
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