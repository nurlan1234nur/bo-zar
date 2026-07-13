import * as React from "react";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  RefreshControl,
} from "react-native";
import { ApiClient, createAdsApi, createAuthApi, createCatalogApi, createFavoritesApi, createImagesApi, createReportsApi } from "@bozar/api-client";
import { theme } from "../packages/design-tokens/src/index";
import { type Category, type Location, type PublicAdvertisement } from "@bozar/shared-types";
import { filterAds, formatPrice, getApiErrorMessage, hasImage, resolveImageUrlValue, type SearchSort } from "./src/app-utils";

declare const process: {
  env: {
    EXPO_PUBLIC_API_BASE_URL?: string;
  };
};

type TabId = "home" | "search" | "create" | "favorites" | "profile";
type AuthSession = {
  token: string;
  user: {
    userId: number;
    fullName: string;
    phone: string;
    email?: string;
    role: string;
  };
};

type CreateAdPayload = {
  title: string;
  description: string;
  price?: number;
  categoryId: number;
  locationId: number;
  contactPhone: string;
};

type PickedImage = {
  uri: string;
  fileName: string;
  mimeType: string;
};

const SESSION_STORAGE_KEY = "bozar.mobile.session";
let authToken: string | undefined;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";
const API_ASSET_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
  getToken: () => authToken,
});
const adsApi = createAdsApi(apiClient);
const authApi = createAuthApi(apiClient);
const catalogApi = createCatalogApi(apiClient);
const favoritesApi = createFavoritesApi(apiClient);
const imagesApi = createImagesApi(apiClient);
const reportsApi = createReportsApi(apiClient);

function resolveImageUrl(imageUrl: string) {
  return resolveImageUrlValue(imageUrl, API_ASSET_ORIGIN);
}

