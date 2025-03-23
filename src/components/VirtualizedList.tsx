import React, { useCallback, useMemo, useState, useLayoutEffect, useRef } from "react";
import styled from "styled-components";

const SVirtualizedList = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "innerHeight",
})<{ innerHeight: number }>`
  position: relative;
  height: ${(props) => props.innerHeight}px;
`;

interface VirtualizedListProps {
  numItems: number;
  defaultItemHeight: number;
  customItemHeights: Map<number, number>;
  renderItem: (i: number, style: React.CSSProperties) => React.ReactNode;
  customListHeader?: React.ReactNode;
}

const VirtualizedList: React.FC<VirtualizedListProps> = ({
  numItems,
  defaultItemHeight,
  customItemHeights,
  renderItem,
  customListHeader,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const virtualizedListRef = useRef<HTMLDivElement | null>(null);

  // Leverage useLayoutEffect here to get the height of the virtualized list
  // and update the windowHeight state before the browser paints
  useLayoutEffect(() => {
    if (virtualizedListRef.current) {
      const observer = new ResizeObserver((entries) => {
        // Safely access this just in case of unexpected behavior
        if (entries.length > 0) {
          // we're only observing 1 element here so we can access it directly
          setWindowHeight(entries[0].contentRect.height);
        }
      });

      observer.observe(virtualizedListRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  const innerHeight = useMemo(() => numItems * defaultItemHeight, [defaultItemHeight, numItems]);
  const startIndex = useMemo(
    () => Math.floor(scrollTop / defaultItemHeight),
    [scrollTop, defaultItemHeight]
  );

  const endIndex = useMemo(
    () =>
      Math.min(
        numItems, // don't render past the end of the list
        Math.floor((scrollTop + windowHeight) / defaultItemHeight)
      ),
    [scrollTop, windowHeight, defaultItemHeight, numItems]
  );

  const items = useMemo(() => {
    const renderedItems = [];
    let carryOverOffset = 0;

    for (let i = startIndex; i < endIndex; i++) {
      const previousItemHeight =
        customItemHeights.get(i - 1) ?? defaultItemHeight;

      if (previousItemHeight > defaultItemHeight) {
        carryOverOffset += previousItemHeight - defaultItemHeight;
      }

      const newTop = i * defaultItemHeight;
      renderedItems.push(
        renderItem(i, {
          position: "absolute",
          top: `${newTop + carryOverOffset}px`,
          width: "100%",
        })
      );
    }

    return renderedItems;
  }, [startIndex, endIndex, customItemHeights, defaultItemHeight, renderItem]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) =>
      setScrollTop(e.currentTarget.scrollTop),
    []
  );

  return (
    <div
      ref={virtualizedListRef}
      onScroll={handleScroll}
      style={{ overflowY: "scroll" }}
    >
      {customListHeader && customListHeader}
      <SVirtualizedList innerHeight={innerHeight}>
        {items}
      </SVirtualizedList>
    </div>
  );
};

export default VirtualizedList;
