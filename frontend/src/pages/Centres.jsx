import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridActionsCellItem, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import Swal from "sweetalert2";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTranslation } from "react-i18next";
import useApiRequest from '../redux/api/useApiRequest';
import { useLocation } from "react-router-dom";
import { Typography } from '@mui/material';
import CentreForm from '../components/CentreForm';

function EditToolbar(props) {
    const { setOpen, setCentre, session } = props;

    const handleClick = () => {
        setOpen(true)
        setCentre({
            id: -1,
            'session': session,
            'structure': null,
            'region': null,
            'departement': null,
            'arrondissement': null,
            'centre': null,
            'form': 'C',
            'type': 'E',
            'for_disabled': false,
            'for_oral': false,
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
    const [current_centre, setCentre] = React.useState(null);
    const [change, setChange] = React.useState(0);
    const protectedApi = useApiRequest();
    const location = useLocation();
    const session = location.state?.data;

    const handleCloseSnackbar = () => setSnackbar(null);

    const handleDeleteClick = (id) => () => {
        protectedApi.delete(`/sessioncentres/${id}`).then((res) => {
            setCentres(centres.filter((row) => row.id !== id));
            setSnackbar({ children: 'Centre | Sous-centre successfully deleted', severity: 'success' });
        }).catch(function (error) {
            Swal.fire(t("error"), error.message, "error");
        });
    };

    const handleEditClick = (row) => () => {
        setOpen(true);
        setCentre(row);
    }

    const columns = [
        { field: 'id', headerName: 'ID', type: 'number', width: 80 },
        {
            field: 'region', type: 'string', valueGetter: ({ value }) => `${value.name}`, headerName: 'Région', renderCell: renderObject
        },
        {
            field: 'departement', type: 'string', valueGetter: ({ value }) => `${value.name}`, headerName: 'Département', renderCell: renderObject
        },
        {
            field: 'arrondissement', type: 'string', valueGetter: ({ value }) => `${value.name}`, headerName: 'Arrondissement', renderCell: renderObject
        },
        { field: 'centre', headerName: 'Examen', valueGetter: ({ value }) => `${value.structure.name}`, width: 100 },
        { field: 'session', headerName: 'Examen', valueGetter: ({ value }) => `${value.name}`, width: 100 },
        { field: 'structure', headerName: 'Etablissement', valueGetter: ({ value }) => `${value.structure.name}`, width: 150 },
        { field: 'form', headerName: 'Forme', type: 'singleSelect', valueOptions: ['C', 'CA', 'SC', 'SA'], width: 100 },
        { field: 'type', headerName: 'Type', type: 'singleSelect', valueOptions: ['E', 'EC', 'ECD', 'EP', 'EPC', 'EPCD'], width: 100 },
        { field: 'for_disabled', headerName: 'Handicapés', type: 'bool', width: 80 },
        { field: 'for_oral', headerName: 'Centre Oral', type: 'bool', width: 80 },
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
                ];
            },
        },
    ];

    React.useEffect(() => {
        protectedApi.get(`/sessions/${session.id}/sessioncentres`).then((res) => {
            setCentres(res.data.data);
        }).catch(function (error) {
            Swal.fire(t("error"), error.message, "error");
        });
    }, [session, change]);

    return (
        <Box
            sx={{
                height: 300,
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
            <Box sx={{ margin: 1 }}>
                <Typography variant="caption">{`${session.exam.name} (${session.name})`}</Typography>
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