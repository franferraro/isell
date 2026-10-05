"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BatteryCharging,
  Cable,
  Check,
  ChevronDown,
  CircleDollarSign,
  Headphones,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Wrench,
  X,
  Zap,
} from "lucide-react";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
const whatsappLabel = process.env.NEXT_PUBLIC_WHATSAPP_LABEL || "WhatsApp";
const googleMapsUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || "#";

const services = [
  {
    number: "01",
    icon: Wrench,
    title: "Servicio técnico",
    text: "Diagnóstico preciso y reparación especializada para que tu equipo vuelva a rendir al máximo.",
  },
  {
    number: "02",
    icon: Smartphone,
    title: "Cambio de pantalla",
    text: "Reemplazo profesional con repuestos seleccionados y terminación impecable.",
  },
  {
    number: "03",
    icon: BatteryCharging,
    title: "Cambio de batería",
    text: "Recuperá la autonomía de tu dispositivo con instalación segura y garantía.",
  },
  {
    number: "04",
    icon: Sparkles,
    title: "Optimización",
    text: "Limpieza, configuración y mantenimiento para mejorar velocidad y rendimiento.",
  },
];

const categories = [
  { icon: Smartphone, name: "Fundas", detail: "Protección con diseño" },
  { icon: ShieldCheck, name: "Vidrios", detail: "Máxima resistencia" },
  { icon: Headphones, name: "Auriculares", detail: "Sonido sin límites" },
  { icon: Zap, name: "Cargadores", detail: "Energía inteligente" },
  { icon: Cable, name: "Cables", detail: "Durabilidad premium" },
  { icon: PackageCheck, name: "Power banks", detail: "Carga donde estés" },
];

const benefits = [
  "Atención personalizada",
  "Servicio ágil y profesional",
  "Repuestos de calidad",
  "Garantía en reparaciones",
  "Asesoramiento honesto",
  "Ubicación en Zona Norte",
];

type Testimonial = {
  id?: string;
  quote: string;
  name: string;
  initials?: string;
  location: string;
  rating?: number;
  url?: string;
};

type ReviewsPayload = {
  source?: string;
  placeName?: string;
  rating?: number;
  userRatingCount?: number;
  url?: string;
  reviews?: Testimonial[];
};

type ProductColor = {
  name: string;
  hex?: string;
  model?: string;
  stock?: number;
  variantId?: string;
};

type Product = {
  id: string;
  name: string;
  category: string;
  family: string;
  type: string;
  price: number;
  discountPrice?: number;
  currency: string;
  featured: boolean;
  stockStatus: string;
  colors: ProductColor[];
  compatibleModels: string[];
  imageUrl?: string;
  description: string;
  order: number;
  tags: string[];
};

type ProductsPayload = {
  products?: Product[];
};

type DeviceOption = {
  name: string;
  storage: string[];
};

type DeviceCatalog = Record<string, DeviceOption[]>;

type QuoteOptionsPayload = {
  catalog?: DeviceCatalog;
  states?: string[];
};

type CartItem = {
  product: Product;
  quantity: number;
  color?: ProductColor;
};

const fallbackTestimonials: Testimonial[] = [
  {
    quote: "Excelente atención y reparación rápida. Mi teléfono quedó impecable.",
    name: "Martina G.",
    location: "Cerro de las Rosas",
    rating: 5,
  },
  {
    quote: "Los mejores accesorios de la zona. Siempre encuentro algo distinto.",
    name: "Santiago R.",
    location: "Urca",
    rating: 5,
  },
  {
    quote: "Muy confiables y transparentes. Me explicaron todo antes de reparar.",
    name: "Carolina M.",
    location: "Villa Belgrano",
    rating: 5,
  },
];

