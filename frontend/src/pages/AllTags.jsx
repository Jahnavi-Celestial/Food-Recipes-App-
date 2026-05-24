import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Autocomplete, Chip, CircularProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Tags } from "../GraphQl/query";

const TagPage = () => {
  const { data, loading: tagsLoading } = useQuery(Tags);

  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const tagOptions = data?.tags?.map((t) => t.name) || [];

  const tags = data?.tags || [];
  
  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const rows = (filteredTags|| []).map((tag) => ({
    id: tag.id,
    name: tag.name,
  }));

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 220,
    },
    {
      field: "name",
      headerName: "Tag",
      width: 500,
    },
  ];

  const handleTagChange = (event, newValue) => {
    const unique = [...new Set(newValue)];

    setSelectedTags(unique);
  };

  const handleSearch = () => {
    const gridTags = rows?.filter((row) => {
        if(selectedRows?.ids?.has(row.id)){
            return row
        }
    })
    const gridTagName = gridTags.map(tag => tag.name)

    const allTags = [...selectedTags, ...gridTagName]

    if (allTags.length === 0) return;

    navigate(
        '/recipes-by-tags', {state: allTags}
    );
  };

  return (
    <Box sx={{mt: 10}}>
      <Box width="100vw" sx={{px: 2, display:"flex", gap: 1, flexDirection: {xs: "column", md: 'row'}}}>
        <TextField
        fullWidth
        label="Filter tags"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 , width: "50%"}}
      />

      <Autocomplete
        sx={{ mb: 2 , width: {xs: "100%", md: "50%"}}}
        multiple
        freeSolo
        options={tagOptions}
        value={selectedTags}
        onChange={handleTagChange}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              key={`${option}-${index}`}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search tags"
            placeholder="Type and press enter"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {tagsLoading && <CircularProgress size={18} />}
                  {params?.InputProps?.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      </Box>

      <div style={{ height: "70vh", width: "100%" }}>
        <div style={{ height: "70vh", width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={tagsLoading}
            initialState={{ pagination: { paginationModel } }}
            paginationModel={paginationModel}
            onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
            pageSizeOptions={[10, 15, 20]}
            onRowSelectionModelChange={(newSelection) =>{
                setSelectedRows(newSelection)
            }
            }
            checkboxSelection
            disableRowSelectionOnClick
          />
        </div>
      </div>

      <Button
        variant="contained"
        sx={{ mt: 2, bgcolor: "#2E7D32" }}
        onClick={handleSearch}
      >
        Search Recipes
      </Button>
    </Box>
  );
};

export default TagPage;
