import React, { useState, useEffect } from "react";
import {
  View,
  Platform,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import SecureLogoutButton from "../components/SecureLogoutButton";

import API_URL from '../config/api';

export default function MyProfile() {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [image, setImage] = useState(null);
  const client = useSelector((state) => state.client.data);

  useEffect(() => {
    loadProfilePicture();
  }, [client]);

  // Reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfilePicture();
    });
    return unsubscribe;
  }, [navigation]);

  const loadProfilePicture = async () => {
    try {
      // Priority 1: Check Redux store
      if (client?.prof_id?.prof_picture) {
        setImage(client.prof_id.prof_picture);
      } 
      // Priority 2: Check SecureStorage
      else {
        const SecureStorage = require('../utils/secureStorage').default;
        const profile = await SecureStorage.getProfile();
        if (profile?.profile_picture) {
          setImage(profile.profile_picture);
        }
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfilePicture();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateString));
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerText}>My Profile</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate("EditProfile")}
          activeOpacity={0.7}
          style={styles.editButtonContainer}
        >
          <Feather name="edit-2" size={18} color="#6237A0" />
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6237A0"]} />
        }
      >
        {/* Profile Picture and Phone Number */}
        <View style={styles.profileHeader}>
          <Image
            source={image ? { uri: image } : require("../assets/userblank.jpg")}
            style={styles.profileImage}
          />
          <Text style={styles.phoneNumber}>
            {client?.client_country_code || ''} {client?.client_number || ''}
          </Text>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={18} color="#6237A0" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          <View style={styles.card}>
            <ProfileItem
              icon="user"
              label="Full Name"
              value={`${client?.prof_id?.prof_firstname || ''} ${client?.prof_id?.prof_middlename || ""} ${client?.prof_id?.prof_lastname || ''}`.trim() || 'Not set'}
            />
            <ProfileItem
              icon="calendar"
              label="Birthdate"
              value={formatDate(client?.prof_id?.prof_date_of_birth)}
            />
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="map-pin" size={18} color="#6237A0" />
            <Text style={styles.sectionTitle}>Address Information</Text>
          </View>
          <View style={styles.card}>
            <ProfileItem
              icon="home"
              label="Street Address"
              value={client?.prof_id?.prof_street_address || 'Not set'}
            />
            <ProfileItem
              icon="map"
              label="Region, Province, City"
              value={client?.prof_id?.prof_region_info || 'Not set'}
            />
            <ProfileItem
              icon="navigation"
              label="Postal Code"
              value={client?.prof_id?.prof_postal_code || 'Not set'}
              isLast
            />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <SecureLogoutButton />
        </View>
      </ScrollView>
    </View>
  );
}

function ProfileItem({ icon, label, value, isLast }) {
  return (
    <View style={[styles.profileItem, !isLast && styles.profileItemBorder]}>
      <View style={styles.profileItemHeader}>
        <Feather name={icon} size={16} color="#999" style={styles.itemIcon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8F9FA" 
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 12,
    color: "#1A1A1A",
  },
  editButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0E6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButton: {
    fontSize: 15,
    color: "#6237A0",
    fontWeight: "600",
    marginLeft: 4,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  profileHeader: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 4,
    borderColor: "#F0E6FF",
  },
  phoneNumber: {
    fontSize: 17,
    fontWeight: "600",
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  profileItem: {
    paddingVertical: 16,
  },
  profileItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  profileItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  itemIcon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1A1A",
    marginLeft: 22,
  },
  logoutContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
});
