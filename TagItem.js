import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TagItem = ({ item, onEdit, onDelete, isEditing, onCancelDelete }) => {
    const swipeableRef = useRef(null); // Create a ref for the Swipeable component

    // Close the swipeable view when `isEditing` becomes true
    useEffect(() => {
        if (!isEditing && swipeableRef.current) {
            swipeableRef.current.close();
        }
    }, [isEditing]);

    const handleCancelDelete = () => {
        if (swipeableRef.current) {
            swipeableRef.current.close(); // Close the swipeable view
        }
        if (onCancelDelete) {
            onCancelDelete(); // Notify the parent component
        }
    };

    const renderRightActions = () => (
        <View style={styles.actionsContainer}>
            <TouchableOpacity
                onPress={() => onEdit(item.id)}
                style={[styles.actionButton, styles.editButton]}
            >
                <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => onDelete(item.id, handleCancelDelete)} // Pass cancel handler
                style={[styles.actionButton, styles.deleteButton]}
            >
                <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Swipeable
            ref={swipeableRef} // Attach the ref to the Swipeable component
            renderRightActions={renderRightActions}
            overshootFriction={8}
            overshootLeft={false}
            overshootRight={false}
        >
            <View style={styles.itemContainer}>
                <Ionicons
                    name={item.icon || 'pricetag'}
                    size={24}
                    color="#555"
                    style={styles.iconBox}
                />
                <Text style={styles.itemText} numberOfLines={1}>
                    {item.tagName}
                </Text>
            </View>
        </Swipeable>
    );
};


const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row', // Align items in a row
        alignItems: 'center', // Center items vertically
        backgroundColor: '#fff',
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    itemText: {
        fontSize: 16,
        color: '#000',
        marginLeft: 10, // Add spacing between the icon and text
        flex: 1, // Allow text to take up remaining space
    },
    iconBox: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10, // Add some spacing to the right of the icon
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 75,
        height: '100%',
    },
    editButton: {
        backgroundColor: '#4CAF50',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});


export default TagItem;
