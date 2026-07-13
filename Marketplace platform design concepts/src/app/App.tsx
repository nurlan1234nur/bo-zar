import React, { useState } from "react";
import {
  Search, Heart, MessageCircle, Plus, Home, LayoutGrid, User,
  ArrowLeft, Star, MapPin, Share2, Bell, Send, Camera,
  SlidersHorizontal, MoreHorizontal, TrendingUp, ImagePlus,
  ChevronDown, X, Check, Package, Sparkles
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type ThemeId = "arc" | "verdure" | "nox";
type ScreenId = "home" | "categories" | "search" | "product" | "profile" | "favorites" | "chat" | "listing";

interface Th {
  id: ThemeId; name: string; sub: string;
  bg: string; bg2: string; fg: string; fg2: string;
  acc: string; accL: string; accFg: string;
  bdr: string; r: number; rSm: number; rLg: number;
  disp: string; body: string;
  priceC: string; tagBg: string; navBg: string;
  pillA: string; pillAFg: string;
}

/* ─── Themes ─────────────────────────────────────────────────────────────────── */
const THEMES: Record<ThemeId, Th> = {
  arc: {
    id: "arc", name: "Arc", sub: "Swiss Precision",
    bg: "#FFFFFF", bg2: "#F3F3F3",
    fg: "#111111", fg2: "#787878",
    acc: "#FF4422", accL: "#FFF1EE", accFg: "#FFFFFF",
    bdr: "#E6E6E6", r: 4, rSm: 3, rLg: 8,
    disp: "'Epilogue', system-ui, sans-serif",
    body: "'DM Sans', system-ui, sans-serif",
    priceC: "#FF4422", tagBg: "#EFEFEF",
    navBg: "#FFFFFF", pillA: "#111111", pillAFg: "#FFFFFF",
  },
  verdure: {
    id: "verdure", name: "Verdure", sub: "Warm Editorial",
    bg: "#FAF7F2", bg2: "#F0EAE0",
    fg: "#1B2D1B", fg2: "#7A6E58",
    acc: "#B8732A", accL: "#FDF3E7", accFg: "#FFFFFF",
    bdr: "#E4DACE", r: 14, rSm: 8, rLg: 20,
    disp: "'Playfair Display', Georgia, serif",
    body: "'DM Sans', system-ui, sans-serif",
    priceC: "#1B2D1B", tagBg: "#EEEADF",
    navBg: "#FAF7F2", pillA: "#1B2D1B", pillAFg: "#FFFFFF",
  },
  nox: {
    id: "nox", name: "Nox", sub: "Dark Premium",
    bg: "#09090E", bg2: "#111119",
    fg: "#FFFFFF", fg2: "#8888AB",
    acc: "#8B5CF6", accL: "#190F30", accFg: "#FFFFFF",
    bdr: "#1D1D2B", r: 18, rSm: 10, rLg: 24,
    disp: "'Epilogue', system-ui, sans-serif",
    body: "'DM Sans', system-ui, sans-serif",
    priceC: "#A78BFA", tagBg: "#1D1D2B",
    navBg: "#0C0C14", pillA: "#8B5CF6", pillAFg: "#FFFFFF",
  },
};

/* ─── Static data ────────────────────────────────────────────────────────────── */
const LISTINGS = [
  { id: 1, title: "Vintage Leather Jacket", price: 120, brand: "Levi's", size: "M", condition: "Good",
    img: "photo-1551028719-00167b16eac5", seller: "Maya K.", sellerAvatar: "photo-1494790108755-2616b612b5c5",
    location: "Brooklyn, NY", likes: 47, rating: 4.9 },
  { id: 2, title: "Sony WH-1000XM5", price: 189, brand: "Sony", size: "One Size", condition: "Like New",
    img: "photo-1505740420928-5e560c06d30e", seller: "Alex T.", sellerAvatar: "photo-1535713875002-d1d0cf377fde",
    location: "Austin, TX", likes: 32, rating: 4.8 },
  { id: 3, title: "Ceramic Planter Set", price: 45, brand: "Handmade", size: "3-piece", condition: "New",
    img: "photo-1485955900006-10f4d324d411", seller: "Priya M.", sellerAvatar: "photo-1438761681033-6461ffad8d80",
    location: "Portland, OR", likes: 28, rating: 5.0 },
  { id: 4, title: "Air Jordan 1 Chicago", price: 380, brand: "Nike", size: "US 10", condition: "Deadstock",
    img: "photo-1542291026-7eec264c27ff", seller: "Jordan L.", sellerAvatar: "photo-1527980965255-d3b416303d12",
    location: "Chicago, IL", likes: 124, rating: 4.7 },
  { id: 5, title: "Linen Overshirt", price: 65, brand: "Acne Studios", size: "L", condition: "Good",
    img: "photo-1594938298603-c8148c4bfa02", seller: "Sophie R.", sellerAvatar: "photo-1544005313-94ddf0286df2",
    location: "London, UK", likes: 19, rating: 4.6 },
  { id: 6, title: "Rolex Explorer II", price: 8400, brand: "Rolex", size: "42mm", condition: "Excellent",
    img: "photo-1523275335684-37898b6baf30", seller: "Henrik J.", sellerAvatar: "photo-1472099645785-5658abf4ff4e",
    location: "Geneva, CH", likes: 203, rating: 5.0 },
];

const CATEGORIES = [
  { id: 1, name: "Fashion", count: "48k", img: "photo-1445205170230-053b83016050" },
  { id: 2, name: "Electronics", count: "23k", img: "photo-1498049794561-7780e7231661" },
  { id: 3, name: "Home & Garden", count: "31k", img: "photo-1555041469-a586c61ea9bc" },
  { id: 4, name: "Sports", count: "17k", img: "photo-1461896836934-ffe607ba8211" },
  { id: 5, name: "Art & Crafts", count: "12k", img: "photo-1513364776144-60967b0f800f" },
  { id: 6, name: "Books", count: "29k", img: "photo-1512820790803-83ca734da794" },
  { id: 7, name: "Collectibles", count: "8k", img: "photo-1558618666-fcd25c85cd64" },
  { id: 8, name: "Vehicles", count: "4k", img: "photo-1492144534655-ae79c964c9d7" },
];

const MESSAGES = [
  { id: 1, user: "Jordan L.", avatar: "photo-1527980965255-d3b416303d12", preview: "Is the jacket still available?", time: "2m", unread: 2, item: "Vintage Leather Jacket" },
  { id: 2, user: "Sophie R.", avatar: "photo-1544005313-94ddf0286df2", preview: "Can you do $170 for the headphones?", time: "1h", unread: 0, item: "Sony WH-1000XM5" },
  { id: 3, user: "Alex T.", avatar: "photo-1535713875002-d1d0cf377fde", preview: "Thanks! Payment sent ✓", time: "3h", unread: 0, item: "Air Jordan 1 Chicago" },
  { id: 4, user: "Priya M.", avatar: "photo-1438761681033-6461ffad8d80", preview: "What's the waist measurement?", time: "1d", unread: 0, item: "Linen Overshirt" },
];

const NAV_SCREENS: { id: ScreenId; label: string; Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }> }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "categories", label: "Categories", Icon: LayoutGrid },
  { id: "search", label: "Search", Icon: Search },
  { id: "product", label: "Product", Icon: Package },
  { id: "profile", label: "Profile", Icon: User },
  { id: "favorites", label: "Favorites", Icon: Heart },
  { id: "chat", label: "Chat", Icon: MessageCircle },
  { id: "listing", label: "New Listing", Icon: Plus },
];

