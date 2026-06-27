import {
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Button
} from "@mui/material";

import { useParams } from "react-router-dom";
import { tests } from "../assets/mockTests";
import { useState } from "react";

export default function TestPage() {
  const { id } = useParams();

  const test = tests.find(
    (t) => t.id === Number(id)
  );

  const [answers, setAnswers] = useState<any>({});

  if (!test) {
    return <Typography>Тест не найден</Typography>;
  }

  const submit = () => {
    let score = 0;

    test.questions.forEach((question) => {
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
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {test.title}
      </Typography>

      {test.questions.map((question) => (
        <div
          key={question.id}
          style={{ marginBottom: 30 }}
        >
          <Typography variant="h6">
            {question.text}
          </Typography>

          {question.type === "single" && (
            <RadioGroup
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [question.id]: e.target.value
                })
              }
            >
              {question.options.map(
                (option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={option}
                  />
                )
              )}
            </RadioGroup>
          )}

          {question.type === "multiple" &&
            question.options.map(
              (option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      onChange={(e) => {
                        const current =
                          answers[
                            question.id
                          ] || [];

                        let updated =
                          [...current];

                        if (
                          e.target.checked
                        ) {
                          updated.push(
                            index
                          );
                        } else {
                          updated =
                            updated.filter(
                              (
                                x: number
                              ) =>
                                x !== index
                            );
                        }

                        setAnswers({
                          ...answers,
                          [question.id]:
                            updated
                        });
                      }}
                    />
                  }
                  label={option}
                />
              )
            )}
        </div>
      ))}

      <Button
        variant="contained"
        onClick={submit}
      >
        Завершить тест
      </Button>
    </Container>
  );
}