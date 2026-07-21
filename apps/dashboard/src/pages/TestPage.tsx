import {
  Alert,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveResult } from "../services/api";

export default function TestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const test = location.state as any;
  const accessToken = test?.accessToken;

  const [answers, setAnswers] = useState<Record<string, string | number[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Number(test?.timeLimit) || 60);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState("");

  const startedAtRef = useRef(Date.now());
  const deadlineRef = useRef(
    Date.now() + (Number(test?.timeLimit) || 60) * 1000
  );
  const submitStartedRef = useRef(false);

  const submit = useCallback(async () => {
    if (!test || submitStartedRef.current) {
      return;
    }

    submitStartedRef.current = true;
    setIsFinished(true);

    const durationSeconds = Math.max(
      0,
      Math.floor((Date.now() - startedAtRef.current) / 1000)
    );

    try {
      const result = await saveResult({
        ...(accessToken
          ? { accessToken }
          : { userId: user?.id, testId: test.id }),
        answers,
        durationSeconds
      });

      alert(`Результат: ${result.score}/${result.total}`);

      if (user) {
        navigate("/dashboard");
      } else {
        navigate(`/access/${accessToken}`, { replace: true });
      }
    } catch (err: any) {
      setError(err.message);
      setIsFinished(false);
      submitStartedRef.current = false;
    }
  }, [accessToken, answers, navigate, test, user]);

  useEffect(() => {
    if (!test) {
      return;
    }

    const updateTimer = () => {
      const remainingSeconds = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000)
      );

      setTimeLeft(remainingSeconds);
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 250);

    return () => window.clearInterval(timer);
  }, [test]);

  useEffect(() => {
    if (test && timeLeft <= 0 && !isFinished) {
      void submit();
    }
  }, [isFinished, submit, test, timeLeft]);

  if (!test) {
    return <Typography>Тест не найден</Typography>;
  }

  if (test.completed) {
    return (
      <Typography>
        Тест уже пройден. Обратитесь к администратору для сброса попытки.
      </Typography>
    );
  }

  const question = test.questions?.[currentQuestionIndex];

  if (!question) {
    return <Typography>В тесте нет вопросов</Typography>;
  }

  function saveSingleAnswer(value: string) {
    setAnswers((previous) => ({
      ...previous,
      [String(question.id)]: value
    }));
  }

  function saveMultipleAnswer(index: number, checked: boolean) {
    setAnswers((previous) => {
      const key = String(question.id);
      const current = Array.isArray(previous[key])
        ? (previous[key] as number[])
        : [];

      const updated = checked
        ? Array.from(new Set([...current, index]))
        : current.filter((item) => item !== index);

      return { ...previous, [key]: updated };
    });
  }

  function nextQuestion() {
    if (currentQuestionIndex === test.questions.length - 1) {
      void submit();
      return;
    }

    setCurrentQuestionIndex((previous) => previous + 1);
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {test.title}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Typography sx={{ mt: 2 }}>
        Осталось времени: {timeLeft} секунд
      </Typography>
      <Typography sx={{ mt: 2 }}>
        Вопрос {currentQuestionIndex + 1} из {test.questions.length}
      </Typography>

      <div style={{ marginBottom: 30 }}>
        <Typography variant="h6">{question.text}</Typography>

        {question.type === "single" && (
          <RadioGroup
            value={answers[String(question.id)] || ""}
            onChange={(event) => saveSingleAnswer(event.target.value)}
          >
            {question.options.map((option: string, index: number) => (
              <FormControlLabel
                key={index}
                value={String(index)}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
        )}

        {question.type === "multiple" &&
          question.options.map((option: string, index: number) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={(
                    (answers[String(question.id)] as number[]) || []
                  ).includes(index)}
                  onChange={(event) =>
                    saveMultipleAnswer(index, event.target.checked)
                  }
                />
              }
              label={option}
            />
          ))}
      </div>

      <Button variant="contained" onClick={nextQuestion} disabled={isFinished}>
        {currentQuestionIndex === test.questions.length - 1
          ? "Завершить тест"
          : "Следующий вопрос"}
      </Button>
    </Container>
  );
}
