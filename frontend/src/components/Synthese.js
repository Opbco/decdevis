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
  {
    id: "effectif",
    label: "Effectif",
    minWidth: 30,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "frais_organisation",
    label: "Frais organisation",
    minWidth: 30,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "indemnite_chef_centre",
    label: "Chef centre",
    minWidth: 18,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "vac_surveillances",
    label: "Surviellance",
    minWidth: 18,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "vac_surveillances_hand",
    label: "Surviellance Handicapés",
    minWidth: 18,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "vac_jury_oral",
    label: "Oral bilingue",
    minWidth: 18,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "vac_sec_ind",
    label: "Sécrétariat",
    minWidth: 18,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "charge_mission",
    label: "Chargé de mission",
    minWidth: 18,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "vac_correct_ind",
    label: "Correction",
    minWidth: 18,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "indemnite_deliberation",
    label: "Délibération",
    minWidth: 18,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "dispatching",
    label: "Dispache",
    minWidth: 30,
    verticale: false,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "vac_jury_harmonisation",
    label: "Harmonisation",
    minWidth: 45,
    verticale: false,
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

export function ccyFormatTotal(nums, dispat = 0) {
  let montant =
    Boolean(nums.length) &&
    nums.reduce(
      (s, a) =>
        s +
        (a.frais_organisation +
          a.indemnite_chef_centre +
          a.vac_surveillances +
          a.vac_surveillances_hand +
          a.vac_jury_oral +
          a.vac_sec_ind +
          a.charge_mission +
          a.vac_correct_ind +
          a.indemnite_deliberation +
          a.vac_jury_harmonisation),
      0
    );
  montant += dispat;
  return Boolean(nums.length)
    ? `${montant.toLocaleString("fr-Fr", {
        style: "currency",
        currency: "XAF",
      })}`
    : "0";
}

export default function Synthese({ download, setDownload, session, region }) {
  const [rows, setRows] = useState([]);
  const protectedApi = useApiRequest();
  const { t } = useTranslation(["common"]);

  React.useEffect(() => {
    protectedApi
      .get(
        `/sessions/${session.id}/sessioncentres?type=synthese&region=${region?.id}`
      )
      .then((res) => {
        let data = res.data.data;
        data.sort(
          (a, b) =>
            a.region.localeCompare(b.region) ||
            a.departement.localeCompare(b.departement) ||
            a.effectif - b.effectif
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
          `/sessions/${session.id}/sessioncentres?type=synthese&format=csv&region=${region?.id}`,
          {
            responseType: "blob",
          }
        )
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "synthese.csv");
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
          <StyledTableCell>
            {ccyFormatTotalNombre(rows, "effectif")}
          </StyledTableCell>
          <StyledTableCell>
            {ccyFormatTotalMontant(rows, "frais_organisation")}
          </StyledTableCell>
          <StyledTableCell>
            {ccyFormatTotalMontant(rows, "indemnite_chef_centre")}
          </StyledTableCell>
          <StyledTableCell>
            {ccyFormatTotalMontant(rows, "vac_surveillances")}
          </StyledTableCell>
          <StyledTableCell>
            {ccyFormatTotalMontant(rows, "vac_surveillances_hand")}
          </StyledTableCell>
          <StyledTableCell>
            {ccyFormatTotalMontant(rows, "vac_jury_oral")}
          </StyledTableCell>
          <StyledTableCell>
            {ccyFormatTotalMontant(rows, "vac_sec_ind")}
          </StyledTableCell>
          <StyledTableCell>
            {ccyFormatTotalMontant(rows, "charge_mission")}
          </StyledTableCell>
          <StyledTableCell>
            {ccyFormatTotalMontant(rows, "vac_correct_ind")}
          </StyledTableCell>
          <StyledTableCell>
            {ccyFormatTotalMontant(rows, "indemnite_deliberation")}
          </StyledTableCell>
          <StyledTableCell>{rows[0]?.dispatching}</StyledTableCell>
          <StyledTableCell>
            {ccyFormatTotalMontant(rows, "vac_jury_harmonisation")}
          </StyledTableCell>
          <StyledTableCell>
            {ccyFormatTotal(rows, rows[0]?.dispatching)}
          </StyledTableCell>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
