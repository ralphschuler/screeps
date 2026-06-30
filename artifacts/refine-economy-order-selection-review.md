## Must-fix findings

1. **Emergency-buy scoring mixes units**
   - `packages/screeps-economy/src/market/orderSelection.ts:94-95`
   - `effectiveCost = order.price + transportCost / cappedOrderAmount` adds **energy units/unit** directly to **credits/unit**.
   - Evidence: Screeps types say `calcTransactionCost` returns energy (`node_modules/@types/screeps/index.d.ts:3518`) and `deal` charges terminal energy (`:3564`). Existing config has `energyCreditValue` for converting terminal energy to credits (`marketManager.ts:93-94`, default `0.001` at `:173`).
   - Active sell correctly applies `energyCreditValue` (`orderSelection.ts:66-67`, `marketManager.ts:831`), emergency buy does not (`marketManager.ts:1109-1116`).
   - New test codifies the unit mix: `orderSelection.test.ts:60-63`.
   - Fix: pass `energyCreditValue` into `rankEmergencyBuyOrders` and use `order.price + transportCost * energyCreditValue / cappedOrderAmount`, or rename/document this as a terminal-energy-preservation heuristic, not “delivered unit cost”.

## Suggestions

- Add boundary tests for `rankEmergencyBuyOrders` / `rankActiveSellOrders`: missing `roomName`, zero `remainingAmount`, `maxDealAmount`, and equal-score tie behavior.

## Changed files reviewed

- `packages/screeps-economy/README.md`
- `packages/screeps-economy/src/market/marketManager.ts`
- `packages/screeps-economy/src/market/orderSelection.ts`
- `packages/screeps-economy/test/orderSelection.test.ts`

## Validation performed

- `npm run lint:economy` ✅
- `npm run build:economy` ✅
- `npm run test:economy` ✅ 60 passing
- `git diff --check -- packages/screeps-economy` ✅
- Checked Screeps market API types for `calcTransactionCost` / `deal`.

## Risks

- Current tests pass while preserving/codifying a likely incorrect emergency-buy cost model.