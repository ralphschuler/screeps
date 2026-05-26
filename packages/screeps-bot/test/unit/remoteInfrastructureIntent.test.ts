import { assert } from "chai";
import {
  type RemoteInfrastructureSnapshot,
  planRemoteInfrastructureIntent
} from "../../src/empire/remoteInfrastructureIntent";

function snapshot(overrides: Partial<RemoteInfrastructureSnapshot> = {}): RemoteInfrastructureSnapshot {
  return {
    homeRoomName: "W1N1",
    myUsername: "me",
    remoteAssignments: ["W2N1"],
    visibleRooms: {
      W1N1: {
        name: "W1N1",
        constructionSiteCount: 0,
        roadPositions: [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
          { x: 12, y: 10 },
          { x: 13, y: 10 }
        ],
        roadKeys: [],
        roadSiteKeys: [],
        wallKeys: []
      },
      W2N1: {
        name: "W2N1",
        constructionSiteCount: 0,
        controller: {},
        sources: [
          {
            id: "source1" as Id<Source>,
            positions: [
              { x: 24, y: 24, walkableNeighbors: 3, hasStructure: false, hasContainer: false, hasContainerSite: false },
              { x: 25, y: 24, walkableNeighbors: 7, hasStructure: false, hasContainer: false, hasContainerSite: false }
            ]
          }
        ],
        roadPositions: [
          { x: 20, y: 20 },
          { x: 21, y: 20 }
        ],
        roadKeys: [],
        roadSiteKeys: [],
        wallKeys: []
      }
    },
    maxSitesPerRemotePerTick: 2,
    maxConstructionSitesPerRoom: 5,
    maxRoadSitesPerRoomPerTick: 3,
    ...overrides
  };
}

describe("Remote infrastructure intent", () => {
  it("plans visible safe remote source containers without mutating the snapshot", () => {
    const input = snapshot();
    const before = JSON.stringify(input);

    const intent = planRemoteInfrastructureIntent(input);

    assert.equal(JSON.stringify(input), before);
    assert.deepEqual(intent.containerSites, [
      {
        roomName: "W2N1",
        sourceId: "source1" as Id<Source>,
        x: 25,
        y: 24,
        structureType: STRUCTURE_CONTAINER
      }
    ]);
    assert.deepEqual(intent.skipped, []);
  });

  it("skips invisible and hostile remotes while reporting reasons", () => {
    const intent = planRemoteInfrastructureIntent(
      snapshot({
        remoteAssignments: ["W2N1", "W3N1"],
        visibleRooms: {
          W2N1: {
            name: "W2N1",
            constructionSiteCount: 0,
            controller: { ownerUsername: "enemy" },
            sources: [],
            roadPositions: [],
            roadKeys: [],
            roadSiteKeys: [],
            wallKeys: []
          }
        }
      })
    );

    assert.deepEqual(intent.containerSites, []);
    assert.deepInclude(intent.skipped, { roomName: "W2N1", reason: "hostile-owner" });
    assert.deepInclude(intent.skipped, { roomName: "W3N1", reason: "not-visible" });
  });

  it("plans road sites only for visible rooms and respects road/site limits", () => {
    const intent = planRemoteInfrastructureIntent(
      snapshot({
        visibleRooms: {
          W1N1: {
            name: "W1N1",
            constructionSiteCount: 3,
            roadPositions: [
              { x: 10, y: 10 },
              { x: 11, y: 10 },
              { x: 12, y: 10 },
              { x: 13, y: 10 }
            ],
            roadKeys: ["10,10"],
            roadSiteKeys: [],
            wallKeys: ["12,10"]
          },
          W2N1: {
            name: "W2N1",
            constructionSiteCount: 5,
            controller: {},
            sources: [],
            roadPositions: [{ x: 20, y: 20 }],
            roadKeys: [],
            roadSiteKeys: [],
            wallKeys: []
          }
        }
      })
    );

    assert.deepEqual(intent.roadSites, [
      { roomName: "W1N1", x: 11, y: 10, structureType: STRUCTURE_ROAD },
      { roomName: "W1N1", x: 13, y: 10, structureType: STRUCTURE_ROAD }
    ]);
  });

  it("allows road per-tick cap in addition to planned containers while respecting total site cap", () => {
    const intent = planRemoteInfrastructureIntent(
      snapshot({
        visibleRooms: {
          W1N1: {
            name: "W1N1",
            constructionSiteCount: 0,
            roadPositions: [],
            roadKeys: [],
            roadSiteKeys: [],
            wallKeys: []
          },
          W2N1: {
            name: "W2N1",
            constructionSiteCount: 0,
            controller: {},
            sources: [
              {
                id: "source1" as Id<Source>,
                positions: [
                  { x: 25, y: 24, walkableNeighbors: 7, hasStructure: false, hasContainer: false, hasContainerSite: false }
                ]
              },
              {
                id: "source2" as Id<Source>,
                positions: [
                  { x: 30, y: 24, walkableNeighbors: 7, hasStructure: false, hasContainer: false, hasContainerSite: false }
                ]
              }
            ],
            roadPositions: [
              { x: 20, y: 20 },
              { x: 21, y: 20 },
              { x: 22, y: 20 },
              { x: 23, y: 20 }
            ],
            roadKeys: [],
            roadSiteKeys: [],
            wallKeys: []
          }
        }
      })
    );

    assert.lengthOf(intent.containerSites, 2);
    assert.lengthOf(intent.roadSites, 3);
  });
});
