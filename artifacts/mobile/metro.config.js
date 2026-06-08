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
 * Fix: tell Metro to watch the workspace root and search both the package-
 * local and the workspace-root node_modules trees.
 */
config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
