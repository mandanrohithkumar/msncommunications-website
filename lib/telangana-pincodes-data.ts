/**
 * Telangana State Pincodes & Jurisdictions Comprehensive Dataset
 * Maps 6-digit PIN codes to District, Mandal, and associated Villages/Localities/Post Offices.
 * Covers all 33 Districts and 589+ Revenue Mandals of Telangana.
 */

import { TELANGANA_LOCATIONS, findDistrict } from "@/components/telangana-locations";

export interface TelanganaPincodeRecord {
  pincode: string;
  district: string;
  mandal: string;
  villages: string[];
  state: "Telangana";
}

/**
 * Historical and administrative alias mapping to map old or variant district names
 * (such as from India Post's pre-bifurcation database) to modern 33 Telangana districts.
 */
export const TELANGANA_DISTRICT_ALIASES: Record<string, string> = {
  "mahabub nagar": "Mahabubnagar",
  "mahabubnagar": "Mahabubnagar",
  "ranga reddi": "Ranga Reddy",
  "rangareddi": "Ranga Reddy",
  "rangareddy": "Ranga Reddy",
  "ranga reddy": "Ranga Reddy",
  "k.v.ranga reddy": "Ranga Reddy",
  "medchal": "Medchal-Malkajgiri",
  "medchal malkajgiri": "Medchal-Malkajgiri",
  "medchal-malkajgiri": "Medchal-Malkajgiri",
  "malkajgiri": "Medchal-Malkajgiri",
  "hanamkonda": "Hanumakonda",
  "hanumakonda": "Hanumakonda",
  "warangal urban": "Hanumakonda",
  "warangal rural": "Warangal",
  "kothagudem": "Bhadradri Kothagudem",
  "bhadradri": "Bhadradri Kothagudem",
  "bhadradri kothagudem": "Bhadradri Kothagudem",
  "bhupalpally": "Jayashankar Bhupalpally",
  "jayashankar": "Jayashankar Bhupalpally",
  "jayashankar bhupalpally": "Jayashankar Bhupalpally",
  "asifabad": "Kumuram Bheem Asifabad",
  "kumuram bheem": "Kumuram Bheem Asifabad",
  "komaram bheem": "Kumuram Bheem Asifabad",
  "gadwal": "Jogulamba Gadwal",
  "jogulamba": "Jogulamba Gadwal",
  "jogulamba gadwal": "Jogulamba Gadwal",
  "sircilla": "Rajanna Sircilla",
  "rajanna": "Rajanna Sircilla",
  "rajanna sircilla": "Rajanna Sircilla",
  "bhongir": "Yadadri Bhuvanagiri",
  "yadadri": "Yadadri Bhuvanagiri",
  "yadadri bhuvanagiri": "Yadadri Bhuvanagiri",
  "hyderabad": "Hyderabad",
  "secunderabad": "Hyderabad",
  "adilabad": "Adilabad",
  "jagtial": "Jagtial",
  "jangaon": "Jangaon",
  "kamareddy": "Kamareddy",
  "karimnagar": "Karimnagar",
  "khammam": "Khammam",
  "mahabubabad": "Mahabubabad",
  "mancherial": "Mancherial",
  "medak": "Medak",
  "mulugu": "Mulugu",
  "nagarkurnool": "Nagarkurnool",
  "nalgonda": "Nalgonda",
  "narayanpet": "Narayanpet",
  "nirmal": "Nirmal",
  "nizamabad": "Nizamabad",
  "peddapalli": "Peddapalli",
  "sangareddy": "Sangareddy",
  "siddipet": "Siddipet",
  "suryapet": "Suryapet",
  "vikarabad": "Vikarabad",
  "wanaparthy": "Wanaparthy",
  "warangal": "Warangal"
};

/**
 * Curated offline dataset of prominent Telangana PIN codes with full lists of villages/localities.
 * Provides instant 0ms lookup without relying on external network requests.
 */
