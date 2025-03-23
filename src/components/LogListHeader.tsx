import React from "react";
import styled from "styled-components";

import { TERTIARY_BACKGROUND_COLOR, DEFAULT_FONT_FAMILY, DEFAULT_BORDER_COLOR } from "../shared/constants";

const SLogListHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 6px;
  background-color: ${TERTIARY_BACKGROUND_COLOR};
  font-size: 14px;
  font-weight: 600;
  font-family: ${DEFAULT_FONT_FAMILY};
`;

const STime = styled.div`
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid ${DEFAULT_BORDER_COLOR};
  margin-right: 8px;
`;

const LogListHeader = () => {
  return (
    <SLogListHeaderContainer>
      <STime>Time</STime>
      <div>Event</div>
    </SLogListHeaderContainer>
  );
};

export default LogListHeader;