declare module '*.woff2' {
  const src: string
  export default src
}

/** WOFF v1 — react-pdf/fontkit does not support WOFF2; use WOFF or TTF for `Font.register`. */
declare module '*.woff' {
  const src: string
  export default src
}
