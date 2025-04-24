const url = process.env.NEXT_PUBLIC_DEPLOYMENT_URL || "https://www.mitsuko.app"
export const DEPLOYMENT_URL = url?.endsWith("/") ? url.slice(0, url.length - 1) : url
export const DISCORD_LINK = "https://discord.gg/8PaGWY6FdZ"
export const GITHUB_LINK = "https://github.com/hasferrr"
export const CHANGE_LOG_LINK = "https://hasferrr.notion.site/Mitsuko-Changelog-1a867529561780a398e9d9f4ed5d73c2"
export const CONTACT_LINK = "YldsMGMzVnJiMmhsYkhCQWNISnZkRzl1TG0xbA=="
