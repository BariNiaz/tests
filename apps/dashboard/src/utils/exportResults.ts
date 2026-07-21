import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const difficulty: Record<number, string> = {
  1: "Junior",
  2: "Middle",
  3: "Senior",
  4: "Lead"
};

export async function exportResults(rows: any[]) {
  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Results");

  sheet.columns = [
    { header: "Логин", key: "email", width: 30 },
    { header: "ФИО", key: "full_name", width: 30 },
    { header: "Тест", key: "testTitle", width: 30 },
    { header: "Уровень", key: "difficulty", width: 15 },
    { header: "Баллы", key: "score", width: 15 },
    { header: "%", key: "percent", width: 10 },
    { header: "Время", key: "duration", width: 12 },
    { header: "Дата", key: "completedAt", width: 25 }
  ];

  rows.forEach(row => {
    sheet.addRow({
      email: row.email,
      full_name: row.full_name,
      testTitle: row.testTitle,
      difficulty: difficulty[row.difficultyLevel],
      score: `${row.score}/${row.total}`,
      percent: `${row.percent}%`,
      duration: `${Math.floor((Number(row.durationSeconds) || 0) / 60)}:${String((Number(row.durationSeconds) || 0) % 60).padStart(2, "0")}`,
      completedAt: new Date(row.completedAt).toLocaleString("ru-RU")
    });
  });

  sheet.getRow(1).font = {
    bold: true
  };

  sheet.views = [
    {
      state: "frozen",
      ySplit: 1
    }
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer]),
    `results-${new Date().toISOString().slice(0,10)}.xlsx`
  );
}