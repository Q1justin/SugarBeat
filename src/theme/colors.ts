// Fresh green palette
export const colors = {
    // Main colors
    primary: '#4CAF50',         // Main green
    primaryLight: '#81C784',    // Light fresh green
    primaryDark: '#388E3C',     // Deeper green
    
    // Backgrounds
    background: '#E8F5E9',      // Very light mint green
    cardBackground: '#F1F8E9',  // Slightly different light green for cards
    modalBackground: '#E8F5E9', // Light mint green for modals
    
    // Accents
    accent: '#4CAF50',          // Brighter green for emphasis
    success: '#66BB6A',         // Light green for success
    error: '#FF5252',          // Keep red for errors (important for visibility)
    warning: '#FFC107',        // Keep amber for warnings (important for visibility)
    
    // Text
    text: {
        primary: '#1B5E20',     // Dark green for primary text
        secondary: '#2E7D32',   // Medium green for secondary text
        disabled: '#A5D6A7',    // Light green for disabled text
        inverse: '#FFFFFF',     // White text for dark backgrounds
    },
    
    // Borders and dividers
    border: '#3A6B3A',          // Slightly lighter than background
    divider: '#2E5B2E',         // Same as cardBackground for subtle division
    
    // Status colors
    progressGood: '#66BB6A',    // Light green for good progress
    progressBad: '#FF5252',     // Keep red for over limit
    
    // Interactive
    ripple: '#4CAF50',          // Visible ripple effect
    hover: '#3A6B3A',          // Slightly lighter than background for hover
} as const;
