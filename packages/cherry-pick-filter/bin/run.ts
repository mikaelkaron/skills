#!/usr/bin/env -S node --experimental-strip-types

import { execute } from "@oclif/core";
await execute({ dir: import.meta.url });
