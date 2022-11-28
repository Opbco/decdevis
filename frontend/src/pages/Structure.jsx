import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid';
import Swal from "sweetalert2";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTranslation } from "react-i18next";
import { Stack, Typography } from '@mui/material';
import useApiRequest from '../redux/api/useApiRequest';
import StructureForm from '../components/StructureForm';


function renderObject(params) {
    return (<Typography component="h5">{params.value}</Typography>);
}

export default function Structure() {
    const { t } = useTranslation(["common"]);
    const [structures, setStructures] = React.useState([]);
    const [current_structure, setStructure] = React.useState(null);
    const [snackbar, setSnackbar] = React.useState(null);
    const [change, setChange] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const protectedApi = useApiRequest();
    const handleCloseSnackbar = () => setSnackbar(null);
    const [open, setOpen] = React.useState(false);



    const handleDeleteClick = (id) => () => {
        Swal.fire({
            title: "Do you really want to delete this School",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33"
        }).then((result) => {
            if (result.isConfirmed) {
                protectedApi.delete(`/structures/${id}`).then((res) => {
                    setStructures(structures.filter((row) => row.id !== id));
                    setSnackbar({ children: 'Structure successfully deleted', severity: 'success' });
                }).catch(function (error) {
                    Swal.fire(t("error"), error.message, "error");
                });
            }
        })

    };

    const handleEditStructure = (row) => () => {
        setOpen(true);
        setStructure(row);
    }

    const handleNewStructure = () => {
        setOpen(true);
        setStructure({ 'id': -1, 'name': "", 'forme': "GENERAL", 'ordre': "PUBLIC", 'language': "FRANCAIS", 'adresse': "", 'contacts': "", 'arrondissement': null });
    }

    const columns = [
        { field: 'id', headerName: 'ID', type: 'number', width: 50, editable: false },
        {
            field: 'name', headerName: 'Name', flex: 1, minWidth: 200, editable: false
        },
        {
            field: 'forme', headerName: 'Forme', minWidth: 100, type: 'singleSelect', valueOptions: ['GENERAL', 'TECHNIQUE', 'POLYVALENT', 'ENIEG', 'ENIET']
        },
        {
            field: 'ordre', headerName: 'Ordre', minWidth: 100, type: 'singleSelect', valueOptions: ['PRIVE CATHOLIQUE', 'PRIVE PROTESTANT', 'PRIVE LAIC', 'PRIVE ISLAMIQUE', 'PUBLIC']
        },
        {
            field: 'language', headerName: 'Language', minWidth: 100, type: 'singleSelect', valueOptions: ['FRANCAIS', 'ANGLAIS', 'BILINGUE']
        },
        {
            field: 'contacts', headerName: 'Contacts', flex: 1, minWidth: 150, editable: false
        },
        {
            field: 'adresse', headerName: 'Adresse', flex: 1, minWidth: 200, editable: false
        },
        {
            field: 'arrondissement', type: 'string', valueGetter: ({ value }) => `${value.name}`, headerName: 'Arrondissement', renderCell: renderObject, editable: false
        },
        {
            field: 'departement', type: 'string', valueGetter: ({ value }) => `${value.name}`, headerName: 'Département', renderCell: renderObject, editable: false
        },
        {
            field: 'region', type: 'string', valueGetter: ({ value }) => `${value.name}`, headerName: 'Région', renderCell: renderObject, editable: false
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 80,
            cellClassName: 'actions',
            getActions: ({ id, row }) => {
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        color="inherit"
                        onClick={handleEditStructure(row)}
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
        setLoading(true);
        protectedApi.get('/structures').then((res) => {
            setStructures(res.data.data);
            setLoading(false);
        }).catch(function (error) {
            Swal.fire(t("error"), error.message, "error");
        });
    }, [change])

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
            <Stack sx={{ my: 1 }} direction="row" justifyContent="flex-start"><Button onClick={handleNewStructure} variant="contained">Add Structure</Button></Stack>
            <DataGrid
                rows={structures}
                columns={columns}
                loading={loading}
                components={{ Toolbar: GridToolbar }}
                componentsProps={{ toolbar: { printOptions: { disableToolbarButton: true } } }}
                initialState={{ pinnedColumns: { left: ['name'], right: ['actions'] } }}
            />
            <StructureForm
                setSnackbar={setSnackbar}
                open={open}
                setOpen={setOpen}
                data={current_structure}
                setData={setStructure}
                change={setChange}
            />
            {!!snackbar && (
                <Snackbar
                    open
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    onClose={handleCloseSnackbar}
                    autoHideDuration={6000}
                >
                    <Alert {...snackbar} onClose={handleCloseSnackbar} />
                </Snackbar>
            )}
        </Box>
    );
}