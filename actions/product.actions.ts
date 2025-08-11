"use server";

import { db } from "@/db/drizzle";
import { products, productTechSpecs, productUsageContexts, productFormats } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";

export interface CreateProductData {
  name: string;
  productCategory: 'standardwerbeform' | 'sonderwerbeform' | 'kombinationswerbeform' | 'instream' | 'inpage';
  width?: number;
  height?: number;
  weightKb: number;
  ecoAdWeightKb?: number;
  formats: Array<'jpg' | 'png' | 'gif' | 'html5' | 'mp4 (H.264)' | '3rd-Party-Redirect' | 'mp3'>;
  description?: string;
  usageContexts: Array<'display' | 'newsletter' | 'audio' | 'video' | 'app' | 'native'>;
  techSpecs: Array<{
    specName: string;
    specValue: string;
    specType?: string;
  }>;
  url?: string;
  impressionPixel?: boolean;
  isEcoAd?: boolean;
  isSkippable?: boolean;
  maxDuration?: number;
  maxHeaderSize?: number;
  maxTextSize?: number;
  maxCTASize?: number;
}

export interface UpdateProductData {
  id: number;
  name: string;
  productCategory: 'standardwerbeform' | 'sonderwerbeform' | 'kombinationswerbeform' | 'instream' | 'inpage';
  width?: number | null;
  height?: number | null;
  weightKb: number;
  ecoAdWeightKb?: number | null;
  formats: Array<'jpg' | 'png' | 'gif' | 'html5' | 'mp4 (H.264)' | '3rd-Party-Redirect' | 'mp3'>;
  description?: string | null;
  usageContexts: Array<'display' | 'newsletter' | 'audio' | 'video' | 'app' | 'native'>;
  url?: string | null;
  impressionPixel?: boolean;
  isEcoAd?: boolean;
  isSkippable?: boolean;
  maxDuration?: number | null;
  maxHeaderSize?: number | null;
  maxTextSize?: number | null;
  maxCTASize?: number | null;
}

export const createProduct = async (data: CreateProductData) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    // Create the product
    const [product] = await db.insert(products).values({
      name: data.name,
      productCategory: data.productCategory,
      width: data.width ?? null,
      height: data.height ?? null,
      // decimal columns expect string values
      weightKb: data.weightKb != null ? Number(data.weightKb).toFixed(2) : null,
      ecoAdWeightKb: data.ecoAdWeightKb != null ? Number(data.ecoAdWeightKb).toFixed(2) : null,
      description: data.description ?? null,
      url: data.url ?? null,
      impressionPixel: data.impressionPixel ?? false,
      isEcoAd: data.isEcoAd ?? false,
      isSkippable: data.isSkippable ?? false,
      maxDuration: data.maxDuration ?? null,
      maxHeaderSize: data.maxHeaderSize ?? null,
      maxTextSize: data.maxTextSize ?? null,
      maxCTASize: data.maxCTASize ?? null,
    } as any).returning();

    // Create formats
    if (data.formats.length > 0) {
      await db.insert(productFormats).values(
        data.formats.map(format => ({
          productId: product.id,
          format: format,
        }))
      );
    }

    // Create usage contexts
    if (data.usageContexts.length > 0) {
      await db.insert(productUsageContexts).values(
        data.usageContexts.map(context => ({
          productId: product.id,
          usageContext: context,
        }))
      );
    }

    // Create tech specs
    if (data.techSpecs.length > 0) {
      await db.insert(productTechSpecs).values(
        data.techSpecs.map(spec => ({
          productId: product.id,
          specName: spec.specName,
          specValue: spec.specValue,
          specType: spec.specType || null,
        }))
      );
    }

    revalidatePath('/techspec');
    return { success: true, data: product };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create product" };
  }
};

export const updateProduct = async (data: UpdateProductData) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    // Enforce admin-only access
    const userRole = (session.user as any)?.role;
    if (userRole !== 'admin') {
      throw new Error("Forbidden");
    }

    // Update base product
    const [updated] = await db
      .update(products)
      .set({
        name: data.name,
        productCategory: data.productCategory,
        width: data.width ?? null,
        height: data.height ?? null,
        weightKb: data.weightKb.toFixed(2),
        ecoAdWeightKb: data.ecoAdWeightKb != null ? Number(data.ecoAdWeightKb).toFixed(2) : null,
        description: data.description ?? null,
        url: data.url ?? null,
        impressionPixel: data.impressionPixel ?? false,
        isEcoAd: data.isEcoAd ?? false,
        isSkippable: data.isSkippable ?? false,
        maxDuration: data.maxDuration ?? null,
        maxHeaderSize: data.maxHeaderSize ?? null,
        maxTextSize: data.maxTextSize ?? null,
        maxCTASize: data.maxCTASize ?? null,
      } as any)
      .where(eq(products.id, data.id))
      .returning();

    // Replace formats
    await db.delete(productFormats).where(eq(productFormats.productId, data.id));
    if (data.formats.length > 0) {
      await db.insert(productFormats).values(
        data.formats.map((format) => ({ productId: data.id, format }))
      );
    }

    // Replace usage contexts
    await db.delete(productUsageContexts).where(eq(productUsageContexts.productId, data.id));
    if (data.usageContexts.length > 0) {
      await db.insert(productUsageContexts).values(
        data.usageContexts.map((ctx) => ({ productId: data.id, usageContext: ctx }))
      );
    }

    revalidatePath('/techspec');
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update product" };
  }
};

export const deleteProduct = async (productId: number) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    // Enforce admin-only access
    const userRole = (session.user as any)?.role;
    if (userRole !== 'admin') {
      throw new Error("Forbidden");
    }

    // Delete child records first (no ON DELETE CASCADE defined)
    await db.delete(productTechSpecs).where(eq(productTechSpecs.productId, productId));
    await db.delete(productFormats).where(eq(productFormats.productId, productId));
    await db.delete(productUsageContexts).where(eq(productUsageContexts.productId, productId));

    // Delete the product
    await db.delete(products).where(eq(products.id, productId));

    revalidatePath('/techspec');
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete product" };
  }
};

export const getProducts = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const allProducts = await db.select().from(products);
    return { success: true, data: allProducts };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch products" };
  }
};

export const getProductWithSpecs = async (productId: number) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const product = await db.select().from(products).where(eq(products.id, productId));
    const techSpecs = await db.select().from(productTechSpecs).where(eq(productTechSpecs.productId, productId));
    const usageContexts = await db.select().from(productUsageContexts).where(eq(productUsageContexts.productId, productId));

    return { 
      success: true, 
      data: { 
        product: product[0], 
        techSpecs, 
        usageContexts 
      } 
    };
  } catch (error) {
    console.error("Error fetching product with specs:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch product with specs" };
  }
}; 