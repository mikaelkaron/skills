import { Args, Command, Flags } from "@oclif/core";
import { uninstall } from "../../lib/tessl.js";

type PluginPjson = {
  tessl?: { tile?: string; version?: string };
  oclif?: { id?: string };
};

export default class TesslUninstall extends Command {
  static override summary =
    "Uninstall tessl skill tiles for one or more installed plugins.";

  static override examples = [
    {
      description: "Uninstall the skill tile for the cherry-pick-filter plugin",
      command: "<%= config.bin %> <%= command.id %> cherry-pick-filter",
    },
  ];

  static override strict = false;

  static override args = {
    plugin: Args.string({
      description: "Installed plugin name(s) whose tile should be uninstalled",
      required: true,
    }),
  };

  static override flags = {
    global: Flags.boolean({
      char: "g",
      description:
        "Uninstall tiles from global ~/.tessl/ instead of the current project",
    }),
  };

  async run(): Promise<void> {
    const { flags, argv } = await this.parse(TesslUninstall);
    const pluginNames = argv as string[];

    const extraArgs: string[] = [];
    if (flags.global) extraArgs.push("--global");

    for (const pluginName of pluginNames) {
      const plugin = [...this.config.plugins.values()].find(
        (p) => (p.pjson as PluginPjson).oclif?.id === pluginName,
      );

      if (!plugin) {
        this.error(`Plugin '${pluginName}' is not installed.`, { exit: 1 });
      }

      const tesslPjson = (plugin.pjson as PluginPjson).tessl;
      if (!tesslPjson?.tile) {
        this.error(
          `Plugin '${pluginName}' does not declare a tessl tile in package.json.`,
          { exit: 1 },
        );
      }

      const tileRef = tesslPjson.version
        ? `${tesslPjson.tile}@${tesslPjson.version}`
        : tesslPjson.tile;

      try {
        uninstall(tileRef, undefined, extraArgs);
      } catch (err: unknown) {
        this.error((err as Error).message, { exit: 1 });
      }
    }
  }
}
