const url = process.env.NEXT_PUBLIC_DEPLOYMENT_URL || "https://www.mitsuko.app"
export const DEPLOYMENT_URL = url?.endsWith("/") ? url.slice(0, url.length - 1) : url
export const DISCORD_LINK = "https://discord.mitsuko.app"
export const GITHUB_LINK = "https://github.com/hasferrr"
export const CONTACT_LINK = "YzNWd2NHOXlkRUJ0YVhSemRXdHZMbUZ3Y0E9PQ=="
