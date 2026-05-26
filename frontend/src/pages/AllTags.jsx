import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Autocomplete,
  Chip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { SearchTags, Tags } from "../GraphQl/query";
import { useDebounce } from "../Hook/useDebounce";

const TagPage = () => {
  const { data, loading: tagsLoading } = useQuery(Tags);

  const navigate = useNavigate();

  const [selectedRows, setSelectedRows] = useState([]);

  const [tagInput, setTagInput] = useState("");
  const debouncedTagInput = useDebounce(tagInput, 400);
  const [tagstate, setTagstate] = useState([]);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const tags = data?.tags || [];

  const rows = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
  }));

  const columns = [
    {
      field: "name",
      headerName: "Tag",
      flex: 1,
    },
  ];

  const { data: tagData } = useQuery(SearchTags, {
    variables: {
      search: debouncedTagInput,
    },
    skip: debouncedTagInput.length < 1,
  });

  const handleSearch = () => {
    const selectedIds = Array.from(selectedRows.ids);

    const tableSelectedTags = rows
      .filter((row) => selectedIds.includes(row.id))
      .map((row) => row.name);

    const allTags = [...new Set([...tagstate, ...tableSelectedTags])];

    if (allTags.length === 0) return;

    navigate("/recipes-by-tags", {
      state: allTags,
    });
  };

  if (tagsLoading) {
      return (
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ color: "gray", fontWeight: "bold" }}>
            Loading...
          </Typography>
        </Box>
      );
    }

  return (
    <Box sx={{ mt: 10, px: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <Autocomplete
          multiple
          freeSolo
          options={tagData?.searchTags || []}
          value={tagstate}
          inputValue={tagInput}
          onInputChange={(e, value) => setTagInput(value)}
          onChange={(e, value) => setTagstate(value)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} label="Tags" placeholder="Type tags..." />
          )}
          sx={{ width: "100%" }}
        />
      </Box>

      <Box sx={{ height: "70vh", width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={tagsLoading}
          checkboxSelection
          disableRowSelectionOnClick
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) =>
            setPaginationModel(newModel)
          }
          pageSizeOptions={[10, 15, 20]}
          onRowSelectionModelChange={(newSelection) =>
            setSelectedRows(newSelection)
          }
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          mt: 3,
        }}
      >
        <Button
          variant="contained"
          sx={{ bgcolor: "#2E7D32" }}
          onClick={handleSearch}
        >
          Search Recipes
        </Button>
      </Box>
    </Box>
  );
};

export default TagPage;
