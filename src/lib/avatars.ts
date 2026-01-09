/**
 * Avatar generation utilities
 * Provides default avatars for users based on their email or initials
 */

/**
 * Generate a default avatar URL using UI Avatars service
 * This creates a clean, professional-looking avatar with initials
 */
export function generateDefaultAvatar(email: string, name: string): string {
  // Use email for uniqueness and consistency
  // The API will create initials from the name automatically
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // Using ui-avatars.com API - creates avatars with initials
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=random&color=random&font-size=0.33&length=2`;
}

/**
 * Generate avatar based on initials with custom colors
 * Returns an SVG data URL for an avatar with user initials
 */
export function generateInitialsAvatar(name: string, size: number = 100): string {
  const initials = name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  // Generate a consistent color based on the name
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];

  const colorIndex = name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  // Create SVG avatar
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${bgColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="${size * 0.4}" font-family="Arial, sans-serif" font-weight="bold" fill="white">
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generate multiple avatar options for a user
 * Can be used when users want to choose their avatar style
 */
export function generateAvatarOptions(email: string, name: string) {
  return {
    uiAvatars: generateDefaultAvatar(email, name),
    initialsSVG: generateInitialsAvatar(name),
  };
}

