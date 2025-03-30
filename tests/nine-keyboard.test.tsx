import { runTscircuitCode } from "lib/runner"
import { test, expect } from "bun:test"

test(
  "nine-key-keyboard component test",
  async () => {
    const circuitJson = await runTscircuitCode(
      {
        "user-code.tsx": `
        import NineKeyKeyboard from "@tsci/seveibar.nine-key-keyboard"
export default () => <NineKeyKeyboard />
      `,
      },
      {
        mainComponentPath: "user-code",
      },
    )

    // Validate that the NineKeyKeyboard component is present in the circuit JSON
    const keyboard = circuitJson.find((element) => element.type === "pcb_via")

    expect(keyboard).toBeDefined()
  },
  { timeout: 10000 },
)