export const CURATED_TELANGANA_PINCODES: Record<string, TelanganaPincodeRecord> = {
  // Nagarkurnool District Hubs & Mandals
  "509209": {
    pincode: "509209",
    district: "Nagarkurnool",
    mandal: "Nagarkurnool",
    villages: [
      "Nagarkurnool Town",
      "Aithole",
      "Chandubatla",
      "Guntakodur",
      "Indrakal",
      "Medipur",
      "Nallavelli",
      "Peddapur",
      "Polmoor",
      "Udimilla",
      "Venkatapur",
      "Deshithanda",
      "Geddamvari Pally",
      "Kothapally",
      "Thimmajipet Road"
    ],
    state: "Telangana"
  },
  "509102": {
    pincode: "509102",
    district: "Nagarkurnool",
    mandal: "Kollapur",
    villages: [
      "Kollapur",
      "Kodair",
      "Pentlavelly",
      "Singotam",
      "Bekkem",
      "Bollaram",
      "Chinnambavi",
      "Jataprole",
      "Machupally",
      "Malleshwaram",
      "Peddakothapally",
      "Yellur"
    ],
    state: "Telangana"
  },
  "509375": {
    pincode: "509375",
    district: "Nagarkurnool",
    mandal: "Achampet",
    villages: [
      "Achampet",
      "Balmoor",
      "Bommangadda",
      "Channaram",
      "Ghanpur",
      "Hajipur",
      "Laxmapur",
      "Puljal",
      "Rangapur",
      "Singavaram"
    ],
    state: "Telangana"
  },
  "509324": {
    pincode: "509324",
    district: "Nagarkurnool",
    mandal: "Kalwakurthy",
    villages: [
      "Kalwakurthy",
      "Charakonda",
      "Gunduru",
      "Jillella",
      "Kurmidda",
      "Marchala",
      "Mukural",
      "Panjugula",
      "Raghupathipet",
      "Thandoor",
      "Urkonda",
      "Vangur"
    ],
    state: "Telangana"
  },
  "509203": {
    pincode: "509203",
    district: "Nagarkurnool",
    mandal: "Bijinapally",
    villages: [
      "Bijinapally",
      "Dharur",
      "Gangoor",
      "Karukonda",
      "Lattupally",
      "Maddigatla",
      "Manganoor",
      "Polepally",
      "Salkarpally",
      "Vaddeman"
    ],
    state: "Telangana"
  },

  // Hyderabad & Cyberabad Metro Area
  "500001": {
    pincode: "500001",
    district: "Hyderabad",
    mandal: "Nampally",
    villages: [
      "Hyderabad GPO",
      "Abids",
      "Gandhi Bhawan",
      "Moazzampura",
      "Seetharampet",
      "Gunfoundry",
      "State Bank Of Hyderabad H.O.",
      "Troop Bazar"
    ],
    state: "Telangana"
  },
  "500081": {
    pincode: "500081",
    district: "Ranga Reddy",
    mandal: "Serilingampally",
    villages: [
      "Madhapur",
      "Cyberabad",
      "HITEC City",
      "Mindspace",
      "Ayyappa Society",
      "Kavuri Hills",
      "Durgam Cheruvu",
      "Silicon Valley"
    ],
    state: "Telangana"
  },
  "500034": {
    pincode: "500034",
    district: "Hyderabad",
    mandal: "Shaikpet",
    villages: [
      "Banjara Hills",
      "Erramanzil",
      "Somajiguda",
      "Panjagutta",
      "Road No 1 to 14 Banjara Hills"
    ],
    state: "Telangana"
  },
  "500033": {
    pincode: "500033",
    district: "Hyderabad",
    mandal: "Shaikpet",
    villages: [
      "Jubilee Hills",
      "Film Nagar",
      "Road No 36 Jubilee Hills",
      "Prashasan Nagar",
      "Check Post"
    ],
    state: "Telangana"
  },
  "500072": {
    pincode: "500072",
    district: "Medchal-Malkajgiri",
    mandal: "Kukatpally",
    villages: [
      "Kukatpally",
      "KPHB Colony (Phase 1-9)",
      "Vivekananda Nagar Colony",
      "Bhagya Nagar Colony",
      "Allwyn Colony",
      "Moosapet"
    ],
    state: "Telangana"
  },
  "500084": {
    pincode: "500084",
    district: "Medchal-Malkajgiri",
    mandal: "Kondapur",
    villages: [
      "Kondapur",
      "Hafeezpet",
      "Kothaguda",
      "Raghavendra Colony",
      "Silpa Gram Craft Village",
      "Botanical Garden Road"
    ],
    state: "Telangana"
  },
  "500050": {
    pincode: "500050",
    district: "Medchal-Malkajgiri",
    mandal: "Chandanagar",
    villages: [
      "Chandanagar",
      "BHEL Township",
      "Lingampally",
      "Gulmohar Park",
      "Tara Nagar",
      "Papireddy Nagar"
    ],
    state: "Telangana"
  },
  "500003": {
    pincode: "500003",
    district: "Hyderabad",
    mandal: "Secunderabad",
    villages: [
      "Secunderabad H.O.",
      "Rashtrapathi Road (RP Road)",
      "MG Road",
      "Paradise Circle",
      "General Bazar",
      "Ranigunj"
    ],
    state: "Telangana"
  },
  "500028": {
    pincode: "500028",
    district: "Hyderabad",
    mandal: "Asifnagar",
    villages: [
      "Mehdipatnam",
      "Murad Nagar",
      "Amba Gardens",
      "Rethi Bowli",
      "Santosh Nagar Colony"
    ],
    state: "Telangana"
  },
  "500004": {
    pincode: "500004",
    district: "Hyderabad",
    mandal: "Khairatabad",
    villages: [
      "Khairatabad",
      "Lakdikapul",
      "Anand Nagar Colony",
      "Raj Bhavan Road",
      "Chintal Basti"
    ],
    state: "Telangana"
  },
  "500013": {
    pincode: "500013",
    district: "Hyderabad",
    mandal: "Amberpet",
    villages: [
      "Amberpet",
      "Ali Cafe",
      "DD Colony",
      "Shivam Road",
      "Bagh Amberpet"
    ],
    state: "Telangana"
  },

  // Hanumakonda & Warangal
  "506001": {
    pincode: "506001",
    district: "Hanumakonda",
    mandal: "Hanumakonda",
    villages: [
      "Hanumakonda Head Post Office",
      "Lashkar Bazar",
      "Subedari",
      "Kakatiya University Campus",
      "Nakkalagutta",
      "Balasamudram",
      "Adalat Circle"
    ],
    state: "Telangana"
  },
  "506002": {
    pincode: "506002",
    district: "Warangal",
    mandal: "Warangal",
    villages: [
      "Warangal Head Post Office",
      "Girmajipet",
      "Shambunipet",
      "Mattewada",
      "Mandi Bazar",
      "Charbowli",
      "Kashibugga"
    ],
    state: "Telangana"
  },
  "506003": {
    pincode: "506003",
    district: "Hanumakonda",
    mandal: "Kazipet",
    villages: [
      "Kazipet Head Post Office",
      "Railway Colony",
      "Diesel Colony",
      "Somidi",
      "Bapuji Nagar",
      "Fathe Nagar"
    ],
    state: "Telangana"
  },

  // Adilabad District
  "504001": {
    pincode: "504001",
    district: "Adilabad",
    mandal: "Adilabad Urban",
    villages: [
      "Adilabad Head Post Office",
      "Adilabad Collectorate",
      "Bhagyanagar",
      "Bhuktapur",
      "Dasnapur Colony",
      "Kailash Nagar",
      "Brahminwada",
      "Mavala"
    ],
    state: "Telangana"
  },

  // Nizamabad District
  "503001": {
    pincode: "503001",
    district: "Nizamabad",
    mandal: "Nizamabad North",
    villages: [
      "Nizamabad Head Post Office",
      "Khaleelwadi",
      "Barkatpura",
      "Subhashnagar",
      "Kotagally",
      "Namdevwada",
      "Kanteshwar"
    ],
    state: "Telangana"
  },

  // Karimnagar District
  "505001": {
    pincode: "505001",
    district: "Karimnagar",
    mandal: "Karimnagar",
    villages: [
      "Karimnagar Head Post Office",
      "Mankammathota",
      "Kashmirgadda",
      "Vidyanagar",
      "Collectorate Complex",
      "Jyothinagar",
      "Mukarampura",
      "Sapthagiri Colony"
    ],
    state: "Telangana"
  },

  // Khammam District
  "507001": {
    pincode: "507001",
    district: "Khammam",
    mandal: "Khammam Urban",
    villages: [
      "Khammam Head Post Office",
      "Gandhi Chowk",
      "Mustafa Nagar",
      "Rotary Nagar",
      "Naya Bazar",
      "Mamillagudem",
      "Wyra Road",
      "Bank Colony"
    ],
    state: "Telangana"
  },

  // Nalgonda District
  "508001": {
    pincode: "508001",
    district: "Nalgonda",
    mandal: "Nalgonda",
    villages: [
      "Nalgonda Head Post Office",
      "Bottuguda",
      "Clock Tower",
      "Manyamchelka",
      "Oldabadi",
      "Prakasham Bazar",
      "Ramagiri",
      "Vikarabad Colony"
    ],
    state: "Telangana"
  },

  // Mahabubnagar District
  "509001": {
    pincode: "509001",
    district: "Mahabubnagar",
    mandal: "Mahabubnagar Urban",
    villages: [
      "Mahabubnagar Head Post Office",
      "Clock Tower",
      "Boya Bazar",
      "Mettugadda",
      "One Town",
      "Shah Saheb Gutta",
      "Venkateshwara Colony",
      "Padmavathi Colony"
    ],
    state: "Telangana"
  },

  // Suryapet District
  "508213": {
    pincode: "508213",
    district: "Suryapet",
    mandal: "Suryapet",
    villages: [
      "Suryapet Head Post Office",
      "Kudakuda",
      "Balaram Nagar",
      "Vidya Nagar",
      "Khammam Road",
      "Shankarnagar",
      "Pillalamarri"
    ],
    state: "Telangana"
  },

  // Siddipet District
  "502103": {
    pincode: "502103",
    district: "Siddipet",
    mandal: "Siddipet Urban",
    villages: [
      "Siddipet Head Post Office",
      "Prashanth Nagar",
      "Bharath Nagar",
      "Mustabad",
      "Rangadhampally",
      "Nasarpura",
      "Subhash Nagar"
    ],
    state: "Telangana"
  },

  // Sangareddy District
  "502001": {
    pincode: "502001",
    district: "Sangareddy",
    mandal: "Sangareddy",
    villages: [
      "Sangareddy Head Post Office",
      "Pothireddypally",
      "Tara Nagar",
      "Vidya Nagar",
      "Rajampet",
      "Collectorate Colony",
      "Kandi Road"
    ],
    state: "Telangana"
  },

  // Bhadradri Kothagudem District
  "507101": {
    pincode: "507101",
    district: "Bhadradri Kothagudem",
    mandal: "Kothagudem",
    villages: [
      "Kothagudem Head Post Office",
      "Rudrampur",
      "Writer Basti",
      "Coolie Line",
      "Chunchupally",
      "Laxmidevipalli",
      "Sujathanagar"
    ],
    state: "Telangana"
  },
  "507111": {
    pincode: "507111",
    district: "Bhadradri Kothagudem",
    mandal: "Bhadrachalam",
    villages: [
      "Bhadrachalam Town",
      "Temple Area",
      "ITC Colony",
      "Sarapaka",
      "Kothapally",
      "Gundala"
    ],
    state: "Telangana"
  },

  // Jagtial District
  "505327": {
    pincode: "505327",
    district: "Jagtial",
    mandal: "Jagtial",
    villages: [
      "Jagtial Head Post Office",
      "Dharmapuri Road",
      "Gollapalli Road",
      "Puranipet",
      "Vani Nagar",
      "Tharunagar"
    ],
    state: "Telangana"
  },

  // Jangaon District
  "506167": {
    pincode: "506167",
    district: "Jangaon",
    mandal: "Jangaon",
    villages: [
      "Jangaon Head Post Office",
      "Nehru Park",
      "Siddipet Road",
      "Kurmanagar",
      "Shamshabad Colony",
      "Station Road"
    ],
    state: "Telangana"
  },

  // Jayashankar Bhupalpally District
  "506169": {
    pincode: "506169",
    district: "Jayashankar Bhupalpally",
    mandal: "Bhupalpally",
    villages: [
      "Bhupalpally Head Post Office",
      "Subhash Nagar",
      "Kashimpally",
      "Gorlaveedu",
      "Chelpur",
      "Ghanpur"
    ],
    state: "Telangana"
  },

  // Jogulamba Gadwal District
  "509125": {
    pincode: "509125",
    district: "Jogulamba Gadwal",
    mandal: "Gadwal",
    villages: [
      "Gadwal Head Post Office",
      "Vedanagar",
      "Ganjipet",
      "Bheemnagar",
      "Fort Area",
      "Kondapally"
    ],
    state: "Telangana"
  },

  // Kamareddy District
  "503111": {
    pincode: "503111",
    district: "Kamareddy",
    mandal: "Kamareddy",
    villages: [
      "Kamareddy Head Post Office",
      "Station Road",
      "Ashok Nagar",
      "Vidyasagar Colony",
      "Devunipally",
      "Sircilla Road"
    ],
    state: "Telangana"
  },

  // Kumuram Bheem Asifabad District
  "504293": {
    pincode: "504293",
    district: "Kumuram Bheem Asifabad",
    mandal: "Asifabad",
    villages: [
      "Asifabad Head Post Office",
      "Ada",
      "Babapur",
      "Chilpalli",
      "Gundi",
      "Mankuguda"
    ],
    state: "Telangana"
  },

  // Mahabubabad District
  "506101": {
    pincode: "506101",
    district: "Mahabubabad",
    mandal: "Mahabubabad",
    villages: [
      "Mahabubabad Head Post Office",
      "Station Road",
      "Gumudur",
      "Babu Camp",
      "Kuravi Road",
      "Kishan Nagar"
    ],
    state: "Telangana"
  },

  // Mancherial District
  "504208": {
    pincode: "504208",
    district: "Mancherial",
    mandal: "Mancherial",
    villages: [
      "Mancherial Head Post Office",
      "Hamaliwada",
      "College Road",
      "Reddy Colony",
      "Gouthami Nagar",
      "Chunnambatti"
    ],
    state: "Telangana"
  },

  // Medak District
  "502110": {
    pincode: "502110",
    district: "Medak",
    mandal: "Medak",
    villages: [
      "Medak Head Post Office",
      "Auto Nagar",
      "Burugupally",
      "Church Compound",
      "Fatehnagar",
      "Machavaram"
    ],
    state: "Telangana"
  },

  // Mulugu District
  "506343": {
    pincode: "506343",
    district: "Mulugu",
    mandal: "Mulugu",
    villages: [
      "Mulugu Head Post Office",
      "Jaggannapet",
      "Bandaru Pally",
      "Patha Mulugu",
      "Govindaraopet",
      "Pasra"
    ],
    state: "Telangana"
  },

  // Narayanpet District
  "509210": {
    pincode: "509210",
    district: "Narayanpet",
    mandal: "Narayanpet",
    villages: [
      "Narayanpet Head Post Office",
      "Bhojpur",
      "Saraf Bazar",
      "Singaram",
      "Appakpalle",
      "Kollampalle"
    ],
    state: "Telangana"
  },

  // Nirmal District
  "504106": {
    pincode: "504106",
    district: "Nirmal",
    mandal: "Nirmal",
    villages: [
      "Nirmal Head Post Office",
      "Mancherial X Road",
      "Devunigutta",
      "Somwarpet",
      "Chincholi",
      "Venkatapur"
    ],
    state: "Telangana"
  },

  // Peddapalli District
  "505172": {
    pincode: "505172",
    district: "Peddapalli",
    mandal: "Peddapalli",
    villages: [
      "Peddapalli Head Post Office",
      "Bus Stand Area",
      "Rangampalli",
      "Shivaji Nagar",
      "Subhash Nagar",
      "Brahmanpalli"
    ],
    state: "Telangana"
  },

  // Rajanna Sircilla District
  "505301": {
    pincode: "505301",
    district: "Rajanna Sircilla",
    mandal: "Sircilla",
    villages: [
      "Sircilla Head Post Office",
      "Bypass Road",
      "Gandhi Nagar",
      "Venkatraopet",
      "Sunder Nagar",
      "Shanthi Nagar"
    ],
    state: "Telangana"
  },

  // Vikarabad District
  "501101": {
    pincode: "501101",
    district: "Vikarabad",
    mandal: "Vikarabad",
    villages: [
      "Vikarabad Head Post Office",
      "Alampally",
      "Shivaji Nagar",
      "Gangaiah Guda",
      "Rajiv Nagar",
      "Station Road"
    ],
    state: "Telangana"
  },

  // Wanaparthy District
  "509103": {
    pincode: "509103",
    district: "Wanaparthy",
    mandal: "Wanaparthy",
    villages: [
      "Wanaparthy Head Post Office",
      "Gandhi Chowk",
      "Bandarnagar",
      "Nagavaram",
      "Peerla Gutta",
      "Venkateshwara Colony"
    ],
    state: "Telangana"
  },

  // Yadadri Bhuvanagiri District
  "508115": {
    pincode: "508115",
    district: "Yadadri Bhuvanagiri",
    mandal: "Bhongir",
    villages: [
      "Bhongir Head Post Office",
      "Raigir",
      "Hanumanwada",
      "Bhuvanagiri Fort Colony",
      "Yadagirigutta Road",
      "Pagidipally"
    ],
    state: "Telangana"
  }
};

