// app/(tabs)/profile.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import AnimatedRe, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BG = "#121212";
const CARD = "#181818";
const WHITE = "#ffffff";
const MUTED = "#b3b3b3";
const GREEN = "#1DB954";
const RED = "#ff6b6b";

const GENRES = ["Pop", "Rock", "Jazz", "Classical", "Hip-Hop"] as const;
type Genre = (typeof GENRES)[number];

type Errors = {
  username?: string;
  email?: string;
  genre?: string;
};

const PROFILE_STORAGE_KEY = "PROFILE_FORM_V1";

// small helper hook for shake animation
function useShake() {
  const offset = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const shake = () => {
    offset.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-4, { duration: 40 }),
      withTiming(4, { duration: 40 }),
      withTiming(0, { duration: 40 })
    );
  };

  return { style, shake };
}

// ---------- Dynamic Profile Preview (memoized) ----------
type PreviewProps = {
  username: string;
  email: string;
  genre: Genre | null;
};

const ProfilePreview = React.memo(function ProfilePreview({
  username,
  email,
  genre,
}: PreviewProps) {
  const trimmedName = username.trim();
  const trimmedEmail = email.trim();
  const hasAny = trimmedName.length > 0 || trimmedEmail.length > 0 || !!genre;

  if (!hasAny) return null;

  const label = genre ?? "User";
  const imageUri = `https://via.placeholder.com/100/1DB954/121212?text=${encodeURIComponent(
    label
  )}`;

  return (
    <AnimatedRe.View
      entering={FadeInDown.duration(220)}
      style={styles.previewCard}
    >
      <View style={styles.previewRow}>
        <Image source={{ uri: imageUri }} style={styles.previewAvatar} />
        <View style={styles.previewMeta}>
          <Text style={styles.previewName}>
            {trimmedName || "Your username"}
          </Text>
          <Text style={styles.previewEmail}>
            {trimmedEmail || "you@example.com"}
          </Text>
          <View style={styles.previewGenrePill}>
            <Text style={styles.previewGenreText}>
              {genre ? `Favorite genre: ${genre}` : "Pick a favorite genre"}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.previewCaption}>
        This is how your profile could appear in a Spotify-style UI.
      </Text>
    </AnimatedRe.View>
  );
});

