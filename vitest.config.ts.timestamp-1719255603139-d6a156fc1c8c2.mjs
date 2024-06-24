// vitest.config.ts
import path2 from "path";
import { defineConfig as defineConfig2, mergeConfig } from "file:///C:/Code/nhn/refor_master/refero/node_modules/vitest/dist/config.js";

// vite.config.ts
import path from "path";
import react from "file:///C:/Code/nhn/refor_master/refero/node_modules/@vitejs/plugin-react/dist/index.mjs";
import autoprefixer from "file:///C:/Code/nhn/refor_master/refero/node_modules/autoprefixer/lib/autoprefixer.js";
import cssnano from "file:///C:/Code/nhn/refor_master/refero/node_modules/cssnano/src/index.js";
import copy from "file:///C:/Code/nhn/refor_master/refero/node_modules/rollup-plugin-copy/dist/index.commonjs.js";
import generatePackageJson from "file:///C:/Code/nhn/refor_master/refero/node_modules/rollup-plugin-generate-package-json/dist/index.cjs.js";
import peerDepsExternal from "file:///C:/Code/nhn/refor_master/refero/node_modules/rollup-plugin-peer-deps-external/dist/rollup-plugin-peer-deps-external.js";
import { defineConfig } from "file:///C:/Code/nhn/refor_master/refero/node_modules/vite/dist/node/index.js";
import dts from "file:///C:/Code/nhn/refor_master/refero/node_modules/vite-plugin-dts/dist/index.mjs";
import { libInjectCss } from "file:///C:/Code/nhn/refor_master/refero/node_modules/vite-plugin-lib-inject-css/dist/index.js";
import tsconfigPaths from "file:///C:/Code/nhn/refor_master/refero/node_modules/vite-tsconfig-paths/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Code\\nhn\\refor_master\\refero";
var OUTPUT_DIRECTORY = "lib";
var vite_config_default = defineConfig(({ command, isPreview }) => {
  const dev = command === "serve" && !isPreview;
  return {
    root: dev ? path.resolve(__vite_injected_original_dirname, "./preview") : path.resolve(__vite_injected_original_dirname, ""),
    css: {
      preprocessorOptions: {
        scss: {
          includePaths: ["node_modules"]
        }
      },
      postcss: {
        plugins: [autoprefixer(), cssnano({ preset: "default" })]
      }
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json", ".scss", ".css"],
      alias: [
        { find: "@helsenorge/refero", replacement: path.resolve(__vite_injected_original_dirname, OUTPUT_DIRECTORY) },
        { find: "@", replacement: path.resolve(__vite_injected_original_dirname, "src") },
        { find: "@components", replacement: path.resolve(__vite_injected_original_dirname, "src/components") },
        { find: "@formcomponents", replacement: path.resolve(__vite_injected_original_dirname, "src/components/formcomponents") },
        { find: "@constants", replacement: path.resolve(__vite_injected_original_dirname, "src/constants") },
        { find: "@test", replacement: path.resolve(__vite_injected_original_dirname, "test") },
        { find: /^~(.*)$/, replacement: "$1" }
      ]
    },
    build: {
      outDir: path.resolve(__vite_injected_original_dirname, OUTPUT_DIRECTORY),
      manifest: true,
      cssMinify: "esbuild",
      sourcemap: false,
      commonjsOptions: {
        transformMixedEsModules: true
      },
      lib: {
        entry: path.resolve(__vite_injected_original_dirname, "src/index.ts"),
        formats: ["es"],
        name: "Refero",
        fileName: (format) => `refero.${format}.js`
      }
    },
    plugins: [
      peerDepsExternal(),
      tsconfigPaths({
        projects: [path.resolve(__vite_injected_original_dirname, "tsconfig.build.json")]
      }),
      dts({
        tsconfigPath: path.resolve(__vite_injected_original_dirname, "tsconfig.build.json"),
        outDir: path.resolve(__vite_injected_original_dirname, "lib/types"),
        include: ["src"],
        exclude: ["__test__", "__mocks__", "__data__"]
      }),
      react(),
      libInjectCss(),
      copy({
        targets: [{ src: "*.md", dest: path.resolve(__vite_injected_original_dirname, OUTPUT_DIRECTORY) }],
        hook: "writeBundle"
      }),
      generatePackageJson({
        outputFolder: path.resolve(__vite_injected_original_dirname, OUTPUT_DIRECTORY),
        baseContents: (pkg) => ({
          author: pkg.author,
          name: pkg.name,
          description: pkg.description,
          repository: pkg.repository,
          version: pkg.version,
          module: "refero.es.js",
          types: "types/index.d.ts",
          license: pkg.license,
          dependencies: pkg.dependencies,
          peerDependencies: pkg.peerDependencies,
          exports: {
            ".": {
              import: "./refero.es.js"
            }
          }
        })
      })
    ]
  };
});

