/**
 * Rollup plugin to stub out Node.js built-ins that shouldn't be in browser/Screeps bundles
 * 
 * This plugin intercepts require() calls to Node.js built-ins (fs, path, etc.) and replaces
 * them with empty objects. This prevents runtime errors when dependencies try to require
 * these modules.
 */

export default function stubNodeBuiltins() {
  const builtins = new Set(['fs', 'path', 'url', 'main.js.map', '../main']);
  
  return {
    name: 'stub-node-builtins',
    
    resolveId(source) {
      // If this is a built-in we want to stub, return a special id
      if (builtins.has(source)) {
        return '\0stub:' + source;
      }
      return null;
    },
    
    load(id) {
      // If this is one of our stubbed modules, return an empty module
      if (id.startsWith('\0stub:')) {
        return 'export default {};';
      }
      return null;
    }
  };
}
