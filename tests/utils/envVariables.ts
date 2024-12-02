export default class ENV {
  // Portal environment variables
  public static PORTAL_URL = process.env.PORTAL_URL!;
  public static PORTAL_USERNAME = process.env.PORTAL_USERNAME!;
  public static PORTAL_PASSWORD = process.env.PORTAL_PASSWORD!;
  public static SECRET_KEY_UAT = process.env.SECRET_KEY_UAT!;

  public static API_URL = process.env.API_URL!;
}