/**
 * Automatically index all 589+ Revenue Mandals from the official TELANGANA_LOCATIONS data structure.
 * This ensures 100% comprehensive coverage across every single mandal in all 33 Telangana districts.
 */
const MANDAL_PINCODE_INDEX: Map<string, { district: string; mandal: string; villages: string[] }> = new Map();

// Populate the index from official TELANGANA_LOCATIONS
TELANGANA_LOCATIONS.forEach((districtObj) => {
  districtObj.mandals.forEach((mandalObj) => {
    const pin = mandalObj.pincode.trim();
    if (!pin) return;

    if (!MANDAL_PINCODE_INDEX.has(pin)) {
      MANDAL_PINCODE_INDEX.set(pin, {
        district: districtObj.name,
        mandal: mandalObj.name,
        villages: [mandalObj.name]
      });
    } else {
      const existing = MANDAL_PINCODE_INDEX.get(pin)!;
      if (!existing.villages.includes(mandalObj.name)) {
        existing.villages.push(mandalObj.name);
      }
    }
  });

  // Default pincode mapping fallback
  if (districtObj.defaultPincode && !MANDAL_PINCODE_INDEX.has(districtObj.defaultPincode)) {
    MANDAL_PINCODE_INDEX.set(districtObj.defaultPincode, {
      district: districtObj.name,
      mandal: districtObj.mandals[0]?.name || districtObj.name,
      villages: [districtObj.name + " H.O."]
    });
  }
});

