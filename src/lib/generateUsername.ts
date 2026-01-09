/**
 * Generate unique display names and usernames from predefined names with numbers
 * Both displayName and username will be assigned the same value initially
 * but users can change them independently later
 */

// Predefined base names for users
const BASE_NAMES = [
  "Alpha",
  "Beta",
  "Gamma",
  "Delta",
  "Epsilon",
  "Zeta",
  "Eta",
  "Theta",
  "Iota",
  "Kappa",
  "Lambda",
  "Mu",
  "Nu",
  "Xi",
  "Omicron",
  "Pi",
  "Rho",
  "Sigma",
  "Tau",
  "Upsilon",
  "Phi",
  "Chi",
  "Psi",
  "Omega",
  "Orion",
  "Nova",
  "Pulsar",
  "Quasar",
  "Nebula",
  "Galaxy",
  "Cosmos",
  "Phoenix",
  "Dragon",
  "Falcon",
  "Hawk",
  "Eagle",
  "Wolf",
  "Bear",
  "Titan",
  "Atlas",
  "Hercules",
  "Apollo",
  "Zeus",
  "Athena",
  "Artemis",
  "Vanguard",
  "Pioneer",
  "Pathfinder",
  "Explorer",
  "Navigator",
  "Pilot",
  "Summit",
  "Apex",
  "Zenith",
  "Prime",
  "Elite",
  "Pro",
  "Master",
  "Legend",
  "Champion",
  "Victor",
  "Triumph",
  "Glory",
  "Honor",
  "Pride",
  "Spirit",
  "Blaze",
  "Storm",
  "Thunder",
  "Lightning",
  "Flash",
  "Spark",
  "Flame",
  "Sage",
  "Wise",
  "Scholar",
  "Expert",
  "Genius",
  "Brain",
  "Mind",
  "Quest",
  "Journey",
  "Adventure",
  "Odyssey",
  "Expedition",
  "Mission",
  "Insight",
  "Vision",
  "Focus",
  "Clarity",
  "Wisdom",
  "Knowledge",
  "Trendsetter",
  "Innovator",
  "Creator",
  "Builder",
  "Maker",
  "Founder",
  "Leader",
  "Captain",
  "Commander",
  "Chief",
  "Director",
  "Manager",
];

/**
 * Generate a random base name from the list
 */
function getRandomBaseName(): string {
  const randomIndex = Math.floor(Math.random() * BASE_NAMES.length);
  return BASE_NAMES[randomIndex];
}

/**
 * Generate a random number suffix (1-9999)
 */
function getRandomSuffix(): number {
  return Math.floor(Math.random() * 9999) + 1;
}

/**
 * Generate a unique display name with a random number suffix
 * Format: {BaseName}{RandomNumber} (e.g., "Alpha1234", "Phoenix5678")
 */
function generateDisplayName(): string {
  const baseName = getRandomBaseName();
  const suffix = getRandomSuffix();
  return `${baseName}${suffix}`;
}

/**
 * Generate a unique display name and username pair
 * Both fields will have the same value initially
 *
 * @returns { displayName: string, username: string } Both with the same unique value
 */
export function generateUniqueNames(): {
  displayName: string;
  username: string;
} {
  const uniqueName = generateDisplayName();
  return {
    displayName: uniqueName,
    username: uniqueName,
  };
}

/**
 * Generate a display name and username based on the user's name
 * Uses the first word of the name, or falls back to random generation
 *
 * @param fullName - User's full name (e.g., "John Doe")
 * @returns { displayName: string, username: string } Both with the same unique value
 */
export function generateNamesFromFirstName(fullName?: string): {
  displayName: string;
  username: string;
} {
  if (fullName && fullName.trim().length >= 2) {
    // Extract the first name (first word) from the full name
    const firstName = fullName.trim().split(/\s+/)[0];
    const sanitizedFirstName = firstName.replace(/[^a-zA-Z0-9]/g, "");

    if (sanitizedFirstName.length >= 2) {
      const suffix = getRandomSuffix();
      const uniqueName = `${sanitizedFirstName}${suffix}`;
      return {
        displayName: uniqueName,
        username: uniqueName,
      };
    }
  }

  return generateUniqueNames();
}
