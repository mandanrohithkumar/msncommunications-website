/**
 * Telangana State Cascading Location Configuration
 * Complete Official 33 Districts, 589+ Revenue Mandals, and Automatic Pincode Mapping
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
    name: "Adilabad",
    code: "ADB",
    defaultPincode: "504001",
    mandals: [
      { name: "Adilabad Urban", pincode: "504001" },
      { name: "Adilabad Rural", pincode: "504002" },
      { name: "Mavala", pincode: "504001" },
      { name: "Gudihatnoor", pincode: "504308" },
      { name: "Bazarhatnoor", pincode: "504304" },
      { name: "Bela", pincode: "504309" },
      { name: "Boido", pincode: "504312" },
      { name: "Jainath", pincode: "504309" },
      { name: "Indervelly", pincode: "504311" },
      { name: "Narnoor", pincode: "504311" },
      { name: "Gadiguda", pincode: "504311" },
      { name: "Utnoor", pincode: "504311" },
      { name: "Boath", pincode: "504307" },
      { name: "Neradigonda", pincode: "504323" },
      { name: "Sirikonda", pincode: "504311" },
      { name: "Ichoda", pincode: "504307" },
      { name: "Tamsi", pincode: "504312" },
      { name: "Bheempur", pincode: "504312" }
    ]
  },
  {
    name: "Bhadradri Kothagudem",
    code: "BDK",
    defaultPincode: "507101",
    mandals: [
      { name: "Kothagudem", pincode: "507101" },
      { name: "Palwancha", pincode: "507115" },
      { name: "Bhadrachalam", pincode: "507111" },
      { name: "Manuguru", pincode: "507117" },
      { name: "Yellandu", pincode: "507123" },
      { name: "Burgampahad", pincode: "507114" },
      { name: "Aswapuram", pincode: "507116" },
      { name: "Dummugudem", pincode: "507137" },
      { name: "Cherla", pincode: "507137" },
      { name: "Pinapaka", pincode: "507117" },
      { name: "Karakagudem", pincode: "507117" },
      { name: "Gundala", pincode: "507123" },
      { name: "Tekulapalli", pincode: "507123" },
      { name: "Julurpad", pincode: "507166" },
      { name: "Sujathanagar", pincode: "507101" },
      { name: "Chunchupally", pincode: "507101" },
      { name: "Laxmidevipalli", pincode: "507101" },
      { name: "Chandrugonda", pincode: "507166" },
      { name: "Annapureddypally", pincode: "507166" },
      { name: "Mulkalapally", pincode: "507115" },
      { name: "Dammapeta", pincode: "507306" },
      { name: "Aswaraopeta", pincode: "507301" },
      { name: "Allapalli", pincode: "507123" }
    ]
  },
  {
    name: "Hanumakonda",
    code: "HNK",
    defaultPincode: "506001",
    mandals: [
      { name: "Hanumakonda", pincode: "506001" },
      { name: "Kazipet", pincode: "506003" },
      { name: "Hasanparthy", pincode: "506371" },
      { name: "Inavole", pincode: "506143" },
      { name: "Kamalapur", pincode: "506102" },
      { name: "Elkathurthy", pincode: "505105" },
      { name: "Bheemadevarpalli", pincode: "505471" },
      { name: "Dharmasagar", pincode: "506142" },
      { name: "Velair", pincode: "506142" },
      { name: "Nadikuda", pincode: "506391" },
      { name: "Damera", pincode: "506006" },
      { name: "Atmakur", pincode: "506342" },
      { name: "Shayampet", pincode: "506319" },
      { name: "Parkal", pincode: "506164" }
    ]
  },
  {
    name: "Hyderabad",
    code: "HYD",
    defaultPincode: "500001",
    mandals: [
      { name: "Amberpet", pincode: "500013" },
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
    name: "Jagtial",
    code: "JGT",
    defaultPincode: "505327",
    mandals: [
      { name: "Jagtial", pincode: "505327" },
      { name: "Jagtial Rural", pincode: "505327" },
      { name: "Raikal", pincode: "505460" },
      { name: "Sarangapur", pincode: "505454" },
      { name: "Beerpur", pincode: "505454" },
      { name: "Dharmapuri", pincode: "505425" },
      { name: "Buggaram", pincode: "505425" },
      { name: "Pegadapalli", pincode: "505532" },
      { name: "Gollapalli", pincode: "505532" },
      { name: "Mallial", pincode: "505452" },
      { name: "Kodimial", pincode: "505501" },
      { name: "Velgatoor", pincode: "505526" },
      { name: "Korutla", pincode: "505326" },
      { name: "Metpalli", pincode: "505325" },
      { name: "Mallapur", pincode: "505331" },
      { name: "Ibrahimpatnam", pincode: "505450" },
      { name: "Medipalli", pincode: "505453" },
      { name: "Kathlapur", pincode: "505462" }
    ]
  },
  {
    name: "Jangaon",
    code: "JGN",
    defaultPincode: "506167",
    mandals: [
      { name: "Jangaon", pincode: "506167" },
      { name: "Lingalaghanpur", pincode: "506201" },
      { name: "Bachannapet", pincode: "506221" },
      { name: "Devaruppula", pincode: "506302" },
      { name: "Narmetta", pincode: "506224" },
      { name: "Tharigoppula", pincode: "506224" },
      { name: "Raghunathpalle", pincode: "506244" },
      { name: "Zaffergadh", pincode: "506316" },
      { name: "Palakurthi", pincode: "506252" },
      { name: "Kodakandla", pincode: "506222" },
      { name: "Chilpur", pincode: "506144" },
      { name: "Station Ghanpur", pincode: "506144" }
    ]
  },
  {
    name: "Jayashankar Bhupalpally",
    code: "JSB",
    defaultPincode: "506169",
    mandals: [
      { name: "Bhupalpally", pincode: "506169" },
      { name: "Chityal", pincode: "506356" },
      { name: "Ghanpur", pincode: "506345" },
      { name: "Regonda", pincode: "506348" },
      { name: "Mogullapally", pincode: "506366" },
      { name: "Tekumatla", pincode: "506356" },
      { name: "Malharrao", pincode: "505503" },
      { name: "Kataram", pincode: "505503" },
      { name: "Mahadevpur", pincode: "505504" },
      { name: "Palimela", pincode: "505504" },
      { name: "Mutharam Mahadevpur", pincode: "505504" }
    ]
  },
  {
    name: "Jogulamba Gadwal",
    code: "JGD",
    defaultPincode: "509125",
    mandals: [
      { name: "Gadwal", pincode: "509125" },
      { name: "Dharur", pincode: "509125" },
      { name: "Maldakal", pincode: "509132" },
      { name: "Ghattu", pincode: "509129" },
      { name: "Aiza", pincode: "509127" },
      { name: "Itikyal", pincode: "509128" },
      { name: "Manopad", pincode: "509128" },
      { name: "Waddepally", pincode: "509126" },
      { name: "Rajoli", pincode: "509126" },
      { name: "Alampur", pincode: "509152" },
      { name: "Undavelli", pincode: "509125" },
      { name: "Kaloor Timmanadoddi", pincode: "509127" }
    ]
  },
  {
    name: "Kamareddy",
    code: "KMR",
    defaultPincode: "503111",
    mandals: [
      { name: "Kamareddy", pincode: "503111" },
      { name: "Bhiknoor", pincode: "503101" },
      { name: "Domakonda", pincode: "503123" },
      { name: "Machareddy", pincode: "503111" },
      { name: "Sadashivnagar", pincode: "503145" },
      { name: "Bibipet", pincode: "503125" },
      { name: "Ramareddy", pincode: "503144" },
      { name: "Rajampet", pincode: "503110" },
      { name: "Banswada", pincode: "503187" },
      { name: "Birkur", pincode: "503321" },
      { name: "Nasrullabad", pincode: "503321" },
      { name: "Kotgiri", pincode: "503207" },
      { name: "Rudrur", pincode: "503188" },
      { name: "Yellareddy", pincode: "503122" },
      { name: "Nagireddypet", pincode: "503108" },
      { name: "Lingampet", pincode: "503124" },
      { name: "Gandhari", pincode: "503114" },
      { name: "Tadwai", pincode: "503120" },
      { name: "Nizamsagar", pincode: "503302" },
      { name: "Pitlam", pincode: "503310" },
      { name: "Jukkal", pincode: "503305" },
      { name: "Madnoor", pincode: "503309" }
    ]
  },
  {
    name: "Karimnagar",
    code: "KRM",
    defaultPincode: "505001",
    mandals: [
      { name: "Karimnagar", pincode: "505001" },
      { name: "Karimnagar Rural", pincode: "505001" },
      { name: "Kothapalli", pincode: "505451" },
      { name: "Manakondur", pincode: "505469" },
      { name: "Timmapur", pincode: "505527" },
      { name: "Ganneruvaram", pincode: "505527" },
      { name: "Gangadhara", pincode: "505445" },
      { name: "Ramadugu", pincode: "505531" },
      { name: "Choppadandi", pincode: "505415" },
      { name: "Chigurumamidi", pincode: "505467" },
      { name: "Huzurabad", pincode: "505468" },
      { name: "Jammikunta", pincode: "505122" },
      { name: "Veenavanka", pincode: "505502" },
      { name: "Illanthakunta", pincode: "505468" },
      { name: "Saidapur", pincode: "505472" },
      { name: "Shankarapatnam", pincode: "505470" }
    ]
  },
  {
    name: "Khammam",
    code: "KMM",
    defaultPincode: "507001",
    mandals: [
      { name: "Khammam Urban", pincode: "507001" },
      { name: "Khammam Rural", pincode: "507003" },
      { name: "Thirumalayapalem", pincode: "507163" },
      { name: "Kusumanchi", pincode: "507159" },
      { name: "Nelakondapalli", pincode: "507160" },
      { name: "Mudigonda", pincode: "507158" },
      { name: "Chinthakani", pincode: "507208" },
      { name: "Bonakal", pincode: "507204" },
      { name: "Madhira", pincode: "507203" },
      { name: "Yerrupalem", pincode: "507201" },
      { name: "Wyra", pincode: "507165" },
      { name: "Konijerla", pincode: "507165" },
      { name: "Singareni", pincode: "507122" },
      { name: "Enkoor", pincode: "507168" },
      { name: "Kallur", pincode: "507209" },
      { name: "Penuballi", pincode: "507209" },
      { name: "Sathupalli", pincode: "507303" },
      { name: "Vemsoor", pincode: "507164" },
      { name: "Tallada", pincode: "507167" },
      { name: "Raghunadhapalem", pincode: "507002" },
      { name: "Kamepalli", pincode: "507122" }
    ]
  },
  {
    name: "Kumuram Bheem Asifabad",
    code: "KBA",
    defaultPincode: "504293",
    mandals: [
      { name: "Asifabad", pincode: "504293" },
      { name: "Rebbena", pincode: "504292" },
      { name: "Tiryani", pincode: "504293" },
      { name: "Wankidi", pincode: "504295" },
      { name: "Kerameri", pincode: "504293" },
      { name: "Jainoor", pincode: "504313" },
      { name: "Sirpur Urban", pincode: "504299" },
      { name: "Kaghaznagar", pincode: "504296" },
      { name: "Bejjur", pincode: "504299" },
      { name: "Dahegaon", pincode: "504273" },
      { name: "Penchikalpet", pincode: "504299" },
      { name: "Chintalamanepally", pincode: "504299" },
      { name: "Kouthala", pincode: "504299" },
      { name: "Lingapur", pincode: "504313" },
      { name: "Sirpur Rural", pincode: "504299" }
    ]
  },
  {
    name: "Mahabubabad",
    code: "MBD",
    defaultPincode: "506101",
    mandals: [
      { name: "Mahabubabad", pincode: "506101" },
      { name: "Kuravi", pincode: "506105" },
      { name: "Dornakal", pincode: "506381" },
      { name: "Maripeda", pincode: "506315" },
      { name: "Narsimhulapet", pincode: "506324" },
      { name: "Danthalapally", pincode: "506324" },
      { name: "Thorrur", pincode: "506163" },
      { name: "Nellikudur", pincode: "506368" },
      { name: "Chinnagudur", pincode: "506101" },
      { name: "Kesamudram", pincode: "506112" },
      { name: "Inugurthy", pincode: "506112" },
      { name: "Kothaguda", pincode: "506135" },
      { name: "Gangaram", pincode: "506135" },
      { name: "Bayyaram", pincode: "507112" },
      { name: "Garla", pincode: "507210" },
      { name: "Seerole", pincode: "506105" }
    ]
  },
  {
    name: "Mahabubnagar",
    code: "MBN",
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
    name: "Mancherial",
    code: "MCL",
    defaultPincode: "504208",
    mandals: [
      { name: "Mancherial", pincode: "504208" },
      { name: "Bellampally", pincode: "504251" },
      { name: "Mandamarri", pincode: "504231" },
      { name: "Chennur", pincode: "504201" },
      { name: "Jaipur", pincode: "504216" },
      { name: "Bheemaram", pincode: "504204" },
      { name: "Kotapally", pincode: "504201" },
      { name: "Vemanpally", pincode: "504214" },
      { name: "Nennel", pincode: "504252" },
      { name: "Tandur", pincode: "504272" },
      { name: "Kasipet", pincode: "504231" },
      { name: "Kannepally", pincode: "504273" },
      { name: "Bheemini", pincode: "504273" },
      { name: "Jannaram", pincode: "504205" },
      { name: "Dandepally", pincode: "504206" },
      { name: "Luxettipet", pincode: "504215" },
      { name: "Hajipur", pincode: "504207" },
      { name: "Naspur", pincode: "504302" }
    ]
  },
  {
    name: "Medak",
    code: "MDK",
    defaultPincode: "502110",
    mandals: [
      { name: "Medak", pincode: "502110" },
      { name: "Haveli Ghanpur", pincode: "502110" },
      { name: "Shankarampet Rural", pincode: "502271" },
      { name: "Shankarampet Alladurg", pincode: "502270" },
      { name: "Papannapet", pincode: "502303" },
      { name: "Ramayampet", pincode: "502101" },
      { name: "Nizampet", pincode: "502102" },
      { name: "Narsapur", pincode: "502313" },
      { name: "Shivampet", pincode: "502334" },
      { name: "Kowdipally", pincode: "502316" },
      { name: "Chilipched", pincode: "502247" },
      { name: "Kulcharam", pincode: "502381" },
      { name: "Yeldurthy", pincode: "502255" },
      { name: "Chegunta", pincode: "502255" },
      { name: "Narsingi", pincode: "502102" },
      { name: "Regode", pincode: "502290" },
      { name: "Alladurg", pincode: "502269" },
      { name: "Tekmal", pincode: "502302" },
      { name: "Manoharabad", pincode: "502336" },
      { name: "Masaipet", pincode: "502335" },
      { name: "Tupran", pincode: "502334" }
    ]
  },
  {
    name: "Medchal–Malkajgiri",
    code: "MDM",
    defaultPincode: "501401",
    mandals: [
      { name: "Alwal", pincode: "500010" },
      { name: "Bachupally", pincode: "500090" },
      { name: "Balanagar", pincode: "500037" },
      { name: "Dundigal Gandimaisamma", pincode: "500043" },
      { name: "Ghatkesar", pincode: "501301" },
      { name: "Kapra", pincode: "500062" },
      { name: "Keesara", pincode: "501301" },
      { name: "Kukatpally", pincode: "500072" },
      { name: "Malkajgiri", pincode: "500047" },
      { name: "Medchal", pincode: "501401" },
      { name: "Medipally", pincode: "500098" },
      { name: "Quthbullapur", pincode: "500055" },
      { name: "Shamirpet", pincode: "500078" },
      { name: "Uppal", pincode: "500039" },
      { name: "Muduchintalpalli", pincode: "500078" }
    ]
  },
  {
    name: "Mulugu",
    code: "MLG",
    defaultPincode: "506343",
    mandals: [
      { name: "Mulugu", pincode: "506343" },
      { name: "Venkatapur", pincode: "506345" },
      { name: "Govindaraopet", pincode: "506344" },
      { name: "Tadvai", pincode: "506344" },
      { name: "Eturnagaram", pincode: "506165" },
      { name: "Mangapet", pincode: "506172" },
      { name: "Kannaigudem", pincode: "506165" },
      { name: "Venkatapuram Nuuguru", pincode: "507136" },
      { name: "Wazeed", pincode: "507136" }
    ]
  },
  {
    name: "Nagarkurnool",
    code: "NGK",
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
      { name: "Pentlavelly", pincode: "509102" },
      { name: "Gopalpet", pincode: "509206" }
    ]
  },
  {
    name: "Nalgonda",
    code: "NLG",
    defaultPincode: "508001",
    mandals: [
      { name: "Nalgonda", pincode: "508001" },
      { name: "Chandur", pincode: "508255" },
      { name: "Chityal", pincode: "508114" },
      { name: "Kattangur", pincode: "508205" },
      { name: "Nakrekal", pincode: "508211" },
      { name: "Kethepally", pincode: "508221" },
      { name: "Shaligouraram", pincode: "508210" },
      { name: "Thipparthy", pincode: "508247" },
      { name: "Nidamanoor", pincode: "508278" },
      { name: "Haliya", pincode: "508202" },
      { name: "Anumula", pincode: "508202" },
      { name: "Tripuraram", pincode: "508207" },
      { name: "Miryalaguda", pincode: "508207" },
      { name: "Vemulapally", pincode: "508217" },
      { name: "Dameracherla", pincode: "508208" },
      { name: "Madgulapally", pincode: "508374" },
      { name: "Devarakonda", pincode: "508248" },
      { name: "Chinthapally", pincode: "508250" },
      { name: "Gundlapally", pincode: "508258" },
      { name: "Chandampet", pincode: "508248" },
      { name: "Neredugommu", pincode: "508248" },
      { name: "Gurrampode", pincode: "508256" },
      { name: "Pedda Adiserla Pally", pincode: "508243" },
      { name: "Munugode", pincode: "508244" },
      { name: "Nampally", pincode: "508373" },
      { name: "Marriguda", pincode: "508245" },
      { name: "Kanagal", pincode: "508255" },
      { name: "Kondamallepally", pincode: "508243" },
      { name: "Tirumalagiri Sagar", pincode: "508202" },
      { name: "Adavidevulapally", pincode: "508207" }
    ]
  },
  {
    name: "Narayanpet",
    code: "NRP",
    defaultPincode: "509210",
    mandals: [
      { name: "Narayanpet", pincode: "509210" },
      { name: "Damaragidda", pincode: "509210" },
      { name: "Dhanwada", pincode: "509205" },
      { name: "Marikal", pincode: "509351" },
      { name: "Kosgi", pincode: "509339" },
      { name: "Maddur", pincode: "509410" },
      { name: "Utkoor", pincode: "509311" },
      { name: "Maganoor", pincode: "509352" },
      { name: "Krishna", pincode: "509352" },
      { name: "Makthal", pincode: "509703" },
      { name: "Narva", pincode: "509130" }
    ]
  },
  {
    name: "Nirmal",
    code: "NRM",
    defaultPincode: "504106",
    mandals: [
      { name: "Nirmal Urban", pincode: "504106" },
      { name: "Nirmal Rural", pincode: "504106" },
      { name: "Soan", pincode: "504106" },
      { name: "Dilawarpur", pincode: "504306" },
      { name: "Narsapur G", pincode: "504306" },
      { name: "Kaddampeddur", pincode: "504204" },
      { name: "Dasturabad", pincode: "504204" },
      { name: "Khanapur", pincode: "504203" },
      { name: "Mamda", pincode: "504310" },
      { name: "Pembi", pincode: "504203" },
      { name: "Laxmanchanda", pincode: "504310" },
      { name: "Sarangapur", pincode: "504110" },
      { name: "Bhainsa", pincode: "504103" },
      { name: "Kubeer", pincode: "504103" },
      { name: "Kuntala", pincode: "504109" },
      { name: "Mudhole", pincode: "504102" },
      { name: "Basar", pincode: "504101" },
      { name: "Lokeshwaram", pincode: "504104" },
      { name: "Tanur", pincode: "504102" }
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
      { name: "Mugpal", pincode: "503003" },
      { name: "Armoor", pincode: "503224" },
      { name: "Balkonda", pincode: "503217" },
      { name: "Bheemgal", pincode: "503307" },
      { name: "Bodhan", pincode: "503185" },
      { name: "Dharpally", pincode: "503165" },
      { name: "Dichpally", pincode: "503175" },
      { name: "Indalwai", pincode: "503164" },
      { name: "Jakranpally", pincode: "503224" },
      { name: "Kammarpally", pincode: "503308" },
      { name: "Kotgiri", pincode: "503207" },
      { name: "Makloor", pincode: "503003" },
      { name: "Mopal", pincode: "503003" },
      { name: "Mortad", pincode: "503225" },
      { name: "Mosra", pincode: "503206" },
      { name: "Nandipet", pincode: "503212" },
      { name: "Navipet", pincode: "503245" },
      { name: "Chandur", pincode: "503185" },
      { name: "Renjal", pincode: "503246" },
      { name: "Rudrur", pincode: "503188" },
      { name: "Sirikonda", pincode: "503165" },
      { name: "Varni", pincode: "503201" },
      { name: "Velpur", pincode: "503311" },
      { name: "Yedapally", pincode: "503202" },
      { name: "Mendora", pincode: "503219" },
      { name: "Mupkal", pincode: "503218" }
    ]
  },
  {
    name: "Peddapalli",
    code: "PDP",
    defaultPincode: "505172",
    mandals: [
      { name: "Peddapalli", pincode: "505172" },
      { name: "Basanthnagar", pincode: "505187" },
      { name: "Odela", pincode: "505152" },
      { name: "Sultanabad", pincode: "505185" },
      { name: "Julapalli", pincode: "505525" },
      { name: "Eligaid", pincode: "505525" },
      { name: "Dharmaram", pincode: "505416" },
      { name: "Ramagundam", pincode: "505208" },
      { name: "Anthergaon", pincode: "505514" },
      { name: "Palakurthy", pincode: "505187" },
      { name: "Kamanpur", pincode: "505188" },
      { name: "Mutharam", pincode: "505184" },
      { name: "Manthani", pincode: "505184" },
      { name: "Ramagiri", pincode: "505212" }
    ]
  },
  {
    name: "Rajanna Sircilla",
    code: "RJS",
    defaultPincode: "505301",
    mandals: [
      { name: "Sircilla", pincode: "505301" },
      { name: "Thangallapalli", pincode: "505405" },
      { name: "Gambhiraopet", pincode: "505304" },
      { name: "Yellareddypet", pincode: "505303" },
      { name: "Veernapalli", pincode: "505303" },
      { name: "Mustabad", pincode: "505404" },
      { name: "Illanthakunta", pincode: "505402" },
      { name: "Boinpally", pincode: "505524" },
      { name: "Vemulawada", pincode: "505302" },
      { name: "Vemulawada Rural", pincode: "505302" },
      { name: "Chandurthi", pincode: "505403" },
      { name: "Rudrangi", pincode: "505403" },
      { name: "Konaraopet", pincode: "505301" }
    ]
  },
  {
    name: "Ranga Reddy",
    code: "RRD",
    defaultPincode: "500030",
    mandals: [
      { name: "Chevella", pincode: "501503" },
      { name: "Moinabad", pincode: "501504" },
      { name: "Shabad", pincode: "501511" },
      { name: "Shankarpally", pincode: "501203" },
      { name: "Rajendranagar", pincode: "500030" },
      { name: "Gandipet", pincode: "500075" },
      { name: "Shamshabad", pincode: "501218" },
      { name: "Serilingampally", pincode: "500019" },
      { name: "Maheshwaram", pincode: "501359" },
      { name: "Kandukur", pincode: "501359" },
      { name: "Amangal", pincode: "509321" },
      { name: "Kadthal", pincode: "509358" },
      { name: "Talakondapally", pincode: "509321" },
      { name: "Ibrahimpatnam", pincode: "501506" },
      { name: "Manchal", pincode: "501508" },
      { name: "Yacharam", pincode: "501509" },
      { name: "Abdullapurmet", pincode: "501505" },
      { name: "Hayathnagar", pincode: "501505" },
      { name: "Saroornagar", pincode: "500035" },
      { name: "Balapur", pincode: "500005" },
      { name: "Farooqnagar", pincode: "509216" },
      { name: "Kothur", pincode: "509228" },
      { name: "Nandigama", pincode: "509228" },
      { name: "Kondurg", pincode: "509207" },
      { name: "Chowderguda", pincode: "509207" },
      { name: "Madgul", pincode: "509327" },
      { name: "Gandeed", pincode: "509337" }
    ]
  },
  {
    name: "Sangareddy",
    code: "SRD",
    defaultPincode: "502001",
    mandals: [
      { name: "Sangareddy", pincode: "502001" },
      { name: "Kandi", pincode: "502285" },
      { name: "Kondapur", pincode: "502306" },
      { name: "Sadasivpet", pincode: "502291" },
      { name: "Patancheru", pincode: "502319" },
      { name: "Ameenpur", pincode: "502032" },
      { name: "Ramachandrapuram", pincode: "502032" },
      { name: "Gummadidala", pincode: "502313" },
      { name: "Jinnaram", pincode: "502319" },
      { name: "Hathnoora", pincode: "502296" },
      { name: "Andole", pincode: "502272" },
      { name: "Pulkal", pincode: "502273" },
      { name: "Choutakur", pincode: "502273" },
      { name: "Vatpally", pincode: "502269" },
      { name: "Munipally", pincode: "502345" },
      { name: "Kohir", pincode: "502210" },
      { name: "Zahirabad", pincode: "502220" },
      { name: "Mogudampally", pincode: "502221" },
      { name: "Nyalkal", pincode: "502249" },
      { name: "Jharasangam", pincode: "502246" },
      { name: "Raikode", pincode: "502257" },
      { name: "Narayankhed", pincode: "502286" },
      { name: "Kangti", pincode: "502287" },
      { name: "Kalher", pincode: "502287" },
      { name: "Sirgapoor", pincode: "502287" },
      { name: "Manoor", pincode: "502286" }
    ]
  },
  {
    name: "Siddipet",
    code: "SDP",
    defaultPincode: "502103",
    mandals: [
      { name: "Siddipet Urban", pincode: "502103" },
      { name: "Siddipet Rural", pincode: "502103" },
      { name: "Chinnakodur", pincode: "502267" },
      { name: "Nangnoor", pincode: "502280" },
      { name: "Narayanraopet", pincode: "502103" },
      { name: "Dubbak", pincode: "502108" },
      { name: "Mirdoddi", pincode: "502102" },
      { name: "Doulthabad", pincode: "502247" },
      { name: "Thoguta", pincode: "502372" },
      { name: "Gajwel", pincode: "502278" },
      { name: "Jagdevpur", pincode: "502281" },
      { name: "Markook", pincode: "502279" },
      { name: "Wargal", pincode: "502279" },
      { name: "Mulugu", pincode: "502279" },
      { name: "Kondapak", pincode: "502277" },
      { name: "Bejjanki", pincode: "505528" },
      { name: "Husnabad", pincode: "505467" },
      { name: "Akkannapet", pincode: "505467" },
      { name: "Koheda", pincode: "505473" },
      { name: "Cherial", pincode: "506223" },
      { name: "Maddur", pincode: "506223" },
      { name: "Komuravelli", pincode: "506355" },
      { name: "Dhoolmitta", pincode: "506223" },
      { name: "Raipole", pincode: "502278" }
    ]
  },
  {
    name: "Suryapet",
    code: "SRP",
    defaultPincode: "508213",
    mandals: [
      { name: "Suryapet", pincode: "508213" },
      { name: "Chivvemla", pincode: "508213" },
      { name: "Mothey", pincode: "508212" },
      { name: "Jaji Reddi Gudem", pincode: "508214" },
      { name: "Penpahad", pincode: "508214" },
      { name: "Atmakur (S)", pincode: "508224" },
      { name: "Noothankal", pincode: "508221" },
      { name: "Thungathurthi", pincode: "508280" },
      { name: "Maddirala", pincode: "508280" },
      { name: "Tirumalagiri", pincode: "508223" },
      { name: "Nagaram", pincode: "508279" },
      { name: "Kodad", pincode: "508206" },
      { name: "Chilkur", pincode: "508206" },
      { name: "Munagala", pincode: "508233" },
      { name: "Nadigudem", pincode: "508234" },
      { name: "Ananthagiri", pincode: "508206" },
      { name: "Huzurnagar", pincode: "508204" },
      { name: "Mattampally", pincode: "508204" },
      { name: "Mellachervu", pincode: "508246" },
      { name: "Garidepally", pincode: "508201" },
      { name: "Neredcherla", pincode: "508218" },
      { name: "Palakeedu", pincode: "508218" },
      { name: "Chinthapalem", pincode: "508246" }
    ]
  },
  {
    name: "Vikarabad",
    code: "VKB",
    defaultPincode: "501101",
    mandals: [
      { name: "Vikarabad", pincode: "501101" },
      { name: "Mominpet", pincode: "501202" },
      { name: "Marpally", pincode: "501106" },
      { name: "Kotepally", pincode: "501106" },
      { name: "Dharur", pincode: "501121" },
      { name: "Bantwaram", pincode: "501121" },
      { name: "Tandur", pincode: "501141" },
      { name: "Peddemul", pincode: "501142" },
      { name: "Yalal", pincode: "501144" },
      { name: "Basheerabad", pincode: "501143" },
      { name: "Doma", pincode: "501502" },
      { name: "Gandeed", pincode: "509337" },
      { name: "Kulkacherla", pincode: "501502" },
      { name: "Parigi", pincode: "501501" },
      { name: "Pudur", pincode: "501501" },
      { name: "Nawabpet", pincode: "501111" },
      { name: "Kodangal", pincode: "509338" },
      { name: "Bomraspet", pincode: "509338" },
      { name: "Doulathabad", pincode: "509336" }
    ]
  },
  {
    name: "Wanaparthy",
    code: "WNP",
    defaultPincode: "509103",
    mandals: [
      { name: "Wanaparthy", pincode: "509103" },
      { name: "Gopalpet", pincode: "509206" },
      { name: "Ravulapalem", pincode: "509103" },
      { name: "Kothakota", pincode: "509381" },
      { name: "Madanapur", pincode: "509110" },
      { name: "Pangal", pincode: "509120" },
      { name: "Pebbair", pincode: "509104" },
      { name: "Srirangapur", pincode: "509104" },
      { name: "Peddamandadi", pincode: "509103" },
      { name: "Ghanpur", pincode: "509380" },
      { name: "Revalli", pincode: "509206" },
      { name: "Chinna Sambaram", pincode: "509103" },
      { name: "Veepanagandla", pincode: "509102" },
      { name: "Amarachinta", pincode: "509130" }
    ]
  },
  {
    name: "Warangal",
    code: "WGL",
    defaultPincode: "506002",
    mandals: [
      { name: "Warangal", pincode: "506002" },
      { name: "Khila Warangal", pincode: "506002" },
      { name: "Geesugonda", pincode: "506330" },
      { name: "Atmakur", pincode: "506342" },
      { name: "Damera", pincode: "506006" },
      { name: "Wardhannapet", pincode: "506313" },
      { name: "Rayaparthy", pincode: "506314" },
      { name: "Mamnoor", pincode: "506166" },
      { name: "Sangem", pincode: "506310" },
      { name: "Parvathagiri", pincode: "506365" },
      { name: "Nekkonda", pincode: "506122" },
      { name: "Chennaraopet", pincode: "506332" },
      { name: "Nallabelly", pincode: "506349" },
      { name: "Duggondu", pincode: "506331" },
      { name: "Khanapur", pincode: "506132" }
    ]
  },
  {
    name: "Yadadri Bhuvanagiri",
    code: "YDB",
    defaultPincode: "508116",
    mandals: [
      { name: "Bhongir", pincode: "508116" },
      { name: "Bibinagar", pincode: "508126" },
      { name: "Bhudan Pochampally", pincode: "508284" },
      { name: "Choutuppal", pincode: "508252" },
      { name: "Narayanpur", pincode: "508253" },
      { name: "Ramannapet", pincode: "508113" },
      { name: "Valigonda", pincode: "508112" },
      { name: "Alair", pincode: "508101" },
      { name: "Gundala", pincode: "508277" },
      { name: "Motakondur", pincode: "508101" },
      { name: "Turkapally", pincode: "508115" },
      { name: "Rajapet", pincode: "508105" },
      { name: "Yadagirigutta", pincode: "508115" },
      { name: "Bommena", pincode: "508116" },
      { name: "Atmakur (M)", pincode: "508111" },
      { name: "Addagudur", pincode: "508277" },
      { name: "Mothkur", pincode: "508277" }
    ]
  }
];

/**
 * Get all 33 Telangana district names
 */