const fallbackProducts: Product[] = [
  {
    id: "FUN-003",
    name: "Fundas Magsafe",
    category: "Fundas",
    family: "Protección",
    type: "Funda MagSafe",
    price: 15000,
    currency: "ARS",
    featured: true,
    stockStatus: "Disponible",
    colors: [
      { name: "Transparente", hex: "#F8F8F8" },
      { name: "Negro", hex: "#111111" },
      { name: "Azul", hex: "#17127A" },
      { name: "Rosa", hex: "#F5A3C7" },
    ],
    compatibleModels: ["Ver variantes"],
    description: "Funda compatible con MagSafe.",
    order: 10,
    tags: ["funda", "magsafe", "iphone"],
  },
  {
    id: "AUD-002",
    name: "AirPods Pro 3",
    category: "Auriculares",
    family: "Audio",
    type: "Auriculares bluetooth",
    price: 55000,
    currency: "ARS",
    featured: true,
    stockStatus: "Disponible",
    colors: [{ name: "Blanco", hex: "#FFFFFF" }],
    compatibleModels: ["Bluetooth"],
    description: "Auriculares bluetooth tipo AirPods Pro.",
    order: 20,
    tags: ["audio", "airpods"],
  },
  {
    id: "FYC-004",
    name: "Fuente Samsung 25W",
    category: "Fuentes y cargadores",
    family: "Carga",
    type: "Fuente Samsung",
    price: 16000,
    currency: "ARS",
    featured: true,
    stockStatus: "Disponible",
    colors: [{ name: "Negro", hex: "#111111" }, { name: "Blanco", hex: "#FFFFFF" }],
    compatibleModels: ["Samsung"],
    description: "Carga rápida Samsung 25W.",
    order: 30,
    tags: ["samsung", "cargador"],
  },
];

const areas = ["Bajo Palermo", "Urca", "Cerro de las Rosas", "Villa Belgrano"];