/* ─── Shared atoms ───────────────────────────────────────────────────────────── */
function Av({ src, size = 36, t }: { src: string; size?: number; t: Th }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", flexShrink: 0, border: `1.5px solid ${t.bdr}`, background: t.bg2 }}>
      <img src={`https://images.unsplash.com/${src}?w=${size * 2}&h=${size * 2}&fit=crop&auto=format`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
}

function ListingCard({ l, t, onPress }: { l: typeof LISTINGS[0]; t: Th; onPress?: () => void }) {
  const [liked, setLiked] = useState(false);
  return (
    <div onClick={onPress} style={{ background: t.bg, borderRadius: t.r + 2, overflow: "hidden", border: `1px solid ${t.bdr}`, cursor: onPress ? "pointer" : "default" }}>
      <div style={{ position: "relative", paddingBottom: "100%", background: t.bg2 }}>
        <img src={`https://images.unsplash.com/${l.img}?w=400&h=400&fit=crop&auto=format`} alt={l.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }} style={{ position: "absolute", top: 7, right: 7, width: 30, height: 30, borderRadius: 15, background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart size={13} fill={liked ? "#FF4422" : "none"} color={liked ? "#FF4422" : "#333"} />
        </button>
        <div style={{ position: "absolute", bottom: 7, left: 7, background: t.bg, borderRadius: t.rSm, padding: "2px 7px", fontSize: 9, fontWeight: 700, color: t.fg }}>
          {l.condition}
        </div>
      </div>
      <div style={{ padding: "9px 10px", fontFamily: t.body }}>
        <div style={{ fontSize: 10, color: t.fg2, marginBottom: 2 }}>{l.brand}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: t.fg, lineHeight: 1.3, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: t.priceC, fontFamily: t.disp }}>${l.price.toLocaleString()}</div>
      </div>
    </div>
  );
}

