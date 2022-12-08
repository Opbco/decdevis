import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import useApiRequest from "../redux/api/useApiRequest";
import { TableFooter } from "@mui/material";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}, &.${tableCellClasses.footer}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
  [`&.${tableCellClasses.footer}`]: {
    fontSize: 14,
    textTransform: "uppercase",
  },
}));

const columns = [
  { id: "region", label: "Région", minWidth: 110 },
  {
    id: "effectif",
    label: "Effectif",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nb_member",
    label: "Nbr de membres (Chef inclus)",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vac_prepa",
    label: "Préparation",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vac_ae",
    label: "Après écrit",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vac_ac",
    label: "Après Correction",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vac_ad",
    label: "Après Délibération",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vac_membre",
    label: "Nbr Vac. par Membre",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "taux_vac",
    label: "Taux Vacation",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "montant_vac",
    label: "Montant Vacations",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "indemnite",
    label: "Indemnité chef Sec.",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "frais",
    label: "Montant",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
];

export default function Dispatching({
  download,
  setDownload,
  session,
  region,
}) {
  const [rows, setRows] = useState([]);
  const protectedApi = useApiRequest();
  const { t } = useTranslation(["common"]);

  React.useEffect(() => {
    protectedApi
      .get(
        `/sessions/${session.id}/sessioncentres?type=dispatch&region=${region?.id}`
      )
      .then((res) => {
        setRows(res.data.data);
      })
      .catch(function (error) {
        Swal.fire(t("error"), error.message, "error");
      });
  }, [session, region]);

  React.useEffect(() => {
    if (download) {
      protectedApi
        .get(
          `/sessions/${session.id}/sessioncentres?type=dispatch&format=csv&region=${region?.id}`,
          {
            responseType: "blob",
          }
        )
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "fraisOrganisation.csv");
          link.click();
          setDownload(false);
          window.URL.revokeObjectURL(url);
        })
        .catch(function (error) {
          Swal.fire(t("error"), error.message, "error");
          setDownload(false);
        });
    }
  }, [session, region, download]);

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell rowSpan={2} style={{ top: 57, minWidth: 80 }}>
              Région
            </StyledTableCell>
            <StyledTableCell rowSpan={2} style={{ top: 57, minWidth: 80 }}>
              Effectifs
            </StyledTableCell>
            <StyledTableCell rowSpan={2} style={{ top: 57, minWidth: 80 }}>
              Nbr membres (Chef inclu)
            </StyledTableCell>
            <StyledTableCell colSpan={7} style={{ top: 57, minWidth: 80, textAlign: "center" }}>
              Vacations
            </StyledTableCell>
            <StyledTableCell rowSpan={2} style={{ top: 57, minWidth: 80 }}>
              Indemnité Chef Sec.
            </StyledTableCell>
            <StyledTableCell rowSpan={2} style={{ top: 57, minWidth: 80 }}>
              Total
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell style={{ top: 57, minWidth: 80 }}>
              Préparation
            </StyledTableCell>
            <StyledTableCell style={{ top: 57, minWidth: 80 }}>
              Après écrit
            </StyledTableCell>
            <StyledTableCell style={{ top: 57, minWidth: 80 }}>
              Après correction
            </StyledTableCell>
            <StyledTableCell style={{ top: 57, minWidth: 80 }}>
              Après délibération
            </StyledTableCell>
            <StyledTableCell style={{ top: 57, minWidth: 80 }}>
              Nbr Vac. par Membre
            </StyledTableCell>
            <StyledTableCell style={{ top: 57, minWidth: 80 }}>
              Taux
            </StyledTableCell>
            <StyledTableCell style={{ top: 57, minWidth: 80 }}>
              Montant
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            return (
              <TableRow hover tabIndex={-1} key={`row${index}`}>
                {columns.map((column) => {
                  const value = row[column.id];

                  return (
                    <TableCell key={column.id}>
                      {column.format && typeof value === "number"
                        ? column.format(value)
                        : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
