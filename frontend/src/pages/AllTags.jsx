import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Tags } from "../GraphQL/query";

const TagPage = () => {
  const { data, loading } = useQuery(Tags);

  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [search, setSearch] = useState("");

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

  const handleSearch = () => {
    const selectedTags = rows.filter((row) => {
        if(selectedRows.ids.has(row.id)){
            return row
        }
    })
    if (selectedTags.length === 0) return;
    navigate(
        '/recipes-by-tags', {state: selectedTags}
    );
  };

  return (
    <Box sx={{mt: 10}}>
      <TextField
        fullWidth
        label="Search tags"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <div style={{ height: "70vh", width: "100%" }}>
        <div style={{ height: "70vh", width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            initialState={{ pagination: { paginationModel } }}
            paginationModel={paginationModel}
            onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
            pageSizeOptions={[10, 15, 20]}
            onRowSelectionModelChange={(newSelection) =>{
                setSelectedRows(newSelection)
                console.log(newSelection)
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
