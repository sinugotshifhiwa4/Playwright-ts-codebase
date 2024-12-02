import axios, { AxiosResponse } from "axios";
import errorHandler from "../../helpers/errorHandler";

export default class RestHttpClient {

  private defaultHeaders: { [key: string]: string };

  constructor() {
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Creates headers for the HTTP request.
   * If authorizationHeader is provided, it will be set as the Authorization header.
   * Otherwise, only the Content-Type header is set with a value of application/json.
   * @param authorizationHeader Authorization header value
   * @returns Headers object
   */
  private createHeaders(authorizationHeader?: string): {
    [key: string]: string;
  } {
    const headers = { ...this.defaultHeaders };
    if (authorizationHeader) {
      headers["Authorization"] = authorizationHeader;
    }
    return headers;
  }

/**
 * Sends an HTTP request using the specified method, endpoint, payload, and headers.
 * Handles errors by logging them and returning the error response if it is an Axios error.
 *
 * @template T - The expected response type.
 * @param method - The HTTP method to use for the request (e.g., "post", "patch", "get", "delete").
 * @param endpoint - The URL endpoint to which the request is sent.
 * @param payload - The optional payload to be included in the request body.
 * @param headers - Optional headers to be included in the request.
 * @returns A promise that resolves with the Axios response of the specified type.
 * @throws Will throw an error if an unexpected error occurs.
 */
  private async sendRequest<T>(
    method: "post" | "patch" | "get" | "delete",
    endpoint: string,
    payload?: object,
    headers?: { [key: string]: string }
  ): Promise<AxiosResponse<T>> {
    try {
      return await axios[method](endpoint, payload, {
        headers: { ...this.defaultHeaders, ...headers },
      });
    } catch (error) {
      // If the error is an Axios error, we can return the response directly
      if (axios.isAxiosError(error) && error.response) {
        errorHandler.handleApiResponse(`[${method.toUpperCase()} Request]`, error);
        return error.response; // return the error response, this help to reduce duplicate errors message as we have centralized error handling
      }

      // For other errors, handle them normally
      errorHandler.logGeneralError(error,`[${method.toUpperCase()} Request]`);
      throw error;
    }
  }

  /**
   * Sends an HTTP POST request to the specified endpoint with the given payload and headers.
   * If authorizationHeader is provided, it will be set as the Authorization header.
   * Otherwise, only the Content-Type header is set with a value of application/json.
   * If the request is successful, the response data is returned.
   * If an error occurs, the error response is returned.
   * If an unexpected error occurs, the error is thrown.
   * @template T - The expected response type.
   * @param endpoint - The URL endpoint to which the request is sent.
   * @param payload - The optional payload to be included in the request body.
   * @param authorizationHeader - Optional Authorization header value.
   * @returns A promise that resolves with the Axios response of the specified type.
   * @throws Will throw an error if an unexpected error occurs.
   */
  async sendPostRequest<T>(
    endpoint: string,
    payload?: object,
    authorizationHeader?: string
  ): Promise<AxiosResponse<T> | null> {
    try{
    const headers = this.createHeaders(authorizationHeader);
    return this.sendRequest("post", endpoint, payload, headers);
    } catch (error) {
      errorHandler.logGeneralError(error,`[POST Request]`);
      throw error;
    }
  }

  /**
   * Sends an HTTP PATCH request to the specified endpoint with the given payload and headers.
   * If authorizationHeader is provided, it will be set as the Authorization header.
   * Otherwise, only the Content-Type header is set with a value of application/json.
   * If the request is successful, the response data is returned.
   * If an error occurs, the error response is returned.
   * If an unexpected error occurs, the error is thrown.
   * @template T - The expected response type.
   * @param endpoint - The URL endpoint to which the request is sent.
   * @param payload - The optional payload to be included in the request body.
   * @param authorizationHeader - Optional Authorization header value.
   * @returns A promise that resolves with the Axios response of the specified type.
   * @throws Will throw an error if an unexpected error occurs.
   */
  async sendPatchRequest<T>(
    endpoint: string,
    payload: object,
    authorizationHeader?: string
  ): Promise<AxiosResponse<T> | null> {
    try{
    const headers = this.createHeaders(authorizationHeader);
    return this.sendRequest("patch", endpoint, payload, headers);
    } catch (error) {
      errorHandler.logGeneralError(error,`[PATCH Request]`);
      throw error;
    }
  }

/**
 * Sends an HTTP GET request to the specified endpoint.
 * If authorizationHeader is provided, it will be set as the Authorization header.
 * Otherwise, only the Content-Type header is set with a value of application/json.
 * If the request is successful, the response data is returned.
 * If an error occurs, the error response is returned.
 * If an unexpected error occurs, the error is thrown.
 * @template T - The expected response type.
 * @param endpoint - The URL endpoint to which the request is sent.
 * @param authorizationHeader - Optional Authorization header value.
 * @returns A promise that resolves with the Axios response of the specified type.
 * @throws Will throw an error if an unexpected error occurs.
 */
  async sendGetRequest<T>(
    endpoint: string,
    authorizationHeader?: string
  ): Promise<AxiosResponse<T> | null> {
    try{
    const headers = this.createHeaders(authorizationHeader);
    return this.sendRequest("get", endpoint, undefined, headers);
    } catch (error) {
      errorHandler.logGeneralError(error,`[GET Request]`);
      throw error;
    }
  }

/**
 * Sends an HTTP DELETE request to the specified endpoint.
 * If authorizationHeader is provided, it will be set as the Authorization header.
 * Otherwise, only the Content-Type header is set with a value of application/json.
 * If the request is successful, the response data is returned.
 * If an error occurs, the error response is returned.
 * If an unexpected error occurs, the error is thrown.
 * @template T - The expected response type.
 * @param endpoint - The URL endpoint to which the request is sent.
 * @param authorizationHeader - Optional Authorization header value.
 * @returns A promise that resolves with the Axios response of the specified type.
 * @throws Will throw an error if an unexpected error occurs.
 */
  async sendDeleteRequest<T>(
    endpoint: string,
    authorizationHeader?: string
  ): Promise<AxiosResponse<T> | null> {
    try{
    const headers = this.createHeaders(authorizationHeader);
    return this.sendRequest("delete", endpoint, undefined, headers);
    } catch (error) {
      errorHandler.logGeneralError(error,`[DELETE Request]`);
      throw error;
    }
  }
}
