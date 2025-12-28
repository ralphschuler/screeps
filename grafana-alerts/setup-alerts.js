#!/usr/bin/env node

/**
 * Grafana Alert Setup Script
 * 
 * Creates or updates Grafana alert rules for CPU budget monitoring
 * using the grafana-mcp server.
 * 
 * Note: This is a reference implementation. Actual alert creation
 * requires Grafana API credentials and may need to be done manually
 * via the Grafana UI or API.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALERTS_FILE = path.join(__dirname, 'cpu-budget-alerts.json');

/**
 * Load alert configuration
 */
function loadAlertConfig() {
  if (!fs.existsSync(ALERTS_FILE)) {
    throw new Error(`Alert configuration file not found: ${ALERTS_FILE}`);
  }
  
  const data = fs.readFileSync(ALERTS_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Display alert configuration summary
 */
function displayAlertSummary(config) {
  console.log('\n=== Grafana Alert Configuration ===\n');
  console.log(`Version: ${config.version}`);
  console.log(`Description: ${config.description}\n`);
  
  console.log('Alert Rules:');
  config.alerts.forEach((alert, index) => {
    console.log(`\n${index + 1}. ${alert.title}`);
    console.log(`   UID: ${alert.uid}`);
    console.log(`   Severity: ${alert.labels.severity}`);
    console.log(`   Evaluation: ${alert.for}`);
    if (alert.annotations && alert.annotations.summary) {
      console.log(`   Summary: ${alert.annotations.summary}`);
    }
  });
  
  console.log('\n\nContact Points:');
  config.contact_points.forEach((cp, index) => {
    console.log(`\n${index + 1}. ${cp.name}`);
    console.log(`   Type: ${cp.type}`);
    if (cp.note) {
      console.log(`   Note: ${cp.note}`);
    }
  });
  
  console.log('\n');
}

/**
 * Generate instructions for manual setup
 */
function generateManualInstructions(config) {
  console.log('=== Manual Setup Instructions ===\n');
  console.log('To set up these alerts manually in Grafana:\n');
  console.log('1. Log in to Grafana at https://ralphschuler.grafana.net');
  console.log('2. Navigate to Alerting → Alert rules');
  console.log('3. Click "New alert rule" for each alert below:\n');
  
  config.alerts.forEach((alert, index) => {
    console.log(`\nAlert ${index + 1}: ${alert.title}`);
    console.log('─'.repeat(50));
    console.log(`Alert rule name: ${alert.title}`);
    console.log(`Folder: Screeps Performance`);
    console.log(`Group: CPU Budget Monitoring`);
    console.log(`Evaluation interval: 1m`);
    console.log(`For: ${alert.for}`);
    console.log(`\nQuery A:`);
    
    const queryA = alert.data.find(d => d.refId === 'A');
    if (queryA && queryA.model && queryA.model.expr) {
      console.log(`  Expression: ${queryA.model.expr}`);
    }
    
    console.log(`\nCondition:`);
    const conditionB = alert.data.find(d => d.refId === 'B');
    if (conditionB && conditionB.model && conditionB.model.conditions) {
      const cond = conditionB.model.conditions[0];
      console.log(`  WHEN ${cond.reducer.type} OF A ${cond.evaluator.type} ${cond.evaluator.params[0]}`);
    }
    
    console.log(`\nAnnotations:`);
    if (alert.annotations) {
      Object.entries(alert.annotations).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
    
    console.log(`\nLabels:`);
    if (alert.labels) {
      Object.entries(alert.labels).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
  });
  
  console.log('\n\n4. Configure notification policies:');
  console.log('   - Navigate to Alerting → Notification policies');
  console.log('   - Add contact points (Slack, email, GitHub, etc.)');
  console.log('   - Create routing rules based on severity labels');
  
  console.log('\n\n5. Test alerts:');
  console.log('   - Use "Test" button in alert rule editor');
  console.log('   - Verify notifications are received');
  
  console.log('\n');
}

/**
 * Main function
 */
async function main() {
  try {
    // Load alert configuration
    console.log('Loading alert configuration...');
    const config = loadAlertConfig();
    
    // Display summary
    displayAlertSummary(config);
    
    // Check if automated setup is possible
    const grafanaApiKey = process.env.GRAFANA_API_KEY;
    const grafanaUrl = process.env.GRAFANA_URL || 'https://ralphschuler.grafana.net';
    
    if (!grafanaApiKey) {
      console.log('⚠️  GRAFANA_API_KEY environment variable not set');
      console.log('Automated alert creation requires Grafana API credentials.\n');
      generateManualInstructions(config);
      console.log('💡 To enable automated setup:');
      console.log('   export GRAFANA_API_KEY="your-api-key"');
      console.log('   export GRAFANA_URL="https://ralphschuler.grafana.net"');
      console.log('   node grafana-alerts/setup-alerts.js\n');
      return;
    }
    
    console.log('✅ Grafana API key found');
    console.log(`Using Grafana URL: ${grafanaUrl}\n`);
    
    console.log('⚠️  Automated alert creation via API is not yet implemented.');
    console.log('This would require:');
    console.log('  1. Using Grafana HTTP API directly');
    console.log('  2. Or using grafana-mcp create_alert_rule tool');
    console.log('  3. Proper authentication and permissions\n');
    
    generateManualInstructions(config);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
