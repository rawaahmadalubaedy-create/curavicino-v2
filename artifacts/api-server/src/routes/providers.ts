import { Router } from "express";
import { db, providersTable, reviewsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

/* Seed data — same providers as the mobile mock, stored in memory
   and upserted into the DB on first cold start via the seed endpoint. */
export const SEED_PROVIDERS = [
  {
    id: "p1",
    userId: "system",
    name: "Sofia Martinelli",
    specialty: "Alzheimer & Dementia Care Specialist",
    category: "elderly-care" as const,
    pricePerHour: 28,
    heroImage: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&q=85&fit=crop",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=85&fit=crop",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=85&fit=crop",
    ],
    about: "Certified geriatric care specialist with 12 years of experience in Alzheimer and dementia care. I provide compassionate, dignified support while maintaining the highest professional standards. Fluent in Italian, English, and Spanish.",
    certifications: ["Certified Geriatric Care Manager (CGCM)", "Alzheimer's Care Specialist", "CPR & First Aid Certified", "Dementia Care Training (Level 3)"],
    languages: ["Italian", "English", "Spanish"],
    serviceAreas: ["Milano Centro", "Navigli", "Porta Romana", "Lambrate"],
    availabilityStatus: "available" as const,
    responseTime: "< 30 min",
    completedServices: 347,
    memberSince: "Member since 2019",
    isVerified: true,
    rating: 4.9,
    reviewsCount: 89,
  },
  {
    id: "p2",
    userId: "system",
    name: "Marco Bianchi",
    specialty: "Home Care & Disability Support",
    category: "elderly-care" as const,
    pricePerHour: 22,
    heroImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&q=85&fit=crop",
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&q=85&fit=crop",
    ],
    about: "Dedicated home care professional specialising in physical disability support, post-surgery recovery, and daily living assistance. I believe every person deserves independence and dignity.",
    certifications: ["Home Health Aide Certified", "Disability Support Worker", "CPR Certified"],
    languages: ["Italian", "English"],
    serviceAreas: ["Torino Centro", "Mirafiori", "San Salvario"],
    availabilityStatus: "available" as const,
    responseTime: "< 1 hour",
    completedServices: 201,
    memberSince: "Member since 2020",
    isVerified: true,
    rating: 4.7,
    reviewsCount: 54,
  },
  {
    id: "p3",
    userId: "system",
    name: "Elena Russo",
    specialty: "Pharmacy & Grocery Delivery",
    category: "delivery" as const,
    pricePerHour: 15,
    heroImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&q=85&fit=crop",
      "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400&q=85&fit=crop",
    ],
    about: "Fast and reliable delivery specialist for pharmacies, supermarkets and local shops. Available 7 days a week with a fully equipped vehicle for temperature-sensitive items.",
    certifications: ["Food Handling Certificate", "Driver's License (B)", "Customer Service Excellence"],
    languages: ["Italian"],
    serviceAreas: ["Roma Centro", "Prati", "Trastevere", "Testaccio"],
    availabilityStatus: "available" as const,
    responseTime: "< 45 min",
    completedServices: 528,
    memberSince: "Member since 2021",
    isVerified: true,
    rating: 4.8,
    reviewsCount: 112,
  },
  {
    id: "p4",
    userId: "system",
    name: "Luigi Ferrari",
    specialty: "Plumbing & Electrical Repair",
    category: "home-services" as const,
    pricePerHour: 35,
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=85&fit=crop",
    ],
    about: "Master plumber and electrician with 15 years of experience. All work guaranteed and fully insured. Available for emergencies.",
    certifications: ["Licensed Master Plumber", "Certified Electrician (Type B)", "Gas Safety Certificate"],
    languages: ["Italian"],
    serviceAreas: ["Napoli Centro", "Posillipo", "Vomero"],
    availabilityStatus: "busy" as const,
    responseTime: "< 2 hours",
    completedServices: 683,
    memberSince: "Member since 2018",
    isVerified: true,
    rating: 4.6,
    reviewsCount: 178,
  },
  {
    id: "p5",
    userId: "system",
    name: "Anna Conti",
    specialty: "House Cleaning & Organisation",
    category: "home-services" as const,
    pricePerHour: 18,
    heroImage: "https://images.unsplash.com/photo-1527515545081-5db817172677?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=85&fit=crop",
    ],
    about: "Professional home cleaning and organisation specialist. I use eco-friendly products and pay attention to every detail so your home feels truly clean and welcoming.",
    certifications: ["Professional Cleaning Certificate", "Eco-Clean Certified"],
    languages: ["Italian", "Romanian"],
    serviceAreas: ["Firenze Centro", "Oltrarno", "Campo di Marte"],
    availabilityStatus: "available" as const,
    responseTime: "< 1 hour",
    completedServices: 412,
    memberSince: "Member since 2020",
    isVerified: true,
    rating: 4.9,
    reviewsCount: 97,
  },
  {
    id: "p6",
    userId: "system",
    name: "Roberto Palermo",
    specialty: "Restaurant & Mall Delivery",
    category: "delivery" as const,
    pricePerHour: 14,
    heroImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&q=85&fit=crop",
    ],
    about: "Reliable delivery driver specialising in restaurant food delivery and mall shopping. Punctual, careful with fragile items, and always communicates proactively.",
    certifications: ["Food Safety Level 2", "Driver's License (B+C)"],
    languages: ["Italian", "English"],
    serviceAreas: ["Bologna Centro", "San Vitale", "Mazzini"],
    availabilityStatus: "offline" as const,
    responseTime: "< 1 hour",
    completedServices: 289,
    memberSince: "Member since 2021",
    isVerified: false,
    rating: 4.5,
    reviewsCount: 61,
  },
];

