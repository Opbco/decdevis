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
import { styled } from "@mui/material/styles";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Autocomplete,
  FormControlLabel,
  FormLabel,
  Switch,
  TextField,
} from "@mui/material";

const FieldSet = styled("fieldset")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  border: "none",
  marginBlock: 20,
  padding: 10,
  gap: 10,
  position: "relative",
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
  ["&::before"]: {
    content: "attr(title)",
    position: "absolute",
    top: "-10%",
    left: 0,
    right: 0,
    color: "#1242ff",
    fontSize: 12,
    zIndex: 2,
    textTransform: "uppercase",
  },
}));

export default function CentreForm({
  setSnackbar,
  open,
  setOpen,
  data,
  setData,
  change,
}) {
  const [arrondissements, setArrondissements] = React.useState([]);
  const [departments, setDepartments] = React.useState([]);
  const [regions, setRegions] = React.useState([]);
  const [structures, setStructures] = React.useState([]);
  const [centres, setCentres] = React.useState([]);
  const protectedApi = useApiRequest();

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmission = () => {
    const centre = {
      ...data,
      centre: data.centre?.id || null,
      session: data.session.id,
      structure: data.structure.id,
      region: null,
      departement: null,
      arrondissement: null
    };
    if (data.id === -1) {
      protectedApi
        .post(`/sessioncentres`, centre)
        .then((res) => {
          setOpen(false);
          setSnackbar({
            children: "Center successfully created",
            severity: "success",
          });
          change((prev) => prev + 1);
        })
        .catch(function (error) {
          console.log(error.response.data.error);
          setSnackbar({
            children: error.response.data.message,
            severity: "error",
          });
        });
    } else {
      protectedApi
        .put(`/sessioncentres/${data.id}`, centre)
        .then((res) => {
          setOpen(false);
          setSnackbar({
            children: "Centre successfully updated",
            severity: "success",
          });
          change((prev) => prev + 1);
        })
        .catch(function (error) {
          setSnackbar({
            children: error.response.data.message,
            severity: "error",
          });
        });
    }
  };

  const handleDataChange = (e) => {
    setData((value) => ({ ...value, [e.target.name]: e.target.type == 'checkbox' ? e.target.checked : e.target.value }));
  };

  React.useEffect(() => {
    protectedApi
      .get("/regions")
      .then((res) => {
        setRegions(res.data.data);
      })
      .catch(function (error) {
        setSnackbar({
          children: error.response.data.message,
          severity: "error",
        });
      });
  }, []);

  React.useEffect(() => {
    if (data?.region) {
      protectedApi
        .get(`/regions/${data.region.id}/departements`)
        .then((res) => {
          setDepartments(res.data.data);
        })
        .catch(function (error) {
          setSnackbar({
            children: error.response.data.message,
            severity: "error",
          });
        });
    }
  }, [data?.region]);

  React.useEffect(() => {
    if (data?.departement) {
      protectedApi
        .get(`/departements/${data.departement.id}/arrondissements`)
        .then((res) => {
          setArrondissements(res.data.data);
        })
        .catch(function (error) {
          setSnackbar({
            children: error.response.data.message,
            severity: "error",
          });
        });
    }
  }, [data?.departement]);

  React.useEffect(() => {
    if (data?.form !== "C" && data?.departement) {
      protectedApi
        .get(
          `/sessions/${data.session.id}/sessioncentres/${data?.departement.id}`
        )
        .then((res) => {
          setCentres(res.data.data);
        })
        .catch(function (error) {
          setSnackbar({
            children: error.response.data.message,
            severity: "error",
          });
        });
    }
  }, [data?.form, data?.departement]);

  React.useEffect(() => {
    if (data?.arrondissement) {
      protectedApi
        .get(`/arrondissements/${data.arrondissement.id}/structures`)
        .then((res) => {
          setStructures(res.data.data);
        })
        .catch(function (error) {
          setSnackbar({
            children: error.response.data.message,
            severity: "error",
          });
        });
    }
  }, [data?.arrondissement]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        Création et Modification des Centres | Sous-centres
      </DialogTitle>
      <DialogContent>
        <Autocomplete
          sx={{ my: 1 }}
          value={data?.region}
          onChange={(event, newValue) => {
            setData((prev) => ({ ...prev, region: newValue }));
          }}
          id="region"
          options={regions}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => <TextField {...params} label="region" />}
        />
        <Autocomplete
          sx={{ my: 1 }}
          value={data?.departement}
          onChange={(event, newValue) => {
            setData((prev) => ({ ...prev, departement: newValue }));
          }}
          id="departement"
          options={departments}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField {...params} label="departement" />
          )}
        />
        <Autocomplete
          sx={{ my: 1 }}
          value={data?.arrondissement}
          onChange={(event, newValue) => {
            setData((prev) => ({ ...prev, arrondissement: newValue }));
          }}
          id="arrondissement"
          options={arrondissements}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField {...params} label="Arrondissement" />
          )}
        />
        <Autocomplete
          sx={{ my: 1 }}
          value={data?.structure}
          onChange={(event, newValue) => {
            setData((prev) => ({ ...prev, structure: newValue }));
          }}
          id="structure"
          options={structures}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField {...params} label="Etablissement" />
          )}
        />
        <FormControl fullWidth>
          <InputLabel id="form-select-label">Form</InputLabel>
          <Select
            sx={{ my: 1 }}
            labelId="form-select-label"
            id="form"
            name="form"
            value={data?.form}
            label="Forme"
            onChange={handleDataChange}
          >
            <MenuItem value="C">Centre</MenuItem>
            <MenuItem value="CA">Centre Assistant</MenuItem>
            <MenuItem value="SC">Sous-Centre</MenuItem>
            <MenuItem value="SA">Sous-Centre Assistant</MenuItem>
          </Select>
        </FormControl>
        {data?.form !== "C" && (
          <Autocomplete
            sx={{ my: 1 }}
            value={data?.centre}
            onChange={(event, newValue) => {
              setData((prev) => ({ ...prev, centre: newValue }));
            }}
            id="centre"
            options={centres}
            getOptionLabel={(option) => option.structure.name}
            renderInput={(params) => <TextField {...params} label="Centre" />}
          />
        )}
        <FormControl fullWidth>
          <InputLabel id="type-select-label">Type</InputLabel>
          <Select
            sx={{ my: 1 }}
            labelId="type-select-label"
            id="type"
            name="type"
            value={data?.type}
            label="Type"
            onChange={handleDataChange}
          >
            <MenuItem value="E">Ecrit</MenuItem>
            <MenuItem value="EC">Ecrit & Correction</MenuItem>
            <MenuItem value="ECD">Ecrit, Correction & Délibération</MenuItem>
            <MenuItem value="EP">Ecrit & Pratique</MenuItem>
            <MenuItem value="EPC">Ecrit, Pratique & Correction</MenuItem>
            <MenuItem value="EPCD">
              Ecrit, Pratique, Correction & Délibération
            </MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={data?.for_oral}
                name="for_oral"
                onChange={handleDataChange}
                inputProps={{ "aria-label": "Centre Oral?" }}
              />
            }
            label="Centre Oral ?"
            labelPlacement="start"
          />
        </FormControl>
        <FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={data?.for_disabled}
                name="for_disabled"
                onChange={handleDataChange}
                inputProps={{ "aria-label": "Centre pour handicapé?" }}
              />
            }
            label="Centre handicapés ?"
            labelPlacement="start"
          />
        </FormControl>
        <FieldSet title="Candidates Information">
          <TextField
            autoFocus
            id="nbr_candidat_ecrit"
            name="nbr_candidat_ecrit"
            label="Nombre de candidats inscrits"
            type="number"
            value={data?.nbr_candidat_ecrit}
            onChange={handleDataChange}
            fullWidth
            variant="standard"
          />
          <TextField
            id="nbr_candidat_inapte"
            name="nbr_candidat_inapte"
            label="Nombre de candidats inaptes"
            type="number"
            value={data?.nbr_candidat_inapte}
            onChange={handleDataChange}
            fullWidth
            variant="standard"
          />
          <TextField
            id="nbr_candidat_epreuve_facultive"
            name="nbr_candidat_epreuve_facultive"
            label="Nombre de candidats à l'épreuve facultative"
            type="number"
            value={data?.nbr_candidat_epreuve_facultive}
            onChange={handleDataChange}
            fullWidth
            variant="standard"
          />
          <TextField
            id="nbr_candidat_oral"
            name="nbr_candidat_oral"
            label="Nombre de candidats à l'oral"
            type="number"
            value={data?.nbr_candidat_oral}
            onChange={handleDataChange}
            fullWidth
            variant="standard"
          />
          <TextField
            id="nbr_candidat_marked"
            name="nbr_candidat_marked"
            label="Nombre de candidats pour correction"
            type="number"
            value={data?.nbr_candidat_marked}
            onChange={handleDataChange}
            fullWidth
            variant="standard"
          />
          <TextField
            id="nbr_copies_marked"
            name="nbr_copies_marked"
            label="Nombre de copies corrigées"
            type="number"
            value={data?.nbr_copies_marked}
            onChange={handleDataChange}
            fullWidth
            variant="standard"
          />
          <TextField
            id="nbr_candidat_delib"
            name="nbr_candidat_delib"
            label="Nombre de candidats pour délibération"
            type="number"
            value={data?.nbr_candidat_delib}
            onChange={handleDataChange}
            fullWidth
            variant="standard"
          />
        </FieldSet>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmission}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
