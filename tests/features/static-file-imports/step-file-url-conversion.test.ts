import { expect, test } from "bun:test"
import { createCircuitWebWorker } from "lib"
import { repoFileUrl } from "tests/fixtures/resourcePaths"

test("should convert .step file path to HTTP URL when projectBaseUrl is configured", async () => {
  const circuitWebWorker = createCircuitWebWorker({
    webWorkerUrl: repoFileUrl("dist/webworker/entrypoint.js").href,
    platform: {
      projectBaseUrl: "https://example.com/assets",
    },
  })

  const worker = await circuitWebWorker

  await worker.executeWithFsMap({
    fsMap: {
      "index.tsx": `
import stepUrl from "./model.step";

if (typeof stepUrl !== "string") {
  throw new Error("Expected stepUrl to be a string, got: " + typeof stepUrl);
}

if (stepUrl !== "https://example.com/assets/model.step") {
  throw new Error("Unexpected STEP URL: " + stepUrl);
}

export default () => {
  return (
    <board width="10mm" height="10mm">
      <chip name="U1" footprint="soic8" />
    </board>
  );
};
      `,
      "model.step": "__STATIC_ASSET__",
    },
    mainComponentPath: "index.tsx",
  })

  await worker.renderUntilSettled()

  const circuitJson = await worker.getCircuitJson()
  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)

  await worker.kill()
})

test("should convert .stp file path to HTTP URL when projectBaseUrl is configured", async () => {
  const circuitWebWorker = createCircuitWebWorker({
    webWorkerUrl: repoFileUrl("dist/webworker/entrypoint.js").href,
    platform: {
      projectBaseUrl: "https://example.com/assets",
    },
  })

  const worker = await circuitWebWorker

  await worker.executeWithFsMap({
    fsMap: {
      "index.tsx": `
import stpUrl from "./model.stp";

if (typeof stpUrl !== "string") {
  throw new Error("Expected stpUrl to be a string, got: " + typeof stpUrl);
}

if (stpUrl !== "https://example.com/assets/model.stp") {
  throw new Error("Unexpected STP URL: " + stpUrl);
}

export default () => {
  return (
    <board width="10mm" height="10mm">
      <chip name="U1" footprint="soic8" />
    </board>
  );
};
      `,
      "model.stp": "__STATIC_ASSET__",
    },
    mainComponentPath: "index.tsx",
  })

  await worker.renderUntilSettled()

  const circuitJson = await worker.getCircuitJson()
  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)

  await worker.kill()
})

test("should convert nested .step file path to correct HTTP URL", async () => {
  const circuitWebWorker = createCircuitWebWorker({
    webWorkerUrl: repoFileUrl("dist/webworker/entrypoint.js").href,
    platform: {
      projectBaseUrl: "https://example.com/assets",
    },
  })

  const worker = await circuitWebWorker

  await worker.executeWithFsMap({
    fsMap: {
      "index.tsx": `
import stepUrl from "./models/enclosure.step";

if (stepUrl !== "https://example.com/assets/models/enclosure.step") {
  throw new Error("Unexpected nested STEP URL: " + stepUrl);
}

export default () => {
  return (
    <board width="10mm" height="10mm">
      <chip name="U1" footprint="soic8" />
    </board>
  );
};
      `,
      "models/enclosure.step": "__STATIC_ASSET__",
    },
    mainComponentPath: "index.tsx",
  })

  await worker.renderUntilSettled()

  const circuitJson = await worker.getCircuitJson()
  expect(circuitJson).toBeDefined()
  expect(circuitJson.length).toBeGreaterThan(0)

  await worker.kill()
})
