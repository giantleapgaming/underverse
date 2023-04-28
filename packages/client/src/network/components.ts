import { defineCoordComponent, defineNumberComponent, defineStringComponent } from "@latticexyz/std-client";
import { world } from "./world";
import { Type, defineComponent, overridableComponent } from "@latticexyz/recs";

export const components = {
  LoadingState: defineComponent(
    world,
    {
      state: Type.Number,
      msg: Type.String,
      percentage: Type.Number,
    },
    {
      id: "LoadingState",
      metadata: {
        contractId: "component.LoadingState",
      },
    }
  ),
  Name: overridableComponent(
    defineStringComponent(world, { id: "Name", indexed: true, metadata: { contractId: "component.Name" } })
  ),
  Cash: overridableComponent(
    defineNumberComponent(world, { id: "Cash", indexed: true, metadata: { contractId: "component.Cash" } })
  ),
  Faction: overridableComponent(
    defineNumberComponent(world, {
      id: "Faction",
      indexed: true,
      metadata: { contractId: "component.Faction" },
    })
  ),
  Attribute1: overridableComponent(
    defineNumberComponent(world, {
      id: "Attribute1",
      indexed: true,
      metadata: { contractId: "component.Attribute1" },
    })
  ),
  Attribute2: overridableComponent(
    defineNumberComponent(world, {
      id: "Attribute2",
      indexed: true,
      metadata: { contractId: "component.Attribute2" },
    })
  ),
  Attribute3: overridableComponent(
    defineNumberComponent(world, {
      id: "Attribute3",
      indexed: true,
      metadata: { contractId: "component.Attribute3" },
    })
  ),
  Attribute4: overridableComponent(
    defineNumberComponent(world, {
      id: "Attribute4",
      indexed: true,
      metadata: { contractId: "component.Attribute4" },
    })
  ),
  Attribute5: overridableComponent(
    defineNumberComponent(world, {
      id: "Attribute5",
      indexed: true,
      metadata: { contractId: "component.Attribute5" },
    })
  ),
  Attribute6: overridableComponent(
    defineNumberComponent(world, {
      id: "Attribute6",
      indexed: true,
      metadata: { contractId: "component.Attribute6" },
    })
  ),
  Type: overridableComponent(
    defineNumberComponent(world, {
      id: "Type",
      indexed: true,
      metadata: { contractId: "component.Type" },
    })
  ),
  Fuel: overridableComponent(
    defineNumberComponent(world, {
      id: "Fuel",
      indexed: true,
      metadata: { contractId: "component.Fuel" },
    })
  ),
  Population: overridableComponent(
    defineNumberComponent(world, {
      id: "Population",
      indexed: true,
      metadata: { contractId: "component.Population" },
    })
  ),
  NFTID: overridableComponent(
    defineNumberComponent(world, {
      id: "NFTID",
      indexed: true,
      metadata: { contractId: "component.NFTID" },
    })
  ),
  EntityType: overridableComponent(
    defineNumberComponent(world, {
      id: "EntityType",
      indexed: true,
      metadata: { contractId: "component.EntityType" },
    })
  ),
  PlayerCount: overridableComponent(
    defineNumberComponent(world, {
      id: "PlayerCount",
      indexed: true,
      metadata: { contractId: "component.PlayerCount" },
    })
  ),
  Rank: overridableComponent(
    defineNumberComponent(world, {
      id: "Rank",
      indexed: true,
      metadata: { contractId: "component.Rank" },
    })
  ),
  Balance: overridableComponent(
    defineNumberComponent(world, {
      id: "Balance",
      indexed: true,
      metadata: { contractId: "component.Balance" },
    })
  ),
  Defence: overridableComponent(
    defineNumberComponent(world, {
      id: "Defence",
      indexed: true,
      metadata: { contractId: "component.Defence" },
    })
  ),
  LastUpdatedTime: overridableComponent(
    defineNumberComponent(world, {
      id: "LastUpdatedTime",
      indexed: true,
      metadata: { contractId: "component.LastUpdatedTime" },
    })
  ),
  Level: overridableComponent(
    defineNumberComponent(world, {
      id: "Level",
      indexed: true,
      metadata: { contractId: "component.Level" },
    })
  ),
  Offence: overridableComponent(
    defineNumberComponent(world, {
      id: "Offence",
      indexed: true,
      metadata: { contractId: "component.Offence" },
    })
  ),
  OwnedBy: overridableComponent(
    defineStringComponent(world, {
      id: "OwnedBy",
      indexed: true,
      metadata: { contractId: "component.OwnedBy" },
    })
  ),
  Position: overridableComponent(
    defineCoordComponent(world, {
      id: "Position",
      indexed: true,
      metadata: { contractId: "component.Position" },
    })
  ),
  PersonName: overridableComponent(
    defineStringComponent(world, {
      id: "PersonName",
      indexed: true,
      metadata: { contractId: "component.PersonName" },
    })
  ),
  PrevPosition: overridableComponent(
    defineCoordComponent(world, {
      id: "PrevPosition",
      indexed: true,
      metadata: { contractId: "component.PrevPosition" },
    })
  ),
  SectorEdge: overridableComponent(
    defineComponent(
      world,
      { value: Type.NumberArray },
      { id: "SectorEdge", metadata: { contractId: "component.SectorEdge" } }
    )
  ),
  Prospected: overridableComponent(
    defineNumberComponent(world, {
      id: "Prospected",
      indexed: true,
      metadata: { contractId: "component.Prospected" },
    })
  ),
  Encounter: overridableComponent(
    defineNumberComponent(world, {
      id: "Encounter",
      indexed: true,
      metadata: { contractId: "component.Encounter" },
    })
  ),
};