const fallbackDeviceCatalog: DeviceCatalog = {
  Apple: [
    { name: "iPhone 18 Pro Max", storage: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    { name: "iPhone 18 Pro", storage: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    { name: "iPhone 17e", storage: ["256 GB", "512 GB"] },
    { name: "iPhone 17 Pro Max", storage: ["256 GB", "512 GB", "1 TB", "2 TB"] },
    { name: "iPhone 17 Pro", storage: ["256 GB", "512 GB", "1 TB"] },
    { name: "iPhone 17", storage: ["256 GB", "512 GB"] },
    { name: "iPhone Air", storage: ["256 GB", "512 GB", "1 TB"] },
    { name: "iPhone 16e", storage: ["128 GB", "256 GB", "512 GB"] },
    { name: "iPhone 16 Pro Max", storage: ["256 GB", "512 GB", "1 TB"] },
    { name: "iPhone 16 Pro", storage: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    { name: "iPhone 16 Plus", storage: ["128 GB", "256 GB", "512 GB"] },
    { name: "iPhone 16", storage: ["128 GB", "256 GB", "512 GB"] },
    { name: "iPhone 15 Pro Max", storage: ["256 GB", "512 GB", "1 TB"] },
    { name: "iPhone 15 Pro", storage: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    { name: "iPhone 15 Plus", storage: ["128 GB", "256 GB", "512 GB"] },
    { name: "iPhone 15", storage: ["128 GB", "256 GB", "512 GB"] },
    { name: "iPhone 14 Pro Max", storage: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    { name: "iPhone 14 Pro", storage: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    { name: "iPhone 14 Plus", storage: ["128 GB", "256 GB", "512 GB"] },
    { name: "iPhone 14", storage: ["128 GB", "256 GB", "512 GB"] },
    { name: "iPhone SE (3ra gen)", storage: ["64 GB", "128 GB", "256 GB"] },
    { name: "iPhone 13 Pro Max", storage: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    { name: "iPhone 13 Pro", storage: ["128 GB", "256 GB", "512 GB", "1 TB"] },
    { name: "iPhone 13", storage: ["128 GB", "256 GB", "512 GB"] },
    { name: "iPhone 13 mini", storage: ["128 GB", "256 GB", "512 GB"] },
    { name: "Otro iPhone", storage: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"] },
  ],
};

const defaultStorageOptions = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];
const fallbackDeviceStates = ["Como nuevo", "Muy bueno", "Bueno", "Con detalles", "No funciona"];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "IS";
}

function getDisplayColors(product: Product) {
  const colors = new Map<string, ProductColor>();

  product.colors
    .filter((color) => color.name)
    .forEach((color) => {
      const key = normalizeText(`${color.name}-${color.hex || ""}`);
      if (!colors.has(key)) colors.set(key, color);
    });

  return Array.from(colors.values());
}

function formatPrice(value: number, currency = "ARS") {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency || "ARS",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);
  }
}

function hasDiscount(product: Product) {
  return Boolean(product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price);
}

function getProductUnitPrice(product: Product) {
  return hasDiscount(product) ? product.discountPrice || product.price : product.price;
}

function getCartTotals(cart: CartItem[]) {
  const totals = new Map<string, number>();

  cart.forEach((item) => {
    const currency = item.product.currency || "ARS";
    totals.set(currency, (totals.get(currency) || 0) + item.quantity * getProductUnitPrice(item.product));
  });

  return Array.from(totals.entries()).map(([currency, total]) => ({ currency, total }));
}

function formatCartTotals(cart: CartItem[]) {
  const totals = getCartTotals(cart);
  return totals.map((item) => formatPrice(item.total, item.currency)).join(" + ");
}

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1280;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo procesar la imagen.");

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error("No se pudo comprimir la imagen.")),
      "image/jpeg",
      0.72,
    );
  });

  const fileName = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${fileName}.jpg`, { type: "image/jpeg" });
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.5 3.5A11.8 11.8 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.15 1.6 5.96L.08 24l6.28-1.65a11.87 11.87 0 0 0 5.7 1.45h.01C18.63 23.8 24 18.46 24 11.9c0-3.18-1.24-6.16-3.5-8.4Zm-8.42 18.29h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.73.98 1-3.63-.24-.37a9.82 9.82 0 0 1-1.51-5.28c0-5.45 4.44-9.89 9.9-9.89a9.82 9.82 0 0 1 7 2.91 9.8 9.8 0 0 1 2.9 7c-.01 5.44-4.45 9.87-9.92 9.87Zm5.43-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.09 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function FadeIn({
  children,
  className = "",
  delay = 0,
  ariaHidden,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  ariaHidden?: boolean;
}) {
  return (
    <motion.div
      className={className}
      aria-hidden={ariaHidden}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [files, setFiles] = useState(0);
  const [quoteStatus, setQuoteStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [modelValue, setModelValue] = useState("");
  const [reviewsData, setReviewsData] = useState<ReviewsPayload | null>(null);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [deviceCatalog, setDeviceCatalog] = useState<DeviceCatalog>(fallbackDeviceCatalog);
  const [deviceStates, setDeviceStates] = useState(fallbackDeviceStates);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const catalogModels = deviceCatalog.Apple?.length ? deviceCatalog.Apple : fallbackDeviceCatalog.Apple;
  const modelQuery = normalizeText(modelValue);
  const exactDevice = modelQuery
    ? catalogModels.find((device) => normalizeText(device.name) === modelQuery)
    : undefined;
  const selectedDevice = modelQuery
    ? exactDevice ?? catalogModels.find((device) => normalizeText(device.name).includes(modelQuery))
    : undefined;
  const storageOptions = selectedDevice?.storage ?? defaultStorageOptions;
  const testimonials = reviewsData?.reviews?.length ? reviewsData.reviews : fallbackTestimonials;
  const visibleProducts = products
    .filter((product) => product.featured)
    .slice(0, 4);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotals = getCartTotals(cart);
  const cartTotalLabel = formatCartTotals(cart);

  useEffect(() => {
    let ignore = false;

    async function loadPageData() {
      try {
        const [reviewsResponse, productsResponse, quoteOptionsResponse] = await Promise.all([
          fetch("/api/reviews"),
          fetch("/api/products"),
          fetch("/api/quote-options"),
        ]);

        if (reviewsResponse.ok) {
          const data = await reviewsResponse.json() as ReviewsPayload;
          if (!ignore && data.reviews?.length) setReviewsData(data);
        }

        if (productsResponse.ok) {
          const data = await productsResponse.json() as ProductsPayload;
          if (!ignore && data.products?.length) setProducts(data.products);
        }

        if (quoteOptionsResponse.ok) {
          const data = await quoteOptionsResponse.json() as QuoteOptionsPayload;
          if (!ignore && data.catalog && Object.keys(data.catalog).length) {
            setDeviceCatalog(data.catalog);
          }
          if (!ignore && data.states?.length) {
            setDeviceStates(data.states);
          }
        }
      } catch {
        // Keep curated fallbacks if external data is unavailable.
      }
    }

    loadPageData();

    return () => {
      ignore = true;
    };
  }, []);

  const addToCart = (product: Product, color?: ProductColor) => {
    setCart((current) => {
      const key = `${product.id}-${color?.variantId || color?.name || "base"}`;
      const existing = current.find((item) => `${item.product.id}-${item.color?.variantId || item.color?.name || "base"}` === key);

      if (existing) {
        return current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }

      return [...current, { product, color, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateCartItem = (index: number, quantity: number) => {
    setCart((current) => current
      .map((item, itemIndex) => itemIndex === index ? { ...item, quantity } : item)
      .filter((item) => item.quantity > 0));
  };

  const sendCartToWhatsApp = async () => {
    if (!cart.length) return;

    const orderPayload = {
      source: "web-catalog",
      currency: cartTotals.length === 1 ? cartTotals[0].currency : "MULTI",
      total: cartTotals.length === 1 ? cartTotals[0].total : undefined,
      totalsByCurrency: cartTotals,
      totalLabel: cartTotalLabel,
      items: cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: getProductUnitPrice(item.product),
        currency: item.product.currency,
        variantId: item.color?.variantId,
        color: item.color?.name,
        model: item.color?.model,
      })),
    };

    let draft: { id?: string; recorded?: boolean; error?: string };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      draft = await response.json();

      if (!response.ok || !draft.id) {
        throw new Error(draft.error || "No se pudo registrar el pedido.");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo registrar el pedido.");
      return;
    }

    const lines = cart.map((item) => {
      const detail = [item.color?.name, item.color?.model].filter(Boolean).join(" / ");
      return `• ${item.quantity} x ${item.product.name}${detail ? ` (${detail})` : ""} - ${formatPrice(getProductUnitPrice(item.product) * item.quantity, item.product.currency)}`;
    }).join("\n");

    const message = `Hola isell.cba, quiero consultar disponibilidad de este pedido.

