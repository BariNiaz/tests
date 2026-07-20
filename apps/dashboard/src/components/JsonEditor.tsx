import { Box, Typography } from "@mui/material";
import { useMemo } from "react";

function highlightJson(value: string) {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"\s*:)|("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g,
    (match, key, stringValue, literal) => {
      if (key) return `<span class="json-key">${match}</span>`;
      if (stringValue) return `<span class="json-string">${match}</span>`;
      if (literal) return `<span class="json-literal">${match}</span>`;
      return `<span class="json-number">${match}</span>`;
    }
  );
}

export default function JsonEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const highlighted = useMemo(() => highlightJson(value), [value]);
  let valid = true;
  try { JSON.parse(value); } catch { valid = false; }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="caption" color={valid ? "success.main" : "error.main"}>
        {valid ? "JSON корректен" : "JSON содержит ошибку"}
      </Typography>
      <Box className="json-editor">
        <pre aria-hidden="true" dangerouslySetInnerHTML={{ __html: `${highlighted}\n` }} />
        <textarea
          aria-label="Вопросы в JSON"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </Box>
    </Box>
  );
}