/* GET /api/providers?category=elderly-care */
router.get("/providers", async (req, res) => {
  try {
    const { category } = req.query;
    const rows = await db
      .select()
      .from(providersTable)
      .where(category ? eq(providersTable.category, category as any) : undefined);

    /* Return full shape expected by the mobile app */
    const providers = rows.map(dbRowToProvider);
    res.json(providers);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* GET /api/providers/:id */
router.get("/providers/:id", async (req, res) => {
  try {
    const [row] = await db
      .select()
      .from(providersTable)
      .where(eq(providersTable.id, req.params.id))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Provider not found" });
      return;
    }

    /* Fetch live reviews */
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.providerId, row.id));

    const provider = dbRowToProvider(row);
    provider.reviewsList = reviews.map((r) => ({
      id: r.id,
      author: r.customerName,
      rating: r.rating,
      text: r.text,
      date: r.createdAt.toLocaleDateString("it-IT"),
      avatar: r.customerAvatar ?? "",
    }));

    res.json(provider);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* POST /api/providers/seed  — idempotent, admin only in prod; open here for setup */
router.post("/providers/seed", async (_req, res) => {
  try {
    for (const p of SEED_PROVIDERS) {
      await db
        .insert(providersTable)
        .values(p)
        .onConflictDoUpdate({
          target: providersTable.id,
          set: {
            name: p.name,
            rating: p.rating,
            reviewsCount: p.reviewsCount,
            availabilityStatus: p.availabilityStatus,
          },
        });
    }
    res.json({ seeded: SEED_PROVIDERS.length });
  } catch (err) {
    _req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function dbRowToProvider(row: typeof providersTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating ?? 0,
    reviews: row.reviewsCount ?? 0,
    experience: `${new Date().getFullYear() - parseInt(row.memberSince?.split(" ").pop() ?? "2020")} years`,
    pricePerHour: row.pricePerHour,
    category: row.category,
    specialty: row.specialty,
    isVerified: row.isVerified ?? false,
    phone: "",
    heroImage: row.heroImage,
    profilePhoto: row.profilePhoto,
    gallery: row.gallery ?? [],
    about: row.about ?? "",
    certifications: row.certifications ?? [],
    languages: row.languages ?? [],
    serviceAreas: row.serviceAreas ?? [],
    availabilityStatus: row.availabilityStatus ?? "available",
    responseTime: row.responseTime ?? "< 1 hour",
    completedServices: row.completedServices ?? 0,
    memberSince: row.memberSince ?? "",
    reviewsList: [] as any[],
  };
}

export default router;
