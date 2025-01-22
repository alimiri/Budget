const libraryNames = [
  {name:'Entypo', folder: 'entypo', file: 'Entypo.json'},
  {name: 'EvilIcons', folder: 'evil-icons', file: 'EvilIcons.json'},
  {name: 'Feather', folder: 'feather', file: 'Feather.json'},
  {name: 'FontAwesome', folder: 'fontawesome', file: 'FontAwesome.json'},
  {name: 'FontAwesome5', folder: 'fontawesome5', file: 'FontAwesome5.json'},
  {name: 'FontAwesome6', folder: 'fontawesome6', file: 'FontAwesome6.json'},
  {name: 'Fontisto', folder: 'fontisto', file: 'Fontisto.json'},
  {name: 'Foundation', folder: 'foundation', file: 'Foundation.json'},
  {name: 'Ionicons', folder: 'ionicons', file: 'Ionicons.json'},
  {name: 'MaterialIcons', folder: 'material-icons', file: 'MaterialIcons.json'},
  {name: 'Octicons', folder: 'octicons', file: 'Octicons.json'},
  {name: 'SimpleLineIcons', folder: 'simple-line-icons', file: 'SimpleLineIcons.json'},
  {name: 'Zocial', folder: 'zocial', file: 'Zocial.json'},
];

// Dynamically construct URLs for JSON files
const iconJSONUrls = {};
libraryNames.forEach((lib) => {
  iconJSONUrls[lib.name] = `https://raw.githubusercontent.com/oblador/react-native-vector-icons/refs/heads/master/packages/${lib.folder}/glyphmaps/${lib.file}`;
});

export const libraries = {
  Entypo: require('react-native-vector-icons/Entypo'),
  EvilIcons: require('react-native-vector-icons/EvilIcons'),
  Feather: require('react-native-vector-icons/Feather'),
  FontAwesome: require('react-native-vector-icons/FontAwesome'),
  FontAwesome5: require('react-native-vector-icons/FontAwesome5'),
  FontAwesome6: require('react-native-vector-icons/FontAwesome6'),
  Fontisto: require('react-native-vector-icons/Fontisto'),
  Foundation: require('react-native-vector-icons/Foundation'),
  Ionicons: require('react-native-vector-icons/Ionicons'),
  MaterialIcons: require('react-native-vector-icons/MaterialIcons'),
  Octicons: require('react-native-vector-icons/Octicons'),
  SimpleLineIcons: require('react-native-vector-icons/SimpleLineIcons'),
  Zocial: require('react-native-vector-icons/Zocial'),
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
