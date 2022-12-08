import { Download, PrintOutlined } from "@mui/icons-material";
import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Swal from "sweetalert2";
import { Autocomplete, Stack, TextField, Typography } from '@mui/material';
import useApiRequest from '../redux/api/useApiRequest';
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import Box from '@mui/material/Box';
import OrganisationFees from '../components/OrganisationFees';
import { Fab, styled } from "@mui/material";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import IndChefCentre from "../components/IndChefCentre";
import VaccSurvEcrit from "../components/VaccSurvEcrit";
import VaccSecInd from "../components/VaccSecInd";
import IndCm from "../components/IndCm";
import VaccCorrInd from "../components/VaccCorrInd";
import DelibIndJury from "../components/DelibIndJury";
import { withEmotionCache } from "@emotion/react";
import Harmo from "../components/Harmo";
import Dispatching from "../components/Dispatching";
import VacOralInd from "../components/VacOralInd";

const BoxContainer = styled("div")`
  ${({ theme, width }) => `
    width: ${width}px;
    height: auto;
    padding: 2rem 1.5rem;
    position: relative;
    margin: 0 auto;
    `}
`;

function TabPanel(props) {
    const { children, value, index, session, setDownload, width, title, region, regions, setRegion, ...other } = props;
    const docRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => docRef.current,
    });

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Autocomplete
                            value={region}
                            onChange={(event, newValue) => {
                                setRegion(newValue)
                            }}
                            id="controllable-region"
                            options={regions}
                            getOptionLabel={(option) => option.name}
                            sx={{ width: 200 }}
                            renderInput={(params) => <TextField {...params} label="Region" />}
                        />
                        <Stack direction="row" gap={4}>
                            <Fab onClick={handlePrint}>
                                <PrintOutlined color="primary" fontSize="large" />
                            </Fab>
                            <Fab onClick={() => setDownload(true)}>
                                <Download color="primary" fontSize="large" />
                            </Fab>
                        </Stack>

                    </Box>
                    <BoxContainer
                        ref={docRef}
                        width={isNaN(width) ? `${width}` : Math.round(width * 3.779527559055)}
                    >
                        <PageHeader
                            region={region}
                            session={session}
                            title={title}
                        />
                        {children}
                        <PageFooter />
                    </BoxContainer>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

