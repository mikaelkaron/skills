import { Args, Command } from "@oclif/core";
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

  async run(): Promise<void> {
    const { args } = await this.parse(TesslInstall);

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

    try {
      install(tileRef);
    } catch (err: unknown) {
      this.error((err as Error).message, { exit: 1 });
    }
  }
}
