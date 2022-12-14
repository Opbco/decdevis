import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { DataGrid, GridActionsCellItem, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import Swal from "sweetalert2";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTranslation } from "react-i18next";
import useApiRequest from '../redux/api/useApiRequest';
import { useLocation, useNavigate } from "react-router-dom";
import { Typography } from '@mui/material';
import SessionExamForm from '../components/SessionExamForm';
import { HomeWorkRounded } from '@mui/icons-material';

function EditToolbar(props) {
    const { setSessions, protectedApi, exam } = props;

    const handleClick = () => {
        const data = { exam: exam.id };
        protectedApi.post(`/sessions`, data).then((res) => {
            setSessions((oldRows) => [res.data.data, ...oldRows]);
            Swal.fire("Operation successfull", `New Session for ${exam.name} successfully created`, "success");
        }).catch(function (error) {
            Swal.fire("Error", error.message, "error");
        });
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add Session
            </Button>
            <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
        </GridToolbarContainer>
    );
}

EditToolbar.propTypes = {
    setSessions: PropTypes.func.isRequired,
    protectedApi: PropTypes.func.isRequired,
    exam: PropTypes.object.isRequired,
};

export default function Session() {
    const { t } = useTranslation(["common"]);
    const [sessions, setSessions] = React.useState([]);
    const [snackbar, setSnackbar] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [current_session, setSession] = React.useState(null);
    const [change, setChange] = React.useState(0);
    const protectedApi = useApiRequest();
    const location = useLocation();
    const exam = location.state?.data;
    let navigate = useNavigate();

    const handleCloseSnackbar = () => setSnackbar(null);

    const handleDeleteClick = (id) => () => {
        Swal.fire({
            title: "Do you really want to delete this session",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33"
        }).then((result) => {
            if (result.isConfirmed) {
                protectedApi.delete(`/sessions/${id}`).then((res) => {
                    setSessions(sessions.filter((row) => row.id !== id));
                    setSnackbar({ children: 'Session successfully deleted', severity: 'success' });
                }).catch(function (error) {
                    Swal.fire(t("error"), error.message, "error");
                });
            }
        })
    };

    const handleEditClick = (row) => () => {
        setOpen(true);
        setSession(row);
    }

    const goPage = (row, page) => () => {
        const route = page === "centre" ? `/exams/centres` : `/exams/stats`
        navigate(route, { state: { data: row } });
    }

    const columns = [
        { field: 'id', headerName: 'ID', type: 'number', width: 80, editable: false },
        { field: 'name', headerName: 'Name', width: 100, editable: false },
        { field: 'nbr_jour_examen_write', headerName: 'Nombre de jours', type: 'number', width: 150, editable: true },
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
                        icon={<HomeWorkRounded />}
                        label="Centres"
                        className="textPrimary"
                        onClick={goPage(row, "centre")}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<AnalyticsIcon />}
                        label="Statistiques"
                        className="textPrimary"
                        onClick={goPage(row, "stats")}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    React.useEffect(() => {
        protectedApi.get(`/exams/${exam.id}/sessions`).then((res) => {
            setSessions(res.data.data);
        }).catch(function (error) {
            Swal.fire(t("error"), error.message, "error");
        });
    }, [exam, change]);

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
                <Typography variant="caption">{exam.name}</Typography>
            </Box>
            <DataGrid
                rows={sessions}
                columns={columns}
                components={{
                    Toolbar: EditToolbar,
                }}
                componentsProps={{
                    toolbar: { setSessions, protectedApi, exam },
                }}
            />
            <SessionExamForm
                setSnackbar={setSnackbar}
                open={open}
                setOpen={setOpen}
                data={current_session}
                setData={setSession}
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