import { expect } from "chai";
import {
  rankActiveSellOrders,
  rankEmergencyBuyOrders
} from "../src/market/orderSelection";

function order(partial: Partial<Order> & Pick<Order, "id" | "type" | "price" | "roomName">): Order {
  return {
    resourceType: RESOURCE_HYDROGEN,
    amount: 10000,
    remainingAmount: 10000,
    created: 1,
    ...partial
  } as Order;
}

describe("market order selection", () => {
  it("ranks active sell orders by net unit value after transport energy cost", () => {
    const candidates = rankActiveSellOrders({
      orders: [
        order({ id: "expensive-but-far", type: ORDER_BUY, price: 2.0, roomName: "W9N9" }),
        order({ id: "cheaper-but-local", type: ORDER_BUY, price: 1.5, roomName: "W1N2" })
      ],
      requestedAmount: 1000,
      sourceRoomName: "W1N1",
      maxDealAmount: 1000,
      energyCreditValue: 10,
      calcTransactionCost: (_amount, _source, destination) => destination === "W9N9" ? 100 : 1
    });

    expect(candidates.map(candidate => candidate.order.id)).to.deep.equal([
      "cheaper-but-local",
      "expensive-but-far"
    ]);
    expect(candidates[0]).to.deep.include({ dealAmount: 1000, energyCost: 1 });
  });

  it("ignores non-positive active sell outcomes", () => {
    const candidates = rankActiveSellOrders({
      orders: [order({ id: "loss", type: ORDER_BUY, price: 0.1, roomName: "W9N9" })],
      requestedAmount: 100,
      sourceRoomName: "W1N1",
      maxDealAmount: 100,
      energyCreditValue: 1,
      calcTransactionCost: () => 100
    });

    expect(candidates).to.deep.equal([]);
  });

  it("ranks emergency buy orders by price-and-energy emergency score and caps amount", () => {
    const candidates = rankEmergencyBuyOrders({
      orders: [
        order({ id: "cheap-far", type: ORDER_SELL, price: 1.0, roomName: "W9N9" }),
        order({ id: "near", type: ORDER_SELL, price: 1.2, roomName: "W1N2" })
      ],
      requestedAmount: 3000,
      destinationRoomName: "W1N1",
      maxDealAmount: 2000,
      calcTransactionCost: (_amount, source) => source === "W9N9" ? 1000 : 10
    });

    expect(candidates.map(candidate => candidate.order.id)).to.deep.equal(["near", "cheap-far"]);
    expect(candidates[0]).to.deep.include({ cappedOrderAmount: 2000, transportCost: 10 });
  });
});
