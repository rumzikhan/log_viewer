import React, { useCallback, useState } from "react";
import styled from "styled-components";

import LogRow from "./components/LogRow";
import { DEFAULT_ITEM_HEIGHT, S3_URL } from "./shared/constants";
import VirtualizedList from "./components/VirtualizedList";
import LogListHeader from "./components/LogListHeader";
import SkeletonLogRow from "./components/SkeletonLogRow";
import { useDataStream } from "./hooks/useDataStream";
import { Log } from "./shared/types";

const SAppContainer = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function App() {
  const { data: logs } = useDataStream<Log>(S3_URL);
  const [logItemHeights, setLogItemHeights] = useState<Map<number, number>>(
    new Map<number, number>()
  );

  // Handles adding/deleting from the logItemHeights map
  // We use the map to dynamically control item height in the virtualized list
  const handleUpdateLogItemHeights = useCallback(
    (index: number, height: number, isDelete?: boolean) => {
      setLogItemHeights((prev) => {
        const newLogItemHeights = new Map(prev);
        if (isDelete) {
          newLogItemHeights.delete(index);
        } else {
          newLogItemHeights.set(index, height);
        }
        return newLogItemHeights;
      });
    },
    [setLogItemHeights]
  );

  // Render skeleton rows if logs haven't loaded yet
  const renderItem = useCallback((i: number, style: React.CSSProperties) => {
    if (!logs.length) {
      return <SkeletonLogRow key={i} logIndex={i} />;
    }
    
    return (
      <LogRow
        key={`${i}:${logs[i]._time}`}
        logIndex={i}
        log={logs[i]}
        style={style}
        logItemHeights={logItemHeights}
        handleUpdateLogItemHeights={handleUpdateLogItemHeights}
      />
    );
  },
  [handleUpdateLogItemHeights, logItemHeights, logs]);

  return (
    <SAppContainer>
      <h1 style={{ flexShrink: 0 }}>Logs</h1>
      <VirtualizedList
        numItems={logs.length > 0 ? logs.length : 20}
        renderItem={renderItem}
        defaultItemHeight={DEFAULT_ITEM_HEIGHT}
        customItemHeights={logItemHeights}
        customListHeader={<LogListHeader />}
      />
    </SAppContainer>
  );
}

export default App;
