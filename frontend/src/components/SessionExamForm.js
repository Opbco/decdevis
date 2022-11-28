import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import useApiRequest from "../redux/api/useApiRequest";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, TextField } from "@mui/material";

const FieldSet = styled("fieldset")(({ theme, title }) => ({
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

export default function SessionExamForm({
  setSnackbar,
  open,
  setOpen,
  data,
  setData,
  change,
}) {
  const protectedApi = useApiRequest();

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmission = () => {
    const session = {
      ...data,
      exam: data.exam.id,
    };

    protectedApi
      .put(`/sessions/${data.id}`, session)
      .then((res) => {
        setOpen(false);
        setSnackbar({
          children: "Examen's session successfully set up!!",
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
  };

  const handleDataChange = (e) => {
    setData((value) => ({ ...value, [e.target.name]: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          fontSize: 14,
          color: "CaptionText",
          textTransform: "uppercase",
          fontWeight: "bold",
          letterSpacing: 1,
        }}
      >
        Configurations, {data?.exam.name || " "} ({data?.name || " "})
      </DialogTitle>
      <DialogContent>
        <Box component="form" noValidate autoComplete="off">
          <FieldSet title="Indemnité Chef Centre / Sous-Centre">
            <TextField
              autoFocus
              id="indemnite_chef_centre_write"
              name="indemnite_chef_centre_write"
              label="Indemnité chef de centre"
              type="number"
              value={data?.indemnite_chef_centre_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="indemnite_chef_scentre_write"
              name="indemnite_chef_scentre_write"
              label="Indemnité chef de sous-centre"
              type="number"
              value={data?.indemnite_chef_scentre_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
          </FieldSet>
          <FieldSet title="Vaccation de surveillances">
            <TextField
              id="nbr_candidat_salle_write"
              name="nbr_candidat_salle_write"
              label="Nombre de candidats par salle"
              type="number"
              value={data?.nbr_candidat_salle_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_surveillant_salle_write"
              name="nbr_surveillant_salle_write"
              label="Nombre de surveillant par salle (écrit)"
              type="number"
              value={data?.nbr_surveillant_salle_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_salle_surveillants_write"
              name="nbr_salle_surveillants_write"
              label="Nombre de salle par surveillant de secteur (écrit)"
              type="number"
              value={data?.nbr_salle_surveillants_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_jour_examen_write"
              name="nbr_jour_examen_write"
              label="Nombre de jour d'examen (écrit)"
              type="number"
              value={data?.nbr_jour_examen_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_vaccation_jour_write"
              name="nbr_vaccation_jour_write"
              label="Nombre de vaccation par jour par surveillant (écrit)"
              type="number"
              value={data?.nbr_vaccation_jour_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="taux_vaccation_surveillant_write"
              name="taux_vaccation_surveillant_write"
              label="Montant d'une vaccation surveillance (écrit)"
              type="number"
              value={data?.taux_vaccation_surveillant_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
          </FieldSet>
          <FieldSet title="Vaccation de surveillances des handicapés">
            <TextField
              id="nbr_candidat_salle_hand_write"
              name="nbr_candidat_salle_hand_write"
              label="Nombre de candidats par salle (handicapés)"
              type="number"
              value={data?.nbr_candidat_salle_hand_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_surveillant_salle_hand_write"
              name="nbr_surveillant_salle_hand_write"
              label="Nombre de surveillant par salle (handicapés)"
              type="number"
              value={data?.nbr_surveillant_salle_hand_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_vaccation_transcript_hand_write"
              name="nbr_vaccation_transcript_hand_write"
              label="Nombre de vaccation transcript examen (handicapés)"
              type="number"
              value={data?.nbr_vaccation_transcript_hand_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_vaccation_deroulement_hand_write"
              name="nbr_vaccation_deroulement_hand_write"
              label="Nombre de vaccation déroulement examen (handicapés)"
              type="number"
              value={data?.nbr_vaccation_deroulement_hand_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="indemnite_chef_atelier_hand_write"
              name="indemnite_chef_atelier_hand_write"
              label="Indemnité chef atelier examen (handicapés)"
              type="number"
              value={data?.indemnite_chef_atelier_hand_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="taux_vaccation_surveillant_hand_write"
              name="taux_vaccation_surveillant_hand_write"
              label="Montant d'une vaccation surveillance (handicapés)"
              type="number"
              value={data?.taux_vaccation_surveillant_hand_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
          </FieldSet>
          <FieldSet title="Vaccation Jury Oral">
            <TextField
              autoFocus
              id="nbr_candidat_atelier_oral"
              name="nbr_candidat_atelier_oral"
              label="Nombre de candidats par sous-atelier"
              type="number"
              value={data?.nbr_candidat_atelier_oral}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_matiere_atelier_oral"
              name="nbr_matiere_atelier_oral"
              label="Nombre de matières (Oral)"
              type="number"
              value={data?.nbr_matiere_atelier_oral}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_membre_atelier_oral"
              name="nbr_membre_atelier_oral"
              label="Nombre de membres par sous-atelier (Oral)"
              type="number"
              value={data?.nbr_membre_atelier_oral}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_vaccation_membre_oral"
              name="nbr_vaccation_membre_oral"
              label="Nombre de vaccations par membre (Oral)"
              type="number"
              value={data?.nbr_vaccation_membre_oral}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="taux_vaccation_surveillant_oral"
              name="taux_vaccation_surveillant_oral"
              label="Montant de la vaccation (Oral)"
              type="number"
              value={data?.taux_vaccation_surveillant_oral}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="indemnite_chef_salle_oral"
              name="indemnite_chef_salle_oral"
              label="Indemnité chef de salle sous-atelier (Oral)"
              type="number"
              value={data?.indemnite_chef_salle_oral}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
          </FieldSet>
          <FieldSet title="Vaccation sécrétariat / Indemnités chef sécrétariat">
            <TextField
              autoFocus
              id="nbr_vaccation_jour_sec_write"
              name="nbr_vaccation_jour_sec_write"
              label="Nombre de vaccation par jour"
              type="number"
              value={data?.nbr_vaccation_jour_sec_write}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_vaccation_sec_correct"
              name="nbr_vaccation_sec_correct"
              label="Nombre de vaccation pendant les corrections"
              type="number"
              value={data?.nbr_vaccation_sec_correct}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_vaccation_sec_delib"
              name="nbr_vaccation_sec_delib"
              label="Nombre de vaccation pendant les délibérations"
              type="number"
              value={data?.nbr_vaccation_sec_delib}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="taux_vaccation_sec"
              name="taux_vaccation_sec"
              label="Montant de la vaccation des membres du sécrétariat"
              type="number"
              value={data?.taux_vaccation_sec}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_jour_examen_pratique"
              name="nbr_jour_examen_pratique"
              label="Nombre de jour examen pratique"
              type="number"
              value={data?.nbr_jour_examen_pratique}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="indemnite_chef_sec"
              name="indemnite_chef_sec"
              label="Indemnité chef sécrétariat (Centre écrit, correct et délibération)"
              type="number"
              value={data?.indemnite_chef_sec}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="indemnite_chef_sec_all"
              name="indemnite_chef_sec_all"
              label="Indemnité chef sécrétariat (autres types de centre)"
              type="number"
              value={data?.indemnite_chef_sec_all}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
          </FieldSet>
          <FieldSet title="Chargés de mission">
            <TextField
              autoFocus
              id="taux_vaccation_cm"
              name="taux_vaccation_cm"
              label="Montant de la vaccation pour chargé de mission"
              type="number"
              value={data?.taux_vaccation_cm}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="indemnite_cm"
              name="indemnite_cm"
              label="Indemnité chargé de mission"
              type="number"
              value={data?.indemnite_cm}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
          </FieldSet>
          <FieldSet title="Vaccation corrections / Indemnité chef de salle">
            <TextField
              autoFocus
              id="nbr_matiere_correct"
              name="nbr_matiere_correct"
              label="Nombre de matières|sujets à corriger"
              type="number"
              value={data?.nbr_matiere_correct}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="taux_copie_correct"
              name="taux_copie_correct"
              label="Montant de correction d'une copie"
              type="number"
              value={data?.taux_copie_correct}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="indemnite_chef_salle_correct"
              name="indemnite_chef_salle_correct"
              label="Indemnité chef salle de corrections"
              type="number"
              value={data?.indemnite_chef_salle_correct}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
          </FieldSet>
          <FieldSet title="Vaccation / Indemnité délibération">
            <TextField
              autoFocus
              id="nbr_candidat_jury_delib"
              name="nbr_candidat_jury_delib"
              label="Nombre de candidats par jury de délibération"
              type="number"
              value={data?.nbr_candidat_jury_delib}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_membre_lecteur_delib"
              name="nbr_membre_lecteur_delib"
              label="Nombre de membres lecteur de PV (délibération)"
              type="number"
              value={data?.nbr_membre_lecteur_delib}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_membre_teneur_delib"
              name="nbr_membre_teneur_delib"
              label="Nombre de membres teneur de PV (délibération)"
              type="number"
              value={data?.nbr_membre_teneur_delib}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_vaccation_teneur_delib"
              name="nbr_vaccation_teneur_delib"
              label="Nombre de vaccations par membre teneur de PV"
              type="number"
              value={data?.nbr_vaccation_teneur_delib}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_vaccation_lecteur_delib"
              name="nbr_vaccation_lecteur_delib"
              label="Nombre de vaccations par membre lecteur de PV"
              type="number"
              value={data?.nbr_vaccation_lecteur_delib}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="taux_vaccation_membre_delib"
              name="taux_vaccation_membre_delib"
              label="Montant d'une vaccation pour membre jury de délibération"
              type="number"
              value={data?.taux_vaccation_membre_delib}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="indemnite_president_jury_delib"
              name="indemnite_president_jury_delib"
              label="Indemnité du Président du jury de délibération"
              type="number"
              value={data?.indemnite_president_jury_delib}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="indemnite_vpresident_jury_delib"
              name="indemnite_vpresident_jury_delib"
              label="Indemnité du Vice Président du jury de délibération"
              type="number"
              value={data?.indemnite_vpresident_jury_delib}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
          </FieldSet>
          <FieldSet title="Vaccation sécrétariat dispatching">
            <TextField
              autoFocus
              id="nbr_vaccation_prepa_dispatch"
              name="nbr_vaccation_prepa_dispatch"
              label="Nombre de vaccation phase préparatoire"
              type="number"
              value={data?.nbr_vaccation_prepa_dispatch}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_vaccation_awrite_dispatch"
              name="nbr_vaccation_awrite_dispatch"
              label="Nombre de vaccations phase après écrit"
              type="number"
              value={data?.nbr_vaccation_awrite_dispatch}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_vaccation_acorrect_dispatch"
              name="nbr_vaccation_acorrect_dispatch"
              label="Nombre de vaccations phase après correction"
              type="number"
              value={data?.nbr_vaccation_acorrect_dispatch}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_vaccation_adelib_dispatch"
              name="nbr_vaccation_adelib_dispatch"
              label="Nombre de vaccations phase après délibération"
              type="number"
              value={data?.nbr_vaccation_adelib_dispatch}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="taux_vaccation_membre_dispatch"
              name="taux_vaccation_membre_dispatch"
              label="Montant d'une vaccation pour membre sécrétariat dispatching"
              type="number"
              value={data?.taux_vaccation_membre_dispatch}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="indemnite_chef_sec_dispacth"
              name="indemnite_chef_sec_dispacth"
              label="Indemnité chef sécrétariat du dispatching"
              type="number"
              value={data?.indemnite_chef_sec_dispacth}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
          </FieldSet>
          <FieldSet title="Vaccation Jury Harmonisation des corrigés">
            <TextField
              autoFocus
              id="nbr_vaccation_membre_harmo"
              name="nbr_vaccation_membre_harmo"
              label="Nombre de vaccation par membre"
              type="number"
              value={data?.nbr_vaccation_membre_harmo}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_membre_jury_harmo"
              name="nbr_membre_jury_harmo"
              label="Nombre de membres par jury"
              type="number"
              value={data?.nbr_membre_jury_harmo}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="nbr_vaccation_responsable_harmo"
              name="nbr_vaccation_responsable_harmo"
              label="Nombre de vaccation par responsable"
              type="number"
              value={data?.nbr_vaccation_responsable_harmo}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="taux_vaccation_harmo"
              name="taux_vaccation_harmo"
              label="Montant d'une vaccation pour membre jury harmonisation"
              type="number"
              value={data?.taux_vaccation_harmo}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
            <TextField
              id="taux_vaccation_harmo"
              name="taux_vaccation_harmo"
              label="Montant d'une vaccation pour membre jury harmonisation"
              type="number"
              value={data?.taux_vaccation_harmo}
              onChange={handleDataChange}
              fullWidth
              variant="standard"
            />
          </FieldSet>
          {Boolean(
            data?.exam?.code === "CAP STT" || data?.exam?.code === "CAPI"
          ) && (
            <FieldSet title="Pratique, Main d'oeuvre et Atelier">
              <TextField
                id="taux_correction_cgao_gso"
                name="taux_correction_cgao_gso"
                label="Montant correction CGAO/GSO"
                type="number"
                value={data?.taux_correction_cgao_gso}
                onChange={handleDataChange}
                fullWidth
                variant="standard"
              />
              <TextField
                id="indemnite_chef_atelier_pratique"
                name="indemnite_chef_atelier_pratique"
                label="Indemnité chef d'atelier pratique"
                type="number"
                value={data?.indemnite_chef_atelier_pratique}
                onChange={handleDataChange}
                fullWidth
                variant="standard"
              />
              <TextField
                id="taux_preparation_atelier_candidat"
                name="taux_preparation_atelier_candidat"
                label="Montant préparation atelier par candidat"
                type="number"
                value={data?.taux_preparation_atelier_candidat}
                onChange={handleDataChange}
                fullWidth
                variant="standard"
              />
              <TextField
                id="taux_matiere_oeuvre_esf_candidat"
                name="taux_matiere_oeuvre_esf_candidat"
                label="Montant matière d'oeuvre ESF par candidat"
                type="number"
                value={data?.taux_matiere_oeuvre_esf_candidat}
                onChange={handleDataChange}
                fullWidth
                variant="standard"
              />
              <TextField
                id="taux_matiere_oeuvre_stt_candidat"
                name="taux_matiere_oeuvre_stt_candidat"
                label="Montant matière d'oeuvre STT par candidat"
                type="number"
                value={data?.taux_matiere_oeuvre_stt_candidat}
                onChange={handleDataChange}
                fullWidth
                variant="standard"
              />
              <TextField
                id="taux_vaccation_examinateur_pratique"
                name="taux_vaccation_examinateur_pratique"
                label="Montant vaccation examinateur pratique"
                type="number"
                value={data?.taux_vaccation_examinateur_pratique}
                onChange={handleDataChange}
                fullWidth
                variant="standard"
              />
              <TextField
                id="nbr_examinateur_atelier_pratique"
                name="nbr_examinateur_atelier_pratique"
                label="Nombre d'examinateur par atelier pratique"
                type="number"
                value={data?.nbr_examinateur_atelier_pratique}
                onChange={handleDataChange}
                fullWidth
                variant="standard"
              />
            </FieldSet>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmission}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
