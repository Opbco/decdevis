import * as React from 'react';
import { useNavigate, Outlet } from "react-router-dom";
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CancelIcon from '@mui/icons-material/Close';
import { DataGrid, GridRowModes, GridActionsCellItem, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import Swal from "sweetalert2";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTranslation } from "react-i18next";
import useApiRequest from '../redux/api/useApiRequest';
import { Stack, Typography } from '@mui/material';

function EditToolbar(props) {
    const { setExams, setRowModesModel } = props;

    const handleClick = () => {
        const id = -1;
        setExams((oldRows) => [{ id, name: '', code: 'BEPC', isNew: true }, ...oldRows]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add Exam
            </Button>
            <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
        </GridToolbarContainer>
    );
}

EditToolbar.propTypes = {
    setRowModesModel: PropTypes.func.isRequired,
    setExams: PropTypes.func.isRequired,
};

export default function Exam() {
    const { t } = useTranslation(["common"]);
    const [exams, setExams] = React.useState([]);
    const [rowModesModel, setRowModesModel] = React.useState({});
    const [snackbar, setSnackbar] = React.useState(null);
    const protectedApi = useApiRequest();
    let navigate = useNavigate();
    const handleCloseSnackbar = () => setSnackbar(null);

    const handleRowEditStart = (params, event) => {
        event.defaultMuiPrevented = true;
    };

    const handleRowEditStop = (params, event) => {
        event.defaultMuiPrevented = true;
    };

    const handleEditClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id) => () => {
        Swal.fire({
            title: "Do you really want to delete this Examination",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33"
        }).then((result) => {
            if (result.isConfirmed) {
                protectedApi.delete(`/exams/${id}`).then((res) => {
                    setExams(exams.filter((row) => row.id !== id));
                    setSnackbar({ children: 'Exam successfully deleted', severity: 'success' });
                }).catch(function (error) {
                    Swal.fire(t("error"), error.message, "error");
                });
            }
        })

    };

    const goSessions = (row) => () => {
        navigate(`/exams/sessions`, { state: { data: row } });
    }

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = exams.find((row) => row.id === id);
        if (editedRow.isNew) {
            setExams(exams.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = React.useCallback(
        async (newRow) => {
            var response;
            // Make the HTTP request to save in the backend
            if (newRow.isNew) {
                response = await protectedApi.post('/exams', newRow);
            } else {
                const updatedRow = { ...newRow, isNew: false };
                response = await protectedApi.put(`/exams/${updatedRow.id}`, updatedRow)
            }

            setSnackbar({ children: 'Exam successfully saved', severity: 'success' });
            return response.data.data;
        },
        [],
    );

    const handleProcessRowUpdateError = React.useCallback((error) => {
        const { id } = JSON.parse(error.config.data);
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
        setSnackbar({ children: error.response.data.message, severity: 'error' });
    }, []);

    const columns = [
        { field: 'id', headerName: 'ID', type: 'number', width: 80, editable: false },
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 500, editable: true },
        {
            field: 'code', headerName: 'Type exam', minWidth: 200, editable: true, type: 'singleSelect', valueOptions: ['BEPC', 'CAP STT', 'CAPI', 'CAPIEPM', 'CAPIET', 'CONCOURS']
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id, row }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        title='Delete'
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<AnalyticsIcon />}
                        label="Sessions"
                        title='Sessions'
                        onClick={goSessions(row)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    React.useEffect(() => {
        protectedApi.get('/exams').then((res) => {
            setExams(res.data.data);
        }).catch(function (error) {
            Swal.fire(t("error"), error.message, "error");
        });
    }, [])

    return (
        <Box>
            <Box sx={{ margin: 2 }}>
                <Typography variant="caption">Gestion des différents type d'examens</Typography>
            </Box>
            <Stack direction="column">
                <Box
                    sx={{
                        height: 350,
                        width: "96%",
                        margin: "2em auto",
                        '& .actions': {
                            color: 'text.primary',
                        },
                        '& .textPrimary': {
                            color: 'text.primary',
                        },
                    }}
                >
                    <DataGrid
                        rows={exams}
                        columns={columns}
                        editMode="row"
                        rowModesModel={rowModesModel}
                        onRowEditStart={handleRowEditStart}
                        onRowEditStop={handleRowEditStop}
                        processRowUpdate={processRowUpdate}
                        onProcessRowUpdateError={handleProcessRowUpdateError}
                        components={{
                            Toolbar: EditToolbar,
                        }}
                        componentsProps={{
                            toolbar: { setExams, setRowModesModel },
                        }}
                        experimentalFeatures={{ newEditingApi: true }}
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
                <Outlet />
            </Stack>
        </Box>
    );
}