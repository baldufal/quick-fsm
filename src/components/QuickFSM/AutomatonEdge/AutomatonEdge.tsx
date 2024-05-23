import { useCallback, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath,useStore as useReactFlowStore } from 'reactflow';
import { IconButton, Wrap, WrapItem, useDisclosure } from '@chakra-ui/react';
import React from 'react';
import { Trigger } from '../QuickFSM';
import { getEdgeParams } from "./edgeUtils"
import { MdEditNote } from 'react-icons/md';
import ActionTrigger from '../ActionTrigger/ActionTrigger';
import SelectActionTriggerModal from '../ActionTrigger/SelectActionTriggerModal';
import "./automatonEdge.css"
import useStore from '../store';

export type EdgeData = {
    triggers: Trigger[];
};

function AutomatonEdge({ id, source, target, markerEnd, style, data }: EdgeProps<EdgeData>) {
    const sourceNode = useReactFlowStore(useCallback((store) => store.nodeInternals.get(source), [source]));
    const targetNode = useReactFlowStore(useCallback((store) => store.nodeInternals.get(target), [target]));
    if (!sourceNode || !targetNode) {
        return null;
    }

    const { isOpen, onOpen, onClose } = useDisclosure()

    const [selectedTriggers, setSelectedTriggers] = React.useState<Trigger[]>([]);
    const triggers = (data && data.triggers) ? data.triggers : [];
    const [unselectedTriggers, setUnselectedTriggers] = useState<Trigger[]>(triggers);

    const onEdgesChange = useStore((state) => state.onEdgesChange);

    const onEdgeClickX = () => {
        onEdgesChange([{ id: id, type: "remove" }]);
    };

    const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

    const length = Math.sqrt(((tx - sx) ** 2) + ((ty - sy) ** 2)) + 1;
    const dx = (tx - sx) / length;
    const dy = (ty - sy) / length;
    const diagonality = 1 - Math.abs(Math.abs(dx) - Math.abs(dy));

    const [edgePath, labelx, labely] = getStraightPath({
        sourceX: sx - dx,
        sourceY: sy - dy,
        targetX: tx,
        targetY: ty,
    });

    return (
        <>
            <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <button
                    style={{
                        transform: `translate(-50%,-50%) translate(${sx}px,${sy}px) translate(${15 * dx * (1 + diagonality)}px, ${15 * dy * (1 + diagonality)}px) `,
                        pointerEvents: "all"
                    }}
                    className="nodrag nopan edgedeletebutton"
                    onClick={onEdgeClickX}
                >
                    X
                </button>

                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelx}px,${labely}px) translate(${15 * dx}px, ${15 * dy}px) rotate(${Math.atan((ty - sy) / (tx - sx))}rad)`,
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
                            <ActionTrigger
                                actionTrigger={trigger}
                                key={trigggerIndex} />
                        )
                        }
                        <WrapItem key={-1}>
                            <IconButton
                                onClick={onOpen}
                                width={"25px"}
                                height={"25px"}
                                size={"25px"}
                                backgroundColor={"black"}
                                _hover={{ background: "grey" }}
                                background={"rgba(255,255,255,0.8)"}
                                aria-label='Edit actions'
                                icon={<MdEditNote
                                    size={"20px"}
                                    color='white' />}
                            />
                        </WrapItem>
                    </Wrap>
                </div>
            </EdgeLabelRenderer>

            <SelectActionTriggerModal
                isOpen={isOpen}
                onClose={onClose}
                text={'triggers'}
                all={triggers}
                selected={selectedTriggers}
                unselected={unselectedTriggers}
                setSelected={setSelectedTriggers}
                setUnSelected={setUnselectedTriggers} />
        </>

    );
}

export default AutomatonEdge;