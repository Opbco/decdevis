import React from "react";
import { styled } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Entete = styled("h6")(
  ({ margin = 0.5, size = 8, underlined = false }) => ({
    fontWeight: "bold",
    fontSize: size,
    textAlign: "center",
    position: "relative",
    ["&::before"]: {
      content: underlined ? `"- - - - - -"` : `""`,
      position: "absolute",
      top: "60%",
      fontWeight: "bold",
      left: 0,
      right: 0,
      fontSize: 12,
    },
  })
);

const PageHeader = ({ session, title, region }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        marginBlockEnd: "1rem",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
            maxWidth: "40%",
          }}
        >
          <Entete>REPUBLIQUE DU CAMEROUN</Entete>
          <Entete underlined={true}>Paix - Travail - Patrie</Entete>
          <Entete underlined={true}>
            MINISTERE DES ENSEIGNEMENTS SECONDAIRES
          </Entete>
          <Entete underlined={true}>
            SECRETARIAT D’ETAT AUPRES DU MINISTRE DES ENSEIGNEMENTS SECONDAIRES,
            CHARGE DE L'ENSEIGNEMENT NORMAL
          </Entete>
          <Entete underlined={true}>SECRETARIAT GENERAL</Entete>
          <Entete underlined={true}>
            DIRECTION DES EXAMENS, DES CONCOURS ET DE LA CERTIFICATION
          </Entete>
          <Entete underlined={true}>
            SOUS - DIRECTION DU MATERIEL, DE LIAISON ET DU CONTRÔLE
          </Entete>
          <Entete underlined={true}>SERVICE DU MATERIEL ET DE LIAISON</Entete>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <img
            alt="MINESEC"
            src="/assets/images/minesec_logo.jpg"
            style={{ width: "100px", aspectRatio: 1, objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
            maxWidth: "40%",
          }}
        >
          <Entete>REPUBLIC OF CAMEROON</Entete>
          <Entete underlined={true}>Peace-Work-Fatherland</Entete>
          <Entete underlined={true}>MINISTRY OF SECONDARY EDUCATION</Entete>
          <Entete underlined={true}>
            SECRETARIAT OF STATE IN THE MINISTRY OF SECONDARY EDUCATION IN
            CHARGE OF TEACHER'S TRAINING
          </Entete>
          <Entete underlined={true}>SECRETARIAT GENERAL</Entete>
          <Entete underlined={true}>
            DEPARTMENT OF EXAMINATIONS AND CERTIFICATION
          </Entete>
          <Entete underlined={true}>
            SUB DEPARTMENT OF MATERIAL, LIAISON AND CONTROL
          </Entete>
          <Entete underlined={true}>SERVICE OF MATERIAL AND LIAISON</Entete>
        </div>
      </div>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Typography
          variant="caption"
          sx={{ fontSize: 18, textAlign: "center" }}
        >{`${session.exam.name}, SESSION ${session.name}`}</Typography>
      </Box>
      <Box display="flex" justifyContent="center">
        <Typography
          sx={{ fontSizeAdjust: "revert", fontWeight: "bold" }}
          variant="h6"
        >
          {title}
        </Typography>
      </Box>
      {Boolean(region) && (
        <Box>
          <Typography
            fontWeight="bold"
            variant="subtitle2"
            textTransform="uppercase"
          >
            REGION: {region?.name}
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default PageHeader;