function AdCard({ ad, onPress, isFavorite, onFavorite }: { ad: PublicAdvertisement; onPress: () => void; isFavorite?: boolean; onFavorite?: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View>
        {hasImage(ad.imageUrl) ? (
          <Image source={{ uri: resolveImageUrl(ad.imageUrl) }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImageEmpty}>
            <Ionicons name="image-outline" size={26} color={theme.colors.muted} />
            <Text style={styles.cardImageEmptyText}>Зураггүй</Text>
          </View>
        )}
        {onFavorite && (
          <Pressable style={styles.favoriteButton} onPress={onFavorite}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={18} color={isFavorite ? theme.colors.accent : theme.colors.text} />
          </Pressable>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.location}>{ad.locationName}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{ad.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>{ad.description}</Text>
        <Text style={styles.price}>{formatPrice(ad.price)}</Text>
      </View>
    </Pressable>
  );
}

function HomeScreen({
  ads,
  categories,
  favoriteIds,
  openAd,
  goSearch,
  source,
  toggleFavorite,
  refreshing,
  onRefresh,
}: {
  ads: PublicAdvertisement[];
  categories: Category[];
  favoriteIds: Set<number>;
  openAd: (ad: PublicAdvertisement) => void;
  goSearch: () => void;
  source: "api" | "offline";
  toggleFavorite: (ad: PublicAdvertisement) => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const featuredAd = ads[0];

  return (
    <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} colors={[theme.colors.accent]} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>БӨ Зар</Text>
          <Text style={styles.subtitle}>Баян-Өлгий marketplace</Text>
        </View>
        <Text style={styles.sourceBadge}>{source === "api" ? "API" : "Offline"}</Text>
        <Pressable style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
        </Pressable>
      </View>

      <Pressable style={styles.searchBox} onPress={goSearch}>
        <Ionicons name="search" size={18} color={theme.colors.muted} />
        <Text style={styles.searchPlaceholder}>Байр, дайвар, ажил хайх...</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ангилал</Text>
        <Text style={styles.link}>Бүгд</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {categories.map((category) => (
          <Pressable key={category.categoryId} style={styles.categoryPill}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryCount}>{category.count} зар</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable style={styles.featured} onPress={() => featuredAd && openAd(featuredAd)}>
        {featuredAd && hasImage(featuredAd.imageUrl) ? <Image source={{ uri: resolveImageUrl(featuredAd.imageUrl) }} style={styles.featuredImage} /> : <View style={styles.featuredFallback} />}
        <View style={styles.featuredOverlay}>
          <Text style={styles.featuredLabel}>Онцлох зар</Text>
          {featuredAd ? (
            <>
              <Text style={styles.featuredTitle}>{featuredAd.title}</Text>
              <Text style={styles.featuredPrice}>{formatPrice(featuredAd.price)}</Text>
            </>
          ) : (
            <Text style={styles.featuredTitle}>Одоогоор зар алга</Text>
          )}
        </View>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Сүүлийн зарууд</Text>
        <Text style={styles.link}>Шинэ</Text>
      </View>
      <View style={styles.list}>
        {ads.map((ad) => (
          <AdCard
            key={ad.adId}
            ad={ad}
            onPress={() => openAd(ad)}
            isFavorite={favoriteIds.has(ad.adId)}
            onFavorite={() => toggleFavorite(ad)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function SearchScreen({
  ads,
  categories,
  locations,
  favoriteIds,
  openAd,
  toggleFavorite,
  query,
  onQueryChange,
  categoryId,
  onCategoryChange,
  locationId,
  onLocationChange,
  sort,
  onSortChange,
  refreshing,
  onRefresh,
}: {
  ads: PublicAdvertisement[];
  categories: Category[];
  locations: Location[];
  favoriteIds: Set<number>;
  openAd: (ad: PublicAdvertisement) => void;
  toggleFavorite: (ad: PublicAdvertisement) => void;
  query: string;
  onQueryChange: (value: string) => void;
  categoryId: number | "all";
  onCategoryChange: (value: number | "all") => void;
  locationId: number | "all";
  onLocationChange: (value: number | "all") => void;
  sort: SearchSort;
  onSortChange: (value: SearchSort) => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} colors={[theme.colors.accent]} />}>
      <Text style={styles.screenTitle}>Хайлт</Text>
      <View style={[styles.searchBox, styles.searchInputBox]}>
        <Ionicons name="search" size={18} color={theme.colors.accent} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder="Юу хайж байна?"
          placeholderTextColor={theme.colors.muted}
          style={styles.searchInput}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <Pressable style={[styles.filterChip, categoryId === "all" && styles.filterChipActive]} onPress={() => onCategoryChange("all")}>
          <Text style={[styles.filterText, categoryId === "all" && styles.filterTextActive]}>Бүгд</Text>
        </Pressable>
        {categories.map((category) => {
          const active = categoryId === category.categoryId;
          return (
            <Pressable key={category.categoryId} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => onCategoryChange(category.categoryId)}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{category.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <Pressable style={[styles.filterChip, locationId === "all" && styles.filterChipActive]} onPress={() => onLocationChange("all")}>
          <Text style={[styles.filterText, locationId === "all" && styles.filterTextActive]}>Бүх байрлал</Text>
        </Pressable>
        {locations.map((location) => {
          const active = locationId === location.locationId;
          return (
            <Pressable key={location.locationId} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => onLocationChange(location.locationId)}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{location.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {[
          { key: "newest", label: "Шинэ" },
          { key: "priceAsc", label: "Үнэ өсөх" },
          { key: "priceDesc", label: "Үнэ буурах" },
          { key: "views", label: "Үзэлт" },
        ].map((item) => {
          const active = sort === item.key;
          return (
            <Pressable key={item.key} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => onSortChange(item.key as SearchSort)}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.list}>
        {ads.map((ad) => (
          <AdCard
            key={ad.adId}
            ad={ad}
            onPress={() => openAd(ad)}
            isFavorite={favoriteIds.has(ad.adId)}
            onFavorite={() => toggleFavorite(ad)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function DetailScreen({
  ad,
  isFavorite,
  onBack,
  toggleFavorite,
  reportAd,
}: {
  ad: PublicAdvertisement;
  isFavorite: boolean;
  onBack: () => void;
  toggleFavorite: (ad: PublicAdvertisement) => void;
  reportAd: (ad: PublicAdvertisement) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.detailScroll}>
      {hasImage(ad.imageUrl) ? (
        <Image source={{ uri: resolveImageUrl(ad.imageUrl) }} style={styles.detailImage} />
      ) : (
        <View style={styles.detailImageEmpty}>
          <Ionicons name="image-outline" size={36} color={theme.colors.muted} />
          <Text style={styles.detailImageEmptyText}>Зураггүй</Text>
        </View>
      )}
      <Pressable style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
      </Pressable>
      <Pressable style={styles.detailFavoriteButton} onPress={() => toggleFavorite(ad)}>
        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? theme.colors.accent : theme.colors.text} />
      </Pressable>
      <View style={styles.detailBody}>
        <Text style={styles.location}>{ad.locationName}</Text>
        <Text style={styles.detailTitle}>{ad.title}</Text>
        <Text style={styles.detailPrice}>{formatPrice(ad.price)}</Text>
        <Text style={styles.detailDescription}>{ad.description}</Text>
        <View style={styles.sellerBox}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{ad.sellerName[0]}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sellerName}>{ad.sellerName}</Text>
            <Text style={styles.location}>{ad.viewCount} үзэлт</Text>
          </View>
        </View>
        <View style={styles.detailActions}>
          <Pressable style={styles.callButton} onPress={() => void Linking.openURL(`tel:${ad.contactPhone}`)}>
            <Ionicons name="call-outline" size={18} color={theme.colors.surface} />
            <Text style={styles.callButtonText}>Холбогдох</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => reportAd(ad)}>
            <Ionicons name="flag-outline" size={18} color={theme.colors.text} />
            <Text style={styles.secondaryButtonText}>Report</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function CreateScreen({
  categories,
  locations,
  ad,
  onSave,
  onDelete,
  onCancel,
  onNotice,
}: {
  categories: Category[];
  locations: Location[];
  ad?: PublicAdvertisement | null;
  onSave: (payload: CreateAdPayload, images?: PickedImage[]) => void;
  onDelete?: () => void;
  onCancel: () => void;
  onNotice: (message: string) => void;
}) {
  const [title, setTitle] = React.useState(ad?.title ?? "");
  const [price, setPrice] = React.useState(ad?.price?.toString() ?? "");
  const [categoryId, setCategoryId] = React.useState(ad?.categoryId ?? categories[0]?.categoryId ?? 1);
  const [locationId, setLocationId] = React.useState(ad?.locationId ?? locations[0]?.locationId ?? 0);
  const [contactPhone, setContactPhone] = React.useState(ad?.contactPhone ?? "");
  const [description, setDescription] = React.useState(ad?.description ?? "");
  const [images, setImages] = React.useState<PickedImage[]>([]);

  React.useEffect(() => {
    setTitle(ad?.title ?? "");
    setPrice(ad?.price?.toString() ?? "");
    setCategoryId(ad?.categoryId ?? categories[0]?.categoryId ?? 1);
    setLocationId(ad?.locationId ?? locations[0]?.locationId ?? 0);
    setContactPhone(ad?.contactPhone ?? "");
    setDescription(ad?.description ?? "");
    setImages([]);
  }, [ad, categories, locations]);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      onNotice("Зураг сонгохын тулд permission зөвшөөрнө үү");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.82,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    setImages((current) => [
      ...current,
      ...result.assets.map((asset, index) => ({
        uri: asset.uri,
        fileName: asset.fileName ?? `mobile-ad-${Date.now()}-${index}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
      })),
    ].slice(0, 8));
  }

  function submit() {
    const selectedCategory = categories.find((category) => category.categoryId === categoryId) ?? categories[0];
    if (!selectedCategory) {
      onNotice("Ангилал ачаалагдаагүй байна");
      return;
    }
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedPhone = contactPhone.trim();

    if (trimmedTitle.length < 3) {
      onNotice("Гарчиг 3-аас дээш тэмдэгттэй байх ёстой");
      return;
    }

    if (trimmedDescription.length < 10) {
      onNotice("Тайлбар 10-аас дээш тэмдэгттэй байх ёстой");
      return;
    }

    if (trimmedPhone.length < 6) {
      onNotice("Утасны дугаар 6-аас дээш тэмдэгттэй байх ёстой");
      return;
    }

    onSave({
      title: trimmedTitle,
      description: trimmedDescription,
      price: Number(price.replace(/\D/g, "")) || undefined,
      categoryId: selectedCategory.categoryId,
      locationId,
      contactPhone: trimmedPhone,
    }, images);
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.screenHeaderRow}>
        <Text style={styles.screenTitle}>{ad ? "Зар засах" : "Зар нэмэх"}</Text>
        <Pressable onPress={onCancel}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </Pressable>
      </View>
      <Pressable style={styles.uploadBox} onPress={() => void pickImage()}>
        {images.length > 0 ? (
          <Image source={{ uri: images[0].uri }} style={styles.uploadPreview} />
        ) : ad && hasImage(ad.imageUrl) ? (
          <Image source={{ uri: resolveImageUrl(ad.imageUrl) }} style={styles.uploadPreview} />
        ) : (
          <>
            <Ionicons name="camera-outline" size={28} color={theme.colors.accent} />
            <Text style={styles.uploadText}>Зураг нэмэх</Text>
          </>
        )}
      </Pressable>
      {images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedImagesRow}>
          {images.map((item, index) => (
            <Pressable key={`${item.uri}-${index}`} style={styles.selectedImageThumb} onPress={() => setImages((current) => current.filter((_, currentIndex) => currentIndex !== index))}>
              <Image source={{ uri: item.uri }} style={styles.selectedImage} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Гарчиг</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Жишээ: 1 өрөө байр түрээслүүлнэ" placeholderTextColor="#9a9a9a" style={styles.fieldInput} />
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Үнэ</Text>
        <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="800000" placeholderTextColor="#9a9a9a" style={styles.fieldInput} />
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Ангилал</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
          {categories.map((category) => {
            const active = category.categoryId === categoryId;
            return (
              <Pressable key={category.categoryId} style={[styles.choiceChip, active && styles.choiceChipActive]} onPress={() => setCategoryId(category.categoryId)}>
                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{category.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
        <View style={styles.field}>
        <Text style={styles.fieldLabel}>Байршил</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
          {locations.map((location) => {
            const active = location.locationId === locationId;
            return (
              <Pressable key={location.locationId} style={[styles.choiceChip, active && styles.choiceChipActive]} onPress={() => setLocationId(location.locationId)}>
                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{location.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Холбогдох утас</Text>
        <TextInput value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" placeholder="Утас" placeholderTextColor="#9a9a9a" style={styles.fieldInput} />
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Тайлбар</Text>
        <TextInput value={description} onChangeText={setDescription} multiline placeholder="Зарын дэлгэрэнгүй мэдээлэл..." placeholderTextColor="#9a9a9a" style={[styles.fieldInput, styles.textArea]} />
      </View>
      <Pressable style={styles.primaryButton} onPress={submit}><Text style={styles.primaryButtonText}>{ad ? "Хадгалах" : "Нийтлэх"}</Text></Pressable>
      {ad && onDelete ? (
        <Pressable style={styles.secondaryFullButton} onPress={onDelete}>
          <Text style={styles.secondaryButtonText}>Устгах</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function FavoritesScreen({
  ads,
  favoriteIds,
  openAd,
  toggleFavorite,
}: {
  ads: PublicAdvertisement[];
  favoriteIds: Set<number>;
  openAd: (ad: PublicAdvertisement) => void;
  toggleFavorite: (ad: PublicAdvertisement) => void;
}) {
  const favorites = ads.filter((ad) => favoriteIds.has(ad.adId));

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.screenTitle}>Хадгалсан зар</Text>
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={30} color={theme.colors.accent} />
          <Text style={styles.emptyTitle}>Хадгалсан зар алга</Text>
          <Text style={styles.placeholderText}>Хадгалсан зар энд харагдана.</Text>
        </View>
      ) : (
        <View style={[styles.list, { marginTop: 18 }]}>
          {favorites.map((ad) => (
            <AdCard
              key={ad.adId}
              ad={ad}
              onPress={() => openAd(ad)}
              isFavorite
              onFavorite={() => toggleFavorite(ad)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.screenTitle}>{title}</Text>
      <Text style={styles.placeholderText}>Энэ хэсэг дараагийн шинэчлэлтээр идэвхжинэ.</Text>
    </View>
  );
}

function ProfileScreen({
  session,
  myAds,
  locations,
  openAd,
  onEdit,
  onDelete,
  onAuthenticated,
  onLogout,
  onNotice,
}: {
  session?: AuthSession;
  myAds: PublicAdvertisement[];
  locations: Location[];
  openAd: (ad: PublicAdvertisement) => void;
  onEdit: (ad: PublicAdvertisement) => void;
  onDelete: (ad: PublicAdvertisement) => void;
  onAuthenticated: (session: AuthSession) => void;
  onLogout: () => void;
  onNotice: (message: string) => void;
}) {
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [fullName, setFullName] = React.useState("");
  const [identifier, setIdentifier] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [profileName, setProfileName] = React.useState(session?.user.fullName ?? "");
  const [profileEmail, setProfileEmail] = React.useState(session?.user.email ?? "");
  const [profileLocationId, setProfileLocationId] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    setProfileName(session?.user.fullName ?? "");
    setProfileEmail(session?.user.email ?? "");
    setProfileLocationId(undefined);
  }, [session, locations]);

  async function submit() {
    if (password.trim().length < 8) {
      onNotice("Нууц үг дор хаяж 8 тэмдэгт байна");
      return;
    }

    try {
      if (mode === "login") {
        const response = await authApi.login({ identifier, password }) as { data: AuthSession };
        authToken = response.data.token;
        onAuthenticated(response.data);
        onNotice("Нэвтрэлт амжилттай");
      } else {
        const response = await authApi.register({ fullName, phone: identifier, email: email || undefined, password }) as { data: AuthSession };
        authToken = response.data.token;
        onAuthenticated(response.data);
        onNotice("Бүртгэл амжилттай");
      }
    } catch (error) {
      onNotice(getApiErrorMessage(error, "Нэвтрэх эсвэл бүртгүүлэх үед алдаа гарлаа"));
    }
  }

  async function saveProfile() {
    if (!session || !authToken) {
      onNotice("Профайл хадгалахын тулд эхлээд нэвтэрнэ үү");
      return;
    }

    try {
      const response = await authApi.updateMe({
        fullName: profileName.trim() || undefined,
        email: profileEmail.trim() || undefined,
        locationId: profileLocationId,
      }) as { data: { userId: number; fullName: string; phone: string; email?: string; role: string } };

      onAuthenticated({
        token: authToken,
        user: response.data,
      });
      onNotice("Профайл хадгаллаа");
    } catch {
      onNotice("Профайл шинэчлэх үед backend алдаа гарлаа");
    }
  }

  if (session) {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.screenTitle}>Профайл</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{session.user.fullName[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{session.user.fullName}</Text>
            <Text style={styles.location}>{session.user.phone}</Text>
            {session.user.email ? <Text style={styles.location}>{session.user.email}</Text> : null}
          </View>
        </View>
        <View style={styles.profilePanel}>
          <Text style={styles.profilePanelTitle}>Миний хэсэг</Text>
          <Text style={styles.placeholderText}>Энэ хэсэгт таны үйлдлүүд харагдана.</Text>
        </View>
        <View style={styles.profilePanel}>
          <Text style={styles.profilePanelTitle}>Тохиргоо</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Нэр</Text>
            <TextInput value={profileName} onChangeText={setProfileName} style={styles.fieldInput} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput value={profileEmail} onChangeText={setProfileEmail} autoCapitalize="none" keyboardType="email-address" style={styles.fieldInput} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Байршил</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
              {locations.map((location) => {
                const active = location.locationId === profileLocationId;
                return (
                  <Pressable
                    key={location.locationId}
                    style={[styles.choiceChip, active && styles.choiceChipActive]}
                    onPress={() => setProfileLocationId(location.locationId)}
                  >
                    <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{location.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => void saveProfile()}>
            <Text style={styles.primaryButtonText}>Хадгалах</Text>
          </Pressable>
        </View>
        <View style={styles.profilePanel}>
          <Text style={styles.profilePanelTitle}>Миний зарууд</Text>
          {myAds.length === 0 ? (
            <Text style={styles.placeholderText}>Энд таны нийтэлсэн зарууд харагдана.</Text>
          ) : (
            <View style={styles.compactList}>
              {myAds.map((ad) => (
                <View key={ad.adId} style={styles.myAdRow}>
                  <Pressable style={styles.myAdMain} onPress={() => openAd(ad)}>
                    {hasImage(ad.imageUrl) ? (
                      <Image source={{ uri: resolveImageUrl(ad.imageUrl) }} style={styles.myAdThumb} />
                    ) : (
                      <View style={styles.myAdThumbEmpty}>
                        <Ionicons name="image-outline" size={16} color={theme.colors.muted} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.myAdTitle} numberOfLines={1}>{ad.title}</Text>
                      <Text style={styles.location}>{formatPrice(ad.price)} · {ad.locationName}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
                  </Pressable>
                  <View style={styles.myAdActions}>
                    <Pressable style={styles.myAdActionButton} onPress={() => onEdit(ad)}>
                      <Ionicons name="create-outline" size={16} color={theme.colors.text} />
                    </Pressable>
                    <Pressable style={[styles.myAdActionButton, styles.myAdDeleteButton]} onPress={() => onDelete(ad)}>
                      <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
        <Pressable style={styles.secondaryFullButton} onPress={onLogout}>
          <Text style={styles.secondaryButtonText}>Гарах</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.screenTitle}>Профайл</Text>
      <View style={styles.segment}>
        <Pressable style={[styles.segmentButton, mode === "login" && styles.segmentButtonActive]} onPress={() => setMode("login")}>
          <Text style={[styles.segmentText, mode === "login" && styles.segmentTextActive]}>Нэвтрэх</Text>
        </Pressable>
        <Pressable style={[styles.segmentButton, mode === "register" && styles.segmentButtonActive]} onPress={() => setMode("register")}>
          <Text style={[styles.segmentText, mode === "register" && styles.segmentTextActive]}>Бүртгүүлэх</Text>
        </Pressable>
      </View>

      {mode === "register" && (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Нэр</Text>
          <TextInput value={fullName} onChangeText={setFullName} placeholder="Бүтэн нэр" placeholderTextColor="#9a9a9a" style={styles.fieldInput} />
        </View>
      )}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{mode === "login" ? "Утас эсвэл email" : "Утас"}</Text>
        <TextInput value={identifier} onChangeText={setIdentifier} placeholder="Утас эсвэл email" placeholderTextColor="#9a9a9a" style={styles.fieldInput} />
      </View>
      {mode === "register" && (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="name@example.com" placeholderTextColor="#9a9a9a" style={styles.fieldInput} />
        </View>
      )}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Нууц үг</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Нууц үг" placeholderTextColor="#9a9a9a" style={styles.fieldInput} />
      </View>
      <Pressable style={styles.primaryButton} onPress={submit}>
        <Text style={styles.primaryButtonText}>{mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}</Text>
      </Pressable>

        <View style={styles.profilePanel}>
          <Text style={styles.profilePanelTitle}>Миний хэсэг</Text>
          <Text style={styles.placeholderText}>Миний зар, хадгалсан зар, тохиргоо энд төвлөрнө.</Text>
        </View>
    </ScrollView>
  );
}

export default function App() {
  const [tab, setTab] = React.useState<TabId>("home");
  const [selectedAd, setSelectedAd] = React.useState<PublicAdvertisement | null>(null);
  const [ads, setAds] = React.useState<PublicAdvertisement[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [favoriteIds, setFavoriteIds] = React.useState<Set<number>>(new Set());
  const [session, setSession] = React.useState<AuthSession | undefined>();
  const [myAds, setMyAds] = React.useState<PublicAdvertisement[]>([]);
  const [source, setSource] = React.useState<"api" | "offline">("offline");
  const [notice, setNotice] = React.useState("");
  const [sessionReady, setSessionReady] = React.useState(false);
  const [editingAd, setEditingAd] = React.useState<PublicAdvertisement | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchCategoryId, setSearchCategoryId] = React.useState<number | "all">("all");
  const [searchLocationId, setSearchLocationId] = React.useState<number | "all">("all");
  const [searchSort, setSearchSort] = React.useState<SearchSort>("newest");

  async function loadAppData() {
    setRefreshing(true);

    try {
      const [adsResponse, categoriesResponse, locationsResponse] = await Promise.all([
        adsApi.list("?page=1&size=24"),
        catalogApi.categories(),
        catalogApi.locations(),
      ]);

      setAds(adsResponse.data.items);
      setCategories(categoriesResponse.data);
      setLocations(locationsResponse.data);
      setSource("api");

      if (authToken) {
        try {
          const [favoritesResponse, myAdsResponse] = await Promise.all([favoritesApi.list(), authApi.myAds()]);
          setFavoriteIds(new Set(favoritesResponse.data.map((ad) => ad.adId)));
          setMyAds((myAdsResponse as { data: PublicAdvertisement[] }).data);
        } catch {
          setFavoriteIds(new Set());
          setMyAds([]);
        }
      }
    } catch {
      setSource("offline");
    } finally {
      setRefreshing(false);
    }
  }

  React.useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(SESSION_STORAGE_KEY)
      .then((stored) => {
        if (!alive || !stored) return;
        const parsed = JSON.parse(stored) as AuthSession;
        if (!parsed.token || !parsed.user) return;
        authToken = parsed.token;
        setSession(parsed);
        return authApi.me().catch(() => {
          if (!alive) return;
          applySession(undefined);
          setNotice("Хадгалсан session хүчингүй болсон байна");
        });
      })
      .catch(() => {
        if (!alive) return;
        authToken = undefined;
        setSession(undefined);
      })
      .finally(() => {
        if (alive) {
          setSessionReady(true);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    if (!sessionReady || !session) {
      setFavoriteIds(new Set());
      setMyAds([]);
      return;
    }

    let alive = true;
    Promise.all([favoritesApi.list(), authApi.myAds()])
      .then(([favoritesResponse, myAdsResponse]) => {
        if (!alive) return;
        setFavoriteIds(new Set(favoritesResponse.data.map((ad) => ad.adId)));
        setMyAds((myAdsResponse as { data: PublicAdvertisement[] }).data);
      })
      .catch(() => {
        if (!alive) return;
        setFavoriteIds(new Set());
        setMyAds([]);
      });

    return () => {
      alive = false;
    };
  }, [session, sessionReady]);

  React.useEffect(() => {
    void loadAppData();
  }, []);

  const openAd = (ad: PublicAdvertisement) => setSelectedAd(ad);
  const closeAd = () => setSelectedAd(null);
  const beginCreate = () => {
    setEditingAd(null);
    setTab("create");
  };
  const beginEdit = (ad: PublicAdvertisement) => {
    setEditingAd(ad);
    setTab("create");
  };
  const searchResults = filterAds(ads, {
    query: searchQuery,
    categoryId: searchCategoryId,
    locationId: searchLocationId,
    sort: searchSort,
  });

  function applySession(nextSession: AuthSession | undefined) {
    if (nextSession) {
      authToken = nextSession.token;
      setSession(nextSession);
      void AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
      return;
    }

    authToken = undefined;
    setSession(undefined);
    void AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  }

  async function deleteAd(ad: PublicAdvertisement) {
    if (!session) {
      setNotice("Зар устгахын тулд нэвтэрнэ үү");
      setTab("profile");
      return;
    }

    try {
      await adsApi.remove(ad.adId);
      setAds((current) => current.filter((item) => item.adId !== ad.adId));
      setMyAds((current) => current.filter((item) => item.adId !== ad.adId));
      setFavoriteIds((current) => {
        const next = new Set(current);
        next.delete(ad.adId);
        return next;
      });
      if (selectedAd?.adId === ad.adId) {
        setSelectedAd(null);
      }
      setNotice("Зар устгалаа");
    } catch {
      setNotice("Зар устгах үед backend алдаа гарлаа");
    }
  }

  async function toggleFavorite(ad: PublicAdvertisement) {
    if (!session) {
      setNotice("Favorite ашиглахын тулд нэвтэрнэ үү");
      setTab("profile");
      return;
    }

    const isFavorite = favoriteIds.has(ad.adId);
    const next = new Set(favoriteIds);
    if (isFavorite) {
      next.delete(ad.adId);
    } else {
      next.add(ad.adId);
    }
    setFavoriteIds(next);

    try {
      if (isFavorite) {
        await favoritesApi.remove(ad.adId);
      } else {
        await favoritesApi.add(ad.adId);
      }
      setNotice(isFavorite ? "Favorite устгалаа" : "Favorite нэмлээ");
    } catch {
      setNotice("Favorite хадгаллаа");
    }
  }

  async function reportAd(ad: PublicAdvertisement) {
    if (!session) {
      setNotice("Report илгээхийн тулд нэвтэрнэ үү");
      setTab("profile");
      return;
    }

    try {
      await reportsApi.create({ adId: ad.adId, reason: "OTHER", comment: "Mobile detail view-с илгээсэн report" });
      setNotice("Report хүлээн авлаа");
    } catch {
      setNotice("Report илгээх үед алдаа гарлаа");
    }
  }

  async function saveAd(payload: CreateAdPayload, images?: PickedImage[]) {
    if (!session) {
      setNotice("Зар нийтлэхийн тулд нэвтэрнэ үү");
      setTab("profile");
      return;
    }

    const isEditing = Boolean(editingAd);
    try {
      const selectedLocation = locations.find((location) => location.locationId === payload.locationId) ?? locations[0];
      const response = isEditing
        ? ((await adsApi.update(editingAd!.adId, payload)) as { data: PublicAdvertisement })
        : ((await adsApi.create(payload)) as { data: { adId?: number; status?: PublicAdvertisement["status"] } });
      const savedAd: PublicAdvertisement = isEditing
        ? {
            ...(response as { data: PublicAdvertisement }).data,
            adId: editingAd!.adId,
            title: payload.title,
            description: payload.description,
            price: payload.price,
            status: (response as { data: PublicAdvertisement }).data.status === "SOLD" ? "SOLD" : "ACTIVE",
            categoryId: payload.categoryId,
            locationId: payload.locationId,
            locationName: selectedLocation?.name ?? "",
            sellerName: session.user.fullName,
            contactPhone: payload.contactPhone,
        imageUrl: images?.[0]?.uri ?? editingAd?.imageUrl ?? "",
            viewCount: editingAd?.viewCount ?? 0,
            createdAt: editingAd?.createdAt ?? new Date().toISOString(),
          }
        : {
            adId: (response as { data: { adId?: number } }).data.adId ?? Date.now(),
            title: payload.title,
            description: payload.description,
            price: payload.price,
            status: "ACTIVE",
            categoryId: payload.categoryId,
            locationId: payload.locationId,
            locationName: selectedLocation?.name ?? "",
            sellerName: session.user.fullName,
            contactPhone: payload.contactPhone,
            imageUrl: images?.[0]?.uri ?? "",
            viewCount: 0,
            createdAt: new Date().toISOString(),
          };
      let uploadFailed = false;
      const adId = savedAd.adId;
      if (images && images.length > 0 && adId) {
        const body = new FormData();
        for (const item of images) {
          body.append("files", {
            uri: item.uri,
            name: item.fileName,
            type: item.mimeType,
          } as unknown as Blob);
        }

        try {
          const uploadResponse = (await imagesApi.upload(adId, body)) as { data?: Array<{ imageUrl: string }> };
          const uploadedImageUrl = uploadResponse.data?.[0]?.imageUrl;
          if (uploadedImageUrl) {
            savedAd.imageUrl = uploadedImageUrl;
          }
        } catch {
          uploadFailed = true;
        }
      }
      setAds((current) => {
        const withoutCurrent = current.filter((item) => item.adId !== savedAd.adId);
        return [savedAd, ...withoutCurrent];
      });
      setMyAds((current) => {
        const withoutCurrent = current.filter((item) => item.adId !== savedAd.adId);
        return [savedAd, ...withoutCurrent];
      });
      setEditingAd(null);
      setTab("home");
      setNotice(uploadFailed ? "Зар нийтлэгдсэн, зураг upload дээр алдаа гарлаа" : images && images.length > 0 ? "Зар болон зураг нийтлэгдлээ" : isEditing ? "Зар хадгаллаа" : "Зар нийтэллээ");
    } catch {
      setNotice(isEditing ? "Зар шинэчлэх үед backend алдаа өглөө" : "Зар нэмэх үед backend алдаа өглөө. Талбаруудаа шалгана уу");
    }
  }

  React.useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  let content: React.ReactNode;
  if (selectedAd) {
    content = (
      <DetailScreen
        ad={selectedAd}
        isFavorite={favoriteIds.has(selectedAd.adId)}
        onBack={closeAd}
        toggleFavorite={toggleFavorite}
        reportAd={reportAd}
      />
    );
  } else if (tab === "home") {
    content = <HomeScreen ads={ads} categories={categories} favoriteIds={favoriteIds} openAd={openAd} goSearch={() => setTab("search")} source={source} toggleFavorite={toggleFavorite} refreshing={refreshing} onRefresh={() => void loadAppData()} />;
  } else if (tab === "search") {
    content = (
      <SearchScreen
        ads={searchResults}
        categories={categories}
        locations={locations}
        favoriteIds={favoriteIds}
        openAd={openAd}
        toggleFavorite={toggleFavorite}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        categoryId={searchCategoryId}
        onCategoryChange={setSearchCategoryId}
        locationId={searchLocationId}
        onLocationChange={setSearchLocationId}
        sort={searchSort}
        onSortChange={setSearchSort}
        refreshing={refreshing}
        onRefresh={() => void loadAppData()}
      />
    );
  } else if (tab === "create") {
    content = (
      <CreateScreen
        key={editingAd?.adId ?? "new"}
        categories={categories}
        locations={locations}
        ad={editingAd}
        onSave={(payload, images) => void saveAd(payload, images)}
        onDelete={editingAd ? () => void deleteAd(editingAd) : undefined}
        onCancel={() => {
          setEditingAd(null);
          setTab("profile");
        }}
        onNotice={setNotice}
      />
    );
  } else if (tab === "favorites") {
    content = <FavoritesScreen ads={ads} favoriteIds={favoriteIds} openAd={openAd} toggleFavorite={toggleFavorite} />;
  } else {
    content = (
      <ProfileScreen
        session={session}
        myAds={myAds}
        locations={locations}
        openAd={openAd}
        onEdit={beginEdit}
        onDelete={(ad) => void deleteAd(ad)}
        onAuthenticated={applySession}
        onLogout={() => {
          applySession(undefined);
          setMyAds([]);
          setFavoriteIds(new Set());
          setNotice("Гарлаа");
        }}
        onNotice={setNotice}
      />
    );
  }

  return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.container}>
        <View style={styles.content}>{sessionReady ? content : <View style={styles.loadingState}><Text style={styles.placeholderText}>Сесс сэргээж байна...</Text></View>}</View>
        {!selectedAd && <BottomNav active={tab} onChange={(nextTab) => { if (nextTab === "create") { setEditingAd(null); } setTab(nextTab); }} />}
        {notice ? <Text style={styles.toast}>{notice}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

function BottomNav({ active, onChange }: { active: TabId; onChange: (tab: TabId) => void }) {
  const items: Array<{ id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { id: "home", label: "Нүүр", icon: "home-outline" },
    { id: "search", label: "Хайлт", icon: "search-outline" },
    { id: "create", label: "Нэмэх", icon: "add" },
    { id: "favorites", label: "Хадгалсан", icon: "heart-outline" },
    { id: "profile", label: "Профайл", icon: "person-outline" },
  ];

  return (
    <View style={styles.nav}>
      {items.map((item) => {
        const isActive = active === item.id;
        const isCreate = item.id === "create";
        return (
          <Pressable key={item.id} style={styles.navItem} onPress={() => onChange(item.id)}>
            <View style={isCreate ? styles.createIcon : undefined}>
              <Ionicons name={item.icon} size={isCreate ? 24 : 22} color={isCreate ? theme.colors.surface : isActive ? theme.colors.accent : theme.colors.muted} />
            </View>
            {!isCreate && <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  container: { flex: 1, backgroundColor: theme.colors.surface },
  content: { flex: 1 },
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  scroll: { padding: 20, paddingBottom: 28 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  logo: { fontSize: 26, fontWeight: "900", color: theme.colors.text },
  subtitle: { marginTop: 3, color: theme.colors.muted, fontSize: 13 },
  sourceBadge: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, color: theme.colors.muted, fontSize: 12, fontWeight: "800" },
  iconButton: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" },
  searchBox: { minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14 },
  searchPlaceholder: { color: theme.colors.muted, fontSize: 15 },
  searchInputBox: { borderColor: theme.colors.accent, backgroundColor: theme.colors.surface, marginTop: 12 },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: 15 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: theme.colors.text },
  link: { color: theme.colors.accent, fontWeight: "700" },
  categoryRow: { gap: 10, paddingRight: 20 },
  categoryPill: { width: 104, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, padding: 12, backgroundColor: theme.colors.surface },
  categoryName: { color: theme.colors.text, fontWeight: "800" },
  categoryCount: { marginTop: 4, color: theme.colors.muted, fontSize: 12 },
  featured: { height: 156, borderRadius: 14, overflow: "hidden", backgroundColor: theme.colors.text, marginTop: 22 },
  featuredImage: { width: "100%", height: "100%", opacity: 0.56 },
  featuredFallback: { width: "100%", height: "100%", backgroundColor: theme.colors.surfaceMuted },
  featuredOverlay: { position: "absolute", left: 18, right: 18, bottom: 16 },
  featuredLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  featuredTitle: { color: theme.colors.surface, fontSize: 22, fontWeight: "900", marginTop: 4 },
  featuredPrice: { color: theme.colors.surface, fontSize: 15, fontWeight: "800", marginTop: 4 },
  list: { gap: 14 },
  card: { borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, overflow: "hidden", backgroundColor: theme.colors.surface },
  cardImage: { width: "100%", height: 168, backgroundColor: theme.colors.surfaceMuted },
  cardImageEmpty: { width: "100%", height: 168, backgroundColor: theme.colors.surfaceMuted, alignItems: "center", justifyContent: "center", gap: 6 },
  cardImageEmptyText: { color: theme.colors.muted, fontWeight: "700" },
  favoriteButton: { position: "absolute", right: 10, top: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" },
  cardBody: { padding: 14 },
  location: { color: theme.colors.muted, fontSize: 13 },
  cardTitle: { color: theme.colors.text, fontSize: 17, fontWeight: "800", marginTop: 6 },
  cardDescription: { color: "#666666", lineHeight: 19, marginTop: 5 },
  price: { color: theme.colors.accent, fontSize: 18, fontWeight: "900", marginTop: 10 },
  filterRow: { gap: 8, paddingVertical: 14 },
  filterChip: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  filterChipActive: { backgroundColor: theme.colors.text, borderColor: theme.colors.text },
  filterText: { color: theme.colors.text, fontWeight: "700" },
  filterTextActive: { color: theme.colors.surface },
  detailScroll: { paddingBottom: 28 },
  detailImage: { width: "100%", height: 330, backgroundColor: theme.colors.surfaceMuted },
  detailImageEmpty: { width: "100%", height: 330, backgroundColor: theme.colors.surfaceMuted, alignItems: "center", justifyContent: "center", gap: 8 },
  detailImageEmptyText: { color: theme.colors.muted, fontWeight: "700" },
  backButton: { position: "absolute", top: 18, left: 18, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  detailFavoriteButton: { position: "absolute", top: 18, right: 18, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  detailBody: { padding: 20 },
  detailTitle: { fontSize: 28, fontWeight: "900", color: theme.colors.text, marginTop: 8 },
  detailPrice: { fontSize: 24, fontWeight: "900", color: theme.colors.accent, marginTop: 8 },
  detailDescription: { color: "#333333", lineHeight: 22, marginTop: 16 },
  sellerBox: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 22, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.text, alignItems: "center", justifyContent: "center" },
  avatarText: { color: theme.colors.surface, fontWeight: "900" },
  sellerName: { color: theme.colors.text, fontWeight: "800" },
  detailActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  callButton: { flex: 1, minHeight: 48, backgroundColor: theme.colors.accent, borderRadius: 8, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  callButtonText: { color: theme.colors.surface, fontWeight: "800" },
  secondaryButton: { flex: 1, minHeight: 48, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  secondaryButtonText: { color: theme.colors.text, fontWeight: "800" },
  screenTitle: { fontSize: 26, fontWeight: "900", color: theme.colors.text },
  screenHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  uploadBox: { height: 150, borderRadius: 12, borderWidth: 2, borderStyle: "dashed", borderColor: theme.colors.accent, backgroundColor: theme.colors.accentSoft, alignItems: "center", justifyContent: "center", marginTop: 18, marginBottom: 18 },
  uploadPreview: { width: "100%", height: "100%", borderRadius: 10 },
  uploadText: { color: theme.colors.accent, fontWeight: "800", marginTop: 8 },
  selectedImagesRow: { gap: 8, paddingBottom: 8 },
  selectedImageThumb: { width: 64, height: 64, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: theme.colors.border },
  selectedImage: { width: "100%", height: "100%" },
  field: { marginBottom: 14 },
  fieldLabel: { color: theme.colors.text, fontWeight: "800", marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, backgroundColor: theme.colors.surfaceMuted, paddingHorizontal: 14, minHeight: 48, color: theme.colors.text },
  choiceRow: { gap: 8, paddingVertical: 2, paddingRight: 20 },
  choiceChip: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: theme.colors.surface },
  choiceChipActive: { backgroundColor: theme.colors.text, borderColor: theme.colors.text },
  choiceText: { color: theme.colors.text, fontWeight: "800" },
  choiceTextActive: { color: theme.colors.surface },
  textArea: { minHeight: 110, paddingTop: 12, textAlignVertical: "top" },
  primaryButton: { height: 50, borderRadius: 10, backgroundColor: theme.colors.accent, alignItems: "center", justifyContent: "center", marginTop: 6 },
  primaryButtonText: { color: theme.colors.surface, fontWeight: "900", fontSize: 16 },
  placeholder: { flex: 1, padding: 20, justifyContent: "center" },
  placeholderText: { color: theme.colors.muted, lineHeight: 22, marginTop: 10 },
  emptyState: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, padding: 20, alignItems: "center", marginTop: 18 },
  emptyTitle: { color: theme.colors.text, fontWeight: "900", fontSize: 17, marginTop: 10 },
  segment: { flexDirection: "row", borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, padding: 4, marginTop: 18, marginBottom: 18 },
  segmentButton: { flex: 1, minHeight: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  segmentButtonActive: { backgroundColor: theme.colors.text },
  segmentText: { color: theme.colors.muted, fontWeight: "800" },
  segmentTextActive: { color: theme.colors.surface },
  profilePanel: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, padding: 16, marginTop: 18 },
  profilePanelTitle: { color: theme.colors.text, fontWeight: "900", fontSize: 16, marginBottom: 6 },
  compactList: { gap: 10, marginTop: 8 },
  myAdRow: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, overflow: "hidden", backgroundColor: theme.colors.surface },
  myAdMain: { minHeight: 70, padding: 8, flexDirection: "row", alignItems: "center", gap: 10 },
  myAdThumb: { width: 54, height: 54, borderRadius: 6, backgroundColor: theme.colors.surfaceMuted },
  myAdThumbEmpty: { width: 54, height: 54, borderRadius: 6, backgroundColor: theme.colors.surfaceMuted, alignItems: "center", justifyContent: "center" },
  myAdTitle: { color: theme.colors.text, fontWeight: "900", marginBottom: 4 },
  myAdActions: { flexDirection: "row", gap: 8, padding: 8, paddingTop: 0 },
  myAdActionButton: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface },
  myAdDeleteButton: { borderColor: theme.colors.accentSoft, backgroundColor: theme.colors.accentSoft },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, padding: 16, marginTop: 18 },
  avatarLarge: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.text, alignItems: "center", justifyContent: "center" },
  profileName: { color: theme.colors.text, fontWeight: "900", fontSize: 18, marginBottom: 4 },
  secondaryFullButton: { height: 48, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 14 },
  toast: { position: "absolute", left: 20, right: 20, bottom: 88, backgroundColor: theme.colors.text, color: theme.colors.surface, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 12, textAlign: "center", fontWeight: "800", overflow: "hidden" },
  nav: { height: 72, borderTopWidth: 1, borderTopColor: theme.colors.border, flexDirection: "row", backgroundColor: theme.colors.surface },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  navLabel: { color: theme.colors.muted, fontSize: 11, fontWeight: "700" },
  navLabelActive: { color: theme.colors.accent },
  createIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.accent, alignItems: "center", justifyContent: "center" },
});




