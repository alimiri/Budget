const libraryNames = [
  'Entypo',
  'EvilIcons',
  'Feather',
  'FontAwesome',
  'FontAwesome5',
  'FontAwesome5Brands',
  'FontAwesome6',
  'FontAwesome6Brands',
  'Fontisto',
  'Foundation',
  'Ionicons',
  'MaterialCommunityIcons',
  'MaterialIcons',
  'Octicons',
  'SimpleLineIcons',
  'Zocial',
];

// Base GitHub URL for JSON files
const githubBaseUrl = 'https://raw.githubusercontent.com/oblador/react-native-vector-icons/master/glyphmaps';

// Dynamically construct URLs for JSON files
const iconJSONUrls = {};
libraryNames.forEach((name) => {
  iconJSONUrls[name] = `${githubBaseUrl}/${name}.json`;
});

// Dynamically import libraries
export const libraries = {};
libraryNames.forEach((name) => {
  try {
    libraries[name] = require(`react-native-vector-icons/${name}`);
  } catch (error) {
    console.warn(`Failed to load library: ${name}`, error);
  }
});

// Function to fetch JSON data
const fetchIconJSON = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON from ${url}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching icon JSON:', error);
    return null;
  }
};

// Populate `iconData` dynamically
export const iconData = {};

export const initializeIconData = async () => {
  for (const [library, url] of Object.entries(iconJSONUrls)) {
    const jsonData = await fetchIconJSON(url);
    if (jsonData) {
      iconData[library] = Object.keys(jsonData);
    } else {
      console.warn(`Could not fetch data for ${library}.`);
    }
  }
};

// Call the initialization function
initializeIconData();
