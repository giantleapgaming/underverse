import { getNftId } from "./../layers/network/utils/getNftId";
import { Layers } from "../types";
import { EntityID, getComponentValue } from "@latticexyz/recs";
import { Mapping } from "./mapping";
import { WorldCoord } from "@latticexyz/phaserx/dist/types";

/**
 * @param a Coordinate A
 * @param b Coordinate B
 * @returns Manhattan distance from A to B (https://xlinux.nist.gov/dads/HTML/manhattanDistance.html)
 */
export function manhattan(a: WorldCoord, b: WorldCoord) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function intersectingCircles(
  circles: Array<[number, number]>,
  p1: [number, number],
  p2: [number, number]
): Array<[number, number]> {
  // array to store the coordinates of the intersecting circles
  const intersectingPoints: Array<[number, number]> = [];

  // Iterate through each circle in the input array
  for (let i = 0; i < circles.length; i++) {
    // center of current circle
    const center = [circles[i][0], circles[i][1]];
    // radius of current circle
    const radius = 1;

    // Find the shortest distance between the center of the current circle and the line segment
    const dist = distanceToSegment(center, p1, p2);

    // If the distance is less than the radius, the circle and segment intersect
    if (dist < radius) {
      // push the center of the intersecting circle to the array
      intersectingPoints.push(center);
    }
  }

  // return the array of intersecting points
  return intersectingPoints;
}

// function to find the shortest distance between the center of the current circle and the line segment
export function distanceToSegment(p: [number, number], v: [number, number], w: [number, number]) {
  // square of the distance between two points
  const l2 = distanceBetweenCoordinates(v, w);
  if (l2 == 0) return distanceBetweenCoordinates(p, v);
  // t is the parameter that describes the projection of the point on the line
  const t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  if (t < 0) return distanceBetweenCoordinates(p, v);
  if (t > 1) return distanceBetweenCoordinates(p, w);
  // square of the distance between the point and the line segment
  return distanceBetweenCoordinates(p, [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])]);
}

// function to calculate the square of the distance between two points
export function distanceBetweenCoordinates(v: [number, number], w: [number, number]) {
  return (v[0] - w[0]) * (v[0] - w[0]) + (v[1] - w[1]) * (v[1] - w[1]);
}

export function enclosedPoints(
  points: Array<[number, number]>,
  rect: [[number, number], [number, number]]
): Array<[number, number]> {
  const enclosedPoints: Array<[number, number]> = [];
  // Get the top-left and bottom-right coordinates of the rectangle
  const x1 = Math.min(rect[0][0], rect[1][0]);
  const y1 = Math.min(rect[0][1], rect[1][1]);
  const x2 = Math.max(rect[0][0], rect[1][0]);
  const y2 = Math.max(rect[0][1], rect[1][1]);
  // Iterate through each point in the input array
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    // Check if the point is within the rectangle
    if (point[0] >= x1 && point[0] <= x2 && point[1] >= y1 && point[1] <= y2) {
      enclosedPoints.push(point);
    }
  }
  return enclosedPoints;
}

export function getCoordinatesArray(valuesX: Map<number, number>, valuesY: Map<number, number>): [number, number][] {
  const coordinates: [number, number][] = [];
  valuesX.forEach((valueX, key) => {
    if (valuesY.has(key)) {
      coordinates.push([valueX, valuesY.get(key) as number]);
    }
  });
  return coordinates;
}

export function segmentPoints(x1: number, y1: number, x2: number, y2: number) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const stepX = (deltaX / distance) * 100;
  const stepY = (deltaY / distance) * 100;
  let x = x1 * 100;
  let y = y1 * 100;
  const points: any[] = [];
  let currentPoint: any;
  for (let i = 1; i <= distance; i++) {
    x += stepX;
    y += stepY;
    currentPoint = { x: (x / 100).toFixed(), y: (y / 100).toFixed() };
    if (!points.some((p) => p.x === currentPoint.x && p.y === currentPoint.y)) {
      points.push(currentPoint);
    }
  }
  return points;
}

