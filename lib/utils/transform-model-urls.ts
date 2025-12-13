import type { AnyCircuitElement } from "circuit-json"

// List of model URL fields that should be transformed
const MODEL_URL_FIELDS = [
  "model_obj_url",
  "model_stl_url",
  "model_3mf_url",
  "model_gltf_url",
  "model_glb_url",
  "model_step_url",
  "model_wrl_url",
] as const

/**
 * Check if a URL is a local file path that needs to be transformed
 */
function isLocalPath(url: string | undefined): url is string {
  if (!url) return false
  // Already an HTTP URL
  if (url.startsWith("http://") || url.startsWith("https://")) return false
  // Blob URL
  if (url.startsWith("blob:")) return false
  // Data URL
  if (url.startsWith("data:")) return false
  // It's a local path
  return true
}

/**
 * Transform local file paths in model URL fields to HTTP URLs using projectBaseUrl.
 *
 * This function processes circuit JSON elements and converts local file paths
 * (e.g., "models/component.step") to HTTP URLs
 * (e.g., "http://localhost:5173/api/files/static/models/component.step").
 *
 * @param circuitJson - Array of circuit JSON elements
 * @param projectBaseUrl - Base URL to prepend to local paths
 * @returns New array with transformed URLs
 */
export function transformModelUrls(
  circuitJson: AnyCircuitElement[],
  projectBaseUrl: string | undefined,
): AnyCircuitElement[] {
  if (!projectBaseUrl) {
    return circuitJson
  }

  return circuitJson.map((element) => {
    if (element.type !== "cad_component") {
      return element
    }

    let hasChanges = false
    const cadComponent = element as Record<string, any>
    const updatedFields: Record<string, string> = {}

    for (const field of MODEL_URL_FIELDS) {
      const url = cadComponent[field]
      if (isLocalPath(url)) {
        hasChanges = true
        // Remove leading "./" if present
        const cleanPath = url.startsWith("./") ? url.slice(2) : url
        updatedFields[field] = `${projectBaseUrl}/${cleanPath}`
      }
    }

    if (!hasChanges) {
      return element
    }

    return {
      ...element,
      ...updatedFields,
    }
  })
}
