import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import ReactFlow, {
  Controls,
  Panel,
  MarkerType,
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import AutomatonNode from './AutomatonNode/AutomatonNode';
import AutomatonEdge, { EdgeData } from './AutomatonEdge/AutomatonEdge';
import { Button, ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import AutomatonConnectionLine from './AutomatonConnectionLine/AutomatonConnectionLine';

export interface QuickFSMHandle {
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

export type Trigger = {
  id: number;
  label: string;
  color: string;
  active: boolean;
};

export type Action = {
  id: number;
  label: string;
  color: string;
  active: boolean;
};

export type AutoNode = {
  label: string;
}

export type AutomatonProps = {
  initialNodes: AutoNode[];
  initialEdges: Edge<EdgeData>[];
  triggers: Trigger[];
  actions: Action[];
  actionCallback: (id: number) => void;
};

const QuickFSM = forwardRef(({ initialNodes, initialEdges, triggers, actions, actionCallback }: AutomatonProps, ref) => {
  const [activeNode, setActiveNode] = useState<number>(0);

  const changeActiveNode = (newActiveNode: number) => {
    if (nodes.length <= newActiveNode) {
      // Invalid index
      changeActiveNode(0);
      return;
    }
    setNodes(prevNodes => prevNodes.map((node, index) => ({
      ...node,
      data: {
        ...node.data,
        active: index === newActiveNode,
      },
    })));

    setActiveNode(newActiveNode);
    for (var action of nodes[newActiveNode].data.actions)
      if (action.active)
        actionCallback(action.id)
  }

  const triggerTransition = (transitionId: number) => {
    //console.log("Trigger: " + transitionId);
    const outgoingEdges = edges.filter((edge) => edge.source == nodes[activeNode].id);

    const edgeWithMatchingTrigger = outgoingEdges.find(edge =>
      edge.data?.triggers.some(trigger => trigger.active && trigger.id == transitionId)
    );

    if (!edgeWithMatchingTrigger)
      return;

    const newNodeIndex = nodes.findIndex((node) => node.id === edgeWithMatchingTrigger.target)
    if (newNodeIndex >= 0)
      changeActiveNode(newNodeIndex);
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
      triggers: JSON.parse(JSON.stringify(triggers)) as typeof triggers
    }
  };

  const initNodes = initialNodes.map((node, nodeIndex) => {
    return {
      id: "" + nodeIndex,
      key: nodeIndex,
      type: 'automaton',
      position: { x: 10 + (nodeIndex % 5) * 100, y: 10 + Math.floor(nodeIndex / 5) * 100 },
      data: {
        label: node.label,
        actions: actions,
        active: nodeIndex == activeNode
      }
    }
  })
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);



  const updatePos = useCallback(() => {
    setNodes((nds) => {
      return nds.map((node) => {
        return {
          ...node,
          position: {
            x: Math.random() * 1500,
            y: Math.random() * 1500,
          },
        };
      });
    });
  }, []);

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
        <Panel position="top-left" className="header">
          QuickFSM
        </Panel>
        <Background />

        <button
          onClick={updatePos}
          style={{ position: 'absolute', right: 10, top: 30, zIndex: 4 }}
        >
          change pos
        </button>
      </ReactFlow>
  );
});

export default QuickFSM;