// app/(tabs)/cameraFilters.tsx
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
  } from "react";
  import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    ScrollView,
    Dimensions,
    Alert,
  } from "react-native";
  import { CameraView, useCameraPermissions } from "expo-camera";
  import type { CameraType } from "expo-camera";
  import * as ImageManipulator from "expo-image-manipulator";
  import Slider from "@react-native-community/slider";
  import { FontAwesome } from "@expo/vector-icons";
  
  const { width: SCREEN_WIDTH } = Dimensions.get("window");
  
  const BG = "#000000";
  const CARD = "#181818";
  const WHITE = "#ffffff";
  const MUTED = "#b3b3b3";
  const GREEN = "#1DB954";
  
  type FilterType = "none" | "grayscale" | "sepia";
  
  export default function CameraFiltersScreen() {
    // --- Permissions (camera only) ---
    const [camPermission, requestCamPermission] = useCameraPermissions();
  
    // --- Camera / capture state ---
    const cameraRef = useRef<any>(null);
    const [facing, setFacing] = useState<CameraType>("back");
    const [isCapturing, setIsCapturing] = useState(false);
  
    // --- Editing state ---
    const [originalUri, setOriginalUri] = useState<string | null>(null);
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(
      null
    );
  
    const [filter, setFilter] = useState<FilterType>("none");
    const [intensity, setIntensity] = useState(0.7);
    const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
    const [squareCrop, setSquareCrop] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
  
    // -------------------------------------------------
    // Camera permission on mount
    // -------------------------------------------------
    useEffect(() => {
      if (!camPermission?.granted) {
        requestCamPermission();
      }
    }, [camPermission, requestCamPermission]);
  
    // -------------------------------------------------
    // Rebuild preview image when edits change
    // (rotation + square crop only; "filters" are visual overlays)
    // -------------------------------------------------
    useEffect(() => {
      if (!originalUri) {
        setPreviewUri(null);
        return;
      }
  
      const baseUri = originalUri as string;
      let cancelled = false;
  
      async function process() {
        try {
          setIsProcessing(true);
  
          let size = imageSize;
          if (!size) {
            const info = await ImageManipulator.manipulateAsync(baseUri, []);
            size = { w: info.width ?? 0, h: info.height ?? 0 };
            setImageSize(size);
          }
  
          const actions: ImageManipulator.Action[] = [];
  
          if (rotation !== 0) {
            actions.push({ rotate: rotation });
          }
  
          if (squareCrop && size && size.w > 0 && size.h > 0) {
            const side = Math.min(size.w, size.h);
            const originX = (size.w - side) / 2;
            const originY = (size.h - side) / 2;
            actions.push({
              crop: { originX, originY, width: side, height: side },
            });
          }
  
          const result = await ImageManipulator.manipulateAsync(
            baseUri,
            actions,
            {
              compress: 0.9,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );
  
          if (!cancelled) {
            setPreviewUri(result.uri);
          }
        } catch (e) {
          console.warn("Image processing failed", e);
        } finally {
          if (!cancelled) setIsProcessing(false);
        }
      }
  
      process();
  
      return () => {
        cancelled = true;
      };
    }, [originalUri, rotation, squareCrop, imageSize]);
  
    // -------------------------------------------------
    // Handlers
    // -------------------------------------------------
    const toggleFacing = useCallback(() => {
      setFacing((prev: "front" | "back") => (prev === "back" ? "front" : "back"));
    }, []);
  
    const handleCapture = useCallback(async () => {
      if (!cameraRef.current) return;
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
  
        setOriginalUri(photo.uri);
        setPreviewUri(photo.uri);
        setImageSize(null);
        setFilter("none");
        setIntensity(0.7);
        setRotation(0);
        setSquareCrop(false);
      } catch (e) {
        console.warn("Capture failed", e);
      } finally {
        setIsCapturing(false);
      }
    }, []);
  
    const handleRotate = useCallback(() => {
      setRotation((r) => (r + 90) % 360);
    }, []);
  
    const handleToggleCrop = useCallback(() => {
      setSquareCrop((prev) => !prev);
    }, []);
  
    const handleSave = useCallback(() => {
      // Expo Go cannot fully save to gallery without a dev build + proper manifest.
      Alert.alert(
        "Save (demo only)",
        "In a real development build, this would save the edited photo to the gallery using expo-media-library."
      );
    }, []);
  
    // -------------------------------------------------
    // Render helpers
    // -------------------------------------------------
    if (!camPermission?.granted) {
      return (
        <View style={[styles.root, styles.center]}>
          <Text style={styles.muted}>
            Camera permission is required to use this feature.
          </Text>
          <TouchableOpacity
            onPress={requestCamPermission}
            style={[styles.chip, { marginTop: 12 }]}
          >
            <Text style={styles.chipText}>Grant permission</Text>
          </TouchableOpacity>
        </View>
      );
    }
  
    return (
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Camera &amp; Filters</Text>
  
          {/* Camera preview block */}
          <View style={styles.cameraCard}>
            <View style={styles.cameraFrame}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                enableTorch={false}
              />
            </View>
  
            <View style={styles.cameraControlsRow}>
              <TouchableOpacity
                onPress={toggleFacing}
                style={styles.circleBtn}
                disabled={isCapturing}
              >
                <FontAwesome name="refresh" size={18} color={WHITE} />
              </TouchableOpacity>
  
              <TouchableOpacity
                onPress={handleCapture}
                style={styles.captureBtn}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator color={WHITE} />
                ) : (
                  <View style={styles.captureInner} />
                )}
              </TouchableOpacity>
  
              <View style={{ width: 40 }} />
            </View>
          </View>
  
          {/* Editor card */}
          {originalUri && (
            <View style={styles.editorCard}>
              <Text style={styles.sectionTitle}>Edit Photo</Text>
  
              <View style={styles.previewWrap}>
                {previewUri ? (
                  <View style={{ position: "relative" }}>
                    <Image
                      source={{ uri: previewUri }}
                      style={styles.previewImg}
                      resizeMode="cover"
                    />
                    {/* Visual overlay to simulate filters, driven by intensity */}
                    {filter === "grayscale" && (
                      <View
                        style={[
                          styles.filterOverlay,
                          {
                            backgroundColor: `rgba(0,0,0,${
                              0.15 + intensity * 0.6
                            })`,
                          },
                        ]}
                      />
                    )}
                    {filter === "sepia" && (
                      <View
                        style={[
                          styles.filterOverlay,
                          {
                            backgroundColor: `rgba(112,66,20,${
                              0.2 + intensity * 0.6
                            })`,
                          },
                        ]}
                      />
                    )}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.previewImg,
                      { alignItems: "center", justifyContent: "center" },
                    ]}
                  >
                    <ActivityIndicator color={WHITE} />
                  </View>
                )}
              </View>
  
              {/* Rotate + Crop row */}
              <View style={styles.editRow}>
                <TouchableOpacity
                  onPress={handleRotate}
                  style={styles.editBtn}
                  disabled={isProcessing}
                >
                  <FontAwesome name="undo" size={16} color={WHITE} />
                  <Text style={styles.editBtnText}>Rotate</Text>
                </TouchableOpacity>
  
                <TouchableOpacity
                  onPress={handleToggleCrop}
                  style={styles.editBtn}
                  disabled={isProcessing}
                >
                  <FontAwesome name="crop" size={16} color={WHITE} />
                  <Text style={styles.editBtnText}>
                    {squareCrop ? "Full view" : "Square crop"}
                  </Text>
                </TouchableOpacity>
              </View>
  
              {/* Filter chips */}
              <Text style={styles.label}>Filter (visual)</Text>
              <View style={styles.chipRow}>
                <FilterChip
                  label="None"
                  active={filter === "none"}
                  onPress={() => setFilter("none")}
                />
                <FilterChip
                  label="Grayscale"
                  active={filter === "grayscale"}
                  onPress={() => setFilter("grayscale")}
                />
                <FilterChip
                  label="Sepia"
                  active={filter === "sepia"}
                  onPress={() => setFilter("sepia")}
                />
              </View>
  
              {/* Intensity slider */}
              <Text style={[styles.label, { marginTop: 12 }]}>
                Intensity ({intensity.toFixed(2)})
              </Text>
              <View style={styles.sliderRow}>
                <Slider
                  style={{ flex: 1 }}
                  minimumValue={0}
                  maximumValue={1}
                  value={intensity}
                  step={0.05}
                  minimumTrackTintColor={GREEN}
                  maximumTrackTintColor="#555"
                  thumbTintColor={GREEN}
                  onValueChange={setIntensity}
                />
              </View>
  
              {/* Save */}
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveBtn, !previewUri && { opacity: 0.5 }]}
                disabled={!previewUri}
              >
                <Text style={styles.saveBtnText}>Save (demo)</Text>
              </TouchableOpacity>
            </View>
          )}
  
          {/* Last capture thumbnail */}
          {previewUri && (
            <View style={styles.lastCard}>
              <Text style={styles.sectionTitle}>Last capture</Text>
              <Image
                source={{ uri: previewUri }}
                style={styles.lastImg}
                resizeMode="cover"
              />
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
  
  // Small chip button for filter selection
  function FilterChip({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) {
    return (
      <TouchableOpacity
        style={[styles.chip, active && styles.chipActive]}
        onPress={onPress}
      >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }
  
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: BG,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 24,
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      color: WHITE,
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 12,
    },
  
    cameraCard: {
      backgroundColor: CARD,
      borderRadius: 18,
      padding: 10,
      marginBottom: 16,
    },
    cameraFrame: {
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: "#000",
    },
    camera: {
      width: "100%",
      height: ((SCREEN_WIDTH - 32) * 4) / 3,
    },
    cameraControlsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 10,
    },
  
    circleBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: WHITE,
      alignItems: "center",
      justifyContent: "center",
    },
    captureBtn: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 4,
      borderColor: WHITE,
      alignItems: "center",
      justifyContent: "center",
    },
    captureInner: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: GREEN,
    },
  
    editorCard: {
      backgroundColor: CARD,
      borderRadius: 18,
      padding: 12,
      marginBottom: 16,
    },
    sectionTitle: {
      color: WHITE,
      fontWeight: "800",
      fontSize: 18,
      marginBottom: 8,
    },
    previewWrap: {
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: "#000",
      marginBottom: 10,
    },
    previewImg: {
      width: "100%",
      aspectRatio: 3 / 4,
    },
  
    filterOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
  
    editRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    editBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "#2a2a2a",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
    },
    editBtnText: {
      color: WHITE,
      fontWeight: "700",
    },
  
    label: {
      color: WHITE,
      fontWeight: "700",
      marginBottom: 4,
    },
    chipRow: {
      flexDirection: "row",
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "#2a2a2a",
    },
    chipActive: {
      backgroundColor: GREEN,
    },
    chipText: {
      color: WHITE,
      fontWeight: "700",
    },
    chipTextActive: {
      color: "#0e3d22",
    },
  
    sliderRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
    },
  
    saveBtn: {
      marginTop: 12,
      backgroundColor: GREEN,
      borderRadius: 999,
      paddingVertical: 10,
      alignItems: "center",
    },
    saveBtnText: {
      color: "#0e3d22",
      fontWeight: "800",
      fontSize: 16,
    },
  
    lastCard: {
      backgroundColor: CARD,
      borderRadius: 18,
      padding: 12,
    },
    lastImg: {
      width: "100%",
      borderRadius: 12,
      height: ((SCREEN_WIDTH - 32) * 9) / 16,
      marginTop: 6,
    },
  
    muted: {
      color: MUTED,
      textAlign: "center",
    },
  });
  