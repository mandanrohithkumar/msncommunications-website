import { NextRequest, NextResponse } from "next/server";
import {
  getLocalTelanganaPincode,
  normalizeTelanganaDistrict,
  CURATED_TELANGANA_PINCODES
} from "@/lib/telangana-pincodes-data";
import { TELANGANA_LOCATIONS } from "@/components/telangana-locations";

// In-memory server cache for ultra-fast < 1ms repeated responses
const serverCache = new Map<
  string,
  {
    success: boolean;
    pincode: string;
    district: string;
    mandal: string;
    villages: string[];
    state: string;
    source: string;
    timestamp: number;
  }
>();

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface IndiaPostOffice {
  Name: string;
  Description?: string;
  BranchType?: string;
  DeliveryStatus?: string;
  Circle?: string;
  District: string;
  Division?: string;
  Region?: string;
  Block: string;
  State: string;
  Country?: string;
  Pincode: string;
}

interface IndiaPostResponse {
  Message: string;
  Status: "Success" | "Error";
  PostOffice: IndiaPostOffice[] | null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ pincode: string }> }
) {
  try {
    const { pincode: rawPincode } = await context.params;
    const pincode = (rawPincode || "").trim();

    // 1. Strict 6-Digit Format Validation
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid 6-digit PIN code."
        },
        { status: 400 }
      );
    }

    // 2. Check Server Memory Cache
    const cached = serverCache.get(pincode);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ ...cached, cached: true });
    }

    // 3. Fast-path: Check Rich Curated Telangana Dataset
    const curated = CURATED_TELANGANA_PINCODES[pincode];
    if (curated) {
      const responseData = {
        success: true,
        pincode: curated.pincode,
        district: curated.district,
        mandal: curated.mandal,
        villages: curated.villages,
        state: curated.state,
        source: "curated-dataset"
      };
      serverCache.set(pincode, { ...responseData, timestamp: Date.now() });
      return NextResponse.json(responseData);
    }

    // 4. Check fallback local Telangana Mandal Index
    const localFallback = getLocalTelanganaPincode(pincode);

    // 5. Query Official India Post API for Comprehensive Live Post Office & Village Data
    let apiData: IndiaPostResponse[] | null = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "User-Agent": "TelanganaLocationPortal/1.0"
        },
        next: { revalidate: 86400 } // Cache for 24 hours in Next.js data cache
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        apiData = await res.json();
      }
    } catch (fetchErr) {
      // If external API times out or network is restricted, we gracefully fall back to local dataset
      console.warn(`[Pincode API] External fetch failed for ${pincode}, falling back to local dataset:`, fetchErr);
    }

    // 6. Process India Post API Response if successful
    if (apiData && Array.isArray(apiData) && apiData[0]?.Status === "Success" && apiData[0].PostOffice) {
      const offices = apiData[0].PostOffice;

      // Extract unique post office / village names
      const villageNamesSet = new Set<string>();
      offices.forEach((o) => {
        if (o.Name) {
          villageNamesSet.add(o.Name.trim());
        }
      });
      const villages = Array.from(villageNamesSet).sort((a, b) => a.localeCompare(b));

      // Resolve District & Mandal
      const firstOffice = offices[0];
      let resolvedDistrict = normalizeTelanganaDistrict(firstOffice.District);
      let resolvedMandal = firstOffice.Block && firstOffice.Block !== "NA" ? firstOffice.Block.trim() : "";

      // If district wasn't resolved by district name alone, resolve via Block (Mandal name) in TELANGANA_LOCATIONS
      if (!resolvedDistrict && resolvedMandal) {
        for (const dist of TELANGANA_LOCATIONS) {
          const matchingMandal = dist.mandals.find(
            (m) => m.name.toLowerCase() === resolvedMandal.toLowerCase()
          );
          if (matchingMandal) {
            resolvedDistrict = dist.name;
            resolvedMandal = matchingMandal.name;
            break;
          }
        }
      }

      // If still not resolved, check local fallback
      if (!resolvedDistrict && localFallback) {
        resolvedDistrict = localFallback.district;
      }
      if (!resolvedMandal && localFallback) {
        resolvedMandal = localFallback.mandal;
      }

      // Default fallbacks if district is still undetermined
      if (!resolvedDistrict) {
        resolvedDistrict = firstOffice.District || "Telangana";
      }
      if (!resolvedMandal) {
        resolvedMandal = villages[0] || resolvedDistrict;
      }

      const responseData = {
        success: true,
        pincode,
        district: resolvedDistrict,
        mandal: resolvedMandal,
        villages: villages.length > 0 ? villages : [resolvedMandal],
        state: "Telangana",
        source: "india-post-live"
      };

      serverCache.set(pincode, { ...responseData, timestamp: Date.now() });
      return NextResponse.json(responseData);
    }

    // 7. If India Post has no records or failed, use local dataset if available
    if (localFallback) {
      const responseData = {
        success: true,
        pincode: localFallback.pincode,
        district: localFallback.district,
        mandal: localFallback.mandal,
        villages: localFallback.villages,
        state: localFallback.state,
        source: "local-indexed-mandal"
      };
      serverCache.set(pincode, { ...responseData, timestamp: Date.now() });
      return NextResponse.json(responseData);
    }

    // 8. If PIN code is not found anywhere
    return NextResponse.json(
      {
        success: false,
        error: `PIN code ${pincode} not found. Please verify the 6-digit code or choose your District and Mandal manually.`
      },
      { status: 404 }
    );
  } catch (err: unknown) {
    console.error("[Pincode API Handler Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while looking up the PIN code. Please enter location manually."
      },
      { status: 500 }
    );
  }
}