export function getTelanganaDistricts(): string[] {
  return TELANGANA_LOCATIONS.map((d) => d.name);
}

/**
 * Normalize district string lookup to handle variations (e.g., 'Ranga Reddy' vs 'Rangareddy', 'Medchal-Malkajgiri' vs 'Medchal–Malkajgiri')
 */
export function findDistrict(districtName: string): DistrictLocation | undefined {
  if (!districtName) return undefined;
  const clean = districtName.toLowerCase().replace(/[\s\-_–—]/g, "");
  return TELANGANA_LOCATIONS.find(
    (d) => d.name.toLowerCase().replace(/[\s\-_–—]/g, "") === clean
  );
}

/**
 * Get all mandals for a specific district
 */
export function getMandalsForDistrict(districtName: string): MandalLocation[] {
  const match = findDistrict(districtName);
  return match ? match.mandals : [];
}

/**
 * Lookup matching Pincode for a District and Mandal combination
 */
export function lookupPincode(districtName: string, mandalName: string): string {
  const district = findDistrict(districtName);
  if (!district) return "";

  const cleanMandal = (mandalName || "").toLowerCase().replace(/[\s\-_–—]/g, "");
  const mandal = district.mandals.find(
    (m) => m.name.toLowerCase().replace(/[\s\-_–—]/g, "") === cleanMandal
  );
  if (mandal) return mandal.pincode;

  return district.defaultPincode;
}
