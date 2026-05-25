import { Args, Command, Flags } from "@oclif/core";
import { list } from "../../lib/tessl.js";

type PluginPjson = {
  tessl?: { tile?: string };
  oclif?: { id?: string };
};

export default class TesslList extends Command {
  static override summary =
    "List installed tessl skill tiles for one or more installed plugins.";

  static override examples = [
    {
      description: "List skill tiles for all installed plugins",
      command: "<%= config.bin %> <%= command.id %>",
    },
    {
      description: "List the skill tile for the cherry-pick-filter plugin",
      command: "<%= config.bin %> <%= command.id %> cherry-pick-filter",
    },
  ];

  static override strict = false;

  static override args = {
    plugin: Args.string({
      description: "Installed plugin name(s) to validate before listing",
      required: false,
    }),
  };

  static override flags = {
    global: Flags.boolean({
      char: "g",
      description:
        "List tiles from global ~/.tessl/ instead of the current project",
    }),
  };

  async run(): Promise<void> {
    const { flags, argv } = await this.parse(TesslList);

    const extraArgs: string[] = [];
    if (flags.global) extraArgs.push("--global");

    const pluginNames = argv as string[];

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
    }

    try {
      list(undefined, extraArgs);
    } catch (err: unknown) {
      this.error((err as Error).message, { exit: 1 });
    }
  }
}
