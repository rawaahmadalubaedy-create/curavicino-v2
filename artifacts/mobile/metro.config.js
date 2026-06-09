const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

/**
 * pnpm monorepo setup.
 *
 * Metro's resolver does not follow pnpm symlinks by default. Without these
 * settings it falls back to expo/AppEntry.js (classic App.js entry) instead
 * of honouring the "main": "expo-router/entry" field, which causes:
 *   "Unable to resolve module ../../App from AppEntry.js"
 *
 * Fix: tell Metro to watch ONLY the workspace node_modules (not the entire
 * workspace root). Watching the full workspace root caused Metro's
 * FallbackWatcher to crash whenever the platform rotated a directory under
 * .local/skills — an ENOENT on a path that was deleted mid-watch.
 */
config.watchFolders = [
  // Only the pnpm virtual store — NOT workspaceRoot itself.
  // Metro watches projectRoot (artifacts/mobile) by default; the workspace
  // node_modules tree is the only additional path needed for symlink resolution.
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
