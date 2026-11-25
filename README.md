# NxLearning

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/getting-started/intro#learn-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Run Archloom locally

Start Docker Desktop and configure the existing app-local settings, then run from the workspace root:

```sh
npm run dev:archloom
```

The command waits for local PostgreSQL to become healthy, then starts the Next.js editor at http://localhost:3000/editor and Express at http://localhost:3001. Press Ctrl+C to stop both application processes. PostgreSQL remains running and its data volume is preserved.

To use an already configured external PostgreSQL service, set `ARCHLOOM_SKIP_LOCAL_DATABASE=1` when running the command. Ensure the existing Express database configuration points to that service; the command does not provision it.

## Run tasks

To run tasks with Nx use:

```sh
npx nx <target> <project-name>
```

For example:

```sh
npx nx build myproject
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

To install a new plugin you can use the `nx add` command. Here's an example of adding the React plugin:

```sh
npx nx add @nx/react
```

Use the plugin's generator to create new projects. For example, to create a new React app or library:

```sh
# Generate an app
npx nx g @nx/react:app demo

# Generate a library
npx nx g @nx/react:lib some-lib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/intro#learn-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

//Add express app
npx nx add @nx/express
npx nx g @nx/express:application apps/express-api \
 --name=express-api \
 --linter=eslint \
 --unitTestRunner=jest \
 --js=false

//add angular app
npx nx add @nx/angular
npx nx g @nx/angular:application --help
npx nx g @nx/angular:application apps/angular-app \
 --name=angular-app \
 --standalone=true \
 --routing=true \
 --style=css \
 --ssr=false \
 --e2eTestRunner=none \
 --unitTestRunner=jest \
 --bundler=esbuild \
 --linter=eslint \
 --port=4200

//Add next app
npx nx add @nx/next
npx nx g @nx/next:application apps/next-app \
 --name=next-app \
 --appDir=true \
 --src=true \
 --style=scss \
 --linter=eslint \
 --unitTestRunner=jest \
 --e2eTestRunner=none \
 --js=false

To add libs
npx nx add @nx/js
npx nx g @nx/js:library libs/design-tokens \
 --name=design-tokens \
 --bundler=none \
 --unitTestRunner=none \
 --linter=none \
 --useProjectJson=true

To run apps
run npx nx dev next-app
npx nx serve angular-app

To build all
npx nx run-many -t build --projects=angular-app,next-app

# Build application

npx nx build angular-app

create design-tokens manually
mkdir -p libs/design-tokens/src
touch libs/design-tokens/src/{\_colors,\_typography,\_spacing,\_radius,\_breakpoints,\_mixins,\_reset,global}.scss

1. Shared UI vs Shared Sections
   Shared UI (UIC) vs Shared Sections (SIC)
   Small reusable components vs Combination of multiple UICs
   uic-button vs sic-sidebar
   uic-input vs sic-login-form
   uic-avatar vs sic-user-profile
   uic-card vs sic-product-grid
   uic-modal vs sic-project-editor
   Generic functionality vs Section-specific functionality

add inside both apps angual and nextjs @app/@project.json
"implicitDependencies": ["design-tokens"]
If Next.js does not have a project.json but has its own package.json, add this inside its nx object instead:
"nx": {
"implicitDependencies": ["design-tokens"]
}

npm run dev:archloom