Pedido: ${draft.id}

${lines}

Total estimado: ${cartTotalLabel}

Me confirman disponibilidad y forma de pago/envío?`;

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const openWhatsApp = (message: string) => {
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleQuote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const whatsappWindow = window.open("", "_blank");
    const selectedFiles = data
      .getAll("photos")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    setQuoteStatus("sending");
    setQuoteMessage(
      selectedFiles.length
        ? "Guardando la solicitud y subiendo las fotos..."
        : "Guardando la solicitud...",
    );

    try {
      const payload = new FormData();
      ["name", "phone", "brand", "model", "storage", "batteryHealth", "condition", "comments"].forEach((field) => {
        payload.set(field, String(data.get(field) ?? ""));
      });

      const compressedFiles = await Promise.all(selectedFiles.slice(0, 5).map(compressImage));
      compressedFiles.forEach((file) => payload.append("photos", file));

      const response = await fetch("/api/quotes", {
        method: "POST",
        body: payload,
      });
      const result = await response.json() as {
        id?: string;
        error?: string;
      };

      if (!response.ok || !result.id) {
        throw new Error(result.error || "No se pudo guardar la cotización.");
      }

      const message = `Hola isell.cba, envié una solicitud para cotizar mi celular.

• Cotización: ${result.id}
• Nombre: ${data.get("name")}
• Modelo: ${data.get("model")}
• Capacidad: ${data.get("storage")}
• Batería: ${data.get("batteryHealth")}%
• Estado: ${data.get("condition")}
• Fotos enviadas: ${compressedFiles.length}

