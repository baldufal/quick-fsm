import { create } from 'zustand';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';

export type RFState = {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    updateActiveNode: (nodeId: string) => void;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => ({
    nodes: [],
    edges: [],
    onNodesChange: (changes: NodeChange[]) => {
        // If we remove one node, we update the active node
        if (changes.length === 1 && changes[0].type === "remove") {
            const { nodes, edges, setNodes, setEdges } = get();

            const nodeId = changes[0].id;
            // Filter out the node with the given id
            const newNodes = nodes.filter(node => node.id !== nodeId);

            // Make sure there is an active node
            if (nodes.some(node => node.id === nodeId && node.data.active) && newNodes.length > 0)
                newNodes[0] = { ...newNodes[0], data: { ...newNodes[0].data, active: true } };
            
            // Filter out all edges connected to the node
            const newEdges = edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);

            setNodes(newNodes);
            setEdges(newEdges);
        } else {
            // Make sure the first node is active
            if (changes.length === 1 && changes[0].type === "add") {
                const { nodes, setNodes } = get();

                const newItem = { ...changes[0].item, data: { ...changes[0].item.data, active: nodes.length > 0 ? false : true } }
                const newNodes = [...nodes, newItem];

                setNodes(newNodes);
            } else {
                set({
                    nodes: applyNodeChanges(changes, get().nodes),
                });
            }
        }
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },
    setNodes: (nodes: Node[]) => {
        set({ nodes });
    },
    setEdges: (edges: Edge[]) => {
        set({ edges });
    },
    updateActiveNode: (nodeId: string) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.data.active && node.id !== nodeId) {
                    // it's important to create a new object here, to inform React Flow about the changes
                    node.data = { ...node.data, active: false };
                }
                if (!node.data.active && node.id === nodeId) {
                    // it's important to create a new object here, to inform React Flow about the changes
                    node.data = { ...node.data, active: true };
                }

                return node;
            }),
        });
    },
}));

export default useStore;