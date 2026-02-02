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

const API_URL =
  Platform.OS === "web" ? "http://localhost:5000" : "http://10.0.2.2:5000";

export default function MyProfile() {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const client = useSelector((state) => state.client.data);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Profile</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Picture and Phone Number */}
        <View style={styles.centerRowContainer}>
          <View style={styles.profileRow}>
            <Image
              source={require("../assets/userblank.jpg")}
              style={styles.profileImage}
            />
            <Text style={styles.phoneNumber}>{client?.client_country_code || ''} {client?.client_number || ''}</Text>
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          <ProfileItem
            label="Name"
            value={`${client?.prof_id?.prof_firstname || ''} ${client?.prof_id?.prof_middlename || ""} ${client?.prof_id?.prof_lastname || ''}`}
          />
          <ProfileItem
            label="Birthdate"
            value={new Intl.DateTimeFormat("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }).format(new Date(client?.prof_id?.prof_date_of_birth || new Date()))}
          />

          <ProfileItem
            label="Street Name, Building, House No."
            value={client?.prof_id?.prof_street_address || ''}
          />
          <ProfileItem
            label="Region, Province, City, Barangay"
            value={client?.prof_id?.prof_region_info || ''}
          />
          <ProfileItem
            label="Postal Code"
            value={client?.prof_id?.prof_postal_code || ''}
          />
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <SecureLogoutButton />
        </View>
      </ScrollView>
    </View>
  );
}

function ProfileItem({ label, value }) {
  return (
    <View style={styles.profileItem}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },
  editButton: {
    fontSize: 16,
    color: "#8a2be2",
    fontWeight: "500",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  centerRowContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detailsContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  profileItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  logoutContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
});
