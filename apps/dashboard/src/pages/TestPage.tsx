import {
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Button
} from "@mui/material";

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function TestPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const test = location.state;

  const [answers, setAnswers] = useState<any>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test?.timeLimit || 60);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && !isFinished) {
      submit();
    }
  }, [timeLeft]);

  if (!test) {
    return <Typography>Тест не найден</Typography>;
  }

  const question = test.questions[currentQuestionIndex];

  function saveSingleAnswer(value: string) {
    setAnswers({
      ...answers,
      [question.id]: value
    });
  }

  function saveMultipleAnswer(index: number, checked: boolean) {
    const current = answers[question.id] || [];

    let updated = [...current];

    if (checked) {
      updated.push(index);
    } else {
      updated = updated.filter(
        (x: number) => x !== index
      );
    }

    setAnswers({
      ...answers,
      [question.id]: updated
    });
  }

  function nextQuestion() {
    if (currentQuestionIndex === test.questions.length - 1) {
      submit();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }

  const submit = () => {
    if (isFinished) {
      return;
    }

    setIsFinished(true);

    let score = 0;

    test.questions.forEach((question: any) => {
      const userAnswer = answers[question.id];

      if (question.type === "single") {
        if (
          Number(userAnswer) ===
          question.correct[0]
        ) {
          score++;
        }
      }

      if (question.type === "multiple") {
        const sortedUser =
          [...(userAnswer || [])].sort();

        const sortedCorrect =
          [...question.correct].sort();

        if (
          JSON.stringify(sortedUser) ===
          JSON.stringify(sortedCorrect)
        ) {
          score++;
        }
      }
    });

    alert(
      `Результат: ${score}/${test.questions.length}`
    );

    navigate("/dashboard");
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {test.title}
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Осталось времени: {timeLeft} секунд
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Вопрос {currentQuestionIndex + 1} из {test.questions.length}
      </Typography>

      <div style={{ marginBottom: 30 }}>
        <Typography variant="h6">
          {question.text}
        </Typography>

        {question.type === "single" && (
          <RadioGroup
            value={answers[question.id] || ""}
            onChange={(e) =>
              saveSingleAnswer(e.target.value)
            }
          >
            {question.options.map(
              (option: string, index: number) => (
                <FormControlLabel
                  key={index}
                  value={String(index)}
                  control={<Radio />}
                  label={option}
                />
              )
            )}
          </RadioGroup>
        )}

        {question.type === "multiple" &&
          question.options.map(
            (option: string, index: number) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={(answers[question.id] || []).includes(index)}
                    onChange={(e) =>
                      saveMultipleAnswer(
                        index,
                        e.target.checked
                      )
                    }
                  />
                }
                label={option}
              />
            )
          )}
      </div>

      <Button
        variant="contained"
        onClick={nextQuestion}
      >
        {currentQuestionIndex === test.questions.length - 1
          ? "Завершить тест"
          : "Следующий вопрос"}
      </Button>
    </Container>
  );
}
