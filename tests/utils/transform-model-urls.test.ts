import { expect, test, describe } from "bun:test"
import { transformModelUrls } from "lib/utils/transform-model-urls"
import type { AnyCircuitElement } from "circuit-json"

describe("transformModelUrls", () => {
  test("should transform local paths to HTTP URLs for model_step_url", () => {
    const circuitJson: AnyCircuitElement[] = [
      {
        type: "cad_component",
        cad_component_id: "cad_1",
        pcb_component_id: "pcb_1",
        source_component_id: "source_1",
        position: { x: 0, y: 0, z: 0 },
        model_step_url: "models/component.step",
      } as AnyCircuitElement,
    ]

    const result = transformModelUrls(
      circuitJson,
      "http://localhost:5173/api/files/static",
    )

    expect(result[0]).toMatchObject({
      type: "cad_component",
      model_step_url:
        "http://localhost:5173/api/files/static/models/component.step",
    })
  })

  test("should transform local paths for all model URL fields", () => {
    const circuitJson: AnyCircuitElement[] = [
      {
        type: "cad_component",
        cad_component_id: "cad_1",
        pcb_component_id: "pcb_1",
        source_component_id: "source_1",
        position: { x: 0, y: 0, z: 0 },
        model_step_url: "models/component.step",
        model_obj_url: "models/component.obj",
        model_gltf_url: "models/component.gltf",
        model_glb_url: "models/component.glb",
        model_stl_url: "models/component.stl",
        model_3mf_url: "models/component.3mf",
        model_wrl_url: "models/component.wrl",
      } as AnyCircuitElement,
    ]

    const result = transformModelUrls(circuitJson, "https://example.com/assets")

    expect(result[0]).toMatchObject({
      type: "cad_component",
      model_step_url: "https://example.com/assets/models/component.step",
      model_obj_url: "https://example.com/assets/models/component.obj",
      model_gltf_url: "https://example.com/assets/models/component.gltf",
      model_glb_url: "https://example.com/assets/models/component.glb",
      model_stl_url: "https://example.com/assets/models/component.stl",
      model_3mf_url: "https://example.com/assets/models/component.3mf",
      model_wrl_url: "https://example.com/assets/models/component.wrl",
    })
  })

  test("should handle paths starting with ./", () => {
    const circuitJson: AnyCircuitElement[] = [
      {
        type: "cad_component",
        cad_component_id: "cad_1",
        pcb_component_id: "pcb_1",
        source_component_id: "source_1",
        position: { x: 0, y: 0, z: 0 },
        model_step_url: "./models/component.step",
      } as AnyCircuitElement,
    ]

    const result = transformModelUrls(circuitJson, "https://example.com/assets")

    expect(result[0]).toMatchObject({
      type: "cad_component",
      model_step_url: "https://example.com/assets/models/component.step",
    })
  })

  test("should not transform URLs that are already HTTP/HTTPS", () => {
    const circuitJson: AnyCircuitElement[] = [
      {
        type: "cad_component",
        cad_component_id: "cad_1",
        pcb_component_id: "pcb_1",
        source_component_id: "source_1",
        position: { x: 0, y: 0, z: 0 },
        model_step_url: "https://cdn.example.com/models/component.step",
        model_glb_url: "http://localhost:3000/models/component.glb",
      } as AnyCircuitElement,
    ]

    const result = transformModelUrls(circuitJson, "https://example.com/assets")

    expect(result[0]).toMatchObject({
      type: "cad_component",
      model_step_url: "https://cdn.example.com/models/component.step",
      model_glb_url: "http://localhost:3000/models/component.glb",
    })
  })

  test("should not transform blob URLs", () => {
    const circuitJson: AnyCircuitElement[] = [
      {
        type: "cad_component",
        cad_component_id: "cad_1",
        pcb_component_id: "pcb_1",
        source_component_id: "source_1",
        position: { x: 0, y: 0, z: 0 },
        model_step_url: "blob:http://localhost:3000/abc123",
      } as AnyCircuitElement,
    ]

    const result = transformModelUrls(circuitJson, "https://example.com/assets")

    expect(result[0]).toMatchObject({
      type: "cad_component",
      model_step_url: "blob:http://localhost:3000/abc123",
    })
  })

  test("should not transform data URLs", () => {
    const circuitJson: AnyCircuitElement[] = [
      {
        type: "cad_component",
        cad_component_id: "cad_1",
        pcb_component_id: "pcb_1",
        source_component_id: "source_1",
        position: { x: 0, y: 0, z: 0 },
        model_glb_url: "data:application/octet-stream;base64,abc123",
      } as AnyCircuitElement,
    ]

    const result = transformModelUrls(circuitJson, "https://example.com/assets")

    expect(result[0]).toMatchObject({
      type: "cad_component",
      model_glb_url: "data:application/octet-stream;base64,abc123",
    })
  })

  test("should return original circuitJson if projectBaseUrl is undefined", () => {
    const circuitJson: AnyCircuitElement[] = [
      {
        type: "cad_component",
        cad_component_id: "cad_1",
        pcb_component_id: "pcb_1",
        source_component_id: "source_1",
        position: { x: 0, y: 0, z: 0 },
        model_step_url: "models/component.step",
      } as AnyCircuitElement,
    ]

    const result = transformModelUrls(circuitJson, undefined)

    expect(result).toBe(circuitJson)
  })

  test("should not modify non-cad_component elements", () => {
    const circuitJson: AnyCircuitElement[] = [
      {
        type: "source_component",
        source_component_id: "source_1",
        name: "R1",
        ftype: "simple_resistor",
      } as AnyCircuitElement,
      {
        type: "pcb_component",
        pcb_component_id: "pcb_1",
        source_component_id: "source_1",
        center: { x: 0, y: 0 },
        layer: "top",
        rotation: 0,
        width: 1,
        height: 1,
      } as AnyCircuitElement,
    ]

    const result = transformModelUrls(circuitJson, "https://example.com/assets")

    expect(result).toEqual(circuitJson)
  })

  test("should handle mixed elements with some having local paths", () => {
    const circuitJson: AnyCircuitElement[] = [
      {
        type: "source_component",
        source_component_id: "source_1",
        name: "R1",
        ftype: "simple_resistor",
      } as AnyCircuitElement,
      {
        type: "cad_component",
        cad_component_id: "cad_1",
        pcb_component_id: "pcb_1",
        source_component_id: "source_1",
        position: { x: 0, y: 0, z: 0 },
        model_step_url: "models/component.step",
      } as AnyCircuitElement,
      {
        type: "cad_component",
        cad_component_id: "cad_2",
        pcb_component_id: "pcb_2",
        source_component_id: "source_2",
        position: { x: 10, y: 0, z: 0 },
        model_glb_url: "https://cdn.example.com/models/other.glb",
      } as AnyCircuitElement,
    ]

    const result = transformModelUrls(circuitJson, "https://example.com/assets")

    expect(result[0]).toMatchObject({
      type: "source_component",
    })
    expect(result[1]).toMatchObject({
      type: "cad_component",
      model_step_url: "https://example.com/assets/models/component.step",
    })
    expect(result[2]).toMatchObject({
      type: "cad_component",
      model_glb_url: "https://cdn.example.com/models/other.glb",
    })
  })
})
