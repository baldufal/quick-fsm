import { Position, MarkerType } from 'reactflow';

type AbsPosition = {
  x: number,
  y: number
};

type Dimensions = {
  width: number,
  height: number,
  positionAbsolute: AbsPosition
}


// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(intersectionNode: Dimensions, targetNode: Dimensions) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const {
    width: intersectionNodeWidth,
    height: intersectionNodeHeight,
    positionAbsolute: intersectionNodePosition,
  } = intersectionNode;
  const targetPosition = targetNode.positionAbsolute;

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetNode.width / 2;
  const y1 = targetPosition.y + targetNode.height / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node: { positionAbsolute: any; }, intersectionPoint: AbsPosition) {
  const n = { ...node.positionAbsolute, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + n.height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: any, target: any) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  let sx = sourceIntersectionPoint.x;
  let sy = sourceIntersectionPoint.y;
  let tx = targetIntersectionPoint.x;
  let ty = targetIntersectionPoint.y;

  // This ensures that reverse edges do not overlap
  switch (sourcePos) {
    case Position.Top:
      sx = (0.5 * sx + source.positionAbsolute.x) / 1.5;
      break;
    case Position.Bottom:
      sx = (0.5 * sx + source.positionAbsolute.x + source.width) / 1.5;
      break;
    case Position.Right:
      sy = (0.5 * sy + source.position.y) / 1.5;
      break;
    case Position.Left:
      sy = (0.5 * sy + source.position.y + source.height) / 1.5;
      break;
  }
  switch (targetPos) {
    case Position.Top:
      tx = (0.5 * tx + target.positionAbsolute.x + target.width) / 1.5;
      break;
    case Position.Bottom:
      tx = (0.5 * tx + target.positionAbsolute.x) / 1.5;
      break;
    case Position.Right:
      ty = (0.5 * ty + target.position.y + target.height) / 1.5;
      break;
    case Position.Left:
      ty = (0.5 * ty + target.position.y) / 1.5;
      break;
  }

  return {
    sx: sx,
    sy: sy,
    tx: tx,
    ty: ty,
    sourcePos,
    targetPos,
  };
}

export function createNodesAndEdges() {
  const nodes = [];
  const edges = [];
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  nodes.push({ id: 'target', data: { label: 'Target' }, position: center });

  for (let i = 0; i < 8; i++) {
    const degrees = i * (360 / 8);
    const radians = degrees * (Math.PI / 180);
    const x = 250 * Math.cos(radians) + center.x;
    const y = 250 * Math.sin(radians) + center.y;

    nodes.push({ id: `${i}`, data: { label: 'Source' }, position: { x, y } });

    edges.push({
      id: `edge-${i}`,
      target: 'target',
      source: `${i}`,
      type: 'floating',
      markerEnd: {
        type: MarkerType.Arrow,
      },
    });
  }

  return { nodes, edges };
}