/**
 * Normalizes district names from any input string (including legacy/India Post values)
 * into one of the official 33 Telangana districts.
 */
export function normalizeTelanganaDistrict(districtRaw: string): string | null {
  if (!districtRaw) return null;
  const clean = districtRaw.trim().toLowerCase();

  // 1. Direct alias match
  if (TELANGANA_DISTRICT_ALIASES[clean]) {
    return TELANGANA_DISTRICT_ALIASES[clean];
  }

  // 2. Exact match in official list
  const directMatch = findDistrict(districtRaw);
  if (directMatch) return directMatch.name;

  // 3. Partial / contains match against aliases
  for (const [alias, official] of Object.entries(TELANGANA_DISTRICT_ALIASES)) {
    if (clean.includes(alias) || alias.includes(clean)) {
      return official;
    }
  }

  return null;
}

/**
 * Look up location by 6-digit PIN code in local Telangana offline dataset.
 * Returns instant result with District, Mandal, and array of Villages.
 */
export function getLocalTelanganaPincode(pincode: string): TelanganaPincodeRecord | null {
  const pin = pincode.trim();
  if (!/^[1-9][0-9]{5}$/.test(pin)) return null;

  // 1. Check curated rich dataset
  if (CURATED_TELANGANA_PINCODES[pin]) {
    return CURATED_TELANGANA_PINCODES[pin];
  }

  // 2. Check complete 589+ mandal index
  if (MANDAL_PINCODE_INDEX.has(pin)) {
    const item = MANDAL_PINCODE_INDEX.get(pin)!;
    return {
      pincode: pin,
      district: item.district,
      mandal: item.mandal,
      villages: item.villages,
      state: "Telangana"
    };
  }

  return null;
}
