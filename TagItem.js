import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

const TagItem = ({ item, onEdit, onDelete }) => {
    const renderRightActions = () => (
        <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => onEdit(item.id)} style={[styles.actionButton, styles.editButton]}>
                <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)} style={[styles.actionButton, styles.deleteButton]}>
                <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Swipeable renderRightActions={renderRightActions} overshootFriction={8} overshootLeft={false} overshootRight={false} >
            <View style={styles.itemContainer}>
                <Text style={styles.itemText} numberOfLines={1}>{item.tagName}</Text>
            </View>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
    },
    itemText: {
        fontSize: 16,
        color: '#000',
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
