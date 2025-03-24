import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import DraggableCustomerCard from './DraggableCustomerCard';

const VirtualizedClientList = ({ clients, onCheckboxChange, selectedClients }) => {
  const Row = useCallback(({ index, style }) => {
    const client = clients[index];
    return (
      <div style={style}>
        <DraggableCustomerCard
          client={client}
          isSelected={selectedClients.includes(client.id)}
          onCheckboxChange={onCheckboxChange}
        />
      </div>
    );
  }, [clients, onCheckboxChange, selectedClients]);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          itemCount={clients.length}
          itemSize={150} // Adjust this value based on your card's height
          width={width}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
};

export default VirtualizedClientList;