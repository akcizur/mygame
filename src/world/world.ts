export type LocationKind = "outdoor" | "interior";

export type Palette = {
  sky?: number;
  distant?: number;
  wall: number;
  floor: number;
  accent: number;
};

export type WorldLocation = {
  id: string;
  kind: LocationKind;
  title: string;
  width: number;
  palette: Palette;
  returnX?: number;
};

export const LOCATIONS: Record<string, WorldLocation> = {
  outdoor_world: {
    id: "outdoor_world",
    kind: "outdoor",
    title: "YEAR 24 • OUTDOOR WORLD",
    width: 9600,
    palette: { sky: 0x162129, distant: 0x22383d, wall: 0x49392d, floor: 0x314c38, accent: 0x8a6a4b }
  },
  house_01: {
    id: "house_01",
    kind: "interior",
    title: "DŮM • BEZPEČNÁ ZÓNA",
    width: 620,
    palette: { wall: 0x59463a, floor: 0x73543d, accent: 0x8db1ad },
    returnX: 345
  },
  cabin_01: {
    id: "cabin_01",
    kind: "interior",
    title: "SAMOTÁŘSKÁ CHATA • DEN 24",
    width: 520,
    palette: { wall: 0x3f332c, floor: 0x5b4637, accent: 0x8f7658 },
    returnX: 4760
  }
};

export function getLocation(id: string): WorldLocation {
  return LOCATIONS[id] ?? LOCATIONS.outdoor_world;
}
