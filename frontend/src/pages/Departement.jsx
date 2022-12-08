import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { DataGrid, GridRowModes, GridActionsCellItem, GridToolbarContainer, useGridApiContext, GridToolbarExport } from '@mui/x-data-grid';
import Swal from "sweetalert2";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTranslation } from "react-i18next";
import { Autocomplete, TextField, Typography } from '@mui/material';
import useApiRequest from '../redux/api/useApiRequest';

function EditToolbar(props) {
    const { setDepartements, setRowModesModel } = props;

    const handleClick = () => {
        const id = -1;
        setDepartements((oldRows) => [{ id, name: '', region: -1, isNew: true }, ...oldRows]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add Departement
            </Button>
            <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
        </GridToolbarContainer>
    );
}

EditToolbar.propTypes = {
    setRowModesModel: PropTypes.func.isRequired,
    setDepartements: PropTypes.func.isRequired,
};

const CustomEditComponent = (props) => {
    const { id, value, regions, field } = props;
    const apiRef = useGridApiContext();

    const handleValueChange = (value) => {
        apiRef.current.setEditCellValue({ id, field, value: value });
    };

    return <Autocomplete
        value={JSON.parse(value)}
        onChange={(event, newValue) => {
            handleValueChange(JSON.stringify(newValue))
        }}
        id="controllable-region"
        options={regions}
        getOptionLabel={(option) => option.name}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Region" />}
    />;
}

function renderRegion(params) {
    return (<Typography component="h5">{JSON.parse(params.value).name}</Typography>);
}

export default function Departement() {
    const { t } = useTranslation(["common"]);
    const [departements, setDepartements] = React.useState([]);
    const [rowModesModel, setRowModesModel] = React.useState({});
    const [snackbar, setSnackbar] = React.useState(null);
    const protectedApi = useApiRequest();
    const handleCloseSnackbar = () => setSnackbar(null);
    const [regions, setRegions] = React.useState([]);

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
        protectedApi.delete(`/departements/${id}`).then((res) => {
            setDepartements(departements.filter((row) => row.id !== id));
            setSnackbar({ children: 'Departement successfully deleted', severity: 'success' });
        }).catch(function (error) {
            Swal.fire(t("error"), error.message, "error");
        });
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = departements.find((row) => row.id === id);
        if (editedRow.isNew) {
            setDepartements(departements.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = React.useCallback(
        async (newRow) => {
            var response;
            console.log(newRow);
            const updatedRow = { id: newRow.id, name: newRow.name, region: JSON.parse(newRow.region).id };
            // Make the HTTP request to save in the backend
            if (newRow.isNew) {
                response = await protectedApi.post('/departements', updatedRow);
            } else {
                response = await protectedApi.put(`/departements/${updatedRow.id}`, updatedRow)
            }

            setSnackbar({ children: 'Departement successfully saved', severity: 'success' });
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
        { field: 'id', headerName: 'ID', type: 'number', width: 100, editable: false },
        {
            field: 'name', headerName: 'Name', width: 300, preProcessEditCellProps: (params) => {
                const hasError = params.props.value.length < 3;
                return { ...params.props, error: hasError };
            }, editable: true
        },
        {
            field: 'region', valueGetter: ({ value }) => JSON.stringify(value), headerName: 'Region', renderCell: renderRegion, renderEditCell: (params) => <CustomEditComponent regions={regions} {...params} />, width: 200, editable: true
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
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
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    React.useEffect(() => {
        protectedApi.get('/departements').then((res) => {
            setDepartements(res.data.data);
        }).catch(function (error) {
            Swal.fire(t("error"), error.message, "error");
        });
    }, [])

    React.useEffect(() => {
        protectedApi.get('/regions').then((res) => {
            setRegions(res.data.data);
        }).catch(function (error) {
            Swal.fire("error", error.message, "error");
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
                rows={departements}
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
                    toolbar: { setDepartements, setRowModesModel, regions },
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
    );
}