export default function ProfileScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [genre, setGenre] = useState<Genre | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  // one shaker per field
  const usernameShake = useShake();
  const emailShake = useShake();
  const genreShake = useShake();

  // ---------- validation helpers ----------
  const validateUsername = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return "Username is required.";
    if (trimmed.length < 3 || trimmed.length > 20) {
      return "Must be 3–20 characters.";
    }
    if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
      return "Letters, numbers, and underscores only.";
    }
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return "Enter a valid email address.";
    }
    return undefined;
  };

  const validateGenre = (value: Genre | null): string | undefined => {
    if (!value) return "Please choose a favorite genre.";
    return undefined;
  };

  // ---------- hydrate from AsyncStorage once ----------
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (!raw) return;

        const parsed: { username?: string; email?: string; genre?: Genre | null } =
          JSON.parse(raw);

        if (!isMounted) return;

        const nextUsername = parsed.username ?? "";
        const nextEmail = parsed.email ?? "";
        const nextGenre = parsed.genre ?? null;

        setUsername(nextUsername);
        setEmail(nextEmail);
        setGenre(nextGenre);

        // revalidate hydrated values
        const usernameError =
          nextUsername.trim().length > 0 ? validateUsername(nextUsername) : undefined;
        const emailError =
          nextEmail.trim().length > 0 ? validateEmail(nextEmail) : undefined;
        const genreError = nextGenre ? validateGenre(nextGenre) : undefined;

        setErrors({
          username: usernameError,
          email: emailError,
          genre: genreError,
        });
      } catch (e) {
        console.warn("Profile hydrate failed:", e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // ---------- persist to AsyncStorage whenever values change ----------
  useEffect(() => {
    const payload = {
      username,
      email,
      genre,
    };
    AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload)).catch((e) =>
      console.warn("Profile persist failed:", e)
    );
  }, [username, email, genre]);

  // real-time validation on change (with shake)
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    const err = validateUsername(value);
    setErrors((prev) => ({ ...prev, username: err }));
    if (err && value.trim().length > 0) {
      usernameShake.shake();
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const err = validateEmail(value);
    setErrors((prev) => ({ ...prev, email: err }));
    if (err && value.trim().length > 0) {
      emailShake.shake();
    }
  };

  const handleSelectGenre = (value: Genre) => {
    setGenre(value);
    const err = validateGenre(value);
    setErrors((prev) => ({ ...prev, genre: err }));
    if (err) {
      genreShake.shake();
    }
  };

  // submit validates, then clears cache and resets form
  const handleSubmit = async () => {
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const genreError = validateGenre(genre);

    const nextErrors: Errors = {
      username: usernameError,
      email: emailError,
      genre: genreError,
    };
    setErrors(nextErrors);

    // shake any invalid fields on submit
    if (usernameError) usernameShake.shake();
    if (emailError) emailShake.shake();
    if (genreError) genreShake.shake();

    const hasError = !!(usernameError || emailError || genreError);
    if (hasError) {
      Alert.alert("Fix the errors", "Please correct the highlighted fields.");
      return;
    }

    // clear cache and reset form
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (e) {
      console.warn("Profile clear failed:", e);
    }

    setUsername("");
    setEmail("");
    setGenre(null);
    setErrors({});

    Alert.alert("Profile saved", "Profile is valid and cache has been cleared.");
  };

  const isSubmitDisabled = useMemo(() => {
    return !username.trim() || !email.trim() || !genre;
  }, [username, email, genre]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.screenTitle}>Profile setup</Text>
      <Text style={styles.screenSubtitle}>
        Create your Spotify-style profile. All fields validate in real time.
      </Text>

      {/* Username */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Username</Text>
        <AnimatedRe.View style={usernameShake.style}>
          <TextInput
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="e.g. francis_daniel"
            placeholderTextColor={MUTED}
            autoCapitalize="none"
            style={[styles.input, errors.username && { borderColor: RED }]}
          />
        </AnimatedRe.View>
        {errors.username ? (
          <AnimatedRe.Text entering={FadeInDown.duration(150)} style={styles.errorText}>
            {errors.username}
          </AnimatedRe.Text>
        ) : (
          <Text style={styles.helperText}>
            3–20 chars, letters / numbers / _
          </Text>
        )}
      </View>

      {/* Email */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email</Text>
        <AnimatedRe.View style={emailShake.style}>
          <TextInput
            value={email}
            onChangeText={handleEmailChange}
            placeholder="you@example.com"
            placeholderTextColor={MUTED}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, errors.email && { borderColor: RED }]}
          />
        </AnimatedRe.View>
        {errors.email ? (
          <AnimatedRe.Text entering={FadeInDown.duration(150)} style={styles.errorText}>
            {errors.email}
          </AnimatedRe.Text>
        ) : (
          <Text style={styles.helperText}>
            We will only use this in the demo.
          </Text>
        )}
      </View>

      {/* Genre pills */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Favorite Genre</Text>
        <AnimatedRe.View style={genreShake.style}>
          <View style={styles.genreRow}>
            {GENRES.map((g) => {
              const active = genre === g;
              return (
                <TouchableOpacity
                  key={g}
                  style={[styles.genrePill, active && styles.genrePillActive]}
                  onPress={() => handleSelectGenre(g)}
                >
                  <Text
                    style={[styles.genreText, active && styles.genreTextActive]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </AnimatedRe.View>
        {errors.genre ? (
          <AnimatedRe.Text entering={FadeInDown.duration(150)} style={styles.errorText}>
            {errors.genre}
          </AnimatedRe.Text>
        ) : (
          <Text style={styles.helperText}>Tap one genre to select it.</Text>
        )}
      </View>

      {/* Dynamic profile preview */}
      <ProfilePreview username={username} email={email} genre={genre} />

      {/* Submit button */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          (isSubmitDisabled || Object.values(errors).some(Boolean)) && {
            opacity: 0.5,
          },
        ]}
        onPress={handleSubmit}
        disabled={isSubmitDisabled}
      >
        <Text style={styles.submitText}>Save profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  screenTitle: {
    color: WHITE,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  screenSubtitle: {
    color: MUTED,
    marginBottom: 18,
  },

  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: WHITE,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    backgroundColor: CARD,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    color: WHITE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#333",
  },
  helperText: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    color: RED,
    fontSize: 12,
    marginTop: 4,
  },

  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genrePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: CARD,
  },
  genrePillActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  genreText: {
    color: WHITE,
    fontWeight: "600",
    fontSize: 12,
  },
  genreTextActive: {
    color: "#0c2616",
  },

  submitBtn: {
    marginTop: 16,
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#0b2b18",
    fontWeight: "800",
    fontSize: 16,
  },

  // Preview card
  previewCard: {
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2b2b2b",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  previewAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1f1f1f",
  },
  previewMeta: {
    flex: 1,
  },
  previewName: {
    color: WHITE,
    fontWeight: "800",
    fontSize: 16,
  },
  previewEmail: {
    color: MUTED,
    fontSize: 12,
    marginTop: 2,
  },
  previewGenrePill: {
    marginTop: 6,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#2c2c2c",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  previewGenreText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: "600",
  },
  previewCaption: {
    color: MUTED,
    fontSize: 11,
  },
});
