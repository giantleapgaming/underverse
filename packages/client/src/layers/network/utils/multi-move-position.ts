interface GridPosition {
  x: number;
  y: number;
}

export function generateGrid(centerX: number, centerY: number): GridPosition[] {
  const positions: GridPosition[] = [];
  for (let y = centerY - 2; y <= centerY + 2; y++) {
    for (let x = centerX - 2; x <= centerX + 2; x++) {
      positions.push({ x, y });
    }
  }
  return positions;
}

export function removeDuplicates(allPositions: GridPosition[], removePositions: GridPosition[]): GridPosition[] {
  const removeSet = new Set<string>(removePositions.map(({ x, y }) => `${x},${y}`));
  const seen = new Set<string>();
  return allPositions.filter(({ x, y }) => {
    const key = `${x},${y}`;
    if (seen.has(key) || removeSet.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export interface SourceDestinationMap {
  source: GridPosition;
  destination: GridPosition;
}
export function mapSourcesToDestinations(
  sources: GridPosition[],
  destinations: GridPosition[]
): SourceDestinationMap[] {
  const sourceDestinationMap: SourceDestinationMap[] = [];
  const usedDestinations = new Set<string>();

  for (const source of sources) {
    let minDistance = Number.MAX_SAFE_INTEGER;
    let nearestDestination: GridPosition | undefined;

    for (const destination of destinations) {
      const distance = manhattanDistance(source, destination);
      if (distance < minDistance && !usedDestinations.has(`${destination.x},${destination.y}`)) {
        minDistance = distance;
        nearestDestination = destination;
      }
    }

    if (nearestDestination) {
      usedDestinations.add(`${nearestDestination.x},${nearestDestination.y}`);
      sourceDestinationMap.push({
        source,
        destination: nearestDestination,
      });
    }
  }

  return sourceDestinationMap;
}

function manhattanDistance(pos1: GridPosition, pos2: GridPosition): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}
