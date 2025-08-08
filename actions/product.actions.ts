"use server";

import { db } from "@/db/drizzle";
import { products, productTechSpecs, productUsageContexts, productFormats } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";

export interface CreateProductData {
  name: string;
  productCategory: 'banner' | 'video' | 'audio' | 'interactive' | 'newsletter' | 'social' | 'display' | 'native';
  width?: number;
  height?: number;
  weightKb: number;
  ecoAdWeightKb?: number;
  formats: Array<'jpg' | 'png' | 'gif' | 'webp' | 'svg' | 'mp4' | 'webm' | 'html5_zip' | 'html' | 'css' | 'js'>;
  description?: string;
  usageContexts: Array<'mobile' | 'desktop' | 'tablet' | 'stationary' | 'video' | 'newsletter' | 'audio' | 'web' | 'app'>;
  techSpecs: Array<{
    specName: string;
    specValue: string;
    specType?: string;
  }>;
  url?: string;
}

export interface UpdateProductData {
  id: number;
  name: string;
  productCategory: 'banner' | 'video' | 'audio' | 'interactive' | 'newsletter' | 'social' | 'display' | 'native';
  width?: number | null;
  height?: number | null;
  weightKb: number;
  ecoAdWeightKb?: number | null;
  formats: Array<'jpg' | 'png' | 'gif' | 'webp' | 'svg' | 'mp4' | 'webm' | 'html5_zip' | 'html' | 'css' | 'js'>;
  description?: string | null;
  usageContexts: Array<'mobile' | 'desktop' | 'tablet' | 'stationary' | 'video' | 'newsletter' | 'audio' | 'web' | 'app'>;
  url?: string | null;
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
      weightKb: data.weightKb.toFixed(2),
      ecoAdWeightKb: data.ecoAdWeightKb != null ? Number(data.ecoAdWeightKb).toFixed(2) : null,
      description: data.description ?? null,
      url: data.url ?? null,
    }).returning();

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
      })
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