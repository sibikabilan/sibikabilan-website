/**
 * Atmospheres are the site's lighting presets. Each one drives the CSS
 * tokens (via [data-atmosphere] in globals.css) and the WebGL light colors.
 * All of them are deliberately desaturated: the light should flatter the
 * photography, never compete with it.
 */
export const ATMOSPHERES = {
  noir: {
    label: "Noir",
    note: "Ivory light, steel shadow",
    key: "#efe9df",
    rim: "#8496ad",
    beam: "#dfe5ee",
    bg: "#09090b",
  },
  dusk: {
    label: "Dusk",
    note: "Sand and slate",
    key: "#e2c7a6",
    rim: "#6f8099",
    beam: "#ecd6bc",
    bg: "#0b0a0b",
  },
  tide: {
    label: "Tide",
    note: "Sea glass and indigo",
    key: "#a7d6cd",
    rim: "#7e88c4",
    beam: "#b6e0d8",
    bg: "#070a0b",
  },
  velvet: {
    label: "Velvet",
    note: "Dusty rose, plum shade",
    key: "#e0b6bf",
    rim: "#8b7cb0",
    beam: "#ecc8cf",
    bg: "#0b090b",
  },
} as const;

export type AtmosphereId = keyof typeof ATMOSPHERES;

export const ATMOSPHERE_IDS = Object.keys(ATMOSPHERES) as AtmosphereId[];

export function isAtmosphere(value: unknown): value is AtmosphereId {
  return typeof value === "string" && value in ATMOSPHERES;
}
