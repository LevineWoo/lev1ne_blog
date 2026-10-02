import type { UIStrings } from "../types";

export default {
  nav: {
    home: "首頁",
    posts: "文章",
    tags: "標籤",
    about: "關於",
    archives: "時光機",
    search: "想搵咩？",
  },

  post: {
    publishedAt: "發佈於",
    updatedAt: "更新日期",
    sharePostIntro: "Share 哩篇文：",
    sharePostOn: "Share 去 {{platform}}",
    sharePostViaEmail: "用 Email Share",
    tagLabel: "標籤",
    backToTop: "返頂",
    goBack: "返上一頁",
    editPage: "編輯哩篇文",
    previousPost: "上一篇文",
    nextPost: "下一篇文",
  },

  pagination: {
    prev: "上一頁",
    next: "下一頁",
    page: "第 {{page}} 頁",
  },

  home: {
    socialLinks: "搵我",
    featured: "推介文章",
    recentPosts: "最新文章",
    allPosts: "睇晒全部文章",
  },

  footer: {
    copyright: "Copyright",
    allRightsReserved: "Made with Astro • Hosted on Cloudflare Pages",
  },

  pages: {
    tagTitle: "標籤",

    tagDesc: "所有用咗呢個標籤嘅文章。",

    tagsTitle: "所有標籤",

    tagsDesc: "整理所有文章使用過的標籤。",

    postsTitle: "所有文章",

    postsDesc: "這裡收錄了全部技術文章與折騰記錄。",

    archivesTitle: "時光機",

    archivesDesc: "舊文全部擺晒喺哩度。",

    searchTitle: "搜尋",

    searchDesc: "輸入關鍵字，睇下有冇寫過。",
  },

  a11y: {
    skipToContent: "跳去主要內容",
    openMenu: "打開選單",
    closeMenu: "收起選單",
    toggleTheme: "轉深色／淺色模式",
    searchPlaceholder: "想搵咩？",
    noResults: "搵唔到相關內容 🤷",
    goToPreviousPage: "去上一頁",
    goToNextPage: "去下一頁",
  },

  notFound: {
    title: "404",
    message: "So9ry，哩頁唔知去咗邊 🤷",
    goHome: "返首頁",
  },
} satisfies UIStrings;