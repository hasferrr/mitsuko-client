const url = process.env.NEXT_PUBLIC_DEPLOYMENT_URL || "https://mitsuko.app"
export const DEPLOYMENT_URL = url?.endsWith("/") ? url.slice(0, url.length - 1) : url
export const NAVBAR_IMG_LINK = "https://i.imgur.com/b9gRjVi.jpeg"
export const DISCORD_LINK = "https://discord.gg/8PaGWY6FdZ"
export const GITHUB_LINK = "https://github.com/hasferrr"
export const CHANGE_LOG_LINK = "https://hasferrr.notion.site/Mitsuko-Changelog-1a867529561780a398e9d9f4ed5d73c2"
export const TERMS_LINK = "https://raw.githubusercontent.com/hasferrr/mitsuko-client/refs/heads/terms/TERMS.md"
