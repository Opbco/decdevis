import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SafetyDividerIcon from '@mui/icons-material/SafetyDividerTwoTone'
import { DataGrid, GridActionsCellItem, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import Swal from "sweetalert2";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTranslation } from "react-i18next";
import useApiRequest from '../redux/api/useApiRequest';
import { useLocation } from "react-router-dom";
import { Autocomplete, Stack, TextField, Typography } from '@mui/material';
import CentreForm from '../components/CentreForm';

function EditToolbar(props) {
    const { setOpen, setCentre, session } = props;

    const handleClick = () => {
        setOpen(true)
        setCentre({
            id: -1,
            session: session,
            structure: null,
            region: null,
            departement: null,
            arrondissement: null,
            centre: null,
            form: 'C',
            type: 'E',
            for_disabled: false,
            for_oral: false,
            isNew: true
        })
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add Centre | Sous-centre
            </Button>
            <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
        </GridToolbarContainer>
    );
}

EditToolbar.propTypes = {
    setCentre: PropTypes.func.isRequired,
    setOpen: PropTypes.func.isRequired,
    session: PropTypes.object.isRequired,
};

function renderObject(params) {
    return (<Typography component="h5">{params.value}</Typography>);
}

export default function Centres() {
    const { t } = useTranslation(["common"]);
    const [centres, setCentres] = React.useState([]);
    const [snackbar, setSnackbar] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const location = useLocation();
    const [session, setSession] = React.useState(() => {
        return location.state?.data;
    });
    const [current_centre, setCentre] = React.useState(null);
    const [sessions, setSessions] = React.useState([]);
    const [change, setChange] = React.useState(0);
    const protectedApi = useApiRequest();


    const handleCloseSnackbar = () => setSnackbar(null);

    const handleDeleteClick = (id) => () => {
        Swal.fire({
            title: "Do you really want to delete this center",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33"
        }).then((result) => {
            if (result.isConfirmed) {
                protectedApi.delete(`/sessioncentres/${id}`).then((res) => {
                    setCentres(centres.filter((row) => row.id !== id));
                    setSnackbar({ children: 'Centre | Sous-centre successfully deleted', severity: 'success' });
                }).catch(function (error) {
                    Swal.fire(t("error"), error.message, "error");
                });
            }
        })
    };

    const handleEditClick = (row) => () => {
        setOpen(true);
        setCentre(row);
    }

    const handleDivideClick = (row) => () => {
        const centreAssist = { ...row, id: -1, structure: null, nbr_candidat_ecrit: 0, centre: { ...row }, form: row.form === 'C' ? 'CA' : 'SA', type: 'E', isNew: true, divide: true }
        setOpen(true);
        setCentre(centreAssist);
    }

    const columns = [
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 100,
            cellClassName: 'actions',
            getActions: ({ id, row }) => {
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(row)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<SafetyDividerIcon />}
                        label="Divide"
                        onClick={handleDivideClick(row)}
                        color="inherit"
                    />,
                ];
            },
        },
        { field: 'id', headerName: 'ID', type: 'number', width: 40 },
        {
            field: 'region', type: 'string', valueGetter: ({ value }) => `${value.name}`, headerName: 'Région', renderCell: renderObject
        },
        {
            field: 'departement', type: 'string', valueGetter: ({ value }) => `${value.name}`, headerName: 'Département', renderCell: renderObject
        },
        {
            field: 'arrondissement', type: 'string', valueGetter: ({ value }) => `${value.name}`, headerName: 'Arrondissement', renderCell: renderObject
        },
        { field: 'centre', headerName: 'Centre', valueGetter: ({ value }) => `${value.structure.name}`, width: 200 },
        { field: 'structure', headerName: 'Etablissement', valueGetter: ({ value }) => `${value.name}`, width: 220 },
        { field: 'form', headerName: 'Forme', type: 'singleSelect', valueOptions: ['C', 'CA', 'SC', 'SA'], width: 100 },
        { field: 'type', headerName: 'Type', type: 'singleSelect', valueOptions: ['E', 'EC', 'ECD', 'EP', 'EPC', 'EPCD'], width: 100 },
        { field: 'nbr_candidat_ecrit', headerName: 'Nombre Candidats', type: 'number', width: 100 },
        { field: 'for_disabled', headerName: 'Handicapés', type: 'boolean', width: 60 },
        { field: 'for_oral', headerName: 'Oral', type: 'boolean', width: 60 },
        { field: 'for_harmo', headerName: 'Harmonisation', type: 'boolean', width: 60 },
    ];

    React.useEffect(() => {
        protectedApi.get(`/sessions/${session?.id}/sessioncentres`).then((res) => {
            setCentres(res.data.data);
        }).catch(function (error) {
            Swal.fire(t("error"), error.message, "error");
        });
    }, [session, change]);

    React.useEffect(() => {
        protectedApi.get(`/sessions`).then((res) => {
            setSessions(res.data.data);
        }).catch(function (error) {
            Swal.fire(t("error"), error.message, "error");
        });
    }, []);

    return (
        <Box
            sx={{
                height: 600,
                width: '94%',
                margin: "0 auto",
                '& .actions': {
                    color: 'text.secondary',
                },
                '& .textPrimary': {
                    color: 'text.primary',
                },
            }}
        >
            <Box sx={{ margin: 2 }}>
                <Autocomplete
                    value={session}
                    onChange={(event, newValue) => {
                        setSession(newValue)
                    }}
                    id="controllable-session"
                    groupBy={(option) => option.exam.name}
                    options={sessions}
                    getOptionLabel={(option) => `${option.exam.name} (${option.name})`}
                    sx={{ width: 600 }}
                    renderInput={(params) => <TextField {...params} label="Examination" />}
                />
            </Box>
            <Box sx={{ margin: 2 }}>
                <Typography variant="caption">{`${session?.exam.name} (${session?.name})`}</Typography>
            </Box>
            <DataGrid
                rows={centres}
                columns={columns}
                components={{
                    Toolbar: EditToolbar,
                }}
                componentsProps={{
                    toolbar: { setCentre, setOpen, session },
                }}
            />
            <CentreForm
                setSnackbar={setSnackbar}
                open={open}
                setOpen={setOpen}
                data={current_centre}
                setData={setCentre}
                change={setChange}
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