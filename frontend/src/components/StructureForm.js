import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import useApiRequest from "../redux/api/useApiRequest";
import DialogTitle from "@mui/material/DialogTitle";
import Swal from "sweetalert2";
import { Autocomplete, TextField } from "@mui/material";

export default function StructureForm({
  setSnackbar,
  open,
  setOpen,
  data,
  setData,
  change,
}) {
  const [arrondissements, setArrondissements] = React.useState([]);
  const protectedApi = useApiRequest();

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmission = () => {
    const structure = {
      ...data,
      form: data.forme,
      arrondissement: data.arrondissement.id,
    };
    if (data.id === -1) {
      protectedApi
        .post(`/structures`, structure)
        .then((res) => {
          setOpen(false);
          setSnackbar({
            children: "Structure successfully created",
            severity: "success",
          });
          change((prev) => prev + 1);
        })
        .catch(function (error) {
          setSnackbar({
            children: error.response.data.message,
            severity: "success",
          });
        });
    } else {
      protectedApi
        .put(`/structures/${data.id}`, structure)
        .then((res) => {
          setOpen(false);
          setSnackbar({
            children: "Structure successfully updated",
            severity: "success",
          });
          change((prev) => prev + 1);
        })
        .catch(function (error) {
          setSnackbar({
            children: error.response.data.message,
            severity: "success",
          });
        });
    }
  };

  const handleDataChange = (e) => {
    setData((value) => ({ ...value, [e.target.name]: e.target.value }));
  };

  React.useEffect(() => {
    protectedApi
      .get("/arrondissements")
      .then((res) => {
        setArrondissements(res.data.data);
      })
      .catch(function (error) {
        Swal.fire("error", error.message, "error");
      });
  }, []);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Structure editing form </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="normal"
          id="name"
          name="name"
          label="Name of the structure"
          type="text"
          value={data?.name}
          onChange={handleDataChange}
          fullWidth
          variant="standard"
        />
        <TextField
          margin="normal"
          id="contacts"
          name="contacts"
          label="Contacts"
          type="text"
          value={data?.contacts}
          onChange={handleDataChange}
          fullWidth
          variant="standard"
        />
        <FormControl fullWidth>
          <InputLabel id="form-select-label">Form</InputLabel>
          <Select
            sx={{ my: 1 }}
            labelId="form-select-label"
            id="forme"
            name="forme"
            value={data?.forme}
            label="Form"
            onChange={handleDataChange}
          >
            <MenuItem value="GENERAL">GENERAL</MenuItem>
            <MenuItem value="TECHNIQUE">TECHNIQUE</MenuItem>
            <MenuItem value="POLYVALENT">POLYVALENT</MenuItem>
            <MenuItem value="ENIEG">ENIEG</MenuItem>
            <MenuItem value="ENIET">ENIET</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="ordre-select-label">Ordre</InputLabel>
          <Select
            sx={{ my: 1 }}
            labelId="ordre-select-label"
            id="ordre"
            name="ordre"
            value={data?.ordre}
            label="Ordre"
            onChange={handleDataChange}
          >
            <MenuItem value="PUBLIC">PUBLIC</MenuItem>
            <MenuItem value="PRIVE CATHOLIQUE">PRIVE CATHOLIQUE</MenuItem>
            <MenuItem value="PRIVE PROTESTANT">PRIVE PROTESTANT</MenuItem>
            <MenuItem value="PRIVE LAIC">PRIVE LAIC</MenuItem>
            <MenuItem value="PRIVE ISLAMIQUE">PRIVE ISLAMIQUE</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            sx={{ my: 1 }}
            labelId="language-select-label"
            id="language"
            name="language"
            value={data?.language}
            label="Language"
            onChange={handleDataChange}
          >
            <MenuItem value="FRANCAIS">FRANCAIS</MenuItem>
            <MenuItem value="ANGLAIS">ANGLAIS</MenuItem>
            <MenuItem value="BILINGUE">BILINGUE</MenuItem>
          </Select>
        </FormControl>
        <Autocomplete
          sx={{ my: 1 }}
          value={data?.arrondissement}
          onChange={(event, newValue) => {
            setData((prev) => ({ ...prev, arrondissement: newValue }));
          }}
          groupBy={(option) => option.departement.name}
          id="arrondissement"
          options={arrondissements}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField {...params} label="Arrondissement" />
          )}
        />
        <TextField
          margin="normal"
          id="adresse"
          name="adresse"
          label="Adresse de la structure"
          type="text"
          value={data?.adresse}
          onChange={handleDataChange}
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmission}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
