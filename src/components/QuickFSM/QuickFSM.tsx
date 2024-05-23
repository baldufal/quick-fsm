import { forwardRef, useEffect, useImperativeHandle } from 'react';
import ReactFlow, {
  Controls,
  MarkerType,
  Edge,
  Background
} from 'reactflow';
import 'reactflow/dist/style.css';
import AutomatonNode, { } from './AutomatonNode/AutomatonNode';
import AutomatonEdge from './AutomatonEdge/AutomatonEdge';
import React from 'react';
import AutomatonConnectionLine from './AutomatonConnectionLine/AutomatonConnectionLine';
import { IconType } from 'react-icons';
import { Button } from '@chakra-ui/react';
import { customDeepCopy } from './utils';
import useStore, { RFState } from './store';
import { useShallow } from 'zustand/react/shallow';

export interface FsmHandle {
  triggerTransition: (triggerId: number) => void;
}

const nodeTypes = {
  automaton: AutomatonNode,
};

const edgeTypes = {
  automaton: AutomatonEdge,
};

const connectionLineStyle = {
  strokeWidth: 3,
  stroke: 'black',
};

export type FsmTrigger = {
  id: number;
  label: string;
  icon?: IconType;
  color: string;
};

export type Trigger = {
  id: number;
  label: string;
  icon?: IconType;
  color: string;
  active: boolean;
};

export type FsmAction = {
  id: number;
  label: string;
  icon?: IconType;
  color: string;
};

export type Action = {
  id: number;
  label: string;
  icon?: IconType;
  color: string;
  active: boolean;
};

export type FsmState = {
  label: string;
}

export type FsmTransition = {
  source: number;
  target: number;
}

export type AutomatonProps = {
  initialStates?: FsmState[];
  initialTransitions?: FsmTransition[];
  triggers: FsmTrigger[];
  actions: FsmAction[];
  actionCallback: (id: number) => void;
};

const selector = (state: RFState) => ({
  nodes: state.nodes,
  setNodes: state.setNodes,
  edges: state.edges,
  setEdges: state.setEdges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  updateActiveNode: state.updateActiveNode,
});

const QuickFSM = forwardRef(({ initialStates, initialTransitions, triggers, actions, actionCallback }: AutomatonProps, ref) => {

  const { nodes, setNodes, edges, setEdges, onNodesChange, onEdgesChange, onConnect, updateActiveNode } = useStore(
    useShallow(selector),
  );

  // This index is used as id for the next node
  const [nextNodeIndex, setNextNodeIndex] = React.useState<number>(initialStates ? initialStates.length : 0);
  
  const internal_triggers = triggers.map((trigger) => ({ ...trigger, active: false }));
  const internal_actions = actions.map((action) => ({ ...action, active: false }));

  // Constructs a new node from the provided label
  const constructNode = (node: FsmState, index: number, center?: boolean, active?: boolean) => {
    const grid = Math.ceil(Math.sqrt(initialStates ? initialStates.length : 3))
    const nodeX = !center ? 10 + (index % grid) * 450 : index * 10;
    const nodeY = !center ? 10 + Math.floor(index / grid) * 300 : index * 10;

    return {
      id: `${index}`,
      key: index,
      type: 'automaton',
      position: {
        x: nodeX,
        y: nodeY,
      },
      data: {
        label: node.label,
        actions: customDeepCopy(internal_actions),
        active: active ? true : false
      },
    };
  };

  if (initialStates)
    useEffect(() => {
      const initNodes = initialStates.map((node, index) => {
        return constructNode(node, index, false, index === 0);
      })

      setNodes(initNodes);

      if (initialTransitions) {
        const initEdges = initialTransitions.reduce(function (filtered: Edge[], transition, index) {
          if (
            transition.source >= 0 &&
            transition.source < initNodes.length &&
            transition.target >= 0 &&
            transition.target < initNodes.length
          ) {
            var someNewValue = {
              id: `${transition.source}-${transition.target}`,
              key: index,
              type: 'automaton',
              source: `${transition.source}`,
              target: `${transition.target}`,
              data: {
                triggers: customDeepCopy(internal_triggers)
              }
            };
            filtered.push(someNewValue);
          }
          return filtered;
        }, []);
        setEdges(initEdges);
      }

    }, [initialStates]);

  const changeActiveNode = (newActiveNodeId: string) => {
    updateActiveNode(newActiveNodeId);
    const activeNode = nodes.find((node) => node.data.active)
    if (activeNode)
      for (var action of activeNode.data.actions) {
        if (action.active)
          actionCallback(action.id)
      }
  }

  const triggerTransition = (transitionId: number) => {
    const activeNode = nodes.find((node) => node.data.active)
    if (!activeNode)
      return;
    const outgoingEdges = edges.filter((edge) => edge.source == activeNode.id);

    const edgeWithMatchingTrigger = outgoingEdges.find(edge =>
      edge.data?.triggers.some((trigger: Trigger) => trigger.active && trigger.id == transitionId)
    );

    if (!edgeWithMatchingTrigger)
      return;

    changeActiveNode(edgeWithMatchingTrigger.target);
  };

  useImperativeHandle(ref, () => ({
    triggerTransition,
  }));

  const defaultEdgeOptions = {
    style: { strokeWidth: 3, stroke: 'black' },
    type: 'automaton',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'black',
    },
    data: {
      triggers: customDeepCopy(internal_triggers)
    }
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineComponent={AutomatonConnectionLine}
      connectionLineStyle={connectionLineStyle}
      fitView
    >
      <Controls showInteractive={false} />
      <Background color='#E6E6FA' />

      <Button
        backgroundColor={"white"}
        onClick={() => {
          onNodesChange([{ type: "add", item: constructNode({ label: "New State" }, nextNodeIndex, true) }])
          setNextNodeIndex(oldIndex => oldIndex + 1)
        }}
        style={{
          position: 'absolute',
          right: 10,
          top: 30,
          zIndex: 4,
          boxShadow: "0 0 10px rgb(0 0 0 / 0.2)",
          border: "solid 1px",
          borderRadius: "0"
        }}
        _hover={{ background: "lightgray" }}
      >
        Add State
      </Button>
    </ReactFlow>
  );
});

export default QuickFSM;