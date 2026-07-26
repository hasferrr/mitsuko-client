declare module "*.png" {
  const image: import("next/image").StaticImageData
  export default image
}

declare module "*.svg" {
  const image: import("next/image").StaticImageData
  export default image
}
