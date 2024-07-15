import { createSystem } from "frog/ui";

export const { Box, vars } = createSystem({
  colors: {
    white: "white",
    black: "rgb(0,2,18)",
    purple: 'rgb(117,89,236)',
  },
  fonts: {
    default: [
      {
        name: "Inter",
        source: "google",
        weight: 600,
      },
    ],
  },
});