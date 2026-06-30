import { expect } from "chai";
import {
  encodePortalDataPayload,
  readPortalDataFromPayload,
  isValidPortalData
} from "../src/portal/interShardMemory";
import type { InterShardPortalData } from "../src/portal/types";

const portalData: InterShardPortalData = {
  shard: "shard0",
  portals: {
    W1N1: [{ shard: "shard1", room: "E1S1" }]
  },
  lastUpdate: 1234
};

describe("inter-shard portal memory helpers", () => {
  it("preserves unrelated InterShardMemory keys when writing portal data", () => {
    const payload = encodePortalDataPayload(
      JSON.stringify({ diplomacy: { allies: ["TooAngel"] } }),
      portalData
    );

    const parsed = JSON.parse(payload);
    expect(parsed.diplomacy).to.deep.equal({ allies: ["TooAngel"] });
    expect(parsed["portals:"]).to.deep.equal(portalData);
  });

  it("starts from a fresh payload when existing local data is invalid JSON", () => {
    const payload = encodePortalDataPayload("not-json", portalData);

    expect(JSON.parse(payload)).to.deep.equal({ "portals:": portalData });
  });

  it("reads valid portal data from the namespaced payload", () => {
    const result = readPortalDataFromPayload(JSON.stringify({ "portals:": portalData }));

    expect(result).to.deep.equal(portalData);
  });

  it("rejects malformed portal destinations", () => {
    const malformed = {
      shard: "shard0",
      portals: {
        W1N1: [{ shard: 9, room: "E1S1" }]
      },
      lastUpdate: 1234
    };

    expect(isValidPortalData(malformed)).to.equal(false);
    expect(readPortalDataFromPayload(JSON.stringify({ "portals:": malformed }))).to.equal(null);
  });
});