// vitest.config.ts
var __vite_injected_original_dirname2 = "C:\\Code\\nhn\\refor_master\\refero";
var vitest_config_default = defineConfig2(
  (configEnv) => mergeConfig(
    vite_config_default(configEnv),
    defineConfig2({
      root: path2.resolve(__vite_injected_original_dirname2, "."),
      resolve: {
        alias: [
          {
            find: "@helsenorge/datepicker",
            replacement: path2.resolve(__vite_injected_original_dirname2, "node_modules/@helsenorge/datepicker")
          }
        ]
      },
      test: {
        testTimeout: 3e4,
        include: ["src/**/*-spec.ts", "src/**/*-spec.tsx"],
        globals: true,
        environment: "jsdom",
        setupFiles: [path2.resolve(__vite_injected_original_dirname2, "test/setup-test.ts")],
        css: {
          modules: {
            classNameStrategy: "non-scoped"
          }
        },
        server: {
          deps: {
            inline: ["@helsenorge/designsystem-react", "@helsenorge/datepicker"]
          }
        },
        coverage: {
          reporter: ["cobertura", "json"]
        },
        reporters: ["default", "junit", "default", "html"],
        outputFile: {
          junit: "test-report.xml"
        }
      }
    })
  )
);
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyIsICJ2aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXENvZGVcXFxcbmhuXFxcXHJlZm9yX21hc3RlclxcXFxyZWZlcm9cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXENvZGVcXFxcbmhuXFxcXHJlZm9yX21hc3RlclxcXFxyZWZlcm9cXFxcdml0ZXN0LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovQ29kZS9uaG4vcmVmb3JfbWFzdGVyL3JlZmVyby92aXRlc3QuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIG1lcmdlQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XHJcblxyXG5pbXBvcnQgdml0ZUNvbmZpZyBmcm9tICcuL3ZpdGUuY29uZmlnLnRzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhjb25maWdFbnYgPT5cclxuICBtZXJnZUNvbmZpZyhcclxuICAgIHZpdGVDb25maWcoY29uZmlnRW52KSxcclxuICAgIGRlZmluZUNvbmZpZyh7XHJcbiAgICAgIHJvb3Q6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuJyksXHJcblxyXG4gICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgYWxpYXM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgZmluZDogJ0BoZWxzZW5vcmdlL2RhdGVwaWNrZXInLFxyXG4gICAgICAgICAgICByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ25vZGVfbW9kdWxlcy9AaGVsc2Vub3JnZS9kYXRlcGlja2VyJyksXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICB0ZXN0OiB7XHJcbiAgICAgICAgdGVzdFRpbWVvdXQ6IDMwMDAwLFxyXG4gICAgICAgIGluY2x1ZGU6IFsnc3JjLyoqLyotc3BlYy50cycsICdzcmMvKiovKi1zcGVjLnRzeCddLFxyXG4gICAgICAgIGdsb2JhbHM6IHRydWUsXHJcbiAgICAgICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXHJcbiAgICAgICAgc2V0dXBGaWxlczogW3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICd0ZXN0L3NldHVwLXRlc3QudHMnKV0sXHJcbiAgICAgICAgY3NzOiB7XHJcbiAgICAgICAgICBtb2R1bGVzOiB7XHJcbiAgICAgICAgICAgIGNsYXNzTmFtZVN0cmF0ZWd5OiAnbm9uLXNjb3BlZCcsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VydmVyOiB7XHJcbiAgICAgICAgICBkZXBzOiB7XHJcbiAgICAgICAgICAgIGlubGluZTogWydAaGVsc2Vub3JnZS9kZXNpZ25zeXN0ZW0tcmVhY3QnLCAnQGhlbHNlbm9yZ2UvZGF0ZXBpY2tlciddLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvdmVyYWdlOiB7XHJcbiAgICAgICAgICByZXBvcnRlcjogWydjb2JlcnR1cmEnLCAnanNvbiddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVwb3J0ZXJzOiBbJ2RlZmF1bHQnLCAnanVuaXQnLCAnZGVmYXVsdCcsICdodG1sJ10sXHJcbiAgICAgICAgb3V0cHV0RmlsZToge1xyXG4gICAgICAgICAganVuaXQ6ICd0ZXN0LXJlcG9ydC54bWwnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9KVxyXG4gIClcclxuKTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxDb2RlXFxcXG5oblxcXFxyZWZvcl9tYXN0ZXJcXFxccmVmZXJvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxDb2RlXFxcXG5oblxcXFxyZWZvcl9tYXN0ZXJcXFxccmVmZXJvXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Db2RlL25obi9yZWZvcl9tYXN0ZXIvcmVmZXJvL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gJ2F1dG9wcmVmaXhlcic7XHJcbmltcG9ydCBjc3NuYW5vIGZyb20gJ2Nzc25hbm8nO1xyXG5pbXBvcnQgY29weSBmcm9tICdyb2xsdXAtcGx1Z2luLWNvcHknO1xyXG5pbXBvcnQgZ2VuZXJhdGVQYWNrYWdlSnNvbiBmcm9tICdyb2xsdXAtcGx1Z2luLWdlbmVyYXRlLXBhY2thZ2UtanNvbic7XHJcbmltcG9ydCBwZWVyRGVwc0V4dGVybmFsIGZyb20gJ3JvbGx1cC1wbHVnaW4tcGVlci1kZXBzLWV4dGVybmFsJztcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcclxuaW1wb3J0IHsgbGliSW5qZWN0Q3NzIH0gZnJvbSAndml0ZS1wbHVnaW4tbGliLWluamVjdC1jc3MnO1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcclxuXHJcbmNvbnN0IE9VVFBVVF9ESVJFQ1RPUlkgPSAnbGliJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kLCBpc1ByZXZpZXcgfSkgPT4ge1xyXG4gIGNvbnN0IGRldiA9IGNvbW1hbmQgPT09ICdzZXJ2ZScgJiYgIWlzUHJldmlldztcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHJvb3Q6IGRldiA/IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3ByZXZpZXcnKSA6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcnKSxcclxuXHJcbiAgICBjc3M6IHtcclxuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICAgIHNjc3M6IHtcclxuICAgICAgICAgIGluY2x1ZGVQYXRoczogWydub2RlX21vZHVsZXMnXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICBwb3N0Y3NzOiB7XHJcbiAgICAgICAgcGx1Z2luczogW2F1dG9wcmVmaXhlcigpLCBjc3NuYW5vKHsgcHJlc2V0OiAnZGVmYXVsdCcgfSldLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgZXh0ZW5zaW9uczogWycudHMnLCAnLnRzeCcsICcuanMnLCAnLmpzb24nLCAnLnNjc3MnLCAnLmNzcyddLFxyXG4gICAgICBhbGlhczogW1xyXG4gICAgICAgIHsgZmluZDogJ0BoZWxzZW5vcmdlL3JlZmVybycsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBPVVRQVVRfRElSRUNUT1JZKSB9LFxyXG4gICAgICAgIHsgZmluZDogJ0AnLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpIH0sXHJcbiAgICAgICAgeyBmaW5kOiAnQGNvbXBvbmVudHMnLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzJykgfSxcclxuICAgICAgICB7IGZpbmQ6ICdAZm9ybWNvbXBvbmVudHMnLCByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzL2Zvcm1jb21wb25lbnRzJykgfSxcclxuICAgICAgICB7IGZpbmQ6ICdAY29uc3RhbnRzJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY29uc3RhbnRzJykgfSxcclxuICAgICAgICB7IGZpbmQ6ICdAdGVzdCcsIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAndGVzdCcpIH0sXHJcbiAgICAgICAgeyBmaW5kOiAvXn4oLiopJC8sIHJlcGxhY2VtZW50OiAnJDEnIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgb3V0RGlyOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBPVVRQVVRfRElSRUNUT1JZKSxcclxuICAgICAgbWFuaWZlc3Q6IHRydWUsXHJcbiAgICAgIGNzc01pbmlmeTogJ2VzYnVpbGQnLFxyXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgICBjb21tb25qc09wdGlvbnM6IHtcclxuICAgICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgbGliOiB7XHJcbiAgICAgICAgZW50cnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgudHMnKSxcclxuICAgICAgICBmb3JtYXRzOiBbJ2VzJ10sXHJcbiAgICAgICAgbmFtZTogJ1JlZmVybycsXHJcbiAgICAgICAgZmlsZU5hbWU6IChmb3JtYXQpOiBzdHJpbmcgPT4gYHJlZmVyby4ke2Zvcm1hdH0uanNgLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHBlZXJEZXBzRXh0ZXJuYWwoKSxcclxuICAgICAgdHNjb25maWdQYXRocyh7XHJcbiAgICAgICAgcHJvamVjdHM6IFtwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAndHNjb25maWcuYnVpbGQuanNvbicpXSxcclxuICAgICAgfSksXHJcbiAgICAgIGR0cyh7XHJcbiAgICAgICAgdHNjb25maWdQYXRoOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAndHNjb25maWcuYnVpbGQuanNvbicpLFxyXG4gICAgICAgIG91dERpcjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2xpYi90eXBlcycpLFxyXG4gICAgICAgIGluY2x1ZGU6IFsnc3JjJ10sXHJcbiAgICAgICAgZXhjbHVkZTogWydfX3Rlc3RfXycsICdfX21vY2tzX18nLCAnX19kYXRhX18nXSxcclxuICAgICAgfSksXHJcbiAgICAgIHJlYWN0KCksXHJcbiAgICAgIGxpYkluamVjdENzcygpLFxyXG4gICAgICBjb3B5KHtcclxuICAgICAgICB0YXJnZXRzOiBbeyBzcmM6ICcqLm1kJywgZGVzdDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgT1VUUFVUX0RJUkVDVE9SWSkgfV0sXHJcbiAgICAgICAgaG9vazogJ3dyaXRlQnVuZGxlJyxcclxuICAgICAgfSksXHJcbiAgICAgIGdlbmVyYXRlUGFja2FnZUpzb24oe1xyXG4gICAgICAgIG91dHB1dEZvbGRlcjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgT1VUUFVUX0RJUkVDVE9SWSksXHJcbiAgICAgICAgYmFzZUNvbnRlbnRzOiBwa2cgPT4gKHtcclxuICAgICAgICAgIGF1dGhvcjogcGtnLmF1dGhvcixcclxuICAgICAgICAgIG5hbWU6IHBrZy5uYW1lLFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246IHBrZy5kZXNjcmlwdGlvbixcclxuICAgICAgICAgIHJlcG9zaXRvcnk6IHBrZy5yZXBvc2l0b3J5LFxyXG4gICAgICAgICAgdmVyc2lvbjogcGtnLnZlcnNpb24sXHJcbiAgICAgICAgICBtb2R1bGU6ICdyZWZlcm8uZXMuanMnLFxyXG4gICAgICAgICAgdHlwZXM6ICd0eXBlcy9pbmRleC5kLnRzJyxcclxuICAgICAgICAgIGxpY2Vuc2U6IHBrZy5saWNlbnNlLFxyXG4gICAgICAgICAgZGVwZW5kZW5jaWVzOiBwa2cuZGVwZW5kZW5jaWVzLFxyXG4gICAgICAgICAgcGVlckRlcGVuZGVuY2llczogcGtnLnBlZXJEZXBlbmRlbmNpZXMsXHJcbiAgICAgICAgICBleHBvcnRzOiB7XHJcbiAgICAgICAgICAgICcuJzoge1xyXG4gICAgICAgICAgICAgIGltcG9ydDogJy4vcmVmZXJvLmVzLmpzJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0pLFxyXG4gICAgXSxcclxuICB9O1xyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2UixPQUFPQSxXQUFVO0FBRTlTLFNBQVMsZ0JBQUFDLGVBQWMsbUJBQW1COzs7QUNGK08sT0FBTyxVQUFVO0FBRTFTLE9BQU8sV0FBVztBQUNsQixPQUFPLGtCQUFrQjtBQUN6QixPQUFPLGFBQWE7QUFDcEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8seUJBQXlCO0FBQ2hDLE9BQU8sc0JBQXNCO0FBQzdCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLG1CQUFtQjtBQVgxQixJQUFNLG1DQUFtQztBQWF6QyxJQUFNLG1CQUFtQjtBQUV6QixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFNBQVMsVUFBVSxNQUFNO0FBQ3RELFFBQU0sTUFBTSxZQUFZLFdBQVcsQ0FBQztBQUVwQyxTQUFPO0FBQUEsSUFDTCxNQUFNLE1BQU0sS0FBSyxRQUFRLGtDQUFXLFdBQVcsSUFBSSxLQUFLLFFBQVEsa0NBQVcsRUFBRTtBQUFBLElBRTdFLEtBQUs7QUFBQSxNQUNILHFCQUFxQjtBQUFBLFFBQ25CLE1BQU07QUFBQSxVQUNKLGNBQWMsQ0FBQyxjQUFjO0FBQUEsUUFDL0I7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxTQUFTLENBQUMsYUFBYSxHQUFHLFFBQVEsRUFBRSxRQUFRLFVBQVUsQ0FBQyxDQUFDO0FBQUEsTUFDMUQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxZQUFZLENBQUMsT0FBTyxRQUFRLE9BQU8sU0FBUyxTQUFTLE1BQU07QUFBQSxNQUMzRCxPQUFPO0FBQUEsUUFDTCxFQUFFLE1BQU0s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LFNBQVMsQ0FBQyxvQkFBb0IsbUJBQW1CO0FBQUEsUUFDakQsU0FBUztBQUFBLFFBQ1QsYUFBYTtBQUFBLFFBQ2IsWUFBWSxDQUFDRCxNQUFLLFFBQVFDLG1DQUFXLG9CQUFvQixDQUFDO0FBQUEsUUFDMUQsS0FBSztBQUFBLFVBQ0gsU0FBUztBQUFBLFlBQ1AsbUJBQW1CO0FBQUEsVUFDckI7QUFBQSxRQUNGO0FBQUEsUUFDQSxRQUFRO0FBQUEsVUFDTixNQUFNO0FBQUEsWUFDSixRQUFRLENBQUMsa0NBQWtDLHdCQUF3QjtBQUFBLFVBQ3JFO0FBQUEsUUFDRjtBQUFBLFFBQ0EsVUFBVTtBQUFBLFVBQ1IsVUFBVSxDQUFDLGFBQWEsTUFBTTtBQUFBLFFBQ2hDO0FBQUEsUUFDQSxXQUFXLENBQUMsV0FBVyxTQUFTLFdBQVcsTUFBTTtBQUFBLFFBQ2pELFlBQVk7QUFBQSxVQUNWLE9BQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRjsiLAogICJuYW1lcyI6IFsicGF0aCIsICJkZWZpbmVDb25maWciLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiLCAiZGVmaW5lQ29uZmlnIiwgInBhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiXQp9Cg==
