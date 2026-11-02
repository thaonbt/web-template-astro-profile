// Content for the Profile page (src/pages/profile.astro).
// Edit this file only: the page itself is a pure view and has no content in it.
// Every value below is a placeholder. Replace it with your own.
// Also replace src/assets/images/avatar.png with your own image.

export interface PageMeta {
  /** <title> prefix and page heading */
  title: string;
  /** Meta description and the line under the page heading */
  description: string;
}

/** Section headings and the link text that are not part of your own content. */
export interface Labels {
  /** Link under the intro that goes to the About page */
  aboutLink: string;
  skills: string;
  experience: string;
  /** Heading of the expandable cards at the bottom of the page */
  more: string;
}

export interface Intro {
  name: string;
  /** Job title shown under the name */
  title: string;
  summary: string;
  /** Alt text of the avatar image */
  avatarAlt: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Experience {
  /** Free text, for example "2022 - Present" */
  period: string;
  role: string;
  company: string;
  description: string;
}

export interface SectionItem {
  text: string;
  /** Optional second line in smaller text, for example an issuer or a year */
  meta?: string;
}

export interface Section {
  /** Used as the HTML id, so it makes the card linkable as /profile#<id> */
  id: string;
  title: string;
  /** Whether the card is expanded on first load */
  open?: boolean;
  items: SectionItem[];
}

export const pageMeta: PageMeta = {
  title: "Profile",
  description: "A short overview of my skills, experience and credentials.",
};

export const labels: Labels = {
  aboutLink: "Read the story behind it",
  skills: "Skills",
  experience: "Experience",
  more: "Highlights & Credentials",
};

export const intro: Intro = {
  name: "[Your Name]",
  title: "[Your Job Title]",
  summary:
    "[Two or three sentences about what you do, what you care about and what you are working on now.]",
  avatarAlt: "Portrait of [Your Name]",
};

export const skills: SkillGroup[] = [
  {
    category: "Category One",
    items: ["Skill A", "Skill B", "Skill C"],
  },
  {
    category: "Category Two",
    items: ["Skill D", "Skill E", "Skill F"],
  },
  {
    category: "Category Three",
    items: ["Skill G", "Skill H"],
  },
  {
    category: "Category Four",
    items: ["Skill I", "Skill J", "Skill K"],
  },
];

export const experiences: Experience[] = [
  {
    period: "2023 - Present",
    role: "Senior Role",
    company: "ABC Tech Company",
    description:
      "[What you own, what you built or improved, and the result. One or two sentences.]",
  },
  {
    period: "2020 - 2023",
    role: "Mid-level Role",
    company: "XYZ Software Corp",
    description: "[What you did there and what you learned.]",
  },
  {
    period: "2017 - 2020",
    role: "Junior Role",
    company: "Example Studio",
    description: "[Where your career started.]",
  },
];

export const sections: Section[] = [
  {
    id: "highlights",
    title: "Highlights",
    open: true,
    items: [
      { text: "[A result you are proud of, ideally with a number.]" },
      {
        text: "[Another achievement or project.]",
        meta: "Optional detail line",
      },
    ],
  },
  {
    id: "certifications",
    title: "Certifications",
    items: [
      { text: "[Certification name]", meta: "[Issuer, year]" },
      { text: "[Another certification]", meta: "[Issuer, year]" },
    ],
  },
  {
    id: "education",
    title: "Education",
    items: [{ text: "[Degree or course]", meta: "[School, year]" }],
  },
];