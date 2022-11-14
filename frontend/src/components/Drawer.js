import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";

const drawerWidth = 300;

const Wrapper = styled("aside", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  paddingInline: theme.spacing(3),
  borderInlineEnd: "1px solid",
  minHeight: "90vh",
  backgroundColor: "var(--main-clr)",
  color: "var(--secondary-clr)",
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: -drawerWidth,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

export default function Drawer({ open }) {
  const theme = useTheme();

  return (
    <Wrapper open={open}>
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon color="secondary" />
            </ListItemIcon>
            <Link to="/regions">
              <ListItemText primary="Régions" />
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon color="secondary" />
            </ListItemIcon>
            <Link to="/departements">
              <ListItemText primary="Départements" />
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon color="secondary" />
            </ListItemIcon>
            <Link to="/arrondissements">
              <ListItemText primary="Arrondissements" />
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon color="secondary" />
            </ListItemIcon>
            <Link to="/structures">
              <ListItemText primary="Structures" />
            </Link>
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        {["All mail", "Trash", "Spam"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? (
                  <InboxIcon color="secondary" />
                ) : (
                  <MailIcon color="secondary" />
                )}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Wrapper>
  );
}
