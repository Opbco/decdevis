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
import { ccyFormatTotalMontant, ccyFormatTotalNombre } from "../utils/formats";

const StyledTableCell = styled(TableCell)(({ theme, verticale }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: 10,
    ...(verticale && { writingMode: "vertical-lr" }),
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 9,
  },
  [`&.${tableCellClasses.footer}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: 10,
    textTransform: "uppercase",
  },
}));

const columns = [
  { id: "departement", label: "Département", minWidth: 50 },
  {
    id: "centre",
    label: "Centre",
    minWidth: 100,
  },
  {
    id: "scentre",
    label: "Sous-centre",
    minWidth: 100,
  },
  {
    id: "effectif",
    label: "Effectif",
    minWidth: 30,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nb_sous_atelier",
    label: "Nbr sous-atelier",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nb_matiere_oral",
    label: "Nbr de matières",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nb_vac_membre",
    label: "Nbr Vac par membre",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nombre_total_membre",
    label: "Nbr total membres par sous-atelier",
    minWidth: 18,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "total_vac",
    label: "Total Vacations",
    minWidth: 18,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "taux_vac",
    label: "Taux Vacation",
    minWidth: 18,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "montant",
    label: "Montant",
    minWidth: 30,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "indemnite",
    label: "Indemnité Chef salle",
    minWidth: 45,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "total",
    label: "Total",
    minWidth: 45,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
];

export default function VacOralInd({ download, setDownload, session, region }) {
  const [rows, setRows] = useState([]);
  const protectedApi = useApiRequest();
  const { t } = useTranslation(["common"]);
  const [countDep, setCountDep] = useState(null);
  const [countCentre, setCountCentre] = useState(null);
  var idep = 0;
  var icen = 0;

  React.useEffect(() => {
    protectedApi
      .get(
        `/sessions/${session.id}/sessioncentres?type=oralind&region=${region?.id}`
      )
      .then((res) => {
        let data = res.data.data;
        data.sort(
          (a, b) =>
            a.region.localeCompare(b.region) ||
            a.departement.localeCompare(b.departement) ||
            a.effectif - b.effectif
        );
        setCountDep(
          data.reduce(
            (acc, curr) => (
              (acc[curr.departement] = (acc[curr.departement] || 0) + 1), acc
            ),
            {}
          )
        );

        setCountCentre(
          data.reduce(
            (acc, curr) => (
              (acc[curr.centre] = (acc[curr.centre] || 0) + 1), acc
            ),
            {}
          )
        );
        setRows(data);
      })
      .catch(function (error) {
        Swal.fire(t("error"), error.message, "error");
      });
  }, [session, region]);

  React.useEffect(() => {
    if (download) {
      protectedApi
        .get(
          `/sessions/${session.id}/sessioncentres?type=oralind&format=csv&region=${region?.id}`,
          {
            responseType: "blob",
          }
        )
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "vacations_oral_ind.csv");
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
            {columns.map((column) => (
              <StyledTableCell
                key={column.id}
                verticale={column.verticale}
                style={{ top: 57, minWidth: column.minWidth }}
              >
                {column.label}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            return (
              <TableRow hover tabIndex={-1} key={`row${index}`}>
                {columns.map((column) => {
                  const value = row[column.id];
                  if (column.id === "departement") {
                    if (idep === 0) {
                      idep++;
                      idep = idep === countDep[value] ? 0 : idep + 1;
                      return (
                        <TableCell key={column.id} rowSpan={countDep[value]}>
                          {column.format && typeof value === "number"
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    } else {
                      idep = idep === countDep[value] ? 0 : idep + 1;
                      return;
                    }
                  }

                  if (column.id === "centre") {
                    if (icen === 0) {
                      icen++;
                      icen = icen === countCentre[value] ? 0 : icen + 1;
                      return (
                        <TableCell key={column.id} rowSpan={countCentre[value]}>
                          {column.format && typeof value === "number"
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    } else {
                      icen = icen === countCentre[value] ? 0 : icen + 1;
                      return;
                    }
                  }

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
        <TableFooter>
          <TableRow>
            <StyledTableCell colSpan={3}>
              {Boolean(region)
                ? `Total région ${region?.name} :`
                : `Total Nationale :`}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "effectif")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "nb_sous_atelier")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "nb_matiere_oral")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "nb_vac_membre")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "nombre_total_membre")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "total_vac")}
            </StyledTableCell>
            <StyledTableCell>...</StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalMontant(rows, "montant")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalMontant(rows, "indemnite")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalMontant(rows, "total")}
            </StyledTableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
