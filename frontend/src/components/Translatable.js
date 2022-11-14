import React from "react";
import { styled } from "@mui/material";

const Span = styled("span")(
  ({ length, auto, top }) => `
  position: relative;
  display: inline-block;
  width: ${auto ? "auto" : length + "ch"};

  &::after {
    content: attr(data-label);
    position: absolute;
    top: ${top}%;
    left: 0;
    font-size: 11px;
    font-style: italic;
    font-family: sans-serif;
    width: auto;
  }
`
);

const Translatable = ({ alt, auto=false, top = 80, children }) => {
  const lchildren = String(children).length || 0;
  return (
    <Span
      data-label={alt}
      length={lchildren > alt.length ? lchildren : alt.length}
      auto={auto}
      top={top}
    >
      {children}
    </Span>
  );
};

export default Translatable;
