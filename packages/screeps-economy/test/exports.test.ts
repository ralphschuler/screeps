/**
 * Basic tests for economy package exports
 */

import { expect } from 'chai';
import {
  LinkManager,
  linkManager,
  TerminalManager,
  terminalManager,
  FactoryManager,
  factoryManager,
  MarketManager,
  marketManager,
  MarketTrendAnalyzer,
  terminalRouter
} from '../src/index';

describe('Economy Package Exports', () => {
  describe('Link Management', () => {
    it('should export LinkManager class', () => {
      expect(LinkManager).to.be.a('function');
    });

    it('should export linkManager instance', () => {
      expect(linkManager).to.be.an.instanceof(LinkManager);
    });
  });

  describe('Terminal Management', () => {
    it('should export TerminalManager class', () => {
      expect(TerminalManager).to.be.a('function');
    });

    it('should export terminalManager instance', () => {
      expect(terminalManager).to.be.an.instanceof(TerminalManager);
    });

    it('should export terminalRouter instance', () => {
      expect(terminalRouter).to.exist;
    });
  });

  describe('Factory Management', () => {
    it('should export FactoryManager class', () => {
      expect(FactoryManager).to.be.a('function');
    });

    it('should export factoryManager instance', () => {
      expect(factoryManager).to.be.an.instanceof(FactoryManager);
    });
  });

  describe('Market Management', () => {
    it('should export MarketManager class', () => {
      expect(MarketManager).to.be.a('function');
    });

    it('should export marketManager instance', () => {
      expect(marketManager).to.be.an.instanceof(MarketManager);
    });

    it('should export MarketTrendAnalyzer class', () => {
      expect(MarketTrendAnalyzer).to.be.a('function');
    });
  });
});
