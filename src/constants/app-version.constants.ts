/** "1.0.0", or "1.0.0 (a1b2c3d)" when the build knows its commit. Compare it between phones. */
export const APP_VERSION: string =
  __APP_COMMIT__ === "" ? __APP_VERSION__ : `${__APP_VERSION__} (${__APP_COMMIT__})`;

/** When this copy of the app was built. */
export const APP_BUILT_AT: number = Date.parse(__APP_BUILT_AT__);