export default function Statistiques() {
    const theme = useTheme();
    const [value, setValue] = useState(0);
    const location = useLocation();
    const [region, setRegion] = useState({ id: 1, name: "Adamaoua" });
    const [regions, setRegions] = useState([]);
    const [download, setDownload] = useState(false);
    const { t } = useTranslation(["common"]);
    const session = location.state?.data;
    const protectedApi = useApiRequest();

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    useEffect(() => {
        protectedApi.get('/regions').then((res) => {
            setRegions(res.data.data);
        }).catch(function (error) {
            Swal.fire("error", error.message, "error");
        });
    }, [])

    return (
        <Box sx={{ bgcolor: 'background.paper', width: "100%", mx: "auto" }}>
            <AppBar position="static">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="scrollable"
                    scrollButtons
                    allowScrollButtonsMobile
                    aria-label="Statistiques tabs"
                >
                    <Tab label="Frais d'organisation" {...a11yProps(0)} />
                    <Tab label="Indemnité chef de centre" {...a11yProps(1)} />
                    <Tab label="Vaccation surveillance" {...a11yProps(2)} />
                    <Tab label="Vaccation surveillance (Handicapés)" {...a11yProps(3)} />
                    <Tab label="Vaccation Jury Oral" {...a11yProps(4)} />
                    <Tab label="Vaccation sécrétariat / Indemnité chef Sec" {...a11yProps(5)} />
                    <Tab label="Chargés de mission" {...a11yProps(6)} />
                    <Tab label="Matières d'oeuvre / Pratique" {...a11yProps(7)} />
                    <Tab label="Vaccation Correction / Indemnité chef de salle" {...a11yProps(8)} />
                    <Tab label="Vaccation / Indemnité délibérations" {...a11yProps(9)} />
                    <Tab label="Vaccation sécrétariat dispatching" {...a11yProps(10)} />
                    <Tab label="Vaccation jury harmonisations" {...a11yProps(11)} />
                </Tabs>
            </AppBar>
            <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onChangeIndex={handleChangeIndex}
            >
                <TabPanel setDownload={setDownload} regions={regions} region={region} setRegion={setRegion} width={220} value={value} index={0} dir={theme.direction} session={session} title="GUIDE DE PAIEMENT DES FRAIS D'ORGANISATION">
                    <OrganisationFees setDownload={setDownload} download={download} session={session} region={region} />
                </TabPanel>
                <TabPanel setDownload={setDownload} regions={regions} region={region} setRegion={setRegion} width={220} value={value} index={1} dir={theme.direction} session={session} title="GUIDE DE PAIEMENT DES INDEMNITES DE CHEF DE CENTRE/SOUS-CENTRE">
                    <IndChefCentre setDownload={setDownload} download={download} session={session} region={region} />
                </TabPanel>
                <TabPanel setDownload={setDownload} regions={regions} region={region} setRegion={setRegion} width={300} value={value} index={2} dir={theme.direction} session={session} title="GUIDE DE PAIEMENT DES FRAIS DE VACATIONS DE SURVEILLANCE">
                    <VaccSurvEcrit setDownload={setDownload} download={download} session={session} region={region} />
                </TabPanel>
                <TabPanel setDownload={setDownload} regions={regions} region={region} setRegion={setRegion} width={300} value={value} index={3} dir={theme.direction} session={session} title="GUIDE DE PAIEMENT DES VACATIONS DE SURVEILLANCE DES HANDICAPES MALVOYANTS">
                    Vaccation surveillance (Handicapés)
                </TabPanel>
                <TabPanel setDownload={setDownload} regions={regions} region={region} setRegion={setRegion} width={290} value={value} index={4} dir={theme.direction} session={session} title="GUIDE DE PAIEMENT DES VACATIONS DU JURY ORAL COMMUNICATION ET DES INDEMNITES DE CHEF DE SALLE">
                    <VacOralInd setDownload={setDownload} download={download} session={session} region={region} />
                </TabPanel>
                <TabPanel setDownload={setDownload} regions={regions} region={region} setRegion={setRegion} width={310} value={value} index={5} dir={theme.direction} session={session} title="GUIDE DE PAIEMENT DES VACATIONS ET INDEMNITES DES CHEFS DE SECRETARIAT">
                    <VaccSecInd setDownload={setDownload} download={download} session={session} region={region} />
                </TabPanel>
                <TabPanel setDownload={setDownload} regions={regions} region={region} setRegion={setRegion} width={290} value={value} index={6} dir={theme.direction} session={session} title="GUIDE DE PAIEMENT DES VACATIONS ET INDEMNITES DES CHARGES DE MISSION">
                    <IndCm setDownload={setDownload} download={download} session={session} region={region} />
                </TabPanel>
                <TabPanel setDownload={setDownload} regions={regions} region={region} setRegion={setRegion} width={290} value={value} index={7} dir={theme.direction} session={session} title="GUIDE DE PAIEMENT DES FRAIS DE MATIERE D'OEUVRE,  DE PREPARATION DES ATELIERS, DE VACATIONS  DES PRATIQUES PROFESSIONNELLES, D'INFORMATIQUE ET DES INDEMNITES DES CHEFS D'ATELIERS">
                    Matières d'oeuvre / Pratique
                </TabPanel>
                <TabPanel setDownload={setDownload} regions={regions} region={region} setRegion={setRegion} width={290} value={value} index={8} dir={theme.direction} session={session} title="GUIDE DE PAIEMENT DES FRAIS DES FRAIS DE CORRECTIONS ET DES INDEMNITES DES CHEFS DE SALLE DE CORRECTION">
                    <VaccCorrInd setDownload={setDownload} download={download} session={session} region={region} />
                </TabPanel>
                <TabPanel setDownload={setDownload} regions={regions} region={region} setRegion={setRegion} width="auto" value={value} index={9} dir={theme.direction} session={session} title="GUIDE DE PAIEMENT DES VACATIONS/INDEMNITES DES DELIBERATIONS">
                    <DelibIndJury setDownload={setDownload} download={download} session={session} region={region} />
                </TabPanel>
                <TabPanel setDownload={setDownload} regions={regions} region={region} setRegion={setRegion} width={290} value={value} index={10} dir={theme.direction} session={session} title="GUIDE DE PAIEMENT DES VACATIONS DU SECRETARIAT DE DISPATCHING ET DE VERIFICATION DES DOCUMENTS D'EXAMENS">
                    <Dispatching setDownload={setDownload} download={download} session={session} region={region} />
                </TabPanel>
                <TabPanel setDownload={setDownload} regions={regions} region={region} setRegion={setRegion} width={290} value={value} index={11} dir={theme.direction} session={session} title="GUIDE DE PAIEMENT DES VACATIONS DU JURY D'HARMONISATION DES CORRIGES">
                    <Harmo setDownload={setDownload} download={download} session={session} region={region} />
                </TabPanel>
            </SwipeableViews>
        </Box>
    );
}