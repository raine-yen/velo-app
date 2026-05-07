const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required for @supabase/supabase-js to resolve its internal modules correctly.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
