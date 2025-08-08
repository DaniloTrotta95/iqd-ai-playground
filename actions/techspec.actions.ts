"use server";

import { db } from "@/db/drizzle";
import { products, productTechSpecs, productUsageContexts, productFormats } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq, gte, inArray, lte, like, or, sql } from "drizzle-orm";
import { headers } from "next/headers";

export interface ProductWithSpecs {
  id: number;
  name: string;
  productCategory: 'banner' | 'video' | 'audio' | 'interactive' | 'newsletter' | 'social' | 'display' | 'native';
  width: number | null;
  height: number | null;
  weightKb: number;
  ecoAdWeightKb: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  url: string | null;
  formats: Array<{
    id: number;
    format: 'jpg' | 'png' | 'gif' | 'webp' | 'svg' | 'mp4' | 'webm' | 'html5_zip' | 'html' | 'css' | 'js';
  }>;
  techSpecs: Array<{
    id: number;
    specName: string;
    specValue: string;
    specType: string | null;
  }>;
  usageContexts: Array<{
    id: number;
    usageContext: 'mobile' | 'desktop' | 'tablet' | 'stationary' | 'video' | 'newsletter' | 'audio' | 'web' | 'app';
  }>;
}

export interface TechSpecFilters {
  name?: string;
  gattung?: Array<'mobile' | 'desktop' | 'tablet' | 'stationary' | 'video' | 'newsletter' | 'audio' | 'web' | 'app'>; // usage contexts
  kategorie?: Array<'banner' | 'video' | 'audio' | 'interactive' | 'newsletter' | 'social' | 'display' | 'native'>;
  format?: Array<'jpg' | 'png' | 'gif' | 'webp' | 'svg' | 'mp4' | 'webm' | 'html5' | 'html5_zip' | 'html' | 'css' | 'js'>;
  widthMin?: number;
  widthMax?: number;
  heightMin?: number;
  heightMax?: number;
  weightMin?: number;
  weightMax?: number;
}

export const getTechSpecs = async () => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user ) {
			throw new Error("Unauthorized");
		}
		
		// Get all products
		const allProducts = await db.select().from(products);
		
		// Get tech specs, usage contexts, and formats for all products
		const productIds = allProducts.map(p => p.id);
		
		const allTechSpecs = await db.select().from(productTechSpecs).where(inArray(productTechSpecs.productId, productIds));
		const allUsageContexts = await db.select().from(productUsageContexts).where(inArray(productUsageContexts.productId, productIds));
		const allFormats = await db.select().from(productFormats).where(inArray(productFormats.productId, productIds));
		
		// Group tech specs, usage contexts, and formats by product ID
		const techSpecsByProduct = allTechSpecs.reduce((acc, spec) => {
			if (!acc[spec.productId]) acc[spec.productId] = [];
			acc[spec.productId].push(spec);
			return acc;
		}, {} as Record<number, typeof allTechSpecs>);
		
		const usageContextsByProduct = allUsageContexts.reduce((acc, context) => {
			if (!acc[context.productId]) acc[context.productId] = [];
			acc[context.productId].push(context);
			return acc;
		}, {} as Record<number, typeof allUsageContexts>);
		
		const formatsByProduct = allFormats.reduce((acc, format) => {
			if (!acc[format.productId]) acc[format.productId] = [];
			acc[format.productId].push(format);
			return acc;
		}, {} as Record<number, typeof allFormats>);
		
		// Combine products with their specs, contexts, and formats
		const productsWithSpecs: ProductWithSpecs[] = allProducts.map(product => ({
			...product,
			weightKb: Number(product.weightKb),
			ecoAdWeightKb: product.ecoAdWeightKb ? Number(product.ecoAdWeightKb) : null,
			isActive: product.isActive ?? true,
			createdAt: product.createdAt || new Date(),
			updatedAt: product.updatedAt || new Date(),
			formats: formatsByProduct[product.id] || [],
			techSpecs: techSpecsByProduct[product.id] || [],
			url: product.url || null,
			usageContexts: usageContextsByProduct[product.id] || [],
		}));
		
		return { success: true, data: productsWithSpecs };
	} catch (error) {
		console.error("Error fetching tech specs:", error);
		return { success: false, error: error instanceof Error ? error.message : "Failed to fetch tech specs" };
	}
};

