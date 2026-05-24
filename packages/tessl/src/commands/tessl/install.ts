import { Args, Command, Flags } from "@oclif/core";
import { install } from "../../lib/tessl.js";

type PluginPjson = {
  tessl?: { tile?: string; version?: string };
  oclif?: { id?: string };
};

export default class TesslInstall extends Command {
  static override summary =
    "Install the tessl skill tile for an installed plugin.";

  static override examples = [
    {
      description: "Install the skill tile for the cherry-pick-filter plugin",
      command: "<%= config.bin %> <%= command.id %> cherry-pick-filter",
    },
  ];

  static override args = {
    plugin: Args.string({
      description: "Installed plugin name whose tile should be installed",
      required: true,
    }),
  };

  static override flags = {
    global: Flags.boolean({
      char: "g",
      description: "Install tiles globally to ~/.tessl/ instead of the current project",
    }),
    skill: Flags.string({
      multiple: true,
      description: "Select specific skills to install from GitHub repositories",
    }),
    yes: Flags.boolean({
      description: "Skip confirmation prompts and auto-select all skills",
    }),
    verbose: Flags.boolean({
      char: "v",
      description: "Show detailed warning messages during installation",
    }),
    "watch-local": Flags.boolean({
      description: "Watch local file-source tiles and reinstall on changes",
    }),
    "accept-warnings": Flags.boolean({
      description: "Pre-accept install policy warnings (no interactive prompt)",
    }),
    agent: Flags.string({
      multiple: true,
      description: "Override agents to install for",
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TesslInstall);

    const plugin = [...this.config.plugins.values()].find(
      (p) => (p.pjson as PluginPjson).oclif?.id === args.plugin,
    );

    if (!plugin) {
      this.error(`Plugin '${args.plugin}' is not installed.`, { exit: 1 });
    }

    const tesslPjson = (plugin.pjson as PluginPjson).tessl;
    if (!tesslPjson?.tile) {
      this.error(
        `Plugin '${args.plugin}' does not declare a tessl tile in package.json.`,
        { exit: 1 },
      );
    }

    const tileRef = tesslPjson.version
      ? `${tesslPjson.tile}@${tesslPjson.version}`
      : tesslPjson.tile;

    const extraArgs: string[] = [];
    if (flags.global) extraArgs.push("--global");
    for (const skill of flags.skill ?? []) extraArgs.push("--skill", skill);
    if (flags.yes) extraArgs.push("--yes");
    if (flags.verbose) extraArgs.push("--verbose");
    if (flags["watch-local"]) extraArgs.push("--watch-local");
    if (flags["accept-warnings"]) extraArgs.push("--accept-warnings");
    for (const agent of flags.agent ?? []) extraArgs.push("--agent", agent);

    try {
      install(tileRef, undefined, extraArgs);
    } catch (err: unknown) {
      this.error((err as Error).message, { exit: 1 });
    }
  }
}
