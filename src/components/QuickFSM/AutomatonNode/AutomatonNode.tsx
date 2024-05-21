import { Handle, NodeProps, NodeResizer, Position, ReactFlowState, useStore } from 'reactflow';
import "./automatonNode.css"
import { Action } from '../QuickFSM';
import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, VStack, Wrap, WrapItem, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import React from 'react';

export type NodeData = {
  active: boolean;
  label: string;
  actions: Action[];
};

const connectionNodeIdSelector = (state: ReactFlowState) => state.connectionNodeId;

function AutomatonNode({ id, data, selected }: NodeProps<NodeData>) {

  const connectionNodeId = useStore(connectionNodeIdSelector);

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [unselectedActions, setUnselectedActions] = useState<Action[]>(data.actions);

  const isConnecting = !!connectionNodeId;
  const isTarget = connectionNodeId && connectionNodeId !== id;
  //const label = isTarget ? 'Drop here' : 'Drag to connect';

  return (
    <>
      <NodeResizer color="#ff0071" isVisible={selected} minWidth={150} minHeight={100} />
      <div
        className="customNode"
        style={{
          borderStyle: isTarget ? 'dashed' : 'solid',
          backgroundColor: data.active ? "#ff0000" : isTarget ? '#ffcce3' : '#ccd9f6',
        }}
      >
        {!isConnecting && (
          <Handle className="customHandle" position={Position.Right} type="source" />
        )}
        <VStack width={"100%"} height={"100%"}>
          <Text>{data.label}</Text>
          <Box overflowY={"hidden"}>
            <Wrap align={"center"}>
              {selectedActions.map((action) =>
                <WrapItem bg={action.color} key={action.id + 1}>
                  {action.label}
                </WrapItem>)}
              <WrapItem key={0}>
                <Button onClick={onOpen}     >
                  Edit
                </Button>
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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Click actions to (de)select</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <Text>
                Avialable actions:
              </Text>
              <Wrap align={"center"}>{unselectedActions.map((action, actionIndex) =>
                <WrapItem bg={action.color} key={action.id}>
                  <Button onClick={() => {
                    const act = data.actions.find((act) => act == action);
                    if (act)
                      act.active = true;
                    setSelectedActions([...selectedActions, unselectedActions[actionIndex]])
                    setUnselectedActions([
                      ...unselectedActions.slice(0, actionIndex),
                      ...unselectedActions.slice(actionIndex + 1)
                    ])
                  }
                  }>
                    {action.label}
                  </Button>

                </WrapItem>)}
              </Wrap>
              <Text>
                Selected actions:
              </Text>
              <Wrap align={"center"}>{selectedActions.map((action, actionIndex) =>
                <WrapItem bg={action.color} key={action.id}>
                  <Button onClick={() => {
                    const act = data.actions.find((act) => act == action);
                    if (act)
                      act.active = false;
                    setUnselectedActions([...unselectedActions, selectedActions[actionIndex]])
                    setSelectedActions([
                      ...selectedActions.slice(0, actionIndex),
                      ...selectedActions.slice(actionIndex + 1)
                    ])
                  }
                  }>
                    {action.label}
                  </Button>
                </WrapItem>)}
              </Wrap>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>

  );
}

export default AutomatonNode;