// export function segmentPoints(x1: number, y1: number, x2: number, y2: number) {
//   const deltaX = x2 - x1;
//   const deltaY = y2 - y1;
//   const distance = Number(Math.sqrt(deltaX * deltaX + deltaY * deltaY).toFixed());
//   const stepX = Number(((deltaX / distance) * 100).toFixed());
//   const stepY = Number(((deltaY / distance) * 100).toFixed());
//   let x = x1 * 100;
//   let y = y1 * 100;
//   const points: any[] = [];
//   let currentPoint: any;
//   for (let i = 1; i <= distance; i++) {
//     x += stepX;
//     y += stepY;
//     currentPoint = { x: (x / 100).toFixed(), y: (y / 100).toFixed() };
//     if (!points.some((p) => p.x === currentPoint.x && p.y === currentPoint.y)) {
//       points.push(currentPoint);
//     }
//   }
//   return points;
// }

export function getObstacleListWhileMove(arrayOfPointsOnThePath: any[], layer: Layers) {
  const { network, phaser } = layer;
  const {
    world,
    components: { EntityType, Level, OwnedBy, NFTID, Defence },
    utils: { getEntityIndexAtPosition },
  } = network;
  const obstaclePoints: any[] = [];
  for (let i = 0; i < arrayOfPointsOnThePath.length - 1; i += 1) {
    const entityOnThatPoint = getEntityIndexAtPosition(arrayOfPointsOnThePath[i].x, arrayOfPointsOnThePath[i].y);

    const entityType = getComponentValue(EntityType, entityOnThatPoint)?.value as EntityID;
    if (
      entityType &&
      (+entityType === Mapping.astroid.id ||
        +entityType === Mapping.planet.id ||
        +entityType === Mapping.pirateShip.id ||
        +entityType === Mapping.unprospected.id)
    ) {
      obstaclePoints.push(entityOnThatPoint);
    }
    if (
      entityType &&
      (+entityType === Mapping.attack.id ||
        +entityType === Mapping.godown.id ||
        +entityType === Mapping.harvester.id ||
        +entityType === Mapping.refuel.id ||
        +entityType === Mapping.residential.id ||
        +entityType === Mapping.shipyard.id)
    ) {
      const defence = getComponentValue(Defence, entityOnThatPoint)?.value as EntityID;
      const ownedBy = getComponentValue(OwnedBy, entityOnThatPoint)?.value;
      const nftEntityIndex = world.entities.findIndex((e) => e === ownedBy);
      const nftId = getComponentValue(NFTID, nftEntityIndex)?.value;
      const nftDetails = getNftId(layer);
      if (defence && +defence > 0) {
        if (!(nftId && nftDetails && +nftId === nftDetails.tokenId)) {
          obstaclePoints.push(entityOnThatPoint);
        }
      }
    }
    if (entityType && +entityType === Mapping.wall.id) {
      const ownedBy = getComponentValue(OwnedBy, entityOnThatPoint)?.value;
      const nftEntityIndex = world.entities.findIndex((e) => e === ownedBy);
      const defence = getComponentValue(Defence, entityOnThatPoint)?.value as EntityID;
      const nftId = getComponentValue(NFTID, nftEntityIndex)?.value;
      const nftDetails = getNftId(layer);
      if (defence && +defence > 0) {
        if (!(nftId && nftDetails && +nftId === nftDetails.tokenId)) {
          obstaclePoints.push(entityOnThatPoint);
        }
      }
    }
  }
  return obstaclePoints;
}

export function getObstacleListWhileOtherActions(arrayOfPointsOnThePath: any[], layer: Layers) {
  const { network, phaser } = layer;
  const {
    utils: { getEntityIndexAtPosition },
    components: { Defence, EntityType },
  } = network;
  const obstaclePoints: any[] = [];
  for (let i = 0; i < arrayOfPointsOnThePath.length - 1; i += 1) {
    const entityOnThatPoint = getEntityIndexAtPosition(arrayOfPointsOnThePath[i].x, arrayOfPointsOnThePath[i].y);
    const entityType = getComponentValue(EntityType, entityOnThatPoint)?.value as EntityID;
    const defence = getComponentValue(Defence, entityOnThatPoint)?.value as EntityID;

    if ((defence && +defence > 0) || (entityType && +entityType === Mapping.unprospected.id)) {
      obstaclePoints.push(entityOnThatPoint);
    }
  }
  return obstaclePoints;
}
