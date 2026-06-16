export const MSG = {
  noPackageJson:
    "Run this from your app folder (the one with package.json).",
  noVite:
    "rte works with React + Vite projects. I couldn't find a Vite config here.",
  noReact: "rte needs React. Add react to this project first.",
  noViteDep: "rte needs Vite. Add vite to this project first.",
  strictTailwind:
    "rte expects Tailwind CSS for class edits. Install tailwindcss or pass --skip-tailwind-check.",
  monorepoRoot:
    "This looks like the rte monorepo. Run init in your app folder, not the tooling repo.",
  cliPackage: "Cannot init inside @rte/cli package.",
  partialHelp:
    "rte set up what it could safely. Finish the steps in rte/SETUP_TODO.md, then run your dev server.",
  noHeading:
    'rte is wired, but I could not find a heading to mark editable. Add data-rte-id="page.title" to one visible element (see rte/START_HERE.md).',
} as const;
