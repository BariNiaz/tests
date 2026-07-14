import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Typography,
  Button
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import type {
  GridColDef,
  GridRenderCellParams
} from "@mui/x-data-grid";

import { getResults } from "../services/api";
import ColumnFilter from "../components/ColumnFilter";
import { exportResults } from "../utils/exportResults";

const difficultyLabels: Record<number, string> = {
  1: "Junior",
  2: "Middle",
  3: "Senior",
  4: "Lead"
};

export default function ResultsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [rows, setRows] = useState<any[]>([]);
  const [emailFilter, setEmailFilter] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState<string[]>([]);
  const [testFilter, setTestFilter] = useState<string[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    if (user.role === "admin") {
      loadResults();
    }
  }, []);

  async function loadResults() {
    try {
      const data = await getResults();

      const prepared = data.map((item: any) => ({
        ...item,
        percent: Math.round((item.score / item.total) * 100)
      }));

      setRows(prepared);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const columns = useMemo<GridColDef[]>(() => [
    {
      field: "email",
      flex: 1,

      renderHeader: () => (

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%"
          }}
        >

          <Typography
            fontWeight={600}
            fontSize={14}
          >
            Логин
          </Typography>

          <ColumnFilter
            values={rows.map(row => ({
              value: row.email,
              label: row.email
            }))}
            selected={emailFilter}
            onChange={setEmailFilter}
            active={emailFilter.length>0}
          />

        </Box>

      )

    },
    {
      field: "full_name",
      flex: 1.3,

      renderHeader: () => (

        <Box
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >

          <Typography
            fontWeight={600}
            fontSize={14}
          >
            ФИО
          </Typography>

          <ColumnFilter
            values={rows.map(row => ({
              value: row.full_name,
              label: row.full_name
            }))}
            selected={nameFilter}
            onChange={setNameFilter}
            active={nameFilter.length>0}
          />

        </Box>

      )

    },
    {
      field: "testTitle",
      flex: 1.4,

      renderHeader: () => (

        <Box
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >

          <Typography
            fontWeight={600}
            fontSize={14}
          >
            Тест
          </Typography>

          <ColumnFilter
            values={rows.map(row => ({
              value: row.testTitle,
              label: row.testTitle
            }))}
            selected={testFilter}
            onChange={setTestFilter}
            active={testFilter.length>0}
          />

        </Box>

      )

    },
    {
      field: "difficultyLevel",
      width: 140,

      renderHeader: () => (

        <Box
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >

          <Typography
            fontWeight={600}
            fontSize={14}
          >
            Уровень
          </Typography>

          <ColumnFilter
            values={rows.map(row => ({
              value: String(row.difficultyLevel),
              label: difficultyLabels[row.difficultyLevel]
            }))}
            selected={difficultyFilter}
            onChange={setDifficultyFilter}
            active={difficultyFilter.length>0}
          />

        </Box>

      ),

      valueFormatter: value =>
        difficultyLabels[Number(value)] ?? "-"
    },
    {
      field: "score",
      headerName: "Баллы",
      width: 120,

      renderCell: (params: GridRenderCellParams) =>
        `${params.row.score}/${params.row.total}`
    },
    {
      field: "percent",
      headerName: "%",

      width: 120,

      renderCell: (params: GridRenderCellParams) => {

        const value = Number(params.value);

        let color: "success" | "warning" | "error" = "error";

        if (value >= 90)
          color = "success";
        else if (value >= 70)
          color = "warning";

        return (
          <Chip
            label={`${value}%`}
            color={color}
            size="small"
          />
        );
      }
    },
    {
      field: "completedAt",
      headerName: "Дата",

      width: 190,

      valueFormatter: (value) =>
        new Date(String(value)).toLocaleString("ru-RU")
    }

  ], [
    rows,
    emailFilter,
    nameFilter,
    testFilter,
    difficultyFilter
  ]);

    const filteredRows = useMemo(() => {

    return rows.filter(row => {

      if (
        emailFilter.length &&
        !emailFilter.includes(row.email)
      ) {
        return false;
      }

      if (
        nameFilter.length &&
        !nameFilter.includes(row.full_name)
      ) {
        return false;
      }

      if (
        testFilter.length &&
        !testFilter.includes(row.testTitle)
      ) {
        return false;
      }

      if (
        difficultyFilter.length &&
        !difficultyFilter.includes(
          String(row.difficultyLevel)
        )
      ) {
        return false;
      }

      return true;

    });

  }, [
    rows,
    emailFilter,
    nameFilter,
    testFilter,
    difficultyFilter
  ]);
  
  if (user.role !== "admin") {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">
          Результаты
        </Typography>

        <Typography sx={{ mt: 2 }}>
          Просмотр результатов доступен только администратору.
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>

      <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
      >
          <Typography variant="h4">
              Результаты тестирования
          </Typography>

          <Button
              variant="contained"
              onClick={() => exportResults(filteredRows)}
          >
              Скачать XLSX
          </Button>
      </Box>

      <Box
        sx={{
          height: 650,
          width: "100%"
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}

          disableColumnMenu
          disableRowSelectionOnClick

          pageSizeOptions={[10, 20, 50]}

          initialState={{
            sorting: {
              sortModel: [
                {
                  field: "email",
                  sort: "asc"
                }
              ]
            },

            pagination: {
              paginationModel: {
                pageSize: 10,
                page: 0
              }
            }
          }}
        />
      </Box>

    </Container>
  );
}