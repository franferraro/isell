"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

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
  updatedAt?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
  color?: ProductColor;
};

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
    ],
    compatibleModels: ["Ver variantes"],
    imageUrl: "",
    description: "Funda compatible con MagSafe.",
    order: 10,
    tags: ["funda", "magsafe", "iphone"],
  },
];

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

function getCartTotals(cart: CartItem[]) {
  const totals = new Map<string, number>();

  cart.forEach((item) => {
    const currency = item.product.currency || "ARS";
    totals.set(currency, (totals.get(currency) || 0) + item.quantity * item.product.price);
  });

  return Array.from(totals.entries()).map(([currency, total]) => ({ currency, total }));
}

function formatCartTotals(cart: CartItem[]) {
  const totals = getCartTotals(cart);
  return totals.map((item) => formatPrice(item.total, item.currency)).join(" + ");
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [catalogUpdatedAt, setCatalogUpdatedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadProducts(showRefreshing = false) {
      try {
        if (showRefreshing && !ignore) setIsRefreshing(true);
        const response = await fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as ProductsPayload;
        if (!ignore && data.products?.length) {
          setProducts(data.products);
          setCatalogUpdatedAt(data.updatedAt ? new Date(data.updatedAt) : new Date());
        }
      } catch {
        // Keep curated fallback.
      } finally {
        if (showRefreshing && !ignore) setIsRefreshing(false);
      }
    }

    loadProducts();
    const interval = window.setInterval(() => loadProducts(true), 30000);

    return () => {
      ignore = true;
      window.clearInterval(interval);
    };
  }, []);

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const visibleProducts = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return products.filter((product) => {
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      const searchable = normalizeText([
        product.name,
        product.category,
        product.family,
        product.type,
        product.description,
        product.tags.join(" "),
      ].join(" "));

      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [products, query, selectedCategory]);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotals = getCartTotals(cart);
  const cartTotalLabel = formatCartTotals(cart);
  const spotlightProducts = products.filter((product) => product.featured);
  const fallbackSpotlightProducts = products.filter((product) => product.imageUrl);
  const spotlightPool = spotlightProducts.length ? spotlightProducts : fallbackSpotlightProducts;
  const activeSpotlightIndex = spotlightPool.length ? spotlightIndex % spotlightPool.length : 0;
  const heroProduct = spotlightPool[activeSpotlightIndex] || products[0];
  const featuredCount = spotlightProducts.length;
  const availableCount = products.filter((product) => product.stockStatus === "Disponible").length;
  const updatedLabel = catalogUpdatedAt
    ? catalogUpdatedAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    : "cargando";
  const goToPreviousSpotlight = () => {
    if (!spotlightPool.length) return;
    setSpotlightIndex((current) => (current - 1 + spotlightPool.length) % spotlightPool.length);
  };
  const goToNextSpotlight = () => {
    if (!spotlightPool.length) return;
    setSpotlightIndex((current) => (current + 1) % spotlightPool.length);
  };

  useEffect(() => {
    if (spotlightPool.length < 2) return;

    const interval = window.setInterval(() => {
      setSpotlightIndex((current) => (current + 1) % spotlightPool.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [spotlightPool.length]);

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
      source: "web-products-page",
      currency: cartTotals.length === 1 ? cartTotals[0].currency : "MULTI",
      total: cartTotals.length === 1 ? cartTotals[0].total : undefined,
      totalsByCurrency: cartTotals,
      totalLabel: cartTotalLabel,
      items: cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        currency: item.product.currency,
        variantId: item.color?.variantId,
        color: item.color?.name,
        model: item.color?.model,
      })),
    };

    const draft = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    }).then((response) => response.json()).catch(() => ({ id: undefined }));

    const lines = cart.map((item) => {
      const detail = [item.color?.name, item.color?.model].filter(Boolean).join(" / ");
      return `• ${item.quantity} x ${item.product.name}${detail ? ` (${detail})` : ""} - ${formatPrice(item.product.price * item.quantity, item.product.currency)}`;
    }).join("\n");

    const message = `Hola isell.cba, quiero consultar disponibilidad de este pedido.

Pedido: ${draft.id || "sin registrar"}

${lines}

Total estimado: ${cartTotalLabel}

Me confirman disponibilidad y forma de pago/envío?`;

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <Link className="brand" href="/" aria-label="Volver al inicio">
          <Image src="/images/logo-isell.png" alt="isell.cba" width={46} height={48} priority />
          <span>isell.cba</span>
        </Link>
        <nav>
          <Link className="catalog-back-link" href="/">
            <ArrowLeft size={16} />
            <span>
              Inicio
            </span>
          </Link>
          <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label="Abrir carrito">
            <ShoppingCart size={17} />
            {cartItemsCount > 0 && <span>{cartItemsCount}</span>}
          </button>
        </nav>
      </header>

      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <span className="section-kicker">Catálogo completo</span>
          <h1>Accesorios y tecnología<br /><em>listos para consultar.</em></h1>
          <p>Explorá productos, colores y precios actualizados desde Sheets. Armá el carrito y cerramos stock, pago y entrega por WhatsApp.</p>
          <div className="catalog-hero-actions">
            <a href="#catalogo">
              Ver productos <ArrowRight size={16} />
            </a>
            <button onClick={() => setCartOpen(true)}>
              <ShoppingCart size={16} />
              Ver carrito
            </button>
          </div>
          <div className="catalog-hero-stats">
            <span><strong>{products.length}</strong> productos</span>
            <span><strong>{featuredCount}</strong> destacados</span>
            <span><strong>{availableCount}</strong> disponibles</span>
          </div>
        </div>
        {heroProduct && (
          <div className="catalog-spotlight" key={heroProduct.id}>
            <div className="spotlight-topline">
              <div className="spotlight-label"><Sparkles size={15} /> Destacado</div>
              {spotlightPool.length > 1 && (
                <div className="spotlight-arrows">
                  <button onClick={goToPreviousSpotlight} aria-label="Ver destacado anterior">
                    <ChevronLeft size={17} />
                  </button>
                  <button onClick={goToNextSpotlight} aria-label="Ver destacado siguiente">
                    <ChevronRight size={17} />
                  </button>
                </div>
              )}
            </div>
            <div className="spotlight-image">
              {heroProduct.imageUrl ? (
                // Product images are managed from Sheets and may come from any provider URL.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroProduct.imageUrl} alt={heroProduct.name} />
              ) : (
                <PackageCheck size={76} />
              )}
            </div>
            <div className="spotlight-info">
              <span>{heroProduct.category}</span>
              <strong>{heroProduct.name}</strong>
              <small>{formatPrice(heroProduct.price, heroProduct.currency)}</small>
            </div>
            {spotlightPool.length > 1 && (
              <div className="spotlight-strip" aria-label="Productos destacados">
                {spotlightPool.map((product, index) => (
                  <button
                    className={index === activeSpotlightIndex ? "is-active" : ""}
                    key={product.id}
                    onClick={() => setSpotlightIndex(index)}
                    aria-label={`Ver destacado ${product.name}`}
                  >
                    {product.imageUrl ? (
                      // Product images are managed from Sheets and may come from any provider URL.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt="" loading="lazy" />
                    ) : (
                      <PackageCheck size={18} />
                    )}
                    <span>{product.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="catalog-shell" id="catalogo">
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar fundas, cables, AirPods..."
            />
          </label>
          <div className="catalog-live-status">
            <span>{visibleProducts.length} productos · actualizado {updatedLabel}</span>
            <button onClick={() => {
              setIsRefreshing(true);
              fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" })
                .then((response) => response.ok ? response.json() : null)
                .then((data: ProductsPayload | null) => {
                  if (data?.products?.length) {
                    setProducts(data.products);
                    setCatalogUpdatedAt(data.updatedAt ? new Date(data.updatedAt) : new Date());
                  }
                })
                .finally(() => setIsRefreshing(false));
            }}>
              <RefreshCw size={14} className={isRefreshing ? "is-spinning" : ""} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="product-tabs catalog-tabs">
          {categories.map((category) => (
            <button
              className={selectedCategory === category ? "is-active" : ""}
              key={category}
              onClick={() => setSelectedCategory(category)}
            >
              <span>{category}</span>
              <small>{category === "Todos" ? products.length : products.filter((product) => product.category === category).length}</small>
            </button>
          ))}
        </div>

        <div className="product-grid catalog-grid">
          {visibleProducts.map((product) => {
            const firstColor = product.colors[0];
            const displayColors = getDisplayColors(product);

            return (
              <article className="product-card catalog-card" key={product.id}>
                <div className="product-media">
                  {product.imageUrl ? (
                    // Product images are managed from Sheets and may come from any provider URL.
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
                    <strong>{formatPrice(product.price, product.currency)}</strong>
                    <small>{product.stockStatus}</small>
                  </div>
                  {!!displayColors.length && (
                    <div className="color-row" aria-label={`Colores disponibles para ${product.name}`}>
                      {displayColors.slice(0, 8).map((color, colorIndex) => (
                        <i
                          key={`${color.name}-${colorIndex}`}
                          title={color.name}
                          style={{ background: color.hex || "#ffffff" }}
                        />
                      ))}
                      {displayColors.length > 8 && <b>+{displayColors.length - 8}</b>}
                    </div>
                  )}
                  <button className="product-add" onClick={() => addToCart(product, firstColor)}>
                    <ShoppingCart size={16} />
                    Agregar al carrito
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

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
                  <small>{formatPrice(item.product.price, item.product.currency)}</small>
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
              <p>Agregá productos y cerramos disponibilidad por WhatsApp.</p>
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

      <a className="floating-whatsapp" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp">
        <WhatsAppIcon size={23} />
      </a>
    </main>
  );
}
