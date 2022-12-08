import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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
    id: "form",
    label: "Statut",
    minWidth: 18,
  },
  {
    id: "effectif",
    label: "Effectif",
    minWidth: 30,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_jury",
    label: "Nombre de jury",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_membre_lec",
    label: "Nombre",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "vac_membre_lec",
    label: "Nombre vacations",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_membre_ten",
    label: "Nombre",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "vac_membre_ten",
    label: "Nombre vacations",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "total_vac_jury",
    label: "Total vacations",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "taux_vac_jury",
    label: "Taux vacations",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "montant_vac_jury",
    label: "Montant vacations jury",
    minWidth: 30,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_pr_jury",
    label: "Nombre PR",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "indemnite_pr_jury",
    label: "Indemnité",
    minWidth: 45,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vpr_jury",
    label: "Nombre VPR",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "indemnite_vpr_jury",
    label: "Indemnité",
    minWidth: 45,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "montant_indemnite",
    label: "Montant Indemnité",
    minWidth: 45,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "total",
    label: "Montant",
    minWidth: 45,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
];

export default function DelibIndJury({
  download,
  setDownload,
  session,
  region,
}) {
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
        `/sessions/${session.id}/sessioncentres?type=delibind&region=${region?.id}`
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
          `/sessions/${session.id}/sessioncentres?type=delibind&format=csv&region=${region?.id}`,
          {
            responseType: "blob",
          }
        )
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "vaccations_jury_delib_ind.csv");
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
            <StyledTableCell
              key="departement"
              verticale={false}
              style={{ top: 57, minWidth: 50 }}
              rowSpan={3}
            >
              Département
            </StyledTableCell>
            <StyledTableCell
              key="centre"
              verticale={false}
              style={{ top: 57, minWidth: 100 }}
              rowSpan={3}
            >
              Centre
            </StyledTableCell>
            <StyledTableCell
              key="scentre"
              verticale={false}
              style={{ top: 57, minWidth: 100 }}
              rowSpan={3}
            >
              Sous-centre
            </StyledTableCell>
            <StyledTableCell
              key="status"
              verticale={false}
              style={{ top: 57, minWidth: 18 }}
              rowSpan={3}
            >
              Statut
            </StyledTableCell>
            <StyledTableCell
              key="effectifs"
              verticale={false}
              style={{ top: 57, minWidth: 20 }}
              rowSpan={3}
            >
              Effectifs
            </StyledTableCell>
            <StyledTableCell
              key="nbrjury"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
              rowSpan={3}
            >
              Nombre Jury
            </StyledTableCell>
            <StyledTableCell
              key="membjury"
              verticale={false}
              style={{ top: 57, minWidth: 120, textAlign: "center" }}
              colSpan={7}
            >
              Membres du jury
            </StyledTableCell>
            <StyledTableCell
              key="presjury"
              verticale={false}
              style={{ top: 57, minWidth: 120, textAlign: "center" }}
              colSpan={5}
            >
              Président du jury
            </StyledTableCell>
            <StyledTableCell
              key="total"
              verticale={false}
              style={{ top: 57, minWidth: 120 }}
              rowSpan={3}
            >
              Total
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell
              key="membLec"
              verticale={false}
              style={{ top: 57, minWidth: 36, textAlign: "center" }}
              colSpan={2}
            >
              Membres Lecteurs
            </StyledTableCell>
            <StyledTableCell
              key="membLec"
              verticale={false}
              style={{ top: 57, minWidth: 36, textAlign: "center" }}
              colSpan={2}
            >
              Membres Teneurs PV
            </StyledTableCell>
            <StyledTableCell
              key="totVacJ"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
              rowSpan={2}
            >
              Total Vacation / Jury
            </StyledTableCell>
            <StyledTableCell
              key="tauxVacJ"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
              rowSpan={2}
            >
              Taux Vacation
            </StyledTableCell>
            <StyledTableCell
              key="montantVacJ"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
              rowSpan={2}
            >
              Montant
            </StyledTableCell>
            <StyledTableCell
              key="presijury"
              verticale={false}
              style={{ top: 57, minWidth: 36, textAlign: "center" }}
              colSpan={2}
            >
              President jury
            </StyledTableCell>
            <StyledTableCell
              key="vpresijury"
              verticale={false}
              style={{ top: 57, minWidth: 36, textAlign: "center" }}
              colSpan={2}
            >
              Vice Président
            </StyledTableCell>
            <StyledTableCell
              key="montantprJ"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
              rowSpan={2}
            >
              Montant
            </StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell
              key="nbrmeml"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
            >
              Nombre
            </StyledTableCell>
            <StyledTableCell
              key="vacmeml"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
            >
              Vacations
            </StyledTableCell>
            <StyledTableCell
              key="nbrmemt"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
            >
              Nombre
            </StyledTableCell>
            <StyledTableCell
              key="nbrprj"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
            >
              Vacations
            </StyledTableCell>
            <StyledTableCell
              key="nbrvprj"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
            >
              Nombre
            </StyledTableCell>
            <StyledTableCell
              key="indemniteprj"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
            >
              Indemnité
            </StyledTableCell>
            <StyledTableCell
              key="nbrvprj"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
            >
              Nombre
            </StyledTableCell>
            <StyledTableCell
              key="indemnitevprj"
              verticale={true}
              style={{ top: 57, minWidth: 18 }}
            >
              Indemnité
            </StyledTableCell>
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
            <StyledTableCell colSpan={4}>
              {Boolean(region)
                ? `Total région ${region?.name} :`
                : `Total Nationale :`}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "effectif")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "nbr_jury")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "nbr_membre_lec")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "vac_membre_lec")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "nbr_membre_ten")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "vac_membre_ten")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "total_vac_jury")}
            </StyledTableCell>
            <StyledTableCell>...</StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalMontant(rows, "montant_vac_jury")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "nbr_pr_jury")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalMontant(rows, "indemnite_pr_jury")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalNombre(rows, "nbr_vpr_jury")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalMontant(rows, "indemnite_vpr_jury")}
            </StyledTableCell>
            <StyledTableCell>
              {ccyFormatTotalMontant(rows, "montant_indemnite")}
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
