import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CareerTest() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/career-test/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to load questions');
    }
  };

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (!answers[currentQuestion]) {
      toast.error('Please select an answer');
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formattedAnswers = Object.entries(answers).map(([qId, answer]) => ({
        question_id: parseInt(qId) + 1,
        answer
      }));

      await axios.post(
        `${API}/career-test/submit`,
        { answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Test completed!');
      navigate('/career-results');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen aurora-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen aurora-gradient">
      <nav className="p-6 md:p-12 flex justify-between items-center border-b border-border/50">
        <div
          className="text-2xl font-bold tracking-tight cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          SkillGap <span className="text-primary">AI</span>
        </div>
        <Button
          data-testid="back-dashboard-btn"
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="rounded-md"
        >
          Back to Dashboard
        </Button>
      </nav>

      <div className="p-6 md:p-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">Career Personality Test</h1>
          <p className="text-muted-foreground mb-8">
            Answer honestly to discover your ideal tech career path
          </p>

          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-bar" />
          </div>

          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-xl p-8 mb-6"
            data-testid="question-card"
          >
            <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

            <RadioGroup
              value={answers[currentQuestion]}
              onValueChange={handleAnswer}
              className="space-y-4"
            >
              {question.options.map((option, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 p-4 rounded-md hover:bg-primary/5 transition-colors cursor-pointer"
                  onClick={() => handleAnswer(option)}
                  data-testid={`option-${idx}`}
                >
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label
                    htmlFor={`option-${idx}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>

          <div className="flex gap-4">
            <Button
              data-testid="previous-btn"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex-1 rounded-md"
            >
              Previous
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button
                data-testid="submit-btn"
                onClick={handleSubmit}
                disabled={submitting || !answers[currentQuestion]}
                className="flex-1 rounded-md btn-hover glow-primary"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Test'
                )}
              </Button>
            ) : (
              <Button
                data-testid="next-btn"
                onClick={handleNext}
                disabled={!answers[currentQuestion]}
                className="flex-1 rounded-md btn-hover glow-primary"
              >
                Next
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
