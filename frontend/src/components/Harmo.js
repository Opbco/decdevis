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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}, &.${tableCellClasses.footer}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    textAlign: "center",
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
    id: "nbr_matiere",
    label: "Nombre de Matières",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vac_resp",
    label: "Nombre de vac par responsable",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_vac_mem",
    label: "Nombre de vac par membre",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "nbr_memb_jur",
    label: "Nombre de membre par jury",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
  {
    id: "total_vac_jury",
    label: "Total vac par jury",
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
    id: "frais",
    label: "Montant",
    minWidth: 80,
    format: (value) => value.toLocaleString("fr-Fr"),
  },
];

export default function Harmo({ download, setDownload, session, region }) {
  const [rows, setRows] = useState([]);
  const protectedApi = useApiRequest();
  const { t } = useTranslation(["common"]);

  React.useEffect(() => {
    protectedApi
      .get(
        `/sessions/${session.id}/sessioncentres?type=harmo&region=${region?.id}`
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
          `/sessions/${session.id}/sessioncentres?type=harmo&format=csv&region=${region?.id}`,
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
            {columns.map((column) => (
              <StyledTableCell
                key={column.id}
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
