import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import IconDisplay from '../icons/IconDisplay';
import { WEEKDAYS } from '../constants/weekdays';

const TagItem = ({ item, onEdit, onDelete, isEditing, onCancelDelete, selectable, isSelected, onSelect }) => {
    const swipeableRef = useRef(null);

    useEffect(() => {
        if (!isEditing && swipeableRef.current) {
            swipeableRef.current.close();
        }
    }, [isEditing]);

    const handleCancelDelete = () => {
        if (swipeableRef.current) swipeableRef.current.close();
        if (onCancelDelete) onCancelDelete();
    };

    const handleSelect = () => {
        if (onSelect) onSelect(item.id);
        if (swipeableRef.current) swipeableRef.current.close();
    };

    const renderRightActions = () => (
        <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => onEdit(item.id, handleCancelDelete)} style={[styles.actionButton, styles.editButton]}>
                <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id, handleCancelDelete)} style={[styles.actionButton, styles.deleteButton]}>
                <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    const renderLeftActions = () => (
        selectable ? (
            <TouchableOpacity onPress={handleSelect} style={[styles.selectButton, isSelected && styles.selected]}>
                <Text style={styles.selectText}>{isSelected ? 'Deselect' : 'Select'}</Text>
            </TouchableOpacity>
        ) : null
    );

    const getCreditText = () => {
            if (!item.creditType || item.creditType === 'None') return null;

            let creditInfo = `Credit: ${item.creditAmount || 0}`;

            switch (item.creditType) {
                case 'No period':
                    creditInfo += ' (Fixed)';
                    break;
                case 'Yearly':
                    creditInfo += ' (Yearly)';
                    break;
                case 'Monthly':
                    creditInfo += ` (Monthly, Start: ${item.startDay})`;
                    break;
                case 'Weekly':
                    const day = WEEKDAYS.find(_ => _.value == item.startDay);
                    creditInfo += ` (Weekly, Start: ${day? day.label : ''})`;
                    break;
            }

            return creditInfo;
        };

    return (
        <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} renderLeftActions={renderLeftActions}>
            <View style={[styles.itemContainer, isSelected && styles.selectedItem]}>
                <IconDisplay library={item.icon ? item.icon.split('/')[0] : 'Ionicons'} icon={item.icon ? item.icon.split('/')[1] : 'pricetag'} size={24} color="#555" />
                <View style={styles.textContainer}>
                    <Text style={styles.itemText} numberOfLines={1}>
                        {item.tagName}
                    </Text>
                    {getCreditText() && <Text style={styles.creditText}>{getCreditText()}</Text>}
                </View>
            </View>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    selectedItem: {
        backgroundColor: '#d3f9d8', // Light green for selected items
    },
    textContainer: {
        marginLeft: 10,
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        color: '#000',
        marginLeft: 10,
        flex: 1,
    },
    creditText: {
        fontSize: 12,
        color: '#666',
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
    selectButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 75,
        height: '100%',
        backgroundColor: '#2196F3',
    },
    selected: {
        backgroundColor: '#1976D2',
    },
    selectText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default TagItem;
