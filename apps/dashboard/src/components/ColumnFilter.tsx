import { useMemo, useState } from "react";

import {
  Box,
  Button,
  Checkbox,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  TextField
} from "@mui/material";

import FilterIcon from "../assets/icon-filters.svg";

interface FilterItem {
  value: string;
  label: string;
}

interface ColumnFilterProps {
  values: FilterItem[];
  selected: string[];
  onChange: (values: string[]) => void;
  active?: boolean;
}

export default function ColumnFilter({
  values,
  selected,
  onChange,
  active = false
}: ColumnFilterProps) {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState("");

  const open = Boolean(anchorEl);

  const uniqueValues = useMemo(() => {

    const map = new Map<string, string>();

    values.forEach(item => {

        if (!map.has(item.value)) {
        map.set(item.value, item.label);
        }

    });

    return Array.from(map.entries())
        .map(([value, label]) => ({
        value,
        label
        }))
        .sort((a, b) =>
        a.label.localeCompare(b.label, "ru")
        );

    }, [values]);
  const filteredValues = useMemo(() => {

    return uniqueValues.filter(item =>
      item.label
        .trim()
        .toLowerCase()
        .includes(
            search
                .trim()
                .toLowerCase()
        )
    );

   }, [uniqueValues, search]);  

  function openMenu(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function closeMenu() {

    setAnchorEl(null);
    setSearch("");
  }

  function toggle(value: string) {

    if (selected.includes(value)) {

      onChange(
        selected.filter(item => item !== value)
      );

    } else {

      onChange([
        ...selected,
        value
      ]);

    }
  }

  function selectAll() {
    onChange(
        filteredValues.map(item => item.value)
    );
  }

  function clear() {
    onChange([]);
    setSearch("");
  }

  return (
    <>
      <Box
          sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center"
          }}
      >

          <IconButton
              size="small"
              onClick={openMenu}
          >
              <img
                  src={FilterIcon}
                  width={18}
                  height={18}
                  alt="filter"
              />
          </IconButton>

          {active && (

              <Box
                  sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "primary.main"
                  }}
              />

          )}

      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        PaperProps={{
          sx: {
            width: 280,
            maxHeight: 350
          }
        }}
      >

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 1,
            py: 1
          }}
        >
          <Button
            size="small"
            onClick={selectAll}
          >
            Все
          </Button>

          <Button
            size="small"
            onClick={clear}
          >
            Очистить
          </Button>
        </Box>

        <Box sx={{ px: 1, pb: 1 }}>

            <TextField
                size="small"
                fullWidth
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

        </Box>

        {filteredValues.map(item => (

          <MenuItem
            key={item.value}
          >

            <Checkbox
              checked={selected.includes(item.value)}
              onChange={() => toggle(item.value)}
            />

            <ListItemText
              primary={item.label}
            />

          </MenuItem>

        ))}

      </Menu>
    </>
  );
}