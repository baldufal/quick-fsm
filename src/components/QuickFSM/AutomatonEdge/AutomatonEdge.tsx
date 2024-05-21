import { useCallback, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath, useStore } from 'reactflow';
import './automatonEdge.css'
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, VStack, Wrap, WrapItem, useDisclosure, Text } from '@chakra-ui/react';
import React from 'react';
import { Trigger } from '../QuickFSM';
import { getEdgeParams } from "./utils"

export type EdgeData = {
    triggers: Trigger[];
};

function AutomatonEdge({ id, source, target, markerEnd, style, data }: EdgeProps<EdgeData>) {
    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

    const { isOpen, onOpen, onClose } = useDisclosure()

    const [selectedTriggers, setSelectedTriggers] = useState<Trigger[]>([]);
    const triggers = (data && data.triggers) ? data.triggers : [];
    const [unselectedTriggers, setUnselectedTriggers] = useState<Trigger[]>(triggers);


    let horizontal = true;
    if (sourceNode?.positionAbsolute && targetNode?.positionAbsolute)
        horizontal = Math.abs(sourceNode?.positionAbsolute?.x - targetNode?.positionAbsolute?.x) >
            Math.abs(sourceNode?.positionAbsolute?.y - targetNode?.positionAbsolute?.y)

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

    const [edgePath, labelx, labely] = getStraightPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
    });

    return (
        <>
            <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        width: '${horizontal ? "100px" : "100%"}',
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelx}px,${labely}px) rotate(${Math.atan((ty - sy) / (tx - sx))}rad)`,
                        fontSize: 12,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: 'all',
                        direction: "revert"
                    }}
                    className="nodrag nopan"
                >
                    <Wrap align={"center"} justify={"center"}>
                        {selectedTriggers.map((trigger, trigggerIndex) =>
                            <WrapItem bg={trigger.color} key={trigggerIndex}>
                                {trigger.label}
                            </WrapItem>)}
                        <WrapItem key={-1}>
                            <Button onClick={onOpen}     >
                                Edit
                            </Button>
                        </WrapItem>
                    </Wrap>
                </div>
            </EdgeLabelRenderer>

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
                            <Wrap align={"center"}>{unselectedTriggers.map((trigger, triggerIndex) =>
                                <WrapItem
                                    bg={trigger.color}
                                    key={triggerIndex}>
                                    <Button onClick={() => {
                                        const trig = triggers.find((trig) => trig == trigger);
                                        if (trig)
                                            trig.active = true;
                                        setSelectedTriggers([...selectedTriggers, unselectedTriggers[triggerIndex]])
                                        setUnselectedTriggers([
                                            ...unselectedTriggers.slice(0, triggerIndex),
                                            ...unselectedTriggers.slice(triggerIndex + 1)
                                        ])
                                    }
                                    }>
                                        {trigger.label}
                                    </Button>

                                </WrapItem>)}
                            </Wrap>
                            <Text>
                                Selected actions:
                            </Text>
                            <Wrap align={"center"}>{selectedTriggers.map((trigger, triggerIndex) =>
                                <WrapItem
                                    bg={trigger.color}
                                    key={triggerIndex}>
                                    <Button onClick={() => {
                                        const trig = triggers.find((trig) => trig == trigger);
                                        if (trig)
                                            trig.active = false;
                                        setUnselectedTriggers([...unselectedTriggers, selectedTriggers[triggerIndex]])
                                        setSelectedTriggers([
                                            ...selectedTriggers.slice(0, triggerIndex),
                                            ...selectedTriggers.slice(triggerIndex + 1)
                                        ])
                                    }
                                    }>
                                        {trigger.label}
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

export default AutomatonEdge;