"use server"

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mengambil seluruh konten dari database menjadi bentuk { key: "value" }
export async function getAllContent(): Promise<Record<string, string>> {
  try {
    const contents = await prisma.siteContent.findMany()
    const contentMap: Record<string, string> = {}
    contents.forEach((item) => {
      contentMap[item.key] = item.value
    })
    return contentMap
  } catch (error) {
    console.error("Error fetching site content:", error)
    return {}
  }
}

// Menyimpan atau memperbarui konten
export async function upsertContent(key: string, value: string): Promise<boolean> {
  try {
    await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })
    return true
  } catch (error) {
    console.error("Error upserting content:", error)
    return false
  }
}
