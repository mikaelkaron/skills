import { Args, Command } from "@oclif/core";
import { spawnSync } from "node:child_process";

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

    const tessCmd = process.env["TESSL_CMD"] ?? "tessl";
    const result = spawnSync(tessCmd, ["tile", "install", tileRef], {
      stdio: "inherit",
    });

    if (result.error) {
      this.error(
        result.error.message.includes("ENOENT")
          ? "tessl CLI not found. Install it from https://tessl.io"
          : result.error.message,
        { exit: 1 },
      );
    }

    if (result.status !== 0) {
      this.exit(result.status ?? 1);
    }
  }
}
