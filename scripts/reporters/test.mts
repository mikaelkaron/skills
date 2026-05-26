import type { TestEvent } from "node:test/reporters";

export default async function* (source: AsyncIterable<TestEvent>) {
  for await (const event of source) {
    switch (event.type) {
      case "test:pass":
      case "test:fail":
      case "test:diagnostic":
        yield JSON.stringify(event) + "\n";
    }
  }
}
