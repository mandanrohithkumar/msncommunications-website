/**
 * Telangana State Cascading Location Configuration
 * Complete Districts, Mandals, and Automatic Pincode Mapping
 */

export interface MandalLocation {
  name: string;
  pincode: string;
}

export interface DistrictLocation {
  name: string;
  code: string;
  defaultPincode: string;
  mandals: MandalLocation[];
}

export const TELANGANA_LOCATIONS: DistrictLocation[] = [
  {
    name: "Nagarkurnool",
    code: "NGKL",
    defaultPincode: "509209",
    mandals: [
      { name: "Nagarkurnool", pincode: "509209" },
      { name: "Bijinapally", pincode: "509203" },
      { name: "Tadoor", pincode: "509209" },
      { name: "Telkapally", pincode: "509385" },
      { name: "Timmajipet", pincode: "509406" },
      { name: "Achampet", pincode: "509375" },
      { name: "Amrabad", pincode: "509326" },
      { name: "Balmoor", pincode: "509375" },
      { name: "Lingal", pincode: "509401" },
      { name: "Uppununthala", pincode: "509376" },
      { name: "Kalwakurthy", pincode: "509324" },
      { name: "Urkonda", pincode: "509324" },
      { name: "Vangoor", pincode: "509349" },
      { name: "Veldanda", pincode: "509360" },
      { name: "Kollapur", pincode: "509102" },
      { name: "Kodair", pincode: "509102" },
      { name: "Padara", pincode: "509326" },
      { name: "Charakonda", pincode: "509324" },
      { name: "Pentlavelly", pincode: "509102" }
    ]
  },
  {
    name: "Mahabubnagar",
    code: "MBNR",
    defaultPincode: "509001",
    mandals: [
      { name: "Mahabubnagar Urban", pincode: "509001" },
      { name: "Mahabubnagar Rural", pincode: "509001" },
      { name: "Jadcherla", pincode: "509301" },
      { name: "Bhoothpur", pincode: "509382" },
      { name: "Nawabpet", pincode: "509340" },
      { name: "Koilkonda", pincode: "509371" },
      { name: "Gandeed", pincode: "509337" },
      { name: "Devarkadra", pincode: "509204" },
      { name: "Chinna Chintakunta", pincode: "509409" },
      { name: "Balanagar", pincode: "509202" },
      { name: "Rajapur", pincode: "509202" },
      { name: "Midjil", pincode: "509357" },
      { name: "Addakal", pincode: "509380" },
      { name: "Moosapet", pincode: "509380" },
      { name: "Koukuntla", pincode: "509204" },
      { name: "Hanwada", pincode: "509334" }
    ]
  },
  {
    name: "Hyderabad",
    code: "HYD",
    defaultPincode: "500001",
    mandals: [
      { name: "Ameerpet", pincode: "500016" },
      { name: "Asifnagar", pincode: "500028" },
      { name: "Bahadurpura", pincode: "500064" },
      { name: "Bandlaguda", pincode: "500005" },
      { name: "Charminar", pincode: "500002" },
      { name: "Golconda", pincode: "500008" },
      { name: "Himayathnagar", pincode: "500029" },
      { name: "Khairatabad", pincode: "500004" },
      { name: "Marredpally", pincode: "500026" },
      { name: "Musheerabad", pincode: "500020" },
      { name: "Nampally", pincode: "500001" },
      { name: "Saidabad", pincode: "500059" },
      { name: "Secunderabad", pincode: "500003" },
      { name: "Shaikpet", pincode: "500096" },
      { name: "Tirumalagiri", pincode: "500015" }
    ]
  },
  {
    name: "Rangareddy",
    code: "RR",
    defaultPincode: "500030",
    mandals: [
      { name: "Rajendranagar", pincode: "500030" },
      { name: "Shamshabad", pincode: "501218" },
      { name: "Serilingampally", pincode: "500019" },
      { name: "Gandipet", pincode: "500075" },
      { name: "Maheshwaram", pincode: "501359" },
      { name: "Ibrahimpatnam", pincode: "501506" },
      { name: "Hayathnagar", pincode: "501505" },
      { name: "Saroornagar", pincode: "500035" },
      { name: "Chevella", pincode: "501503" },
      { name: "Shabad", pincode: "509217" },
      { name: "Moinabad", pincode: "501504" },
      { name: "Shadnagar (Farooqnagar)", pincode: "509216" },
      { name: "Keshampet", pincode: "509408" },
      { name: "Kondurg", pincode: "509207" },
      { name: "Chowderguda", pincode: "509207" },
      { name: "Kothur", pincode: "509228" },
      { name: "Nandigama", pincode: "509228" },
      { name: "Amangal", pincode: "509321" },
      { name: "Kadthal", pincode: "509358" },
      { name: "Talakondapalle", pincode: "509321" },
      { name: "Manchal", pincode: "501508" },
      { name: "Yacharam", pincode: "501509" },
      { name: "Madgul", pincode: "509327" }
    ]
  },
  {
    name: "Medchal-Malkajgiri",
    code: "MDCL",
    defaultPincode: "501401",
    mandals: [
      { name: "Medchal", pincode: "501401" },
      { name: "Malkajgiri", pincode: "500047" },
      { name: "Kukatpally", pincode: "500072" },
      { name: "Alwal", pincode: "500010" },
      { name: "Quthbullapur", pincode: "500055" },
      { name: "Dundigal Gandimaisamma", pincode: "500043" },
      { name: "Balanagar", pincode: "500037" },
      { name: "Uppal", pincode: "500039" },
      { name: "Ghatkesar", pincode: "501301" },
      { name: "Medipally", pincode: "500098" },
      { name: "Kapra", pincode: "500062" },
      { name: "Keesara", pincode: "501301" },
      { name: "Shamirpet", pincode: "500078" },
      { name: "Muduchintalapalli", pincode: "500078" },
      { name: "Bachupally", pincode: "500090" }
    ]
  },
  {
    name: "Wanaparthy",
    code: "WNPR",
    defaultPincode: "509103",
    mandals: [
      { name: "Wanaparthy", pincode: "509103" },
      { name: "Ghanpur", pincode: "509380" },
      { name: "Gopalpeta", pincode: "509206" },
      { name: "Kothakota", pincode: "509381" },
      { name: "Madnapoor", pincode: "509381" },
      { name: "Pangal", pincode: "509120" },
      { name: "Pebbair", pincode: "509104" },
      { name: "Peddamandadi", pincode: "509103" },
      { name: "Revally", pincode: "509206" },
      { name: "Srirangapur", pincode: "509104" },
      { name: "Atmakur", pincode: "509131" },
      { name: "Amarchinta", pincode: "509130" },
      { name: "Chinnambavi", pincode: "509120" },
      { name: "Weepangandla", pincode: "509120" }
    ]
  },
  {
    name: "Jogulamba Gadwal",
    code: "GDWL",
    defaultPincode: "509125",
    mandals: [
      { name: "Gadwal", pincode: "509125" },
      { name: "Dharur", pincode: "509125" },
      { name: "Maldakal", pincode: "509132" },
      { name: "Gattu", pincode: "509129" },
      { name: "KT Doddi", pincode: "509129" },
      { name: "Ieeja", pincode: "509127" },
      { name: "Itikyal", pincode: "509128" },
      { name: "Manopad", pincode: "509153" },
      { name: "Alampur", pincode: "509152" },
      { name: "Waddepalle", pincode: "509126" },
      { name: "Rajoli", pincode: "509126" },
      { name: "Undavelli", pincode: "509153" }
    ]
  },
  {
    name: "Narayanpet",
    code: "NRPT",
    defaultPincode: "509210",
    mandals: [
      { name: "Narayanpet", pincode: "509210" },
      { name: "Damaragidda", pincode: "509407" },
      { name: "Dhanwada", pincode: "509205" },
      { name: "Koilkonda", pincode: "509371" },
      { name: "Krishna", pincode: "509205" },
      { name: "Maddur", pincode: "509410" },
      { name: "Maganoor", pincode: "509352" },
      { name: "Makthal", pincode: "509703" },
      { name: "Marikal", pincode: "509351" },
      { name: "Narva", pincode: "509130" },
      { name: "Utkoor", pincode: "509311" }
    ]
  },
  {
    name: "Nalgonda",
    code: "NLG",
    defaultPincode: "508001",
    mandals: [
      { name: "Nalgonda", pincode: "508001" },
      { name: "Miryalaguda", pincode: "508207" },
      { name: "Devarakonda", pincode: "508248" },
      { name: "Nakrekal", pincode: "508211" },
      { name: "Chandur", pincode: "508255" },
      { name: "Chityal", pincode: "508114" },
      { name: "Haliya (Anumula)", pincode: "508202" },
      { name: "Narketpally", pincode: "508254" },
      { name: "Munugode", pincode: "508244" },
      { name: "Damaracherla", pincode: "508355" },
      { name: "Kangal", pincode: "508004" }
    ]
  },
  {
    name: "Suryapet",
    code: "SRPT",
    defaultPincode: "508213",
    mandals: [
      { name: "Suryapet", pincode: "508213" },
      { name: "Kodad", pincode: "508206" },
      { name: "Huzurnagar", pincode: "508204" },
      { name: "Mothey", pincode: "508212" },
      { name: "Chivvemla", pincode: "508213" },
      { name: "Maddirala", pincode: "508280" },
      { name: "Nereducherla", pincode: "508218" },
      { name: "Thungathurthy", pincode: "508280" }
    ]
  },
  {
    name: "Khammam",
    code: "KMM",
    defaultPincode: "507001",
    mandals: [
      { name: "Khammam Urban", pincode: "507001" },
      { name: "Khammam Rural", pincode: "507003" },
      { name: "Madhira", pincode: "507203" },
      { name: "Sathupalli", pincode: "507303" },
      { name: "Wyra", pincode: "507165" },
      { name: "Kalluru", pincode: "507209" },
      { name: "Kusumanchi", pincode: "507159" },
      { name: "Tirumalayapalem", pincode: "507163" }
    ]
  },
  {
    name: "Warangal",
    code: "WGL",
    defaultPincode: "506002",
    mandals: [
      { name: "Warangal", pincode: "506002" },
      { name: "Khila Warangal", pincode: "506005" },
      { name: "Wardhannapet", pincode: "506313" },
      { name: "Narsampet", pincode: "506132" },
      { name: "Geesugonda", pincode: "506330" },
      { name: "Parvathagiri", pincode: "506365" },
      { name: "Rayaparthy", pincode: "506314" }
    ]
  },
  {
    name: "Hanamkonda",
    code: "HNK",
    defaultPincode: "506001",
    mandals: [
      { name: "Hanamkonda", pincode: "506001" },
      { name: "Kazipet", pincode: "506003" },
      { name: "Inavolu", pincode: "506313" },
      { name: "Hasanparthy", pincode: "506371" },
      { name: "Elkathurthi", pincode: "505464" },
      { name: "Bheemadevarpalle", pincode: "505497" },
      { name: "Dharmasagar", pincode: "506142" }
    ]
  },
  {
    name: "Karimnagar",
    code: "KRN",
    defaultPincode: "505001",
    mandals: [
      { name: "Karimnagar", pincode: "505001" },
      { name: "Huzurabad", pincode: "505468" },
      { name: "Jammikunta", pincode: "505122" },
      { name: "Manakondur", pincode: "505505" },
      { name: "Choppadandi", pincode: "505415" },
      { name: "Gangadhara", pincode: "505445" },
      { name: "Kothapally", pincode: "505451" },
      { name: "Veenavanka", pincode: "505502" }
    ]
  },
  {
    name: "Nizamabad",
    code: "NZB",
    defaultPincode: "503001",
    mandals: [
      { name: "Nizamabad North", pincode: "503001" },
      { name: "Nizamabad South", pincode: "503002" },
      { name: "Nizamabad Rural", pincode: "503003" },
      { name: "Armoor", pincode: "503224" },
      { name: "Bodhan", pincode: "503185" },
      { name: "Bheemgal", pincode: "503307" },
      { name: "Dichpally", pincode: "503175" },
      { name: "Kotgiri", pincode: "503207" },
      { name: "Varni", pincode: "503201" }
    ]
  },
  {
    name: "Sangareddy",
    code: "SNG",
    defaultPincode: "502001",
    mandals: [
      { name: "Sangareddy", pincode: "502001" },
      { name: "Patancheru", pincode: "502319" },
      { name: "Ameenpur", pincode: "502032" },
      { name: "Ramachandrapuram", pincode: "502032" },
      { name: "Zahirabad", pincode: "502220" },
      { name: "Kandi", pincode: "502285" },
      { name: "Sadasivpet", pincode: "502291" },
      { name: "Narayankhed", pincode: "502286" }
    ]
  },
  {
    name: "Siddipet",
    code: "SDPT",
    defaultPincode: "502103",
    mandals: [
      { name: "Siddipet Urban", pincode: "502103" },
      { name: "Siddipet Rural", pincode: "502103" },
      { name: "Gajwel", pincode: "502278" },
      { name: "Dubbak", pincode: "502108" },
      { name: "Husnabad", pincode: "505467" },
      { name: "Cherial", pincode: "506223" },
      { name: "Mulugu", pincode: "502279" },
      { name: "Wargal", pincode: "502279" }
    ]
  },
  {
    name: "Vikarabad",
    code: "VKBD",
    defaultPincode: "501101",
    mandals: [
      { name: "Vikarabad", pincode: "501101" },
      { name: "Tandur", pincode: "501141" },
      { name: "Parigi", pincode: "501501" },
      { name: "Kodangal", pincode: "509338" },
      { name: "Mominpet", pincode: "501202" },
      { name: "Dharur", pincode: "501121" },
      { name: "Nawabpet", pincode: "501111" }
    ]
  }
];

/**
 * Get all Telangana district names
 */
export function getTelanganaDistricts(): string[] {
  return TELANGANA_LOCATIONS.map((d) => d.name);
}

/**
 * Get all mandals for a specific district
 */
export function getMandalsForDistrict(districtName: string): MandalLocation[] {
  const match = TELANGANA_LOCATIONS.find(
    (d) => d.name.toLowerCase() === (districtName || "").toLowerCase().trim()
  );
  return match ? match.mandals : [];
}

/**
 * Lookup matching Pincode for a District and Mandal combination
 */
export function lookupPincode(districtName: string, mandalName: string): string {
  const district = TELANGANA_LOCATIONS.find(
    (d) => d.name.toLowerCase() === (districtName || "").toLowerCase().trim()
  );
  if (!district) return "";

  const mandal = district.mandals.find(
    (m) => m.name.toLowerCase() === (mandalName || "").toLowerCase().trim()
  );
  if (mandal) return mandal.pincode;

  return district.defaultPincode;
}
