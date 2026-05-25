import Arborist from "@npmcli/arborist";

export async function loadWorkspaceTree(cwd = process.cwd()) {
  const arb = new Arborist({ path: cwd });
  return arb.loadActual();
}
