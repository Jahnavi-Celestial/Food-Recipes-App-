import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";

import {
  AddNote,
  UpdateNote,
  DeleteNote,
} from "../GraphQl/mutation";

import { NotesBySavedRecipe } from "../GraphQl/query";

const NoteModal = ({
  open,
  onClose,
  savedRecipeId,
  mode,
  refetch,
}) => {
  const [text, setText] = useState("");
  const [editingId, setEditingId] =
    useState(null);

  const [currentMode, setCurrentMode] =
    useState(mode);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const {
    data,
    refetch: refetchNotes,
  } = useQuery(NotesBySavedRecipe, {
    variables: {
      saved_recipe_id: Number(savedRecipeId),
    },
    skip: !open,
  });

  const notes = data?.notesBySavedRecipe || [];

  const [addNote] = useMutation(AddNote);

  const [updateNote] =
    useMutation(UpdateNote);

  const [deleteNote] =
    useMutation(DeleteNote);

  useEffect(() => {
    if (!open) {
      setText("");
      setEditingId(null);
      setCurrentMode(mode);
    }
  }, [open, mode]);

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateNote({
          variables: {
            id: Number(editingId),
            note: text,
          },
        });
      } else {
        await addNote({
          variables: {
            saved_recipe_id:
              Number(savedRecipeId),
            note: text,
          },
        });
      }

      setText("");
      setEditingId(null);
      setCurrentMode("view");

      await refetchNotes();
      refetch();
    } catch (err) {
      console.log("SAVE ERROR:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote({
        variables: {
          id: Number(id),
        },
      });

      await refetchNotes();
      refetch();
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setText(note.note);
    setCurrentMode("add");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {editingId
          ? "Update Note"
          : currentMode === "add"
          ? "Add Note"
          : "View Notes"}
      </DialogTitle>

      <DialogContent>
        {(currentMode === "add" ||
          editingId) && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
              placeholder="Write your note..."
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!text.trim()}
              >
                {editingId
                  ? "Update"
                  : "Save"}
              </Button>
            </Box>
          </Box>
        )}

        {currentMode === "view" && (
          <Box sx={{ mt: 2 }}>
            {notes.length === 0 ? (
              <Typography>
                No notes yet.
              </Typography>
            ) : (
              notes.map((note) => (
                <Box
                  key={note.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border:
                      "1px solid #e0e0e0",
                    borderRadius: 2,
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: 2,
                  }}
                >
                  <Typography
                    sx={{ flex: 1 }}
                  >
                    {note.note}
                  </Typography>

                  <Box>
                    <IconButton
                      color="primary"
                      onClick={() =>
                        handleEdit(note)
                      }
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() =>
                        handleDelete(
                          note.id
                        )
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "flex-end",
          px: 3,
          pb: 2,
        }}
      >
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteModal;