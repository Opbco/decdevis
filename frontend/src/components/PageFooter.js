import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const PageFooter = () => {
  return (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      marginTop={5}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontSize: 12,
          maxWidth: "40%",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        LE DIRECTEUR DES EXAMENS, DES CONCOURS ET DE LA CERTIFICATION
      </Typography>
    </Box>
  );
};

export default PageFooter;
