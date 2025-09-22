import { existsSync, readFileSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { join } from 'node:path';

import type { Plugin } from 'vite';

type StringOrRegExp = string | RegExp;

interface UserOptions {
  deps: boolean;
  devDeps: boolean;
  optionalDeps: boolean;
  peerDeps: boolean;
  nodeBuiltins: boolean;
  include: StringOrRegExp[];
  except: StringOrRegExp[];
  useFile: string;
  applyToWorkers: boolean;
}

const DEFAULTS: UserOptions = {
  deps: true,
  devDeps: false,
  optionalDeps: true,
  peerDeps: true,
  nodeBuiltins: true,
  include: [],
  except: [],
  useFile: join(process.cwd(), 'package.json'),
  applyToWorkers: true,
};

function escapeRegex(lit: string): string {
  return lit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Turn a package name into `^name(?:/.*)?$` to match deep imports. */
function pkgToRegex(name: string): RegExp {
  return new RegExp(`^${escapeRegex(name)}(?:/.*)?$`);
}

/** Normalize user string/regex arrays to regex array (strings become package-deep regex). */
function toRegexes(list: StringOrRegExp[]): RegExp[] {
  return list.map(x => (typeof x === 'string' ? pkgToRegex(x) : x));
}

/** Try to extract the npm package name from an absolute path inside node_modules. */
function pkgNameFromNodeModulesPath(id: string): string | null {
  // Normalize path separators
  const norm = id.split(/[\\/]+/);
  const nmIndex = norm.lastIndexOf('node_modules');
  if (nmIndex === -1) return null;
  const first = norm[nmIndex + 1];
  if (!first) return null;
  // Scoped packages: @scope/name
  if (first.startsWith('@')) {
    const second = norm[nmIndex + 2];
    if (!second) return null;
    return `${first}/${second}`;
  }
  return first;
}

function buildExternalMatcher(opts: UserOptions): (id: string) => boolean {
  if (!existsSync(opts.useFile)) {
    throw new Error(`[externalize-deps] useFile not found: ${opts.useFile}`);
  }
  const pkgJson = JSON.parse(readFileSync(opts.useFile, 'utf8'));

  const detected = new Set<RegExp>();
  const addFrom = (obj?: Record<string, string>): void => {
    Object.keys(obj ?? {}).forEach(dep => detected.add(pkgToRegex(dep)));
  };

  if (opts.deps) addFrom(pkgJson.dependencies);
  if (opts.devDeps) addFrom(pkgJson.devDependencies);
  if (opts.optionalDeps) addFrom(pkgJson.optionalDependencies);
  if (opts.peerDeps) addFrom(pkgJson.peerDependencies);

  if (opts.nodeBuiltins) {
    for (const m of builtinModules) {
      detected.add(new RegExp(`^(?:node:)?${escapeRegex(m)}$`));
    }
  }

  const include = toRegexes(opts.include);
  const except = toRegexes(opts.except);

  // Merge lists; turn into one big alternation regex for speed
  const all = [...detected, ...include];

  const bigAlternation = all.length ? new RegExp(`(?:${all.map(r => r.source).join('|')})`) : null;

  const isExcept = (id: string): boolean => except.some(re => re.test(id));
  const isExternalBare = (id: string): boolean => (bigAlternation ? bigAlternation.test(id) : false);

  const cache = new Map<string, boolean>();

  const predicate = (rawId: string): boolean => {
    const cached = cache.get(rawId);
    if (cached !== undefined) return cached;

    // never externalize styles
    if (/\.(css|scss|sass|less|styl)$/i.test(rawId)) {
      cache.set(rawId, false);
      return false;
    }
    // never externalize virtual/url/query imports
    if (rawId.startsWith('\0') || rawId.startsWith('virtual:') || rawId.startsWith('data:') || rawId.startsWith('http')) {
      cache.set(rawId, false);
      return false;
    }
    // If the specifier has query/hash, keep it internal
    if (rawId.includes('?') || rawId.includes('#')) {
      cache.set(rawId, false);
      return false;
    }

    // bare id check (react, @scope/pkg, lodash/fp)
    if (!isExcept(rawId) && isExternalBare(rawId)) {
      cache.set(rawId, true);
      return true;
    }

    // absolute/relative resolved into node_modules
    const pkgFromPath = pkgNameFromNodeModulesPath(rawId);
    if (pkgFromPath) {
      const matched = !isExcept(pkgFromPath) && isExternalBare(pkgFromPath);
      cache.set(rawId, matched);
      return matched;
    }

    cache.set(rawId, false);
    return false;
  };

  return predicate;
}

export function externalizeDeps(userOptions: Partial<UserOptions> = {}): Plugin {
  const opts: UserOptions = { ...DEFAULTS, ...userOptions };
  let external!: (id: string) => boolean;

  return {
    name: 'externalize-deps-internal',
    apply: 'build',
    enforce: 'pre',
    config() {
      external = buildExternalMatcher(opts);
      const rollup = { external };
      return {
        build: { rollupOptions: rollup },
        ...(opts.applyToWorkers ? { worker: { rollupOptions: rollup } } : {}),
      };
    },
  };
}
