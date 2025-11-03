import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";

import { TCourse, TFeedback, TPurchase } from "@/types/models.types";
import moment from "moment";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function processPurchaseData(
  purchases: TPurchase[],
  coursePrice: number
) {
  const monthRevenue = Array(12).fill(0);

  purchases.forEach((purchase) => {
    const month = moment(purchase.createdAt).month();
    monthRevenue[month] += coursePrice;
  });

  return monthRevenue.map((revenue, index) => ({
    name: moment.monthsShort(index),
    total: revenue,
  }));
}
export function timeAgo(dateString: Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  if (secondsPast < 60) {
    return "Just now";
  }
  if (secondsPast < 3600) {
    return `${Math.floor(secondsPast / 60)} minutes ago`;
  }
  if (secondsPast <= 86400) {
    return `${Math.floor(secondsPast / 3600)} hours ago`;
  }
  if (secondsPast > 86400) {
    const day = Math.floor(secondsPast / 86400);
    return `${day} day${day !== 1 ? "s" : ""} ago`;
  }

  return date.toString();
}
export function getTimeInterval(hours: number): string {
  if (hours <= 1) {
    return `${hours} Hour${hours !== 1 ? "s" : ""}`;
  } else if (hours < 24) {
    return `${hours} Hour${hours !== 1 ? "s" : ""}`;
  } else if (hours < 24 * 7) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days} Day${days !== 1 ? "s" : ""}`;
    } else {
      return `${days} Day${days !== 1 ? "s" : ""} and ${remainingHours} Hour${
        remainingHours !== 1 ? "s" : ""
      }`;
    }
  } else if (hours < 24 * 30) {
    const weeks = Math.floor(hours / (24 * 7));
    const remainingDays = Math.floor((hours % (24 * 7)) / 24);
    if (remainingDays === 0) {
      return `${weeks} Week${weeks !== 1 ? "s" : ""}`;
    } else {
      return `${weeks} Week${weeks !== 1 ? "s" : ""} and ${remainingDays} Day${
        remainingDays !== 1 ? "s" : ""
      }`;
    }
  } else {
    const months = Math.floor(hours / (24 * 30));
    const remainingWeeks = Math.floor((hours % (24 * 30)) / (24 * 7));
    if (remainingWeeks === 0) {
      return `${months} Month${months !== 1 ? "s" : ""}`;
    } else {
      return `${months} Month${
        months !== 1 ? "s" : ""
      } and ${remainingWeeks} Week${remainingWeeks !== 1 ? "s" : ""}`;
    }
  }
}

export function formatNumber(number: number): string {
  if (number < 1000) {
    return number.toString();
  } else if (number < 1000000) {
    return (number / 1000).toFixed(1) + " K";
  } else {
    return (number / 1000000).toFixed(1) + " M";
  }
}

interface UrlQueryParams {
  params: string;
  key: string;
  value: string | null;
}

export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
};

interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export const removeKeysFromQuery = ({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) => {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
};

export const transformCurrencyToSymbol = (currency: string): string => {
  const currencySymbols: { [key: string]: string } = {
    AED: "د.إ",
    AFN: "؋",
    ALL: "L",
    AMD: "֏",
    ANG: "ƒ",
    AOA: "Kz",
    ARS: "$",
    AUD: "A$",
    AWG: "ƒ",
    AZN: "₼",
    BAM: "КМ",
    BBD: "Bds$",
    BDT: "৳",
    BGN: "лв",
    BHD: ".د.ب",
    BIF: "FBu",
    BMD: "BD$",
    BND: "B$",
    BOB: "Bs.",
    BRL: "R$",
    BSD: "B$",
    BTC: "₿",
    BTN: "Nu.",
    BWP: "P",
    BYN: "Br",
    BZD: "BZ$",
    CAD: "C$",
    CDF: "FC",
    CHF: "CHF",
    CLF: "UF",
    CLP: "CLP$",
    CNH: "CN¥",
    CNY: "CN¥",
    COP: "COL$",
    CRC: "₡",
    CUC: "CUC$",
    CUP: "CUP$",
    CVE: "Esc",
    CZK: "Kč",
    DJF: "Fdj",
    DKK: "kr",
    DOP: "RD$",
    DZD: "دج",
    EGP: "E£",
    ERN: "Nfk",
    ETB: "Br",
    EUR: "€",
    FJD: "FJ$",
    FKP: "FK£",
    GBP: "£",
    GEL: "₾",
    GGP: "GG£",
    GHS: "GH₵",
    GIP: "£",
    GMD: "D",
    GNF: "FG",
    GTQ: "Q",
    GYD: "G$",
    HKD: "HK$",
    HNL: "L",
    HRK: "kn",
    HTG: "G",
    HUF: "Ft",
    IDR: "Rp",
    ILS: "₪",
    IMP: "IM£",
    INR: "₹",
    IQD: "د.ع",
    IRR: "﷼",
    ISK: "kr",
    JEP: "JE£",
    JMD: "J$",
    JOD: "JD",
    JPY: "¥",
    KES: "Ksh",
    KGS: "сом",
    KHR: "៛",
    KMF: "CF",
    KPW: "₩",
    KRW: "₩",
    KWD: "KD",
    KYD: "CI$",
    KZT: "₸",
    LAK: "₭",
    LBP: "L£",
    LKR: "₨",
    LRD: "L$",
    LSL: "M",
    LYD: "LD",
    MAD: "MAD",
    MDL: "MDL",
    MGA: "Ar",
    MKD: "ден",
    MMK: "K",
    MNT: "₮",
    MOP: "MOP$",
    MRU: "UM",
    MUR: "₨",
    MVR: "ރ.",
    MWK: "MK",
    MXN: "$",
    MYR: "RM",
    MZN: "MT",
    NAD: "N$",
    NGN: "₦",
    NIO: "C$",
    NOK: "kr",
    NPR: "नेरू",
    NZD: "NZ$",
    OMR: "ر.ع.",
    PAB: "B/.",
    PEN: "S/.",
    PGK: "K",
    PHP: "₱",
    PKR: "₨",
    PLN: "zł",
    PYG: "₲",
    QAR: "ر.ق",
    RON: "lei",
    RSD: "дин.",
    RUB: "₽",
    RWF: "RF",
    SAR: "ر.س",
    SBD: "SI$",
    SCR: "SR",
    SDG: "ج.س.",
    SEK: "kr",
    SGD: "S$",
    SHP: "£",
    SLL: "Le",
    SOS: "Sh",
    SRD: "$",
    SSP: "£",
    STD: "Db",
    STN: "Db",
    SVC: "₡",
    SYP: "£S",
    SZL: "E",
    THB: "฿",
    TJS: "SM",
    TMT: "T",
    TND: "د.ت",
    TOP: "T$",
    TRY: "₺",
    TTD: "TT$",
    TWD: "NT$",
    TZS: "TSh",
    UAH: "₴",
    UGX: "USh",
    USD: "$",
    UYU: "$U",
    UZS: "so'm",
    VEF: "Bs.",
    VES: "Bs.S",
    VND: "₫",
    VUV: "VT",
    WST: "WS$",
    XAF: "FCFA",
    XAG: "XAG",
    XAU: "XAU",
    XCD: "EC$",
    XDR: "SDR",
    XOF: "CFA",
    XPD: "XPD",
    XPF: "CFP",
    XPT: "XPT",
    YER: "﷼",
    ZAR: "R",
    ZMW: "K",
    ZWL: "Z$",
  };

  return currencySymbols[currency];
};
export function getTimeAgo(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date);
  }

  const now = new Date();
  const diff = Math.abs(now.getTime() - date.getTime());
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) {
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  } else if (weeks > 0) {
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  } else if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else {
    return "just now";
  }
}

export function convertSecondsToTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const minutesString = minutes.toString().padStart(2, "0");
  const secondsString = remainingSeconds.toString().padStart(2, "0");

  return `${minutesString}:${secondsString}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function format(timestamp: Date): string {
  const date = new Date(timestamp);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export type TagType = {
  value: string;
  label: string;
};

export const tags: TagType[] = [
  // Programming and Software Development
  { value: "programming", label: "Programming" },
  { value: "software-development", label: "Software Development" },
  { value: "web-development", label: "Web Development" },
  { value: "front-end", label: "Front End" },
  { value: "back-end", label: "Back End" },
  { value: "full-stack", label: "Full Stack" },

  // Programming Languages
  { value: "javascript", label: "JavaScript" },
  { value: "html", label: "HTML" },

  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c++", label: "C++" },
  { value: "c#", label: "C#" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "dart", label: "Dart" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "scala", label: "Scala" },
  { value: "r", label: "R" },

  // Web Development Frameworks
  { value: "node.js", label: "Node.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "next.js", label: "Next.js" },
  { value: "gatsby", label: "Gatsby" },
  { value: "nuxt.js", label: "Nuxt.js" },
  { value: "express", label: "Express" },
  { value: "django", label: "Django" },
  { value: "flask", label: "Flask" },
  { value: "ruby-on-rails", label: "Ruby on Rails" },
  { value: "laravel", label: "Laravel" },
  { value: "spring", label: "Spring" },
  { value: "play-framework", label: "Play Framework" },
  { value: "tailwindcss", label: "Tailwind CSS" },

  // Style sheet languages
  { value: "css", label: "CSS" },
  { value: "sass", label: "Sass" },
  { value: "less", label: "Less" },
  { value: "stylus", label: "Stylus" },
  { value: "bootstrap", label: "Bootstrap" },
  { value: "materialize", label: "Materialize" },
  { value: "bulma", label: "Bulma" },
  { value: "chakra-ui", label: "Chakra UI" },
  { value: "ant-design", label: "Ant Design" },
  { value: "semantic-ui", label: "Semantic UI" },
  { value: "shadcn-ui", label: "Shadcn UI" },
  { value: "design", label: "Design" },
  { value: "mokup", label: "Mokup" },
  { value: "figma", label: "Figma" },
  { value: "adobe-xd", label: "Adobe XD" },
  { value: "sketch", label: "Sketch" },
  { value: "photoshop", label: "Photoshop" },
  { value: "illustrator", label: "Illustrator" },
  { value: "coreldraw", label: "CorelDraw" },
  { value: "indesign", label: "InDesign" },
  { value: "after-effects", label: "After Effects" },
  { value: "premiere-pro", label: "Premiere Pro" },
  { value: "lightroom", label: "Lightroom" },
  { value: "xd", label: "XD" },
  { value: "invision", label: "InVision" },
  { value: "zeplin", label: "Zeplin" },
  { value: "marvel", label: "Marvel" },
  { value: "framer", label: "Framer" },

  {
    value: "styled-components",
    label: "Styled Components",
  },
  { value: "emotion", label: "Emotion" },
  { value: "css-modules", label: "CSS Modules" },
  { value: "Styling", label: "Styling" },
  { value: "emotion", label: "Emotion" },
  { value: "responsive-design", label: "Responsive Design" },

  // Databases
  { value: "sql", label: "SQL" },
  { value: "nosql", label: "NoSQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "firebase", label: "Firebase" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },

  // APIs and Development Tools
  { value: "graphql", label: "GraphQL" },
  { value: "rest-api", label: "REST API" },
  { value: "websockets", label: "WebSockets" },
  { value: "docker", label: "Docker" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "serverless", label: "Serverless" },
  { value: "microservices", label: "Microservices" },
  { value: "testing", label: "Testing" },
  { value: "ci-cd", label: "CI/CD" },
  { value: "git", label: "Git" },
  { value: "version-control", label: "Version Control" },

  // Algorithms and Data Structures
  { value: "algorithms", label: "Algorithms" },
  { value: "data-structures", label: "Data Structures" },

  // Data Science and AI
  { value: "data-science", label: "Data Science" },
  { value: "data-analysis", label: "Data Analysis" },
  { value: "data-visualization", label: "Data Visualization" },
  { value: "machine-learning", label: "Machine Learning" },
  { value: "artificial-intelligence", label: "Artificial Intelligence" },
  { value: "deep-learning", label: "Deep Learning" },
  { value: "nlp", label: "Natural Language Processing (NLP)" },
  { value: "reinforcement-learning", label: "Reinforcement Learning" },

  // Development Stacks
  { value: "mern-stack", label: "MERN Stack" },
  { value: "mean-stack", label: "MEAN Stack" },

  // Other Technologies
  { value: "cloud-computing", label: "Cloud Computing" },
  { value: "devops", label: "DevOps" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "blockchain", label: "Blockchain" },

  // Design and Marketing
  { value: "ui-ux-design", label: "UI/UX Design" },
  { value: "graphic-design", label: "Graphic Design" },
  { value: "digital-marketing", label: "Digital Marketing" },

  // Business and Finance
  { value: "business", label: "Business" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "finance", label: "Finance" },
  { value: "accounting", label: "Accounting" },
  { value: "economics", label: "Economics" },

  // Science and Education
  { value: "mathematics", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "medicine", label: "Medicine" },
  { value: "environmental-science", label: "Environmental Science" },
  { value: "sustainability", label: "Sustainability" },
  { value: "education", label: "Education" },
  { value: "stem", label: "STEM" },

  // Personal Development and Hobbies
  { value: "health-fitness", label: "Health & Fitness" },
  { value: "psychology", label: "Psychology" },
  { value: "history", label: "History" },
  { value: "literature", label: "Literature" },
  { value: "languages", label: "Languages" },
  { value: "music", label: "Music" },
  { value: "art", label: "Art" },
  { value: "photography", label: "Photography" },
  { value: "cooking", label: "Cooking" },
  { value: "gardening", label: "Gardening" },
  { value: "diy-crafts", label: "DIY & Crafts" },
  { value: "travel", label: "Travel" },
  { value: "sports", label: "Sports" },
  { value: "yoga-meditation", label: "Yoga & Meditation" },
  { value: "personal-development", label: "Personal Development" },
  { value: "self-help", label: "Self-Help" },
  { value: "parenting", label: "Parenting" },

  // Miscellaneous
  { value: "philosophy", label: "Philosophy" },
  { value: "religion", label: "Religion" },
  { value: "astrology", label: "Astrology" },
  { value: "space-exploration", label: "Space Exploration" },
  { value: "career", label: "Career" },
];

export const calculateCourseRating = (
  course: TCourse
): {
  courseRating: number;
  ratingFrom: number;
} => {
  // Check if feedbacks exists and is an array
  if (!course.feedbacks || !Array.isArray(course.feedbacks) || course.feedbacks.length === 0) {
    return {
      courseRating: 0,
      ratingFrom: 0,
    };
  }

  const studentsRating = course.feedbacks.reduce(
    (acc: number, feedback: TFeedback) => acc + feedback.rating,
    0
  );

  const courseRating = studentsRating / course.feedbacks.length;

  return {
    courseRating: +courseRating.toFixed(1) || 0,
    ratingFrom: course.feedbacks.length,
  };
};
