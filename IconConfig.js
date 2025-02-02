const libraryNames = [
  'Entypo',
  'EvilIcons',
  'Feather',
  'FontAwesome',
  'Fontisto',
  'Foundation',
  'Ionicons',
  'MaterialIcons',
  'Octicons',
  'SimpleLineIcons',
  'Zocial',
  'MaterialCommunityIcons',
];

const iconJSONUrls = {};
libraryNames.forEach((lib) => {
  iconJSONUrls[lib] = `https://raw.githubusercontent.com/expo/vector-icons/master/src/vendor/react-native-vector-icons/glyphmaps/${lib}.json`;
});

export const libraries = {
  Entypo: require('react-native-vector-icons/Entypo'),
  EvilIcons: require('react-native-vector-icons/EvilIcons'),
  Feather: require('react-native-vector-icons/Feather'),
  FontAwesome: require('react-native-vector-icons/FontAwesome'),
  Fontisto: require('react-native-vector-icons/Fontisto'),
  Foundation: require('react-native-vector-icons/Foundation'),
  Ionicons: require('react-native-vector-icons/Ionicons'),
  MaterialIcons: require('react-native-vector-icons/MaterialIcons'),
  Octicons: require('react-native-vector-icons/Octicons'),
  SimpleLineIcons: require('react-native-vector-icons/SimpleLineIcons'),
  Zocial: require('react-native-vector-icons/Zocial'),
  MaterialCommunityIcons: require('react-native-vector-icons/MaterialCommunityIcons'),
};

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
