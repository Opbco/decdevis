import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { DataGrid, GridRowModes, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid';
import Swal from "sweetalert2";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTranslation } from "react-i18next";
import { Typography } from '@mui/material';
import useApiRequest from '../redux/api/useApiRequest';


function renderObject(params) {
    return (<Typography component="h5">{params.value}</Typography>);
}

export default function Structure() {
    const { t } = useTranslation(["common"]);
    const [structures, setStructures] = React.useState([]);
    const [snackbar, setSnackbar] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const protectedApi = useApiRequest();
    const handleCloseSnackbar = () => setSnackbar(null);



    const handleDeleteClick = (id) => () => {
        protectedApi.delete(`/structures/${id}`).then((res) => {
            setStructures(structures.filter((row) => row.id !== id));
            setSnackbar({ children: 'Structure successfully deleted', severity: 'success' });
        }).catch(function (error) {
            Swal.fire(t("error"), error.message, "error");
        });
    };

    const columns = [
        { field: 'id', headerName: 'ID', type: 'number', width: 100, editable: false },
        {
            field: 'name', headerName: 'Name', width: 300, editable: false
        },
        {
            field: 'forme', headerName: 'Forme', width: 150, editable: false
        },
        {
            field: 'ordre', headerName: 'Ordre', width: 150, editable: false
        },
        {
            field: 'language', headerName: 'Language', width: 100, editable: false
        },
        {
            field: 'contacts', headerName: 'Contacts', width: 150, editable: false
        },
        {
            field: 'adresse', headerName: 'Adresse', width: 200, editable: false
        },
        {
            field: 'arrondissement', type: 'string', valueGetter: ({ value }) => `${value.name}`, headerName: 'Arrondissement', renderCell: renderObject, editable: false
        },
        {
            field: 'departement', type: 'string', valueGetter: ({ value }) => `${value.departement.name}`, headerName: 'Département', renderCell: renderObject, editable: false
        },
        {
            field: 'region', type: 'string', valueGetter: ({ value }) => `${value.region.name}`, headerName: 'Région', renderCell: renderObject, width: 200, editable: false
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    React.useEffect(() => {
        protectedApi.get('/structures').then((res) => {
            setStructures(res.data.data);
            setLoading(false);
        }).catch(function (error) {
            Swal.fire(t("error"), error.message, "error");
        });
    }, [])

    return (
        <Box
            sx={{
                height: 600,
                width: '94%',
                margin: "2em auto",
                '& .actions': {
                    color: 'text.secondary',
                },
                '& .textPrimary': {
                    color: 'text.primary',
                },
            }}
        >
            <DataGrid
                rows={structures}
                columns={columns}
                loading={loading}
                components={{ Toolbar: GridToolbar }}
            />
            {!!snackbar && (
                <Snackbar
                    open
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    onClose={handleCloseSnackbar}
                    autoHideDuration={6000}
                >
                    <Alert {...snackbar} onClose={handleCloseSnackbar} />
                </Snackbar>
            )}
        </Box>
    );
}