import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://lev1ne.org/",
    title: "🐠.__lev1ne",
    description: "记录 Linux、VPS、网络、服务器折腾过程。",
    author: "__lev1ne",
    profile: "https://lev1ne.org",
    ogImage: "og-default.png",
    lang: "en",
    timezone: "Asia/Hong_Kong",
    dir: "ltr",
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
    editPost: {
      enabled: false
    },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/LevineWoo" },
    { name: "x",        url: "https://x.com/__lev1ne" },
    { name: "mail",     url: "mailto:gd.wulw@gmail.com" },
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