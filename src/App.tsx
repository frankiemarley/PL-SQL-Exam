import React, { useState, useEffect } from 'react';
import { Upload, RotateCcw, ChevronRight, ChevronLeft, Check, X, Grid } from 'lucide-react';

interface Question {
  question: string;
  code?: string | null;
  options: string[];
  answers: string[];
  explanation: string;
}

interface AnswerState {
  answered: boolean;
  selected: Set<string>;
  isCorrect: boolean;
}

export default function QuizApp() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResults, setShowResults] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!questions.length) return;

    const currentAnswer = answers[currentIndex];
    if (currentAnswer?.answered) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions, currentIndex, answers]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const data: Question[] = JSON.parse(result);
          setQuestions(data);
          setCurrentIndex(0);
          setTimeLeft(60);
          setAnswers({});
          setShowResults(false);
          setShowSummary(false);
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleTimeUp = () => {
    // Timer runs out, just change color - no auto-submit
  };

  const toggleOption = (option: string) => {
    const currentAnswer = answers[currentIndex];
    if (currentAnswer?.answered) return;

    const newSelected = new Set(currentAnswer?.selected || new Set());
    if (newSelected.has(option)) {
      newSelected.delete(option);
    } else {
      newSelected.add(option);
    }

    setAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        answered: prev[currentIndex]?.answered || false,
        selected: newSelected,
        isCorrect: prev[currentIndex]?.isCorrect || false
      }
    }));
  };

  const handleSubmit = () => {
    const q = questions[currentIndex];
    const selected = answers[currentIndex]?.selected || new Set();
    const isCorrect =
      selected.size === q.answers.length &&
      [...selected].every(s => q.answers.includes(s));

    setAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        answered: true,
        selected,
        isCorrect
      }
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(60);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setTimeLeft(60);
    }
  };

  const handleNavigateToQuestion = (index: number) => {
    setCurrentIndex(index);
    setTimeLeft(60);
    setShowSummary(false);
  };

  const handleFinish = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setAnswers({});
    setTimeLeft(60);
    setShowResults(false);
    setShowSummary(false);
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Master</h1>
          <p className="text-gray-600 mb-6">Upload your JSON quiz file to get started</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
            <Upload className="w-12 h-12 text-blue-500 mb-2" />
            <span className="text-blue-600 font-semibold">Click to upload</span>
            <span className="text-gray-500 text-sm mt-1">or drag and drop</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>
      </div>
    );
  }

  if (showResults) {
    const stats = Object.values(answers).reduce(
      (acc, a) => ({ correct: acc.correct + (a.isCorrect ? 1 : 0), total: acc.total + 1 }),
      { correct: 0, total: 0 }
    );
    const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h2>
          <div className="text-6xl font-bold text-blue-600 mb-2">{percentage}%</div>
          <p className="text-xl text-gray-600 mb-8">
            {stats.correct} / {stats.total} correct
          </p>
          <button
            onClick={handleReset}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const stats = Object.values(answers).reduce(
      (acc, a) => ({ correct: acc.correct + (a.isCorrect ? 1 : 0), total: acc.total + 1 }),
      { correct: 0, total: 0 }
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Summary</h2>
            <p className="text-gray-600 mb-6">Score: {stats.correct} / {stats.total} ({Math.round((stats.correct / stats.total) * 100)}%)</p>
            
            <div className="grid grid-cols-4 gap-2 mb-8">
              {questions.map((_, idx) => {
                const answer = answers[idx];
                const isAnswered = answer?.answered;
                const isCorrect = answer?.isCorrect;

                return (
                  <button
                    key={idx}
                    onClick={() => handleNavigateToQuestion(idx)}
                    className={`aspect-square rounded-lg font-semibold text-white transition ${
                      isAnswered && isCorrect
                        ? 'bg-green-500 hover:bg-green-600'
                        : isAnswered && !isCorrect
                        ? 'bg-red-500 hover:bg-red-600'
                        : isAnswered
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSummary(false)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Continue
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const isAnswered = currentAnswer?.answered || false;
  const selected = currentAnswer?.selected || new Set();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-sm font-semibold opacity-90">Question {currentIndex + 1}/{questions.length}</h2>
                <div className="flex gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-300" />
                    <span>{Object.values(answers).filter(a => a.isCorrect).length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <X className="w-4 h-4 text-red-300" />
                    <span>{Object.values(answers).filter(a => a.answered && !a.isCorrect).length}</span>
                  </div>
                </div>
              </div>
              <div className={`text-4xl font-bold ${timeLeft === 0 ? 'text-red-400 animate-pulse' : timeLeft <= 10 ? 'text-red-300' : ''}`}>
                {timeLeft}s
              </div>
            </div>
            <div className="w-full bg-blue-500 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all" 
                style={{ width: `${(timeLeft / 60) * 100}%` }} 
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 whitespace-pre-wrap">{q.question}</h3>

            {q.code && (
              <div className="mb-6 p-4 bg-gray-900 rounded-lg overflow-x-auto">
                <pre className="text-gray-100 font-mono text-sm whitespace-pre-wrap break-words">
                  {q.code}
                </pre>
              </div>
            )}

            <div className="space-y-3 mb-8">
              {q.options.map((option, idx) => {
                const isSelected = selected.has(option);
                const isAnswer = q.answers.includes(option);
                const showCorrect = isAnswered && isAnswer;
                const showIncorrect = isAnswered && isSelected && !isAnswer;

                return (
                  <button
                    key={idx}
                    onClick={() => toggleOption(option)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-lg border-2 transition text-left font-medium ${
                      showCorrect
                        ? 'border-green-500 bg-green-50 text-gray-900'
                        : showIncorrect
                        ? 'border-red-500 bg-red-50 text-gray-900'
                        : isSelected && !isAnswered
                        ? 'border-blue-500 bg-blue-50 text-gray-900'
                        : 'border-gray-300 hover:border-blue-300 text-gray-700'
                    } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showCorrect && <Check className="w-5 h-5 text-green-600" />}
                      {showIncorrect && <X className="w-5 h-5 text-red-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Explanation</h4>
                <p className="text-gray-700">{q.explanation}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>

              {!isAnswered ? (
                <button
                  onClick={handleSubmit}
                  disabled={selected.size === 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Submit <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={currentIndex === questions.length - 1}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => setShowSummary(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Grid className="w-5 h-5" /> Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}