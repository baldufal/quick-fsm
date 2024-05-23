import { Handle, NodeProps, NodeResizer, Position, ReactFlowState, useStore as useReactFlowStore} from 'reactflow';
import "./automatonNode.css"
import { Action } from '../QuickFSM';
import { Box, IconButton, Input, VStack, Wrap, WrapItem, useDisclosure } from '@chakra-ui/react';
import { useState  } from 'react';
import React from 'react';
import { MdEditNote } from 'react-icons/md';
import ActionTrigger from '../ActionTrigger/ActionTrigger';
import SelectActionTriggerModal from '../ActionTrigger/SelectActionTriggerModal';
import useStore from '../store';

export type NodeData = {
  active: boolean;
  label: string;
  actions: Action[];
};

export interface NodesDeleteEventDetail {
  id: string
}

const connectionNodeIdSelector = (state: ReactFlowState) => state.connectionNodeId;

function AutomatonNode({ id, data, selected }: NodeProps<NodeData>) {

  const [label, setLabel] = React.useState(data.label)

  const onNodesChange = useStore((state) => state.onNodesChange);

  const onNodeClickX = () => {
    onNodesChange([{id: id, type: "remove"}]);
  };

  const connectionNodeId = useReactFlowStore(connectionNodeIdSelector);

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [unselectedActions, setUnselectedActions] = useState<Action[]>(data.actions);

  const isConnecting = !!connectionNodeId;
  const isTarget = connectionNodeId && connectionNodeId !== id;
  //const label = isTarget ? 'Drop here' : 'Drag to connect';

  return (
    <>
      <NodeResizer
        lineStyle={{ zIndex: 9 }}
        handleStyle={{ zIndex: 9 }}
        color="red"
        isVisible={selected}
        minWidth={150}
        minHeight={100}
      />
      <button
        style={{
          position: 'absolute',
          zIndex: '10',
          transform: `translate(-30%,-30%)`,
          pointerEvents: "all"
        }}
        className="nodedeletebutton"
        onClick={onNodeClickX}
      >
        X
      </button>
      <div
        className="customNode"
        style={{
          borderStyle: isTarget ? 'dashed' : 'solid',
          borderColor: data.active ? "green" : "black",
          boxShadow: data.active ? "green 0px 0px 16px" : ""
        }}
      >

        {!isConnecting && (
          <Handle className="customHandle" position={Position.Right} type="source" />
        )}
        <VStack width={"100%"} height={"100%"}>
          <Input
          className='nodrag nopan'
            style={{ fontWeight: "bold" }}
            //width={"auto"}
            background={"rgba(255,255,255,0.8)"}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder='Name'
            size='sm'
          />
          <Box overflowY={"hidden"}>
            <Wrap align={"center"}>
              {selectedActions.map((action) =>
                <WrapItem bg={action.color} key={action.id + 1}>
                  <ActionTrigger
                    actionTrigger={action}
                    key={action.id} />
                </WrapItem>)}
              <WrapItem key={0}>
                
                <IconButton
                  onClick={onOpen}
                  width={"25px"}
                  height={"25px"}
                  size={"25px"}
                  backgroundColor={"black"}
                  _hover={{background: "grey"}}
                  background={"rgba(255,255,255,0.8)"}
                  aria-label='Edit actions'
                  icon={<MdEditNote
                  size={"20px"}
                     color='white'/>}
                />
              </WrapItem>
            </Wrap>
          </Box>
        </VStack>

        <Handle
          className="customHandle"
          position={Position.Left}
          type="target"
          isConnectableStart={false}
        />
      </div>

      <SelectActionTriggerModal
        isOpen={isOpen}
        onClose={onClose}
        text={'actions'}
        all={data.actions}
        selected={selectedActions}
        unselected={unselectedActions}
        setSelected={setSelectedActions}
        setUnSelected={setUnselectedActions} />
    </>

  );
}

export default AutomatonNode;