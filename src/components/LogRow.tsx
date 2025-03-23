import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

import { Log } from "../shared/types";
import { ReactComponent as ArrowRight } from "../assets/arrow-right.svg";
import {
  DEFAULT_BORDER_COLOR,
  PRIMARY_BACKGROUND_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  DEFAULT_FONT_FAMILY,
} from "../shared/constants";

// Apply prop styles as inline style to the component to reduce
// number of classes styled components has to generate. We also remove
// the logIndex prop from the component to prevent it from being passed
// to the DOM as it's only used to compute the background color.
const SLogRow = styled.div
  .attrs<{
    style: React.CSSProperties;
    logIndex: number;
  }>((props) => ({
    style: props.style,
  }))
  .withConfig({
    shouldForwardProp: (prop) => prop !== "logIndex",
  })`
  padding: 5px 10px;
  border-bottom: 1px solid ${DEFAULT_BORDER_COLOR};
  display: flex;
  align-items: center;
  cursor: pointer;

  font-size: 14px;
  font-family: ${DEFAULT_FONT_FAMILY};

  background-color: ${(props) =>
    props.logIndex % 2 === 0
      ? PRIMARY_BACKGROUND_COLOR
      : SECONDARY_BACKGROUND_COLOR};
`;

const STimestampContainer = styled.div`
  display: flex;
  align-items: center;
  width: 220px;
  flex-shrink: 0;
`;

const SArrowRight = styled(ArrowRight).withConfig({
  shouldForwardProp: (prop) => prop !== "isExpanded",
})<{ isExpanded: boolean }>`
  height: 15px;
  width: 15px;
  transform: ${(props) =>
    props.isExpanded ? "rotate(90deg)" : "rotate(0deg)"};
`;

const SLogEvent = styled.pre.withConfig({
  shouldForwardProp: (prop) => prop !== "isExpanded",
})<{ isExpanded: boolean }>`
  overflow: ${(props) => (props.isExpanded ? "visible" : "hidden")};
  text-overflow: ${(props) => (props.isExpanded ? "clip" : "ellipsis")};
  white-space: ${(props) => (props.isExpanded ? "pre-wrap" : "nowrap")};
  font-size: 12px;
`;

const formatDateToLocalIso8601 = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toISOString().replace("T", " ").replace("Z", "");
};

interface LogRowProps {
  logIndex: number;
  log: Log;
  style: React.CSSProperties;
  logItemHeights: Map<number, number>;
  handleUpdateLogItemHeights: (
    index: number,
    height: number,
    isDelete?: boolean
  ) => void;
}

const LogRow: React.FC<LogRowProps> = ({
  logIndex,
  log,
  style,
  logItemHeights,
  handleUpdateLogItemHeights,
}) => {
  const [isExpanded, setIsExpanded] = useState(logItemHeights.has(logIndex));
  const logRowRef = useRef<HTMLDivElement | null>(null);

  // Format the timestamp to a local ISO 8601 string
  const dateTimeStamp = useMemo(
    () => formatDateToLocalIso8601(log._time),
    [log._time]
  );

  // Format the log object to a JSON string, with or without pretty print
  // depending on isExpanded
  const formattedLogJson = useMemo(
    () => (isExpanded ? JSON.stringify(log, null, 2) : JSON.stringify(log)),
    [isExpanded, log]
  );

  const handleLogRowClick = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Update the height of the log row in the virtualized list depending on isExpanded
  useEffect(() => {
    if (logRowRef.current) {
      if (isExpanded) {
        handleUpdateLogItemHeights(logIndex, logRowRef.current.clientHeight);
      } else {
        handleUpdateLogItemHeights(
          logIndex,
          logRowRef.current.clientHeight,
          true
        );
      }
    }
  }, [handleUpdateLogItemHeights, isExpanded, logIndex]);

  return (
    <SLogRow
      ref={logRowRef}
      style={style}
      onClick={handleLogRowClick}
      logIndex={logIndex}
    >
      <STimestampContainer>
        <SArrowRight isExpanded={isExpanded} />
        {dateTimeStamp}
      </STimestampContainer>
      <SLogEvent isExpanded={isExpanded}>{formattedLogJson}</SLogEvent>
    </SLogRow>
  );
};

export default LogRow;
