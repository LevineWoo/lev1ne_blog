import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://lev1ne.org/",
    title: "🐠.__lev1ne",
    description: "由 Server 到 AI，由工具到生活——記低踩過嘅坑、試過嘅設定同值得記低嘅嘢。",
    author: "__lev1ne",
    profile: "https://lev1ne.org",
    ogImage: "og-default.png",
    lang: "zh-HK",
    timezone: "Asia/Hong_Kong",
    dir: "ltr",
  },
  posts: {
    perPage: 10,
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
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
