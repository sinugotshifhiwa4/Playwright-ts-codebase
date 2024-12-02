import BaseRoutes from "./baseRoutes";

export default class Routes extends BaseRoutes {
  
  /**
   * Creates a consent URL based on the preQualificationId and applicantId.
   * It generates the URL by combining the consent endpoint with the base URL.
   * @param preQualificationId - The ID for the pre-qualification.
   * @param applicantId - The ID of the applicant.
   * @returns A Promise that resolves with the generated consent URL.
   * @throws Will throw an error if there is an issue creating the consent URL.
   */
  async createConsentUrl(
    preQualificationId: string,
    applicantId: string
  ): Promise<string> {
    try {
      return this.generateUrl(
        this.getConsentEndpoint(preQualificationId, applicantId),
        "Consent"
      );
    } catch (error) {
      this.errorHandler.logGeneralError(
        error,
        "createConsentUrl",
        "Failed to create consent URL"
      );
      throw error;
    }
  }

  /**
   * Creates a credit check URL based on the preQualificationId.
   * It generates the URL by combining the credit check endpoint with the base URL.
   * @param preQualificationId - The ID for the pre-qualification.
   * @returns A Promise that resolves with the generated credit check URL.
   * @throws Will throw an error if there is an issue creating the credit check URL.
   */
  async createCreditCheckUrl(preQualificationId: string): Promise<string> {
    try {
      return this.generateUrl(
        this.getCreditCheckEndpoint(preQualificationId),
        "Credit Check"
      );
    } catch (error) {
      this.errorHandler.logGeneralError(
        error,
        "createCreditCheckUrl",
        "Failed to create credit check URL"
      );
      throw error;
    }
  }

  /**
   * Generates a consent endpoint based on the preQualificationId and applicantId.
   * It generates the URL by combining the consent endpoint with the base URL.
   * @param preQualificationId - The ID for the pre-qualification.
   * @param applicantId - The ID for the applicant.
   * @returns A string that represents the generated consent endpoint URL.
   * @throws Will throw an error if there is an issue generating the consent endpoint URL.
   */
  private getConsentEndpoint(
    preQualificationId: string,
    applicantId: string
  ): string {
    try {
      if (!preQualificationId || !applicantId) {
        throw new Error(
          `Both preQualificationId ${preQualificationId} and applicantId ${applicantId} are required`
        );
      }
      return `/api/v1/consent/${preQualificationId}/applicants/${applicantId}`;
    } catch (error) {
     this.errorHandler.logGeneralError(error, "getConsentEndpoint", "Failed to generate consent endpoint");
      throw error;
    }
  }

  /**
   * Generates a credit check endpoint based on the preQualificationId.
   * It generates the URL by combining the credit check endpoint with the base URL.
   * @param preQualificationId - The ID for the pre-qualification.
   * @returns A string that represents the generated credit check endpoint URL.
   * @throws Will throw an error if there is an issue generating the credit check endpoint URL.
   */
  private getCreditCheckEndpoint(preQualificationId: string): string {
    try {
      if (!preQualificationId) {
        throw new Error("preQualificationId is required");
      }
      return `/api/v1/pre-qualifications/${preQualificationId}/credit-check`;
    } catch (error) {
     this.errorHandler.logGeneralError(error, "getCreditCheckEndpoint", "Failed to generate credit check endpoint");
      throw error;
    }
  }
}
