// app/(tabs)/map.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { Marker, Circle, Region } from "react-native-maps";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BG = "#000000";
const CARD = "#181818";
const WHITE = "#ffffff";
const MUTED = "#b3b3b3";
const GREEN = "#1DB954";

// ---------- Custom dark map style (Google Maps style JSON) ----------
const MAP_DARK_STYLE = [
  {
    elementType: "geometry",
    stylers: [{ color: "#1b1b1b" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#e0e0e0" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#222222" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#102c1c" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6bffb0" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2a2a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#101010" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#333333" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#101010" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0a1f33" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4f92ff" }],
  },
];

const POIS = [
  {
    id: "p1",
    title: "Checkpoint A",
    description: "Mock landmark near you",
    latitudeOffset: 0.0008,
    longitudeOffset: 0.0008,
    radius: 100,
  },
  {
    id: "p2",
    title: "Checkpoint B",
    description: "Second virtual spot",
    latitudeOffset: -0.001,
    longitudeOffset: 0.0005,
    radius: 100,
  },
  {
    id: "p3",
    title: "Checkpoint C",
    description: "Third virtual spot",
    latitudeOffset: 0.0002,
    longitudeOffset: -0.001,
    radius: 100,
  },
];

type LatLng = { latitude: number; longitude: number };

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);

  const [location, setLocation] = useState<LatLng | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [insideMap, setInsideMap] = useState<Record<string, boolean>>({});

  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  // Ask for location permission + initial location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setHasPermission(false);
          setIsLoading(false);
          return;
        }

        setHasPermission(true);

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const initialLoc: LatLng = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        };
        setLocation(initialLoc);
        setRegion({
          ...initialLoc,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,
          },
          (pos) => {
            const loc: LatLng = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
            setLocation(loc);
            setRegion((prev) =>
              prev
                ? {
                    ...prev,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                  }
                : {
                    ...loc,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
            );
            checkGeofences(loc);
          }
        );
        locationSubRef.current = sub;
      } catch (e) {
        console.warn("Location error", e);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      if (locationSubRef.current) {
        locationSubRef.current.remove();
      }
    };
  }, []);

  // Geofencing logic
  const checkGeofences = useCallback(
    (loc: LatLng) => {
      setInsideMap((prev) => {
        const next: Record<string, boolean> = { ...prev };

        POIS.forEach((p) => {
          if (!location) return;

          const center: LatLng = {
            latitude: location.latitude + p.latitudeOffset,
            longitude: location.longitude + p.longitudeOffset,
          };

          const distance = haversineDistance(loc, center);
          const inside = distance <= p.radius;

          const wasInside = prev[p.id] ?? false;

          if (!wasInside && inside) {
            Alert.alert("Geofence entered", `You entered ${p.title}`);
          } else if (wasInside && !inside) {
            Alert.alert("Geofence exited", `You left ${p.title}`);
          }

          next[p.id] = inside;
        });

        return next;
      });
    },
    [location]
  );

  // Map controls
  const zoom = useCallback(
    (factor: number) => {
      if (!region) return;
      const newRegion: Region = {
        ...region,
        latitudeDelta: Math.min(Math.max(region.latitudeDelta * factor, 0.001), 1),
        longitudeDelta: Math.min(
          Math.max(region.longitudeDelta * factor, 0.001),
          1
        ),
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 300);
    },
    [region]
  );

  const recenter = useCallback(() => {
    if (!location) return;
    const newRegion: Region = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 400);
  }, [location]);

  const onRegionChangeComplete = (r: Region) => {
    setRegion(r);
  };

  // Loading / permission states
  if (isLoading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={WHITE} />
        <Text style={[styles.muted, { marginTop: 8 }]}>Getting location…</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.muted}>
          Location permission is required to view the map.
        </Text>
      </View>
    );
  }

  if (!region || !location) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.muted}>Location not available.</Text>
      </View>
    );
  }

  const poiCoords = POIS.map((p) => ({
    ...p,
    latitude: location.latitude + p.latitudeOffset,
    longitude: location.longitude + p.longitudeOffset,
  }));

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        followsUserLocation={false}
        showsMyLocationButton={false}
        customMapStyle={MAP_DARK_STYLE} // ✅ custom dark style applied here
      >
        {poiCoords.map((p) => (
          <React.Fragment key={p.id}>
            <Marker
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              title={p.title}
              description={p.description}
              pinColor={insideMap[p.id] ? GREEN : "tomato"}
            />
            <Circle
              center={{ latitude: p.latitude, longitude: p.longitude }}
              radius={p.radius}
              strokeColor={insideMap[p.id] ? GREEN : "rgba(255,99,71,0.8)"}
              fillColor={
                insideMap[p.id]
                  ? "rgba(29,185,84,0.2)"
                  : "rgba(255,99,71,0.15)"
              }
              strokeWidth={2}
            />
          </React.Fragment>
        ))}
      </MapView>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Live location</Text>
        <Text style={styles.infoText}>
          Lat: {location.latitude.toFixed(5)} | Lng: {location.longitude.toFixed(5)}
        </Text>
        <Text style={styles.infoSub}>
          Move around to trigger geofence enter/exit alerts near markers.
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={() => zoom(0.7)}
          accessibilityLabel="Zoom in"
        >
          <FontAwesome name="plus" size={18} color={WHITE} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={() => zoom(1.4)}
          accessibilityLabel="Zoom out"
        >
          <FontAwesome name="minus" size={18} color={WHITE} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ctrlBtn, { marginTop: 8 }]}
          onPress={recenter}
          accessibilityLabel="Recenter on me"
        >
          <FontAwesome name="crosshairs" size={16} color={WHITE} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Haversine distance in meters
function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return R * c;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  map: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  muted: {
    color: MUTED,
    textAlign: "center",
  },
  infoCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: CARD,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#333",
  },
  infoTitle: {
    color: WHITE,
    fontWeight: "800",
    marginBottom: 4,
  },
  infoText: {
    color: WHITE,
    fontWeight: "600",
  },
  infoSub: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },
  controls: {
    position: "absolute",
    right: 16,
    top: 90,
    alignItems: "center",
  },
  ctrlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#333",
  },
});
