import type { FileInput, Rest } from "../../core/index.js";
import type {
  GuildScheduledEventEntity,
  GuildScheduledEventEntityMetadata,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventRecurrenceRuleEntity,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
  GuildScheduledEventUserEntity,
} from "./scheduled-event.entity.js";

export interface EventCreateOptions {
  channel_id?: string;
  entity_metadata?: GuildScheduledEventEntityMetadata;
  name: string;
  privacy_level: GuildScheduledEventPrivacyLevel;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  description?: string;
  entity_type: GuildScheduledEventType;
  image?: FileInput;
  recurrence_rule?: GuildScheduledEventRecurrenceRuleEntity;
}

export interface EventUpdateOptions extends Partial<EventCreateOptions> {
  status?: GuildScheduledEventStatus;
}

export interface EventUsersFetchParams {
  limit?: number;
  with_member?: boolean;
  before?: string;
  after?: string;
}

export class ScheduledEventRouter {
  static readonly Routes = {
    guildEventsEndpoint: (guildId: string) => `/guilds/${guildId}/scheduled-events` as const,
    guildEventByIdEndpoint: (guildId: string, eventId: string) =>
      `/guilds/${guildId}/scheduled-events/${eventId}` as const,
    eventUsersEndpoint: (guildId: string, eventId: string) =>
      `/guilds/${guildId}/scheduled-events/${eventId}/users` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchEvents(guildId: string, withUserCount = false): Promise<GuildScheduledEventEntity[]> {
    return this.#rest.get(ScheduledEventRouter.Routes.guildEventsEndpoint(guildId), {
      query: { with_user_count: withUserCount },
    });
  }
  async createEvent(
    guildId: string,
    options: EventCreateOptions,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    const processedOptions = { ...options };
    if (processedOptions.image) {
      processedOptions.image = await this.#rest.toDataUri(processedOptions.image);
    }
    return this.#rest.post(ScheduledEventRouter.Routes.guildEventsEndpoint(guildId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }
  fetchGuildEvent(
    guildId: string,
    eventId: string,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity> {
    return this.#rest.get(ScheduledEventRouter.Routes.guildEventByIdEndpoint(guildId, eventId), {
      query: { with_user_count: withUserCount },
    });
  }
  async updateEvent(
    guildId: string,
    eventId: string,
    options: EventUpdateOptions,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    const processedOptions = { ...options };
    if (processedOptions.image) {
      processedOptions.image = await this.#rest.toDataUri(processedOptions.image);
    }
    return this.#rest.patch(ScheduledEventRouter.Routes.guildEventByIdEndpoint(guildId, eventId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }
  deleteEvent(guildId: string, eventId: string): Promise<void> {
    return this.#rest.delete(ScheduledEventRouter.Routes.guildEventByIdEndpoint(guildId, eventId));
  }
  fetchEventUsers(
    guildId: string,
    eventId: string,
    query?: EventUsersFetchParams,
  ): Promise<GuildScheduledEventUserEntity[]> {
    return this.#rest.get(ScheduledEventRouter.Routes.eventUsersEndpoint(guildId, eventId), {
      query,
    });
  }
}
