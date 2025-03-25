import type { ApplicationEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import { FileHandler } from "../handlers/index.js";
import type {
  ActivityInstanceEntity,
  EditCurrentApplicationSchema,
} from "../schemas/index.js";

/**
 * Router for Discord Application-related API endpoints.
 * Provides methods to interact with application resources such as fetching
 * application information, editing applications, and managing activity instances.
 */
export class ApplicationRouter {
  /**
   * API route constants for application-related endpoints.
   */
  static readonly ROUTES = {
    /** Route for current application endpoint */
    applicationsMe: "/applications/@me" as const,

    /**
     * Generates the route for an application activity instance
     * @param applicationId - ID of the application
     * @param instanceId - ID of the activity instance
     * @returns The formatted route string
     */
    applicationsActivityInstance: (
      applicationId: Snowflake,
      instanceId: string,
    ) =>
      `/applications/${applicationId}/activity-instances/${instanceId}` as const,
  } as const;

  /** The REST client used for making API requests */
  readonly #rest: Rest;

  /**
   * Creates a new ApplicationRouter instance.
   * @param rest - The REST client to use for making API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches the current application's information.
   * Retrieves details about the authenticated application.
   * @returns A promise that resolves to the application information
   * @see {@link https://discord.com/developers/docs/resources/application#get-current-application}
   */
  getCurrentApplication(): Promise<ApplicationEntity> {
    return this.#rest.get(ApplicationRouter.ROUTES.applicationsMe);
  }

  /**
   * Edits the current application with the provided options.
   * Updates various properties of the authenticated application.
   * @param options - The application properties to update
   * @returns A promise that resolves to the updated application information
   * @throws Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application}
   */
  async editCurrentApplication(
    options: EditCurrentApplicationSchema,
  ): Promise<ApplicationEntity> {
    if (options.icon) {
      options.icon = await FileHandler.toDataUri(options.icon);
    }

    if (options.cover_image) {
      options.cover_image = await FileHandler.toDataUri(options.cover_image);
    }

    return this.#rest.patch(ApplicationRouter.ROUTES.applicationsMe, {
      body: JSON.stringify(options),
    });
  }

  /**
   * Fetches an application activity instance.
   * Retrieves details about a specific activity instance for an application.
   * @param applicationId - ID of the application
   * @param instanceId - ID of the activity instance
   * @returns A promise that resolves to the activity instance information
   * @see {@link https://discord.com/developers/docs/resources/application#get-application-activity-instance}
   */
  getApplicationActivityInstance(
    applicationId: Snowflake,
    instanceId: string,
  ): Promise<ActivityInstanceEntity> {
    return this.#rest.get(
      ApplicationRouter.ROUTES.applicationsActivityInstance(
        applicationId,
        instanceId,
      ),
    );
  }
}
