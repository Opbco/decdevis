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
    id: "status",
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
    id: "nbr_membre_sec",
    label: "Nombre de membre (chef inclus)",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vaccation_aecrit_sec",
    label: "Nombre de vaccations (AvE)",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vaccation_ecrit_sec",
    label: "Nombre de vaccations (E)",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vaccation_apecrit_sec",
    label: "Nombre de vaccations (AE)",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vaccation_correct_sec",
    label: "Nombre de vaccations (C)",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vaccation_delib_sec",
    label: "Nombre de vaccations (D)",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "taux_vaccation_sec",
    label: "Taux vaccation",
    minWidth: 18,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "total_membre_sec",
    label: "Montant Vaccations",
    minWidth: 45,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "indemnite_chef_sec",
    label: "Indemnité Chef",
    minWidth: 45,
    verticale: true,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "montant",
    label: "Montant",
    minWidth: 45,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
];

function ccyFormatEffectifs(nums) {
  let effs = Boolean(nums.length) && nums.reduce((s, a) => s + a.effectif, 0);
  return Boolean(nums.length) ? `${effs.toLocaleString("fr-Fr")}` : "0";
}

function ccyFormatNbVaccAvE(nums) {
  let salles =
    Boolean(nums.length) &&
    nums.reduce((s, a) => s + a.nbr_vaccation_aecrit_sec, 0);
  return Boolean(nums.length) ? `${salles.toLocaleString("fr-Fr")}` : "0";
}

function ccyFormatNbVaccE(nums) {
  let salles =
    Boolean(nums.length) &&
    nums.reduce((s, a) => s + a.nbr_vaccation_ecrit_sec, 0);
  return Boolean(nums.length) ? `${salles.toLocaleString("fr-Fr")}` : "0";
}

function ccyFormatNbVaccAE(nums) {
  let salles =
    Boolean(nums.length) &&
    nums.reduce((s, a) => s + a.nbr_vaccation_apecrit_sec, 0);
  return Boolean(nums.length) ? `${salles.toLocaleString("fr-Fr")}` : "0";
}

function ccyFormatNbVaccC(nums) {
  let salles =
    Boolean(nums.length) &&
    nums.reduce((s, a) => s + a.nbr_vaccation_correct_sec, 0);
  return Boolean(nums.length) ? `${salles.toLocaleString("fr-Fr")}` : "0";
}

function ccyFormatNbVaccD(nums) {
  let salles =
    Boolean(nums.length) &&
    nums.reduce((s, a) => s + a.nbr_vaccation_delib_sec, 0);
  return Boolean(nums.length) ? `${salles.toLocaleString("fr-Fr")}` : "0";
}

function ccyFormatTotalVacc(nums) {
  let survs =
    Boolean(nums.length) && nums.reduce((s, a) => s + a.total_membre_sec, 0);
  return Boolean(nums.length)
    ? `${survs.toLocaleString("fr-Fr", {
        style: "currency",
        currency: "XAF",
      })}`
    : "0";
}

function ccyFormatIndemnite(nums) {
  let survss =
    Boolean(nums.length) && nums.reduce((s, a) => s + a.indemnite_chef_sec, 0);
  return Boolean(nums.length)
    ? `${survss.toLocaleString("fr-Fr", {
        style: "currency",
        currency: "XAF",
      })}`
    : "0";
}

function ccyFormatNbMemb(nums) {
  let vaccs =
    Boolean(nums.length) && nums.reduce((s, a) => s + a.nbr_membre_sec, 0);
  return Boolean(nums.length) ? `${vaccs.toLocaleString("fr-Fr")}` : "0";
}

function ccyFormat(nums) {
  let frais = Boolean(nums.length) && nums.reduce((s, a) => s + a.montant, 0);
  return Boolean(nums.length)
    ? `${frais.toLocaleString("fr-Fr", {
        style: "currency",
        currency: "XAF",
      })}`
    : "0";
}

export default function VaccSecInd({ download, setDownload, session, region }) {
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
        `/sessions/${session.id}/sessioncentres?type=vaccseci&region=${region?.id}`
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
          `/sessions/${session.id}/sessioncentres?type=vaccseci&format=csv&region=${region?.id}`,
          {
            responseType: "blob",
          }
        )
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "vaccations_secretariat_ind.csv");
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
            <StyledTableCell colSpan={4}>
              {Boolean(region)
                ? `Total région ${region?.name} :`
                : `Total Nationale :`}
            </StyledTableCell>
            <StyledTableCell>{ccyFormatEffectifs(rows)}</StyledTableCell>
            <StyledTableCell>{ccyFormatNbMemb(rows)}</StyledTableCell>
            <StyledTableCell>{ccyFormatNbVaccAvE(rows)}</StyledTableCell>
            <StyledTableCell>{ccyFormatNbVaccE(rows)}</StyledTableCell>
            <StyledTableCell>{ccyFormatNbVaccAE(rows)}</StyledTableCell>
            <StyledTableCell>{ccyFormatNbVaccC(rows)}</StyledTableCell>
            <StyledTableCell>{ccyFormatNbVaccD(rows)}</StyledTableCell>
            <StyledTableCell>...</StyledTableCell>
            <StyledTableCell>{ccyFormatTotalVacc(rows)}</StyledTableCell>
            <StyledTableCell>{ccyFormatIndemnite(rows)}</StyledTableCell>
            <StyledTableCell>{ccyFormat(rows)}</StyledTableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
