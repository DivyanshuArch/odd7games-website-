// ODD7GAMES - Games Catalog Configuration Data
// Edit this file to add, modify, or remove games from the directory page.

const GAMES_DATA = [
  {
    id: "hope",
    title: "Project - HOPE",
    subtitle: "RPG",
    category: "rpg", // 'action', 'rpg', 'retro', etc. (lowercase, used for filtering)
    accentClass: "accent-red", // Styling accents: 'accent-red', 'accent-cyan', 'accent-green', 'accent-purple', 'accent-yellow', 'accent-orange'
    icon: "⚡",
    description: "A battle fought for loyalty and faith ends in betrayal, proving that the deadliest blade comes from the hand you trusted most.",
    stats: [
      { label: "TO BE RELEASED", value: "v0.2" }
    ],
    buttonText: "DEMO",
    buttonLink: "https://drive.google.com/uc?export=download&id=1_VVm4sgP0P48bBqu8ocwYU0Q-nk7p0X-", // Add actual URL or path here

    // Platform download links (Windows, Linux, Mac/Max)
    // Add Google Drive file links (or direct download URLs) below.
    // If a link is provided, its OS logo will appear in the game card.
    // Clicking the logo will trigger direct download of the file.
    platforms: {
      win: "https://drive.google.com/uc?export=download&id=1_VVm4sgP0P48bBqu8ocwYU0Q-nk7p0X-",   // Windows download URL (e.g. Google Drive link)
      linux: "", // Linux download URL
      max: ""    // Mac / Max download URL (or 'mac')
    },

    featuredOnHome: true,
    featuredLabel: "TO BE RELEASED",
    featuredStat: [
      { label: "TO BE RELEASED", value: "v0.2" },
      { label: "EARLY PROTOTYPE", value: "NEW!" }
    ],
    images: ["assets/screenshots/image2.png",
      "assets/screenshots/image.png",
      "assets/screenshots/image1.png",
      "assets/screenshots/image2.png",
      "assets/screenshots/image3.png",
      "assets/screenshots/image4.png"]
  },

];
