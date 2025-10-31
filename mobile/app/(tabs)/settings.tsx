import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const PERENUAL_API_KEY = process.env.PERENUAL_API_KEY || 'sk-tDbl6903173768f7e13203';
const PERENUAL_API_URL = process.env.PERENUAL_URL || 'https://perenual.com/api/species-list';

interface Plant {
    id: number;
    common_name: string;
    scientific_name: string[];
    other_name: string[];
    cycle: string;
    watering: string;
    sunlight: string[];
    default_image?: {
        thumbnail: string;
        regular_url: string;
    };
}

interface MyPlant {
    id: string;
    plantData: Plant;
    addedDate: string;
}

export default function SettingsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Plant[]>([]);
    const [myPlants, setMyPlants] = useState<MyPlant[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    //!! Charger les plantes sauvegardées au démarrage
    useEffect(() => {
        loadMyPlants();
    }, []);

    //! Fonction pour charger les plantes de l'utilisateur
    const loadMyPlants = async () => {
        //! Ici, vous pouvez charger depuis AsyncStorage ou une base de données
        //! Pour l'instant, on utilise un état local
        const savedPlants = await AsyncStorage.getItem('myPlants'); //! À remplacer par: await AsyncStorage.getItem('myPlants')
        setMyPlants(savedPlants);
    };

    //! Rechercher des plantes via l'API Perenual
    const searchPlants = async () => {
        if(!searchQuery.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer un nom de plante');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${PERENUAL_API_URL}?key=${PERENUAL_API_KEY}&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();

            if(data.data && data.data.length > 0) {
                setSearchResults(data.data);
                setShowSearchModal(true);
            } else {
                Alert.alert('Aucun résultat', 'Aucune plante trouvée avec ce nom');
            }
        } catch(error) {
            console.error('Erreur recherche plantes:', error);
            Alert.alert('Erreur', 'Impossible de rechercher les plantes');
        } finally {
            setLoading(false);
        }
    };

    //!! Ajouter une plante à ma liste
    const addPlant = (plant: Plant) => {
        const newPlant: MyPlant = {
            id: `${plant.id}-${Date.now()}`,
            plantData: plant,
            addedDate: new Date().toLocaleDateString(),
        };
      
        setMyPlants([...myPlants, newPlant]);
        //! Sauvegarder dans AsyncStorage
        //! await AsyncStorage.setItem('myPlants', JSON.stringify([...myPlants, newPlant]));

        setShowSearchModal(false);
        setSearchQuery('');
        setSearchResults([]);

        Alert.alert('Succès', `${plant.common_name} a été ajouté à vos plantes`);
    };

    //! Supprimer une plante
    const deletePlant = (plantId: string) => {
        Alert.alert(
            'Confirmer la suppression',
            'Voulez-vous vraiment supprimer cette plante ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => {
                        const updatedPlants = myPlants.filter(p => p.id !== plantId);
                        setMyPlants(updatedPlants);
                        //! await AsyncStorage.setItem('myPlants', JSON.stringify(updatedPlants));
                    },
                },
            ]
        );
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadMyPlants();
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    return (
        <View style={styles.container}>
            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher une plante (ex: rose, tomate...)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={searchPlants}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#6b7280" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={searchPlants}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Ionicons name="search" size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
            
            {/* Liste de mes plantes */}
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                <Text style={styles.title}>Mes Plantes</Text>
                <Text style={styles.subtitle}>
                    {myPlants.length} plante{myPlants.length > 1 ? 's' : ''}
                </Text>
            </View>
          
            {myPlants.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="leaf-outline" size={64} color="#d1d5db" />
                    <Text style={styles.emptyText}>Aucune plante ajoutée</Text>
                    <Text style={styles.emptySubtext}>
                        Recherchez et ajoutez vos premières plantes
                    </Text>
                </View>
            ) : (
                myPlants.map((myPlant) => (
                    <View key={myPlant.id} style={styles.plantCard}>
                        <Image
                            source={{
                                uri: myPlant.plantData.default_image?.thumbnail || 
                                'https://via.placeholder.com/80?text=No+Image',
                            }}
                            style={styles.plantImage}
                        />
                        <View style={styles.plantInfo}>
                            <Text style={styles.plantName}>
                                {myPlant.plantData.common_name}
                            </Text>
                            <Text style={styles.plantScientific}>
                                {myPlant.plantData.scientific_name?.[0] || 'N/A'}
                            </Text>
                            <View style={styles.plantTags}>
                                <View style={styles.tag}>
                                    <Ionicons name="water" size={12} color="#3b82f6" />
                                    <Text style={styles.tagText}>
                                        {myPlant.plantData.watering || 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.tag}>
                                    <Ionicons name="sunny" size={12} color="#f59e0b" />
                                    <Text style={styles.tagText}>
                                        {myPlant.plantData.sunlight?.[0] || 'N/A'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.addedDate}>Ajouté le {myPlant.addedDate}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deletePlant(myPlant.id)}
                        >
                            <Ionicons name="trash-outline" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                ))
            )}
            </ScrollView>
          
            {/* Modal de résultats de recherche */}
            <Modal
                visible={showSearchModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowSearchModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Résultats de recherche</Text>
                            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                                <Ionicons name="close" size={28} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            {searchResults.map((plant) => (
                                <TouchableOpacity
                                    key={plant.id}
                                    style={styles.searchResultCard}
                                    onPress={() => addPlant(plant)}
                                >
                                    <Image
                                          source={{
                                            uri: plant.default_image?.thumbnail || 
                                              'https://via.placeholder.com/60?text=No+Image',
                                          }}
                                          style={styles.resultImage}
                                    />
                                    <View style={styles.resultInfo}>
                                        <Text style={styles.resultName}>{plant.common_name}</Text>
                                        <Text style={styles.resultScientific}>
                                            {plant.scientific_name?.[0] || 'N/A'}
                                        </Text>
                                        <View style={styles.resultTags}>
                                            {plant.cycle && (
                                                <View style={[styles.tag, styles.tagSmall]}>
                                                    <Text style={styles.tagTextSmall}>{plant.cycle}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <Ionicons name="add-circle" size={32} color="#10b981" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );  
}   

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        gap: 8,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#374151',
    },
    searchButton: {
        width: 48,
        height: 48,
        backgroundColor: '#10b981',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 8,
    },
    plantCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    plantImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    plantInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    plantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    plantScientific: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#6b7280',
        marginBottom: 8,
    },
    plantTags: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    tagText: {
        fontSize: 11,
        color: '#374151',
        textTransform: 'capitalize',
    },
    tagSmall: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    tagTextSmall: {
        fontSize: 10,
        color: '#374151',
        textTransform: 'capitalize',
    },
    addedDate: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 4,
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 44,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    modalScroll: {
        padding: 16,
    },
    searchResultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    resultImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#e5e7eb',
    },
    resultInfo: {
        flex: 1,
        marginLeft: 12,
    },
    resultName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    resultScientific: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#6b7280',
        marginBottom: 6,
    },
    resultTags: {
        flexDirection: 'row',
        gap: 6,
    },
});