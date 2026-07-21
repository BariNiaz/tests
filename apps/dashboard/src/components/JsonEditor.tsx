import { Box, Typography } from "@mui/material";
import EditorImport from "react-simple-code-editor";
import Prism from "prismjs";

import "prismjs/components/prism-json";
import "prismjs/themes/prism-tomorrow.css";

type JsonEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

type EditorComponentProps = {
  value: string;
  onValueChange: (value: string) => void;
  highlight: (code: string) => string;
  padding?: number;
  textareaId?: string;
  textareaClassName?: string;
  preClassName?: string;
  style?: React.CSSProperties;
};

const Editor =
  (
    EditorImport as unknown as {
      default?: React.ComponentType<EditorComponentProps>;
    }
  ).default ??
  (EditorImport as unknown as React.ComponentType<EditorComponentProps>);

export default function JsonEditor({
  value,
  onChange
}: JsonEditorProps) {
  let isValid = true;
  let validationMessage = "JSON корректен";

  try {
    const parsedJson = JSON.parse(value);

    if (!Array.isArray(parsedJson)) {
      isValid = false;
      validationMessage =
        "JSON должен содержать массив вопросов";
    }
  } catch (error) {
    isValid = false;
    validationMessage =
      error instanceof Error
        ? `Ошибка JSON: ${error.message}`
        : "JSON содержит ошибку";
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="caption"
        color={isValid ? "success.main" : "error.main"}
        sx={{
          display: "block",
          mb: 1
        }}
      >
        {validationMessage}
      </Typography>

      <Box className="json-code-editor">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={(code) =>
            Prism.highlight(
              code,
              Prism.languages.json,
              "json"
            )
          }
          padding={16}
          textareaId="test-json-editor"
          textareaClassName="json-code-textarea"
          preClassName="json-code-highlight"
          style={{
            minHeight: 440,
            fontFamily:
              'Consolas, Monaco, "Courier New", monospace',
            fontSize: 15,
            lineHeight: 1.55,
            backgroundColor: "#2d2d2d"
          }}
        />
      </Box>
    </Box>
  );
}