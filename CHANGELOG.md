# [2.0.0](https://github.com/mikaelkaron/skills/compare/v1.0.1...v2.0.0) (2026-05-26)


* chore(260526-w09-01)!: delete packages/cli and regenerate package-lock.json ([d127ca1](https://github.com/mikaelkaron/skills/commit/d127ca196fdd761ffe7dbceb2517ac5309d5ad4f))


### Bug Fixes

* **02:** CR-01 escape regex metacharacters in buildSkipFilter step ID matching ([591708c](https://github.com/mikaelkaron/skills/commit/591708c43c843bdbce0fc325c3716f2abf5c7ddf))
* **02:** CR-02 add permissions: {} to setup job in release.yml ([6f46d65](https://github.com/mikaelkaron/skills/commit/6f46d65e5db3511df2b0cb07bdc625ae6a885556))
* **02:** IN-01 anchor workflow test file paths to import.meta.url ([a60a930](https://github.com/mikaelkaron/skills/commit/a60a930bc50aa28980aa31ccc9169a1c8eb0a795))
* **02:** IN-02 add skip_changelog input to release.yml and test coverage ([5243d1b](https://github.com/mikaelkaron/skills/commit/5243d1b4a81d799193b0a1f15f438b2e84889c79))
* **02:** IN-03 remove explicit undefined suffix from withId calls, support overloaded signature ([f8bcb23](https://github.com/mikaelkaron/skills/commit/f8bcb23c9f65bc0a722a8d61db24dc506299b8f9))
* **02:** WR-01 route release.yml inputs through env vars to prevent shell injection ([cb35f8b](https://github.com/mikaelkaron/skills/commit/cb35f8b75491a0b0db599111d62285f218894498))
* **02:** WR-02 remove redundant npm test step, keep only test:coverage in CI ([47a2adf](https://github.com/mikaelkaron/skills/commit/47a2adf2693f038195e077353869c6ae1a80becd))
* **02:** WR-03 fix [skip ci] guard to also check PR title on pull_request events ([bf52a3b](https://github.com/mikaelkaron/skills/commit/bf52a3b2fd30c3b6fec24d723a4edb103eb30dc7))
* **02:** WR-04 pin lcov-reporter-action to commit SHA instead of mutable tag ([fb339aa](https://github.com/mikaelkaron/skills/commit/fb339aa5ea504b534edaf3e992c784be8a4ad868))
* **02:** WR-05 find semantic-release step by run content instead of last index ([8d83a95](https://github.com/mikaelkaron/skills/commit/8d83a95064e3dc30ca3693f341cffffa1523cbee))
* **02:** WR-06 regenerate package-lock.json after version bump in release pipeline ([5a73688](https://github.com/mikaelkaron/skills/commit/5a73688e52cb98b129db5ccf0b76d060a7fda833))
* **260526-w09-01:** remove packages/cli from release config and update tests ([9fbc73b](https://github.com/mikaelkaron/skills/commit/9fbc73bee2c8fa1b95582b05905a41e6e83be6a5))
* **ci:** add time attribute to <testsuites> root element ([cffc0a2](https://github.com/mikaelkaron/skills/commit/cffc0a28d8e18a65eab3b433b0a65c0f7a16281c))
* **ci:** correct YAML indentation in job if expression ([431124d](https://github.com/mikaelkaron/skills/commit/431124d53b6ba2b3c8a0c206878ca3f31124a8b4))
* **ci:** remove job-level if condition that was blocking push triggers ([d055998](https://github.com/mikaelkaron/skills/commit/d05599816e850dbcb8eb150eacadfc99aa573427))
* **ci:** remove redundant skip-ci checks, GitHub handles these natively ([c320f4e](https://github.com/mikaelkaron/skills/commit/c320f4ef06ce76e54e2405dd2006e3b42488e89f))
* **ci:** repair JUnit XML before dorny processes it ([c76d158](https://github.com/mikaelkaron/skills/commit/c76d158a58c72d0dddd358ca6ee25243fa94f6b6))
* **ci:** replace Python heredoc with TS fix-junit script ([2a6be0d](https://github.com/mikaelkaron/skills/commit/2a6be0d74bbd03e938c8a2078113ff60d205df8d))
* **ci:** restore checks:write permission ([8a017f2](https://github.com/mikaelkaron/skills/commit/8a017f28398ba43af2cdf9670113b8013c8a753c))
* **ci:** restore job if condition for draft PR and skip ci gating ([ae19e1b](https://github.com/mikaelkaron/skills/commit/ae19e1bdb94f1917172419b7c3e8b78097ffa115))
* **ci:** simplify job if condition, remove head_commit reference ([930c470](https://github.com/mikaelkaron/skills/commit/930c47087ce2992f150f9e6d55dc73350e8f0749))
* clean up .gitignore by removing duplicate entries and organizing ignored files ([34396af](https://github.com/mikaelkaron/skills/commit/34396afc87d928cb1a318ed7393029327f503a3c))
* **release:** replace regex skip filter with exact Set membership ([66526b7](https://github.com/mikaelkaron/skills/commit/66526b7ca7b9cb097e9708dc3d30e19414f6b86d))
* **types:** add .d.mts declarations for .mjs modules, fix test type errors ([1c3c865](https://github.com/mikaelkaron/skills/commit/1c3c865369165a593583d75b3b5a1278c70f344b))
* **types:** allow JS imports and add @types/js-yaml for test type check ([94b9212](https://github.com/mikaelkaron/skills/commit/94b92125ef821cf0853d8b11703ac375a2d54e10))


### BREAKING CHANGES

* @mikaelkaron/skills-cli is no longer published as a separate npm package. The oclif configuration has been merged into the root @mikaelkaron/skills package.

## [1.0.1](https://github.com/mikaelkaron/skills/compare/v1.0.0...v1.0.1) (2026-05-25)

### Bug Fixes

- add repository field to all package.json files for npm provenance ([808ffe1](https://github.com/mikaelkaron/skills/commit/808ffe1b534b7ee222add5ddcc0ab8b5b3d2c94c))

# 1.0.0 (2026-05-25)

### Bug Fixes

- **01:** IN-01 add unit tests for version validation and workspace dep update logic ([8ce5fdf](https://github.com/mikaelkaron/skills/commit/8ce5fdf73152f84ef6bfb04fef7e8166932694af))
- **01:** IN-01 document peerDependencies/optionalDependencies out of scope ([56b4853](https://github.com/mikaelkaron/skills/commit/56b48531084b9369a7d61266713f9d98608ffa67))
- **01:** IN-01 pass explicit undefined suffix to withId for github plugin ([85e6390](https://github.com/mikaelkaron/skills/commit/85e6390349a3271fcb324eef2ab9ff697f8c8376))
- **01:** IN-02 add test for invalid-regex error path in buildSkipFilter ([c3fe117](https://github.com/mikaelkaron/skills/commit/c3fe117a07bd20b592a4fdef9e4321160781899f))
- **01:** IN-02 use Map to store step IDs out of plugin options objects ([f023746](https://github.com/mikaelkaron/skills/commit/f0237467a02c17b5ecd69531edc048d3764bed18))
- **01:** WR-01 end-anchor version regex to reject trailing garbage ([9d64a52](https://github.com/mikaelkaron/skills/commit/9d64a526f136e5932bcd600466938c34490c1f54))
- **01:** WR-01 extract VERSION_REGEX and applyWorkspaceVersions into shared lib ([44d5d11](https://github.com/mikaelkaron/skills/commit/44d5d110e25ac88f2c277e8de4d42a759bc76808))
- **01:** WR-02 update intra-workspace sibling dep versions in per-workspace loop ([004ffea](https://github.com/mikaelkaron/skills/commit/004ffea0f489a742a7254568860c24073443f299))
- **01:** WR-03 use getter for plugins so SEMREL_SKIP_STEPS is read on demand ([d1038d4](https://github.com/mikaelkaron/skills/commit/d1038d46e35573a9221c1e9f1f6c9f5b30ab1ad2))
- **02:** resolve code review findings (CR-01, WR-02, WR-03, WR-04) ([1d30eda](https://github.com/mikaelkaron/skills/commit/1d30edaeb00f1ed46e479cb90c882b0c5c48ee61))
- **02:** restore build and test steps to ci.yml pipeline (CI-01/D-03) ([dd0741c](https://github.com/mikaelkaron/skills/commit/dd0741c43c49a74647a4eeb9a39fdc33bd709326))
- change trigger from push to workflow_dispatch in publish-tile.yml ([25e254b](https://github.com/mikaelkaron/skills/commit/25e254bb075b7737d736905b841f700a6fafc5dc))
- **cherry-pick-filter:** assert error message instead of stderr in conflict test ([dc05271](https://github.com/mikaelkaron/skills/commit/dc052713dcaf9bbfab6baa68d601f71ae409938e))
- correct formatting of compatibility message in SKILL.md ([5ae1ee0](https://github.com/mikaelkaron/skills/commit/5ae1ee0672a67d4fdf998e5f5878db8987e56a59))
- inherit stderr in execSync so git errors are visible ([700c4ce](https://github.com/mikaelkaron/skills/commit/700c4cedfc1fbc8b4c210c957adbb2aa0146816e))
- inherit stdio in spawnSync so tessl output is visible ([98e2bc0](https://github.com/mikaelkaron/skills/commit/98e2bc0fd4c872ec0f31c0812cecf63de50f6b77))
- make @mikaelkaron/skills the oclif CLI root and expose @mikaelkaron/skills-cli as a core plugin ([0792f06](https://github.com/mikaelkaron/skills/commit/0792f06df8723586e24eb819c0151f786fe33699))
- remove XML tags from tessl skill description ([9fd7b48](https://github.com/mikaelkaron/skills/commit/9fd7b48e791ac83fdc50397cc327fc6792579bf7))
- specify version range for skills-cli dependency ([0e2000a](https://github.com/mikaelkaron/skills/commit/0e2000a925388e90e0a3a2988c076b3eb9b57c8d))
- **tessl:** skip lib tests when tile install exits 0 but tile not fetched ([1fa5904](https://github.com/mikaelkaron/skills/commit/1fa5904ccea1050746e90191d2a88df71399d6dd))
- update actions/checkout version to v4.2.2 in publish-tile.yml ([dedb696](https://github.com/mikaelkaron/skills/commit/dedb69696dc567097ccfc8a6ef1a8482924e62ef))
- update actions/checkout version to v5 in publish-tile.yml ([9902e0b](https://github.com/mikaelkaron/skills/commit/9902e0b5b8708497e25e3a08e4906dee868eb185))
- update bin paths to remove leading './' in package.json ([851b7ad](https://github.com/mikaelkaron/skills/commit/851b7ad534380e2e3e6cffa0d217e70143ffe79f))
- update package versions to 0.1.1 and correct bin paths in package.json files ([b3c78dc](https://github.com/mikaelkaron/skills/commit/b3c78dc947c10cbc9a91ded88c12ff47f20d6b15))
- update publish-tile.yml to use setup-tessl action and adjust publish command ([be3efa2](https://github.com/mikaelkaron/skills/commit/be3efa2e29884859b18e47907b2a6b747065c5dd))
- update version to 0.1.1 in tile.json ([2b1739d](https://github.com/mikaelkaron/skills/commit/2b1739d3a42681c1be7c03fc77f45b100ffad9f6))
- update version to 0.1.3 in tile.json and refine SKILL.md documentation ([8b762cc](https://github.com/mikaelkaron/skills/commit/8b762cc8817038cc3c3566ab4750ed74b952122d))
- update version to 0.1.4 in tile.json ([e6d02fd](https://github.com/mikaelkaron/skills/commit/e6d02fdc7edb79541ad7a4a4752093afd69a4400))
- update version to 0.1.5 in tile.json and add main entry point description in SKILL.md ([2000045](https://github.com/mikaelkaron/skills/commit/20000454f485f13b3a2236ce211656724124153d))
- update version to 0.1.6 in tile.json ([4504cba](https://github.com/mikaelkaron/skills/commit/4504cbaa05fdf859a64babb3cc3f8745ced43bd6))
- use oclif colon notation for plugin subcommands in cli skill ([8a9c976](https://github.com/mikaelkaron/skills/commit/8a9c976d641ae8c85d487f7892e0f94b6ff4bca2))
- use this.error() for consistent error handling in cherry-pick-filter ([3faccd7](https://github.com/mikaelkaron/skills/commit/3faccd7b2d69d6d72134002b55cb00e9eaa05852))

### Features

- **02-01:** author release.yml satisfying GHA-01..GHA-09 ([f65806a](https://github.com/mikaelkaron/skills/commit/f65806a8c13a4dba3c3d4e781a5136a1499672f1))
- **02-02:** author ci.yml and delete test.yml (CI-01..CI-03 GREEN) ([cd9f5a8](https://github.com/mikaelkaron/skills/commit/cd9f5a8e41890bc44baed39157bc0fa9c982e961))
- **1-02:** implement release.config.mjs ([3e0dabb](https://github.com/mikaelkaron/skills/commit/3e0dabb7063ee57eaa4af82522236077af551e88))
- **1-03:** add set-workspace-versions.mjs version bumper ([6219645](https://github.com/mikaelkaron/skills/commit/6219645dccc0c3d7f7bede0f3af88242a06550bf))
- **1-03:** add workspace.mjs arborist loader ([f3eeb27](https://github.com/mikaelkaron/skills/commit/f3eeb27816cb56995a191c9f424f616e09d56359))
- add cherry-pick-filter skill and documentation ([e166b1b](https://github.com/mikaelkaron/skills/commit/e166b1ba6db4974257240e8100db1fbd23657354))
- add cli and tessl skill tiles ([b8a08c7](https://github.com/mikaelkaron/skills/commit/b8a08c76fbae7154d28fa6cddcf17db83cfa4662))
- add extraArgs parameter to install function ([86dcb34](https://github.com/mikaelkaron/skills/commit/86dcb34b16abd19d5ba3e97e1395887d8d42838a))
- add HISTORY-REWRITE.md for one-time history rewrite instructions ([e56579b](https://github.com/mikaelkaron/skills/commit/e56579b5b7c344c5eee077bc48a3e548abbed906))
- add oclif packages for cli, tessl, and cherry-pick-filter ([31a9552](https://github.com/mikaelkaron/skills/commit/31a95528a976aa96e8772be8e9746419cafc96ed))
- add publish workflow and cherry-pick-filter tile configuration ([2b41eb4](https://github.com/mikaelkaron/skills/commit/2b41eb4db5ee6e68abf7858b6158472ec8f3c55b))
- add run.js files for cherry-pick-filter, cli, and tessl packages ([192401b](https://github.com/mikaelkaron/skills/commit/192401b8c6682b9e2bf8196303776327e1d0e15b))
- add tessl uninstall command with --global and --skill flags ([fbd5901](https://github.com/mikaelkaron/skills/commit/fbd5901f8a64ee6d601749de89eab13590989d16))
- add test:coverage script to all packages ([bb8453a](https://github.com/mikaelkaron/skills/commit/bb8453aa59452986a45cf2c119775c80a3934633))
- expand tessl skill with uninstall command, all flags, and colon notation ([49d830b](https://github.com/mikaelkaron/skills/commit/49d830bb4745f8d131fec4e3874840245badf3ea))
- extract tessl install logic into lib/tessl with unit tests ([b0cd6cc](https://github.com/mikaelkaron/skills/commit/b0cd6ccd88399894cb8b92448b3cd7785c510743))
- forward extra args from tessl install command to tessl CLI ([91c172c](https://github.com/mikaelkaron/skills/commit/91c172c063b51c695176bafc793db24d60e0f406))
- implement cherry-pick-filter script and update documentation ([3697619](https://github.com/mikaelkaron/skills/commit/369761912600df047447ad03f46edcc0c81c39f5))
- prefix skill names with mks- namespace ([a9bc02b](https://github.com/mikaelkaron/skills/commit/a9bc02b427d8e1661618f9dc74ce6a58566bd7ec))
- remove --skill flag from install and uninstall commands ([1d5405a](https://github.com/mikaelkaron/skills/commit/1d5405a74daf012be3c1c9078058e2ebf8e97494))
- replace blind arg passthrough with explicit tessl install flags ([7e60dbc](https://github.com/mikaelkaron/skills/commit/7e60dbc2c3a6538334c13af3a115f050fab8bcde))
- support multi-tile selection in publish-tile workflow ([b382ce6](https://github.com/mikaelkaron/skills/commit/b382ce650215b73750aef0bc8f81ec8676d58723))
- support multiple plugins, drop --watch-local from tessl install ([649ee3f](https://github.com/mikaelkaron/skills/commit/649ee3f8dc40aaaa7485da97fecbceeda9a14fed))
- **tessl:** add list command ([919fe8b](https://github.com/mikaelkaron/skills/commit/919fe8b61de1962086a01fb2e68e05d4d2c3cd43))
- **tessl:** bump tile version to 0.4.0 ([258285d](https://github.com/mikaelkaron/skills/commit/258285d48162c2f70811463e0076ef3afca4ac87))
- track installed tile versions in tessl state ([c9a0dd9](https://github.com/mikaelkaron/skills/commit/c9a0dd997ce87f96d25af1b2950577825e367ec8))
