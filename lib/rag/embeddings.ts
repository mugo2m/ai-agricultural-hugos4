// lib/rag/embeddings.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createHash } from "crypto";
import { supabase } from "@/lib/supabase/client";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({ model: "models/text-embedding-001" });

// Cache for embeddings to avoid redundant API calls
const embeddingCache = new Map<string, number[]>();

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Check memory cache first
    const cacheKey = createHash('sha256').update(text).digest('hex');
    if (embeddingCache.has(cacheKey)) {
      console.log("🎯 Embedding cache HIT (memory)");
      return embeddingCache.get(cacheKey)!;
    }

    // Check Supabase cache
    const { data: cached } = await supabase
      .from('embedding_cache')
      .select('embedding')
      .eq('text_hash', cacheKey)
      .single();

    if (cached) {
      console.log("🎯 Embedding cache HIT (database)");
      embeddingCache.set(cacheKey, cached.embedding);
      return cached.embedding;
    }

    // Generate new embedding
    console.log("🔄 Generating new embedding...");
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding.values;

    // Store in caches
    embeddingCache.set(cacheKey, embedding);

    // Store in Supabase (async, don't await)
    supabase.from('embedding_cache').insert({
      text_hash: cacheKey,
      text: text.substring(0, 1000), // Store preview
      embedding: embedding,
      created_at: new Date().toISOString()
    }).then().catch(console.error);

    return embedding;
  } catch (error) {
    console.error("❌ Embedding generation failed:", error);
    // Fallback to zero vector
    return new Array(768).fill(0);
  }
}

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    try {
      const embedding = await generateEmbedding(text);
      embeddings.push(embedding);
    } catch (error) {
      console.error("Failed to generate embedding for chunk:", error);
      embeddings.push(new Array(768).fill(0));
    }
  }

  return embeddings;
}