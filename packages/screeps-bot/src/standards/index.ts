/**
 * Screepers Standards Integration
 * Implements protocols from https://github.com/screepers/screepers-standards
 */

// Core standards
export * from "./types";
export * from "./SS1SegmentManager";
export * from "./SS2TerminalComms";
export * from "./ProtocolRegistry";

// Alliance and diplomacy
export * from "./types/allianceTypes";
export * from "./SimpleAlliesManager";

// Segment protocols
export * from "./segment-protocols/PortalsProtocol";
export * from "./segment-protocols/RoomNeedsProtocol";
export * from "./segment-protocols/TerminalComProtocol";

// Terminal protocols
export * from "./terminal-protocols/KeyExchangeProtocol";
export * from "./terminal-protocols/ResourceRequestProtocol";
