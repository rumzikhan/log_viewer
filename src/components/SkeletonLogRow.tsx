import React from "react";
import styled, { keyframes } from "styled-components";
import {
  DEFAULT_BORDER_COLOR,
  PRIMARY_BACKGROUND_COLOR,
  PRIMARY_LOADING_COLOR,
  SECONDARY_LOADING_COLOR,
  SECONDARY_BACKGROUND_COLOR,
} from "../shared/constants";

const pulseAnimation = keyframes`
  0% {
    background-color: ${PRIMARY_LOADING_COLOR};
  }
  50% {
    background-color: ${SECONDARY_LOADING_COLOR};
  }
  100% {
    background-color: ${PRIMARY_LOADING_COLOR};
  }
`;

const SSkeletonLogRow = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "logIndex",
})<{ logIndex: number }>`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid ${DEFAULT_BORDER_COLOR};

  background-color: ${(props) =>
    props.logIndex % 2 === 0
      ? PRIMARY_BACKGROUND_COLOR
      : SECONDARY_BACKGROUND_COLOR};
`;

const SSkeletonTimeContainer = styled.div`
  width: 220px;
  flex-shrink: 0;
  padding-right: 10px;
`;

const SSkeletonLogEventContainer = styled.div`
  width: 100%;
`;

const SSkeletonInnerBlock = styled.div`
  width: 100%;
  height: 15px;
  background-color: ${PRIMARY_LOADING_COLOR};
  border-radius: 3px;

  animation: ${pulseAnimation} 2s infinite;
`;

interface SkeletonLogRowProps {
  logIndex: number;
}

const SkeletonLogRow: React.FC<SkeletonLogRowProps> = ({ logIndex }) => (
  <SSkeletonLogRow logIndex={logIndex}>
    <SSkeletonTimeContainer>
      <SSkeletonInnerBlock />
    </SSkeletonTimeContainer>
    <SSkeletonLogEventContainer>
      <SSkeletonInnerBlock />
    </SSkeletonLogEventContainer>
  </SSkeletonLogRow>
);

export default SkeletonLogRow;