export const getTechSpecsFiltered = async (filters: TechSpecFilters) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const conditions = [] as any[];

    if (filters.name && filters.name.trim().length > 0) {
      const term = `%${filters.name.trim().toLowerCase()}%`;
      conditions.push(sql`lower(${products.name}) like ${term}`);
    }

    if (filters.kategorie && filters.kategorie.length > 0) {
      conditions.push(inArray(products.productCategory, filters.kategorie as any));
    }

    if (filters.widthMin != null && !Number.isNaN(filters.widthMin)) {
      conditions.push(gte(products.width, filters.widthMin));
    }
    if (filters.widthMax != null && !Number.isNaN(filters.widthMax)) {
      conditions.push(lte(products.width, filters.widthMax));
    }

    if (filters.heightMin != null && !Number.isNaN(filters.heightMin)) {
      conditions.push(gte(products.height, filters.heightMin));
    }
    if (filters.heightMax != null && !Number.isNaN(filters.heightMax)) {
      conditions.push(lte(products.height, filters.heightMax));
    }

    if (filters.weightMin != null && !Number.isNaN(filters.weightMin)) {
      conditions.push(gte(products.weightKb, Number(filters.weightMin).toFixed(2)));
    }
    if (filters.weightMax != null && !Number.isNaN(filters.weightMax)) {
      conditions.push(lte(products.weightKb, Number(filters.weightMax).toFixed(2)));
    }

    // Start with base filtered products
    const baseWhere = conditions.length > 0 ? and(...conditions) : undefined;
    let baseProducts = await db.select().from(products).where(baseWhere as any);

    // Filter by usage contexts if provided
    if (filters.gattung && filters.gattung.length > 0) {
      const idsByContext = await db
        .select({ productId: productUsageContexts.productId })
        .from(productUsageContexts)
        .where(inArray(productUsageContexts.usageContext, filters.gattung as any));
      const allowedIds = new Set(idsByContext.map((r) => r.productId));
      baseProducts = baseProducts.filter((p) => allowedIds.has(p.id));
    }

    // Filter by formats if provided (map 'html5' -> 'html5_zip')
    if (filters.format && filters.format.length > 0) {
      const mapped = filters.format.map((f) => (f === 'html5' ? 'html5_zip' : f)) as any[];
      const idsByFormat = await db
        .select({ productId: productFormats.productId })
        .from(productFormats)
        .where(inArray(productFormats.format, mapped as any));
      const allowedIds = new Set(idsByFormat.map((r) => r.productId));
      baseProducts = baseProducts.filter((p) => allowedIds.has(p.id));
    }

    const productIds = baseProducts.map((p) => p.id);

    if (productIds.length === 0) {
      return { success: true, data: [] as ProductWithSpecs[] };
    }

    const allTechSpecs = await db.select().from(productTechSpecs).where(inArray(productTechSpecs.productId, productIds));
    const allUsageContexts = await db.select().from(productUsageContexts).where(inArray(productUsageContexts.productId, productIds));
    const allFormats = await db.select().from(productFormats).where(inArray(productFormats.productId, productIds));

    const techSpecsByProduct = allTechSpecs.reduce((acc, spec) => {
      if (!acc[spec.productId]) acc[spec.productId] = [] as typeof allTechSpecs;
      acc[spec.productId].push(spec);
      return acc;
    }, {} as Record<number, typeof allTechSpecs>);

    const usageContextsByProduct = allUsageContexts.reduce((acc, context) => {
      if (!acc[context.productId]) acc[context.productId] = [] as typeof allUsageContexts;
      acc[context.productId].push(context);
      return acc;
    }, {} as Record<number, typeof allUsageContexts>);

    const formatsByProduct = allFormats.reduce((acc, format) => {
      if (!acc[format.productId]) acc[format.productId] = [] as typeof allFormats;
      acc[format.productId].push(format);
      return acc;
    }, {} as Record<number, typeof allFormats>);

    const productsWithSpecs: ProductWithSpecs[] = baseProducts.map((product) => ({
      ...product,
      weightKb: Number(product.weightKb),
      ecoAdWeightKb: product.ecoAdWeightKb ? Number(product.ecoAdWeightKb) : null,
      isActive: product.isActive ?? true,
      createdAt: product.createdAt || new Date(),
      updatedAt: product.updatedAt || new Date(),
      formats: formatsByProduct[product.id] || [],
      techSpecs: techSpecsByProduct[product.id] || [],
      url: product.url || null,
      usageContexts: usageContextsByProduct[product.id] || [],
    }));

    return { success: true, data: productsWithSpecs };
  } catch (error) {
    console.error("Error fetching filtered tech specs:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch filtered tech specs" };
  }
};

export const getMobileVideoProducts = async () => {
  return await db
  .select()
  .from(products)
  .innerJoin(productUsageContexts, eq(products.id, productUsageContexts.productId))
  .innerJoin(productFormats, eq(products.id, productFormats.productId))
  .where(
    and(
      inArray(productUsageContexts.usageContext, ['mobile', 'video']),
      eq(productFormats.format, 'mp4')
    )
  );
};

// // Filter by dimensions and weight
// const lightweightBanners = await db
//   .select()
//   .from(products)
//   .where(
//     and(
//       eq(products.productCategory, 'banner'),
//       lte(products.weightKb, 100),
//       gte(products.width, 728),
//       eq(products.height, 90)
//     )
//   );

// // Filter by custom tech specs
// const highFrameRateVideos = await db
//   .select()
//   .from(products)
//   .innerJoin(productTechSpecs, eq(products.id, productTechSpecs.productId))
//   .where(
//     and(
//       eq(productTechSpecs.specName, 'frame_rate'),
//       eq(productTechSpecs.specValue, '60fps')
//     )
//   );