/* ─── Screen: Home ───────────────────────────────────────────────────────────── */
function HomeScreen({ t, go }: { t: Th; go: (s: ScreenId) => void }) {
  const catImgs = ["photo-1445205170230-053b83016050","photo-1498049794561-7780e7231661","photo-1555041469-a586c61ea9bc","photo-1461896836934-ffe607ba8211","photo-1513364776144-60967b0f800f","photo-1512820790803-83ca734da794"];
  const catLabels = ["Fashion", "Tech", "Home", "Sports", "Art", "Books"];
  return (
    <div style={{ fontFamily: t.body, background: t.bg, minHeight: "100%" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: t.disp, fontSize: 26, fontWeight: 900, color: t.fg, letterSpacing: "-0.5px" }}>avra</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative", cursor: "pointer" }}>
            <Bell size={22} color={t.fg} />
            <div style={{ position: "absolute", top: -1, right: -1, width: 8, height: 8, background: t.acc, borderRadius: 4, border: `2px solid ${t.bg}` }} />
          </div>
          <Av src="photo-1494790108755-2616b612b5c5" size={32} t={t} />
        </div>
      </div>
      <div style={{ padding: "12px 20px 0" }}>
        <div onClick={() => go("search")} style={{ display: "flex", alignItems: "center", gap: 10, background: t.bg2, borderRadius: t.r + 4, padding: "11px 16px", border: `1px solid ${t.bdr}`, cursor: "pointer" }}>
          <Search size={15} color={t.fg2} />
          <span style={{ fontSize: 14, color: t.fg2 }}>Search for anything...</span>
        </div>
      </div>
      <div style={{ paddingTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 20px 10px", alignItems: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: t.fg, fontFamily: t.disp }}>Categories</span>
          <span onClick={() => go("categories")} style={{ fontSize: 12, color: t.acc, fontWeight: 600, cursor: "pointer" }}>See all</span>
        </div>
        <div style={{ display: "flex", gap: 12, paddingLeft: 20, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
          {catLabels.map((label, i) => (
            <div key={label} onClick={() => go("categories")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
              <div style={{ width: 54, height: 54, borderRadius: t.r + 12, overflow: "hidden", border: `2px solid ${i === 0 ? t.acc : t.bdr}` }}>
                <img src={`https://images.unsplash.com/${catImgs[i]}?w=108&h=108&fit=crop&auto=format`} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span style={{ fontSize: 10, color: i === 0 ? t.acc : t.fg, fontWeight: i === 0 ? 700 : 500 }}>{label}</span>
            </div>
          ))}
          <div style={{ width: 4, flexShrink: 0 }} />
        </div>
      </div>
      <div style={{ padding: "14px 20px 0" }}>
        <div onClick={() => go("product")} style={{ borderRadius: t.rLg, overflow: "hidden", position: "relative", height: 152, background: t.acc, cursor: "pointer" }}>
          <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&h=304&fit=crop&auto=format" alt="featured" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }} />
          <div style={{ position: "absolute", inset: 0, padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Featured Drop</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#FFF", fontFamily: t.disp, lineHeight: 1.1 }}>Rolex Explorer II</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", fontWeight: 700, marginTop: 4 }}>$8,400 · Geneva</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: t.fg, fontFamily: t.disp }}>Trending Now</span>
          <span style={{ fontSize: 12, color: t.acc, fontWeight: 600, cursor: "pointer" }}>See all</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {LISTINGS.slice(0, 4).map(l => <ListingCard key={l.id} l={l} t={t} onPress={() => go("product")} />)}
        </div>
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}

/* ─── Screen: Categories ─────────────────────────────────────────────────────── */
function CategoriesScreen({ t }: { t: Th }) {
  return (
    <div style={{ fontFamily: t.body, background: t.bg, minHeight: "100%" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ fontFamily: t.disp, fontSize: 22, fontWeight: 800, color: t.fg, marginBottom: 14 }}>Browse</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: t.bg2, borderRadius: t.r + 4, padding: "11px 16px", border: `1px solid ${t.bdr}`, marginBottom: 18 }}>
          <Search size={15} color={t.fg2} /><span style={{ fontSize: 14, color: t.fg2 }}>Find categories...</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {CATEGORIES.map((cat, i) => (
            <div key={cat.id} style={{ ...(i === 0 ? { gridColumn: "1 / -1" } : {}), borderRadius: t.rLg, overflow: "hidden", position: "relative", height: i === 0 ? 162 : 112, background: t.bg2, cursor: "pointer" }}>
              <img src={`https://images.unsplash.com/${cat.img}?w=${i === 0 ? 700 : 380}&h=${i === 0 ? 324 : 224}&fit=crop&auto=format`} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
              <div style={{ position: "absolute", bottom: 12, left: 14 }}>
                <div style={{ fontSize: i === 0 ? 18 : 14, fontWeight: 800, color: "#FFF", fontFamily: t.disp }}>{cat.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>{cat.count} items</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}

/* ─── Screen: Search ─────────────────────────────────────────────────────────── */
function SearchScreen({ t, go }: { t: Th; go: (s: ScreenId) => void }) {
  const [activeF, setActiveF] = useState("All");
  const filters = ["All", "Fashion", "Size M", "Under $200", "New"];
  return (
    <div style={{ fontFamily: t.body, background: t.bg, minHeight: "100%" }}>
      <div style={{ padding: "14px 20px 10px", background: t.navBg, borderBottom: `1px solid ${t.bdr}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: t.bg2, borderRadius: t.r + 4, padding: "11px 16px", border: `1.5px solid ${t.acc}`, marginBottom: 10 }}>
          <Search size={15} color={t.acc} />
          <span style={{ fontSize: 14, color: t.fg, fontWeight: 500, flex: 1 }}>vintage leather jacket</span>
          <X size={13} color={t.fg2} style={{ cursor: "pointer" }} />
        </div>
        <div style={{ display: "flex", gap: 7, overflowX: "auto", scrollbarWidth: "none" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setActiveF(f)} style={{ padding: "5px 13px", borderRadius: 20, flexShrink: 0, background: activeF === f ? t.pillA : t.bg2, color: activeF === f ? t.pillAFg : t.fg, border: `1px solid ${activeF === f ? "transparent" : t.bdr}`, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: t.body }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: t.fg2 }}>124 results</span>
          <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: t.fg, fontFamily: t.body }}>
            <SlidersHorizontal size={13} color={t.fg} /> Filter
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {LISTINGS.map(l => <ListingCard key={l.id} l={l} t={t} onPress={() => go("product")} />)}
        </div>
      </div>
    </div>
  );
}

/* ─── Screen: Product Detail ─────────────────────────────────────────────────── */
function ProductScreen({ t, go }: { t: Th; go: (s: ScreenId) => void }) {
  const [liked, setLiked] = useState(false);
  const l = LISTINGS[0];
  return (
    <div style={{ fontFamily: t.body, background: t.bg, minHeight: "100%" }}>
      <div style={{ position: "relative", height: 320, background: t.bg2 }}>
        <img src={`https://images.unsplash.com/${l.img}?w=780&h=640&fit=crop&auto=format`} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <button onClick={() => go("search")} style={{ position: "absolute", top: 14, left: 14, width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={17} color="#111" />
        </button>
        <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 8 }}>
          <button onClick={() => setLiked(!liked)} style={{ width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={17} fill={liked ? "#FF4422" : "none"} color={liked ? "#FF4422" : "#111"} />
          </button>
          <button style={{ width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Share2 size={17} color="#111" />
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ width: i === 0 ? 18 : 6, height: 6, borderRadius: 3, background: i === 0 ? t.acc : "rgba(255,255,255,0.55)" }} />)}
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{ fontSize: 11, color: t.fg2, fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>{l.brand} · Size {l.size}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.fg, fontFamily: t.disp, lineHeight: 1.2 }}>{l.title}</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: t.priceC, fontFamily: t.disp, flexShrink: 0 }}>${l.price}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 16 }}>
          {[l.condition, "Vintage", "90s Style", "Leather"].map(tag => (
            <span key={tag} style={{ padding: "4px 10px", borderRadius: t.rSm, background: t.tagBg, fontSize: 11, fontWeight: 600, color: t.fg }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: t.bg2, borderRadius: t.r + 4, marginBottom: 14, border: `1px solid ${t.bdr}` }}>
          <Av src={l.sellerAvatar} size={42} t={t} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.fg }}>{l.seller}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: t.fg2, marginTop: 2 }}>
              <Star size={11} fill={t.acc} color={t.acc} />
              <span>{l.rating}</span><span>· 47 sales</span>
            </div>
          </div>
          <button style={{ padding: "6px 14px", borderRadius: t.r, border: `1.5px solid ${t.fg}`, background: "transparent", fontSize: 12, fontWeight: 700, color: t.fg, cursor: "pointer", fontFamily: t.body }}>
            Follow
          </button>
        </div>
        <div style={{ fontSize: 13, color: t.fg2, lineHeight: 1.65, marginBottom: 14 }}>
          Authentic Levi's Type III Trucker from the early 90s. Minor scuff on left cuff, otherwise in great condition. All snap buttons intact, original lining in place.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: t.fg2, marginBottom: 20 }}>
          <MapPin size={13} color={t.acc} />{l.location} · Listed 3 days ago
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button onClick={() => go("chat")} style={{ padding: "14px", borderRadius: t.r, background: t.bg2, border: `1.5px solid ${t.bdr}`, fontSize: 14, fontWeight: 700, color: t.fg, cursor: "pointer", fontFamily: t.body }}>
            Make Offer
          </button>
          <button style={{ padding: "14px", borderRadius: t.r, background: t.acc, border: "none", fontSize: 14, fontWeight: 700, color: t.accFg, cursor: "pointer", fontFamily: t.body }}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Screen: Profile ────────────────────────────────────────────────────────── */
function ProfileScreen({ t }: { t: Th }) {
  const [tab, setTab] = useState<"listed" | "sold" | "reviews">("listed");
  return (
    <div style={{ fontFamily: t.body, background: t.bg, minHeight: "100%" }}>
      <div style={{ height: 118, background: t.acc, position: "relative", overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=780&h=236&fit=crop&auto=format" alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
      </div>
      <div style={{ padding: "0 20px", marginTop: -28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <div style={{ width: 68, height: 68, borderRadius: 34, overflow: "hidden", border: `3px solid ${t.bg}` }}>
            <img src="https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=136&h=136&fit=crop&auto=format" alt="user" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <button style={{ padding: "8px 18px", borderRadius: t.r, border: `1.5px solid ${t.bdr}`, background: t.bg, fontSize: 12, fontWeight: 700, color: t.fg, cursor: "pointer", fontFamily: t.body, marginBottom: 4 }}>
            Edit Profile
          </button>
        </div>
        <div style={{ fontSize: 19, fontWeight: 800, color: t.fg, fontFamily: t.disp }}>Maya Kim</div>
        <div style={{ fontSize: 13, color: t.fg2, marginBottom: 14 }}>@mayakim · Brooklyn, NY</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: `1px solid ${t.bdr}`, borderBottom: `1px solid ${t.bdr}`, padding: "14px 0" }}>
          {[["47", "Listings"], ["203", "Sales"], ["4.9★", "Rating"]].map(([val, label], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: t.fg, fontFamily: t.disp }}>{val}</div>
              <div style={{ fontSize: 11, color: t.fg2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", borderBottom: `1px solid ${t.bdr}` }}>
        {(["listed", "sold", "reviews"] as const).map(tabId => (
          <button key={tabId} onClick={() => setTab(tabId)} style={{ flex: 1, padding: "12px", background: "none", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", color: tab === tabId ? t.acc : t.fg2, borderBottom: `2px solid ${tab === tabId ? t.acc : "transparent"}`, fontFamily: t.body, textTransform: "capitalize" as const }}>
            {tabId}
          </button>
        ))}
      </div>
      <div style={{ padding: "12px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          {LISTINGS.map(l => (
            <div key={l.id} style={{ borderRadius: t.rSm, overflow: "hidden", aspectRatio: "1", background: t.bg2 }}>
              <img src={`https://images.unsplash.com/${l.img}?w=200&h=200&fit=crop&auto=format`} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Screen: Favorites ──────────────────────────────────────────────────────── */
function FavoritesScreen({ t, go }: { t: Th; go: (s: ScreenId) => void }) {
  const [col, setCol] = useState("All");
  const collections = ["All", "Shoes", "Jackets", "Ceramics", "Watches"];
  return (
    <div style={{ fontFamily: t.body, background: t.bg, minHeight: "100%" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ fontFamily: t.disp, fontSize: 22, fontWeight: 800, color: t.fg, marginBottom: 16 }}>Saved</div>
        <div style={{ display: "flex", gap: 7, marginBottom: 16, overflowX: "auto", scrollbarWidth: "none" }}>
          {collections.map(c => (
            <button key={c} onClick={() => setCol(c)} style={{ padding: "5px 14px", borderRadius: 20, flexShrink: 0, background: col === c ? t.pillA : t.bg2, color: col === c ? t.pillAFg : t.fg, border: `1px solid ${col === c ? "transparent" : t.bdr}`, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: t.body }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: t.accL, borderRadius: t.r + 4, marginBottom: 14, border: `1px solid ${t.acc}22` }}>
          <TrendingUp size={15} color={t.acc} />
          <span style={{ fontSize: 12, color: t.fg }}>Price drop on <strong>2 saved items</strong></span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {LISTINGS.map((l, i) => (
            <div key={l.id} style={{ position: "relative" }}>
              <ListingCard l={l} t={t} onPress={() => go("product")} />
              {i < 2 && (
                <div style={{ position: "absolute", top: 7, left: 7, background: t.acc, borderRadius: t.rSm, padding: "2px 7px", fontSize: 9, fontWeight: 700, color: t.accFg }}>
                  ↓${i === 0 ? 20 : 30}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}

/* ─── Screen: Chat ───────────────────────────────────────────────────────────── */
function ChatScreen({ t }: { t: Th }) {
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const chatMsgs = [
    { mine: false, text: "Hey! Is the jacket still available?", time: "2:30 PM" },
    { mine: true, text: "Yes it is! Just washed, ready to go 👌", time: "2:32 PM" },
    { mine: false, text: "Could you do $100? Can pick up today", time: "2:34 PM" },
    { mine: true, text: "Best I can do is $110 — it's in great condition", time: "2:35 PM" },
    { mine: false, text: "Deal! I'll come by tomorrow morning?", time: "2:38 PM" },
  ];
  if (activeConv !== null) {
    const conv = MESSAGES[activeConv];
    return (
      <div style={{ fontFamily: t.body, background: t.bg, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${t.bdr}`, background: t.navBg, flexShrink: 0 }}>
          <button onClick={() => setActiveConv(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <ArrowLeft size={20} color={t.fg} />
          </button>
          <Av src={conv.avatar} size={36} t={t} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.fg }}>{conv.user}</div>
            <div style={{ fontSize: 11, color: t.fg2 }}>re: {conv.item}</div>
          </div>
          <MoreHorizontal size={20} color={t.fg2} />
        </div>
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", scrollbarWidth: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: t.bg2, borderRadius: t.r + 4, border: `1px solid ${t.bdr}` }}>
            <div style={{ width: 44, height: 44, borderRadius: t.rSm, overflow: "hidden" }}>
              <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=88&h=88&fit=crop&auto=format" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.fg }}>Vintage Leather Jacket</div>
              <div style={{ fontSize: 12, color: t.priceC, fontWeight: 700 }}>$120</div>
            </div>
            <div style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: t.rSm, background: t.tagBg, fontSize: 11, fontWeight: 600, color: t.fg }}>
              Available
            </div>
          </div>
          {chatMsgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.mine ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "74%", padding: "10px 14px", borderRadius: m.mine ? `${t.rLg}px ${t.rLg}px 6px ${t.rLg}px` : `${t.rLg}px ${t.rLg}px ${t.rLg}px 6px`, background: m.mine ? t.acc : t.bg2, color: m.mine ? t.accFg : t.fg, fontSize: 13, lineHeight: 1.5 }}>
                {m.text}
                <div style={{ fontSize: 10, color: m.mine ? "rgba(255,255,255,0.55)" : t.fg2, marginTop: 3, textAlign: "right" as const }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${t.bdr}`, background: t.navBg, display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: t.bg2, borderRadius: 24, padding: "9px 16px", border: `1px solid ${t.bdr}` }}>
            <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Message..." style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: t.fg, fontFamily: t.body }} />
          </div>
          <button style={{ width: 38, height: 38, borderRadius: 19, background: t.acc, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Send size={15} color={t.accFg} />
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ fontFamily: t.body, background: t.bg, minHeight: "100%" }}>
      <div style={{ padding: "14px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${t.bdr}` }}>
        <div style={{ fontFamily: t.disp, fontSize: 22, fontWeight: 800, color: t.fg }}>Messages</div>
        <MessageCircle size={20} color={t.fg2} />
      </div>
      {MESSAGES.map((conv, i) => (
        <div key={conv.id} onClick={() => setActiveConv(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", borderBottom: `1px solid ${t.bdr}`, background: conv.unread > 0 ? t.bg2 : t.bg, cursor: "pointer" }}>
          <div style={{ position: "relative" }}>
            <Av src={conv.avatar} size={44} t={t} />
            {conv.unread > 0 && (
              <div style={{ position: "absolute", top: -2, right: -2, width: 17, height: 17, borderRadius: 9, background: t.acc, color: t.accFg, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${t.bg}` }}>
                {conv.unread}
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.fg }}>{conv.user}</span>
              <span style={{ fontSize: 11, color: t.fg2 }}>{conv.time}</span>
            </div>
            <div style={{ fontSize: 12, color: t.fg2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{conv.preview}</div>
            <div style={{ fontSize: 11, color: t.acc, fontWeight: 600, marginTop: 2 }}>{conv.item}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Screen: New Listing ────────────────────────────────────────────────────── */
function ListingScreen({ t }: { t: Th }) {
  const [step, setStep] = useState(1);
  const [vals, setVals] = useState({ title: "", price: "", desc: "" });
  const s = (k: keyof typeof vals) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setVals(v => ({ ...v, [k]: e.target.value }));
  const inp = { width: "100%", padding: "11px 14px", borderRadius: t.r, border: `1.5px solid ${t.bdr}`, background: t.bg2, fontSize: 14, color: t.fg, fontFamily: t.body, outline: "none", boxSizing: "border-box" as const };
  return (
    <div style={{ fontFamily: t.body, background: t.bg, minHeight: "100%" }}>
      <div style={{ padding: "14px 20px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${t.bdr}` }}>
        <div style={{ fontFamily: t.disp, fontSize: 18, fontWeight: 800, color: t.fg }}>New Listing</div>
        <div style={{ fontSize: 10, color: t.fg2, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const }}>Step {step}/3</div>
      </div>
      <div style={{ display: "flex", gap: 4, padding: "12px 20px 0" }}>
        {[1,2,3].map(n => <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= step ? t.acc : t.bg2, transition: "background 0.3s" }} />)}
      </div>
      {step === 1 && (
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.fg, fontFamily: t.disp, marginBottom: 14 }}>Add photos</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8, height: 188, marginBottom: 20 }}>
            <div style={{ gridRow: "1 / -1", background: t.bg2, borderRadius: t.r + 4, border: `2px dashed ${t.acc}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: t.accL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Camera size={20} color={t.acc} />
              </div>
              <span style={{ fontSize: 11, color: t.acc, fontWeight: 700 }}>Main Photo</span>
            </div>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ background: t.bg2, borderRadius: t.rSm, border: `1.5px dashed ${t.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <ImagePlus size={15} color={t.fg2} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: t.fg, marginBottom: 6 }}>Title</div><input value={vals.title} onChange={s("title")} placeholder="e.g. Vintage Levi's Jacket" style={inp} /></div>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: t.fg, marginBottom: 6 }}>Price</div><input value={vals.price} onChange={s("price")} placeholder="$0.00" style={inp} /></div>
            {["Category", "Condition"].map(label => (
              <div key={label}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.fg, marginBottom: 6 }}>{label}</div>
                <div style={{ ...inp, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <span style={{ color: t.fg2 }}>Select {label.toLowerCase()}</span>
                  <ChevronDown size={15} color={t.fg2} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(2)} style={{ width: "100%", marginTop: 22, padding: "14px", borderRadius: t.r, background: t.acc, border: "none", fontSize: 14, fontWeight: 700, color: t.accFg, cursor: "pointer", fontFamily: t.body }}>Continue →</button>
        </div>
      )}
      {step === 2 && (
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.fg, fontFamily: t.disp, marginBottom: 14 }}>Item details</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {["Brand", "Size", "Color", "Material"].map(label => (
              <div key={label}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.fg, marginBottom: 6 }}>{label}</div>
                <div style={{ ...inp, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <span style={{ color: t.fg2 }}>Select {label.toLowerCase()}</span>
                  <ChevronDown size={15} color={t.fg2} />
                </div>
              </div>
            ))}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.fg, marginBottom: 6 }}>Description</div>
              <textarea value={vals.desc} onChange={s("desc")} placeholder="Describe condition, fit, history..." rows={4} style={{ ...inp, resize: "none" as const }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 22 }}>
            <button onClick={() => setStep(1)} style={{ padding: "14px", borderRadius: t.r, background: t.bg2, border: `1.5px solid ${t.bdr}`, fontSize: 14, fontWeight: 700, color: t.fg, cursor: "pointer", fontFamily: t.body }}>← Back</button>
            <button onClick={() => setStep(3)} style={{ padding: "14px", borderRadius: t.r, background: t.acc, border: "none", fontSize: 14, fontWeight: 700, color: t.accFg, cursor: "pointer", fontFamily: t.body }}>Continue →</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.fg, fontFamily: t.disp, marginBottom: 14 }}>Preview & publish</div>
          <div style={{ background: t.bg2, borderRadius: t.rLg, overflow: "hidden", border: `1px solid ${t.bdr}`, marginBottom: 18 }}>
            <div style={{ height: 150, background: t.bdr, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={28} color={t.fg2} />
            </div>
            <div style={{ padding: "14px" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: t.fg, fontFamily: t.disp }}>Vintage Levi's Jacket</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: t.priceC, fontFamily: t.disp, marginTop: 4 }}>$120</div>
              <div style={{ fontSize: 12, color: t.fg2, marginTop: 4 }}>Fashion · Size M · Good condition</div>
            </div>
          </div>
          {["Photos added (4)", "Title & price set", "Description written", "Category: Fashion"].map(item => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${t.bdr}` }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: t.acc, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check size={11} color={t.accFg} />
              </div>
              <span style={{ fontSize: 13, color: t.fg }}>{item}</span>
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 22 }}>
            <button onClick={() => setStep(2)} style={{ padding: "14px", borderRadius: t.r, background: t.bg2, border: `1.5px solid ${t.bdr}`, fontSize: 14, fontWeight: 700, color: t.fg, cursor: "pointer", fontFamily: t.body }}>← Back</button>
            <button onClick={() => setStep(1)} style={{ padding: "14px", borderRadius: t.r, background: t.acc, border: "none", fontSize: 14, fontWeight: 700, color: t.accFg, cursor: "pointer", fontFamily: t.body }}>
              Publish ↗
            </button>
          </div>
        </div>
      )}
      <div style={{ height: 20 }} />
    </div>
  );
}

/* ─── Phone chrome ───────────────────────────────────────────────────────────── */
function BottomNav({ t, screen, go }: { t: Th; screen: ScreenId; go: (s: ScreenId) => void }) {
  const items: { id: ScreenId; label: string; Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }> }[] = [
    { id: "home", label: "Home", Icon: Home },
    { id: "categories", label: "Browse", Icon: LayoutGrid },
    { id: "listing", label: "Sell", Icon: Plus },
    { id: "chat", label: "Messages", Icon: MessageCircle },
    { id: "profile", label: "Profile", Icon: User },
  ];
  const activeId = (id: ScreenId) => screen === id || (id === "home" && ["search","product","favorites"].includes(screen));
  return (
    <div style={{ display: "flex", background: t.navBg, borderTop: `1px solid ${t.bdr}`, padding: "0 4px", flexShrink: 0 }}>
      {items.map(({ id, label, Icon }) => {
        const active = activeId(id);
        const isSell = id === "listing";
        return (
          <button key={id} onClick={() => go(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: isSell ? "5px 0" : "8px 0 6px", background: "none", border: "none", cursor: "pointer" }}>
            {isSell ? (
              <div style={{ width: 40, height: 40, borderRadius: t.r + 8, background: t.acc, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={20} color={t.accFg} />
              </div>
            ) : (
              <>
                <Icon size={22} color={active ? t.acc : t.fg2} strokeWidth={active ? 2.5 : 1.75} />
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? t.acc : t.fg2, fontFamily: t.body }}>{label}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ScreenContent({ t, screen, go }: { t: Th; screen: ScreenId; go: (s: ScreenId) => void }) {
  switch (screen) {
    case "home": return <HomeScreen t={t} go={go} />;
    case "categories": return <CategoriesScreen t={t} />;
    case "search": return <SearchScreen t={t} go={go} />;
    case "product": return <ProductScreen t={t} go={go} />;
    case "profile": return <ProfileScreen t={t} />;
    case "favorites": return <FavoritesScreen t={t} go={go} />;
    case "chat": return <ChatScreen t={t} />;
    case "listing": return <ListingScreen t={t} />;
  }
}

function PhoneFrame({ t, screen, go }: { t: Th; screen: ScreenId; go: (s: ScreenId) => void }) {
  return (
    <div style={{ width: 390, height: 844, borderRadius: 50, background: t.bg, border: `1px solid ${t.bdr}`, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: `0 40px 80px ${t.acc}28, 0 8px 40px rgba(0,0,0,0.28)`, fontFamily: t.body }}>
      {/* Status bar */}
      <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 28px 0", background: t.bg, position: "relative", fontSize: 13, fontWeight: 700, color: t.fg }}>
        <span>9:41</span>
        <div style={{ width: 120, height: 34, background: "#000", borderRadius: 20, position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)" }} />
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
            {[0,1,2,3].map(i => <rect key={i} x={i * 4} y={11 - (i + 1) * 2.6} width="3" height={(i + 1) * 2.6} fill={t.fg} opacity={i < 3 ? 0.9 : 0.3} rx="0.5" />)}
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke={t.fg} strokeWidth="1" />
            <rect x="1.5" y="1.5" width="16" height="9" rx="2" fill={t.fg} />
            <rect x="21.5" y="3.5" width="2.5" height="5" rx="1.2" fill={t.fg} opacity="0.4" />
          </svg>
        </div>
      </div>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none" }}>
        <ScreenContent t={t} screen={screen} go={go} />
      </div>
      <BottomNav t={t} screen={screen} go={go} />
      {/* Home indicator */}
      <div style={{ height: 32, background: t.navBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 130, height: 5, borderRadius: 3, background: t.fg, opacity: 0.14 }} />
      </div>
    </div>
  );
}

/* ─── Main app ───────────────────────────────────────────────────────────────── */
const PHONE_W = 340;
const PHONE_SCALE = PHONE_W / 390;
const PHONE_H = Math.round(844 * PHONE_SCALE);

export default function App() {
  const [screen, setScreen] = useState<ScreenId>("home");
  const [activeTheme, setActiveTheme] = useState<ThemeId>("arc");
  const themeIds: ThemeId[] = ["arc", "verdure", "nox"];

  return (
    <div style={{ minHeight: "100vh", background: "#08080D", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#F0F0F8" }}>
      {/* ── Header ── */}
      <div style={{ textAlign: "center", padding: "52px 20px 36px" }}>
        <div style={{ fontFamily: "'Epilogue', system-ui, sans-serif", fontSize: 40, fontWeight: 900, letterSpacing: "-2px", color: "#FFFFFF", lineHeight: 1 }}>avra</div>
        <div style={{ fontSize: 10, color: "#44445A", letterSpacing: "4px", textTransform: "uppercase", marginTop: 10 }}>UI / UX Design Concepts</div>
      </div>

      {/* ── Screen selector ── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "0 16px 36px" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 720 }}>
          {NAV_SCREENS.map(({ id, label, Icon }) => {
            const active = screen === id;
            return (
              <button key={id} onClick={() => setScreen(id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: active ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.04)", color: active ? "#08080D" : "#666680", border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.08)"}`, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Theme chips (mobile only — controls which phone is "focused") ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28, padding: "0 16px" }}>
        {themeIds.map(tid => {
          const t = THEMES[tid];
          const active = activeTheme === tid;
          return (
            <button key={tid} onClick={() => setActiveTheme(tid)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 24, background: active ? t.acc : "rgba(255,255,255,0.05)", color: active ? "#FFF" : "#666680", border: `1px solid ${active ? t.acc : "rgba(255,255,255,0.08)"}`, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: active ? "rgba(255,255,255,0.7)" : t.acc }} />
              {t.name}
            </button>
          );
        })}
      </div>

      {/* ── Three phones ── */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 36, padding: "0 24px 64px", flexWrap: "wrap" }}>
        {themeIds.map(tid => {
          const t = THEMES[tid];
          const isActive = tid === activeTheme;
          return (
            <div key={tid} onClick={() => !isActive && setActiveTheme(tid)} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: isActive ? 1 : 0.55, transition: "opacity 0.3s ease", cursor: isActive ? "default" : "pointer" }}>
              {/* Label */}
              <div style={{ marginBottom: 14, textAlign: "center" }}>
                <div style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 14, fontWeight: 800, color: t.acc, letterSpacing: "-0.25px" }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "#44445A", marginTop: 3, letterSpacing: "0.5px" }}>{t.sub}</div>
              </div>
              {/* Scaled phone container */}
              <div style={{ width: PHONE_W, height: PHONE_H, overflow: "hidden", borderRadius: Math.round(50 * PHONE_SCALE), flexShrink: 0, boxShadow: isActive ? `0 32px 64px ${t.acc}30, 0 8px 32px rgba(0,0,0,0.35)` : "0 16px 32px rgba(0,0,0,0.2)" }}>
                <div style={{ width: 390, height: 844, transform: `scale(${PHONE_SCALE})`, transformOrigin: "top left" }}>
                  <PhoneFrame t={t} screen={screen} go={(s) => setScreen(s)} />
                </div>
              </div>
              {/* Accent line */}
              <div style={{ marginTop: 20, width: 32, height: 3, borderRadius: 2, background: isActive ? t.acc : "rgba(255,255,255,0.06)", transition: "background 0.3s" }} />
            </div>
          );
        })}
      </div>

      {/* ── Concept descriptions ── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "0 24px 80px", flexWrap: "wrap", gap: 12 }}>
        {themeIds.map(tid => {
          const t = THEMES[tid];
          const descs: Record<ThemeId, string> = {
            arc: "Strict Swiss grid, pure white ground, coral fire for hierarchy. Every pixel earns its place.",
            verdure: "Cream fields, editorial serif display type, amber warmth. Craft goods, cultivated taste.",
            nox: "Deep space ground, violet pulse, generous rounding. Luxe without loudness.",
          };
          return (
            <div key={tid} style={{ flex: "1 1 260px", maxWidth: 320, padding: "18px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid rgba(255,255,255,0.06)` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.acc, marginBottom: 6 }}>{t.name} — {t.sub}</div>
              <div style={{ fontSize: 12, color: "#55556A", lineHeight: 1.6 }}>{descs[tid]}</div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: "center", padding: "0 20px 48px", color: "#2A2A3A", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase" }}>
        Avra · Premium Marketplace · UI/UX Design System Concepts
      </div>
    </div>
  );
}