Los datos y las fotos ya quedaron registrados.`;

      setQuoteStatus("success");
      setQuoteMessage(`Solicitud ${result.id} guardada correctamente. Abriendo WhatsApp...`);
      form.reset();
      setFiles(0);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      if (whatsappWindow) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }
    } catch (error) {
      whatsappWindow?.close();
      setQuoteStatus("error");
      setQuoteMessage(error instanceof Error ? error.message : "No se pudo enviar la solicitud.");
    }
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="isell.cba, inicio">
          <Image src="/images/logo-isell.png" alt="isell.cba" width={48} height={48} priority />
          <span>isell.cba</span>
        </a>
        <nav className={menuOpen ? "nav-menu is-open" : "nav-menu"} aria-label="Navegación principal">
          <a href="#servicios" onClick={() => setMenuOpen(false)}>Servicios</a>
          <a href="/catalogo" onClick={() => setMenuOpen(false)}>Tienda</a>
          <a href="#accesorios" onClick={() => setMenuOpen(false)}>Accesorios</a>
          <a href="#cotizar" onClick={() => setMenuOpen(false)}>Vendé tu celu</a>
          <a href="#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</a>
        </nav>
        <div className="header-actions">
          <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label="Abrir carrito">
            <ShoppingCart size={17} />
            {cartItemsCount > 0 && <span>{cartItemsCount}</span>}
          </button>
          <a
            className="header-cta"
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola isell.cba, quiero hacer una consulta.")}`}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon />
            Hablemos
          </a>
        </div>
        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="eyebrow"
          >
            <span />
            Tecnología. Servicio. Confianza.
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Todo para tu celular, <em>en un solo lugar.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            Celulares sellados y usados seleccionados, accesorios y servicio técnico.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <button className="button button-dark" onClick={() => openWhatsApp("Hola isell.cba, quiero hacer una consulta.")}>
              <WhatsAppIcon />
              Contactar por WhatsApp
            </button>
            <a className="button button-light" href="/catalogo">
              Ir a tienda
              <ArrowRight size={17} />
            </a>
          </motion.div>
          <motion.div
            className="hero-proof"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            <div className="avatars" aria-hidden="true">
              <span>MG</span><span>SR</span><span>CM</span>
            </div>
            <div>
              <div className="stars">★★★★★</div>
              <small>Clientes que vuelven a elegirnos</small>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
        >
          <Image
            src="/images/isell-hero.png"
            alt="Celulares y accesorios premium"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
          />
          <div className="floating-card floating-top">
            <span className="floating-icon"><ShieldCheck size={19} /></span>
            <div><strong>Servicio garantizado</strong><small>Reparaciones con respaldo</small></div>
          </div>
          <div className="floating-card floating-bottom">
            <span className="floating-icon dark"><CircleDollarSign size={19} /></span>
            <div><strong>Compramos tu usado</strong><small>Cotización rápida y justa</small></div>
          </div>
        </motion.div>
        <a className="scroll-hint" href="#servicios" aria-label="Ver servicios">
          <span>Descubrí más</span>
          <ArrowDown size={15} />
        </a>
      </section>

      <section className="services section" id="servicios">
        <FadeIn className="section-heading light-heading">
          <div>
            <span className="section-kicker">Lo que hacemos</span>
            <h2>Tu tecnología,<br /><em>en buenas manos.</em></h2>
          </div>
          <p>Soluciones expertas y transparentes para cuidar los dispositivos que te acompañan todos los días.</p>
        </FadeIn>
        <div className="service-grid">
          {services.map((service, index) => (
            <FadeIn className="service-card" delay={index * 0.08} key={service.title}>
              <div className="service-top">
                <span>{service.number}</span>
                <service.icon size={23} strokeWidth={1.5} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola, quiero consultar por ${service.title.toLowerCase()}.`)}`} target="_blank" rel="noreferrer">
                Consultar <ArrowRight size={15} />
              </a>
            </FadeIn>
          ))}
        </div>
        <FadeIn className="service-banner">
          <div className="diagnostic-icon"><Smartphone size={30} /></div>
          <div>
            <span>¿No sabés qué le pasa a tu equipo?</span>
            <h3>Hacemos un diagnóstico profesional.</h3>
          </div>
          <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola, necesito un diagnóstico para mi equipo.")}`} target="_blank" rel="noreferrer">
            Agendar diagnóstico <ArrowRight size={17} />
          </a>
        </FadeIn>
      </section>

      <section className="products-section section" id="productos">
        <FadeIn className="section-heading">
          <div>
            <span className="section-kicker">Tienda viva</span>
            <h2>Tienda destacada<br /></h2>
          </div>
          <div>
            <p>Elegí accesorios, armá tu pedido y lo cerramos por WhatsApp con disponibilidad confirmada.</p>
            <a className="text-link-button" href="/catalogo">
              Entrar a la tienda <ArrowRight size={15} />
            </a>
          </div>
        </FadeIn>
        <div className="product-grid">
          {visibleProducts.map((product, index) => {
            const firstColor = product.colors[0];
            const displayColors = getDisplayColors(product);

            return (
              <FadeIn className="product-card" delay={index * 0.05} key={product.id}>
                <div className="product-media">
                  {product.imageUrl ? (
                    // Product images come from Sheets, so we avoid domain allowlist friction.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt={product.name} loading="lazy" />
                  ) : (
                    <div className="product-placeholder">
                      <span>{product.family}</span>
                      <strong>{product.name}</strong>
                    </div>
                  )}
                  {product.featured && <span className="product-badge">Destacado</span>}
                </div>
                <div className="product-info">
                  <span>{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-meta">
                    <div className="price-stack">
                      {hasDiscount(product) && <del>{formatPrice(product.price, product.currency)}</del>}
                      <strong>{formatPrice(getProductUnitPrice(product), product.currency)}</strong>
                    </div>
                    <small>{product.stockStatus}</small>
                  </div>
                  {!!displayColors.length && (
                    <div className="color-row" aria-label={`Colores disponibles para ${product.name}`}>
                      {displayColors.slice(0, 6).map((color, colorIndex) => (
                        <i
                          key={`${color.name}-${colorIndex}`}
                          title={color.name}
                          style={{ background: color.hex || "#ffffff" }}
                        />
                      ))}
                    </div>
                  )}
                  <button className="product-add" onClick={() => addToCart(product, firstColor)}>
                    <ShoppingCart size={16} />
                    Agregar al carrito
                  </button>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <section className="quote-section section" id="cotizar">
        <FadeIn className="quote-intro">
          <span className="section-kicker">Renová tu equipo</span>
          <h2>PLAN CANJE</h2>
          <p>Entregá tu celu como parte de pago y llevate tu próximo iPhone.</p>
          <div className="quote-points">
            <span><Check size={16} /> Una propuesta por tu equipo clara, sin vueltas.</span>
            <span><Check size={16} /> Cotización sin cargo.</span>
            <span><Check size={16} /> Respuesta rápida.</span>
          </div>
          <div className="trade-visual" aria-hidden="true">
            <div className="trade-phone"><Smartphone /></div>
            <div className="trade-arrow"><ArrowRight /></div>
            <div className="trade-cash"><CircleDollarSign /></div>
          </div>
        </FadeIn>
        <FadeIn className="quote-form-wrap" delay={0.12}>
          <div className="form-title">
            <div><span>01</span><strong>Contanos sobre tu equipo</strong></div>
            <small>Completá los datos para cotizar</small>
          </div>
          <form onSubmit={handleQuote}>
            <input type="hidden" name="brand" value="Apple" />
            <div className="form-row">
              <label>
                Nombre
                <input name="name" required placeholder="Tu nombre" autoComplete="name" />
              </label>
              <label>
                WhatsApp
                <input name="phone" required placeholder="Ej. 351 555 1234" inputMode="tel" autoComplete="tel" />
              </label>
            </div>
            <div className="form-row">
              <label>
                Modelo de iPhone
                <input
                  name="model"
                  required
                  placeholder="Ej. iPhone 14 Pro"
                  list="model-suggestions"
                  value={modelValue}
                  onChange={(event) => setModelValue(event.target.value)}
                />
                <datalist id="model-suggestions">
                  {catalogModels.map((device) => (
                    <option value={device.name} key={device.name} />
                  ))}
                </datalist>
              </label>
              <label>
                Capacidad
                <span className="select-wrap">
                  <select name="storage" required defaultValue="" key={storageOptions.join("|")}>
                    <option value="" disabled>Seleccioná</option>
                    {storageOptions.map((storage) => (
                      <option key={storage}>{storage}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} />
                </span>
              </label>
            </div>
            <div className="model-assist" aria-live="polite">
              {modelValue ? (
                selectedDevice ? (
                  <>
                    <Sparkles size={15} />
                    Detectamos {selectedDevice.name}. Te mostramos las capacidades más comunes.
                  </>
                ) : (
                  <>
                    <Smartphone size={15} />
                    Si tu modelo no aparece, escribilo igual y elegí la capacidad manualmente.
                  </>
                )
              ) : (
                <>
                  <Smartphone size={15} />
                  Empezá a escribir el modelo de iPhone para ver sugerencias.
                </>
              )}
            </div>
            <div className="form-row">
              <label>
                Batería
                <input
                  name="batteryHealth"
                  type="number"
                  min="1"
                  max="100"
                  inputMode="numeric"
                  placeholder="Ej: 98"
                  required
                />
              </label>
              <label>
                Estado general
                <span className="select-wrap">
                  <select name="condition" required defaultValue="">
                    <option value="" disabled>Seleccioná el estado</option>
                    {deviceStates.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} />
                </span>
              </label>
            </div>
            <label>
              Comentarios <small>(opcional)</small>
              <textarea name="comments" placeholder="Contanos si tiene algún detalle, reparación previa, etc." />
            </label>
            <label className="upload-box">
              <input
                name="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const count = Math.min(e.target.files?.length ?? 0, 5);
                  setFiles(count);
                  setQuoteStatus("idle");
                  setQuoteMessage("");
                }}
              />
              <Upload size={22} />
              <span>{files ? `${files} foto${files > 1 ? "s" : ""} seleccionada${files > 1 ? "s" : ""}` : "Subí fotos de tu equipo"}</span>
              <small>Frente, dorso y detalles. Máx. 5 fotos.</small>
            </label>
            <button className="button submit-button" type="submit" disabled={quoteStatus === "sending"}>
              {quoteStatus === "sending" ? "Enviando..." : "Solicitar cotización"}
              <ArrowRight size={18} />
            </button>
            {quoteMessage && (
              <p className={`form-feedback ${quoteStatus}`} role="status">
                {quoteMessage}
              </p>
            )}
            <p className="form-note"><ShieldCheck size={14} /> Tus datos están protegidos y no serán compartidos.</p>
          </form>
        </FadeIn>
      </section>

      <section className="accessories section" id="accesorios">
        <FadeIn className="section-heading">
          <div>
            <span className="section-kicker">Accesorios</span>
            <h2>Equipá tu celu a tu manera.</h2>
          </div>
          <div>
            <p>Accesorios de calidad para tu día a día. Fundas, vidrios, cables, cargadores y más.</p>
            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola, quiero conocer el catálogo de accesorios.")}`} target="_blank" rel="noreferrer">
              Ver catálogo completo <ArrowRight size={15} />
            </a>
          </div>
        </FadeIn>
        <div className="category-grid">
          {categories.map((category, index) => (
            <FadeIn className={`category-card category-${index + 1}`} delay={index * 0.06} key={category.name}>
              <category.icon size={index === 0 ? 94 : 66} strokeWidth={0.8} />
              <div><span>{category.detail}</span><h3>{category.name}</h3></div>
              <a
                className="category-hit-area"
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola, quiero consultar por ${category.name.toLowerCase()}.`)}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Consultar por ${category.name}`}
              >
                <span><ArrowRight size={17} /></span>
              </a>
            </FadeIn>
          ))}
        </div>
        <FadeIn className="compatibility">
          <span>Compatibles con</span>
          <strong>iPhone</strong><i>•</i><strong>Samsung</strong><i>•</i><strong>Motorola</strong><i>•</i><strong>Xiaomi</strong><i>•</i><strong>Y más</strong>
        </FadeIn>
      </section>

      <section className="why-section section" id="nosotros">
        <div className="why-copy">
          <FadeIn>
            <span className="section-kicker">Por qué isell.cba</span>
            <h2>Más que un servicio.<br /><em>Una experiencia simple.</em></h2>
            <p>Creemos que la tecnología tiene que darte soluciones, no problemas. Por eso trabajamos con claridad, cuidado y atención real.</p>
          </FadeIn>
          <div className="benefit-list">
            {benefits.map((benefit, index) => (
              <FadeIn className="benefit" delay={index * 0.05} key={benefit}>
                <span>0{index + 1}</span>
                <strong>{benefit}</strong>
                <Check size={17} />
              </FadeIn>
            ))}
          </div>
        </div>
        <FadeIn className="why-visual">
          <div className="visual-phone">
            <div className="phone-speaker" />
            <div className="phone-logo">isell<span>.cba</span></div>
            <div className="phone-check"><Check /></div>
            <p>Tu equipo está<br /><strong>en buenas manos.</strong></p>
          </div>
          <div className="quality-seal"><ShieldCheck /><span>Calidad<br />garantizada</span></div>
          <div className="why-stats">
            <div><strong>100%</strong><span>Compromiso</span></div>
            <div><strong>5<span>★</span></strong><span>Atención</span></div>
          </div>
        </FadeIn>
      </section>

      <section className="testimonials section">
        <FadeIn className="testimonial-heading">
          <span className="section-kicker">Reseñas de Google</span>
          <h2>Lo dicen quienes<br /><em>ya nos eligieron.</em></h2>
          {reviewsData?.rating && (
            <a
              className="google-rating"
              href={reviewsData.url || googleMapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span>{reviewsData.rating.toFixed(1)}</span>
              <div className="rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} fill="currentColor" />
                ))}
              </div>
              <small>{reviewsData.userRatingCount ?? ""} opiniones en Google</small>
            </a>
          )}
        </FadeIn>
        <div className="testimonial-carousel" aria-label="Reseñas de clientes">
          <div className="testimonial-track">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <FadeIn
                className="testimonial-card"
                delay={(index % testimonials.length) * 0.05}
                key={`${testimonial.id || testimonial.name}-${index}`}
                ariaHidden={index >= testimonials.length}
              >
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      fill={star <= (testimonial.rating ?? 5) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <blockquote>“{testimonial.quote}”</blockquote>
                <div className="testimonial-person">
                  <span>{testimonial.initials || getInitials(testimonial.name)}</span>
                  <div><strong>{testimonial.name}</strong><small>{testimonial.location}</small></div>
                </div>
                {testimonial.url && (
                  <a className="review-link" href={testimonial.url} target="_blank" rel="noreferrer">
                    Ver en Google <ArrowRight size={14} />
                  </a>
                )}
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="coverage section">
        <FadeIn className="coverage-map">
          <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" />
          {areas.map((area, index) => (
            <div className={`map-pin pin-${index + 1}`} key={area}>
              <MapPin size={19} fill="currentColor" />
              <span>{area}</span>
            </div>
          ))}
          <div className="map-center">
            <Image src="/images/logo-isell.png" alt="isell.cba" width={44} height={44} />
          </div>
        </FadeIn>
        <FadeIn className="coverage-copy">
          <span className="section-kicker">Cerca tuyo</span>
          <h2>Estamos en<br /><em>Zona Norte.</em></h2>
          <p>Atendemos principalmente a clientes de Zona Norte de Córdoba, con una ubicación cómoda y accesible.</p>
          <div className="area-list">
            {areas.map((area) => <span key={area}><MapPin size={15} /> {area}</span>)}
          </div>
          <a className="text-link" href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola, quisiera saber cómo llegar.")}`} target="_blank" rel="noreferrer">
            Consultar ubicación <ArrowRight size={16} />
          </a>
        </FadeIn>
      </section>

      <section className="final-cta section">
        <FadeIn>
          <span className="section-kicker">Estamos para ayudarte</span>
          <h2>¿Necesitás ayuda<br />con tu celular?</h2>
          <p>Escribinos y recibí atención personalizada de nuestro equipo.</p>
          <a
            className="button whatsapp-button"
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola isell.cba, necesito ayuda con mi celular.")}`}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon size={21} />
            Escribinos por WhatsApp
            <ArrowRight size={18} />
          </a>
          <small>Respondemos lo antes posible</small>
        </FadeIn>
      </section>

      <footer>
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand" href="#inicio">
              <Image src="/images/logo-isell.png" alt="isell.cba" width={48} height={48} />
              <span>isell.cba</span>
            </a>
            <p>Todo para tu celular<br />en un solo lugar.</p>
            <div className="socials">
              <a href="https://instagram.com/isell.cba" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon /></a>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><WhatsAppIcon /></a>
            </div>
          </div>
          <div className="footer-column"><strong>Navegación</strong><a href="#servicios">Servicios</a><a href="/catalogo">Tienda</a><a href="#accesorios">Accesorios</a><a href="#cotizar">Vendé tu celu</a><a href="#nosotros">Nosotros</a></div>
          <div className="footer-column"><strong>Servicios</strong><a href="#servicios">Servicio técnico</a><a href="#servicios">Cambio de pantalla</a><a href="#servicios">Cambio de batería</a><a href="#cotizar">Compra de usados</a></div>
          <div className="footer-column contact-column">
            <strong>Contacto</strong>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer"><WhatsAppIcon /> {whatsappLabel}</a>
            <a href="https://instagram.com/isell.cba" target="_blank" rel="noreferrer"><InstagramIcon size={16} /> @isell.cba</a>
            <span><MapPin size={16} /> Zona Norte, Córdoba</span>
            <span className="hours">Lun a Vie 9:00–18:00<br />Sábados 9:00–13:00</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 isell.cba. Todos los derechos reservados.</span>
          <span>Hecho en Córdoba, Argentina.</span>
        </div>
      </footer>

      {cartOpen && <button className="cart-backdrop" aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} />}
      <aside className={cartOpen ? "cart-drawer is-open" : "cart-drawer"} aria-label="Carrito">
        <div className="cart-head">
          <div>
            <span>Pedido por WhatsApp</span>
            <strong>Tu carrito</strong>
          </div>
          <button onClick={() => setCartOpen(false)} aria-label="Cerrar carrito"><X size={19} /></button>
        </div>
        <div className="cart-body">
          {cart.length ? (
            cart.map((item, index) => (
              <div className="cart-item" key={`${item.product.id}-${item.color?.variantId || item.color?.name || "base"}`}>
                <div>
                  <strong>{item.product.name}</strong>
                  <span>{[item.color?.name, item.color?.model].filter(Boolean).join(" / ") || item.product.category}</span>
                  <small>{formatPrice(getProductUnitPrice(item.product), item.product.currency)}</small>
                </div>
                <div className="cart-controls">
                  <button onClick={() => updateCartItem(index, item.quantity - 1)} aria-label="Restar unidad"><Minus size={14} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateCartItem(index, item.quantity + 1)} aria-label="Sumar unidad"><Plus size={14} /></button>
                  <button onClick={() => updateCartItem(index, 0)} aria-label="Eliminar producto"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-cart">
              <ShoppingCart size={30} />
              <strong>Tu carrito está vacío</strong>
              <p>Agregá productos destacados y cerramos disponibilidad por WhatsApp.</p>
            </div>
          )}
        </div>
        <div className="cart-footer">
          <div>
            <span>Total estimado</span>
            <strong>{cartTotalLabel || formatPrice(0)}</strong>
          </div>
          <button className="button submit-button" disabled={!cart.length} onClick={sendCartToWhatsApp}>
            <WhatsAppIcon />
            Enviar pedido
          </button>
          <small>No se cobra en la web. Confirmamos stock y pago por WhatsApp.</small>
        </div>
      </aside>

      <a
        className="floating-whatsapp"
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola isell.cba, quiero hacer una consulta.")}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar por WhatsApp"
      >
        <WhatsAppIcon size={23} />
      </a>
    </main>
  );
}
