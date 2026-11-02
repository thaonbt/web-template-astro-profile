import { defineAstroPaperConfig } from "./src/types/config";
import { deploy } from "./deploy.config";

export default defineAstroPaperConfig({
  site: {
    url: deploy.siteUrl,
    title: "My Profile",
    description: "Description about the site.",
    author: "<Your Name>",
    profile: deploy.siteUrl,
    ogImage: "",
    lang: "en",
    timezone: "Asia/Bangkok",
    dir: "ltr",
    googleVerification: "9HnQvUceCBrJCNiw_z6JXmg6jpy1ode8SOVQ_d9tCxE",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    // editPost: {
    //   enabled: false,
    //   url: "https://github.com/satnaing/astro-paper/edit/main/",
    // },
    search: "pagefind",
  },
  socials: [
    // { name: "x",        url: "https://x.com/<username>" },
    { name: "linkedin", url: "https://www.linkedin.com/in/<username>/" },
    { name: "mail",     url: "mailto:<username>@gmail.com" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});