// ODD7GAMES - Games Catalog Configuration Data
// Edit this file to add, modify, or remove games from the directory page.

const GAMES_DATA = [
  {
    id: "hope",
    title: "HOPE",
    subtitle: "RPG",
    category: "action", // 'action', 'rpg', 'retro', etc. (lowercase, used for filtering)
    accentClass: "accent-red", // Styling accents: 'accent-red', 'accent-cyan', 'accent-green', 'accent-purple', 'accent-yellow'
    icon: "⚡",
    description: "Dodge grid lasers, dash through firewall barriers, and race against an AI collapse in this hard-as-nails speedrunner.",
    quote: "Dodge, die, optimize, repeat.",
    stats: [
      { label: "DEVELOPMENT", value: "RELEASED v1.0" },
      { label: "STEAM REVIEWS", value: "96% POSITIVE" }
    ],
    buttonText: "PLAY ON STEAM",
    buttonLink: "#", // Add actual URL or path here
    featuredOnHome: true,
    featuredLabel: "OUT NOW",
    featuredStat: { label: "STEAM PLATFORM", value: "96% OVERWHELMINGLY POSITIVE" },
    images: ["assets/HOPE_1.png", "assets/HOPE_2.png"]
  },

];
