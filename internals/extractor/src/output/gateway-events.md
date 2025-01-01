# Gateway Events

Gateway connections are WebSockets, meaning they're bidirectional and either side of the WebSocket can send events to the other. The following events are split up into two types:

-   Send events are Gateway events sent by an app to Discord (like when identifying with the Gateway)
-   Receive events are Gateway events that are sent by Discord to an app. These events typically represent something happening inside of a server where an app is installed, like a channel being updated.

All Gateway events are encapsulated in a [Gateway event payload](/docs/events/gateway-events#payload-structure).

For more information about interacting with the Gateway, you can reference the [Gateway documentation](/docs/events/gateway).

Not all Gateway event fields are documented. You should assume that undocumented fields are not supported for apps, and their format and data may change at any time.


### Event Names

In practice, event names are UPPER-CASED with under\_scores joining each word in the name. For instance, [Channel Create](/docs/events/gateway-events#channel-create) would be `CHANNEL_CREATE` and [Voice State Update](/docs/events/gateway-events#voice-state-update) would be `VOICE_STATE_UPDATE`.

For readability, event names in the following documentation are typically left in Title Case.


### Payload Structure

Gateway event payloads have a common structure, but the contents of the associated data (`d`) varies between the different events.

Field | Type | Description
--- | --- | ---
op | integer | Gateway opcode, which indicates the payload type
d | ?mixed (any JSON value) | Event data
s | ?integer * | Sequence number of event used for resuming sessions and heartbeating
t | ?string * | Event name

\* `s` and `t` are `null` when `op` is not `0` ([Gateway Dispatch opcode](/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes)).


### Example Gateway Event Payload
```json
{
  "op": 0,
  "d": {},
  "s": 42,
  "t": "GATEWAY_EVENT_NAME"
}
```



---

## Send Events

Send events are Gateway events encapsulated in an [event payload](/docs/events/gateway-events#payload-structure), and are sent by an app to Discord through a Gateway connection.

Previously, Gateway send events were labeled as commands

Name | Description
--- | ---
Identify | Triggers the initial handshake with the gateway
Resume | Resumes a dropped gateway connection
Heartbeat | Maintains an active gateway connection
Request Guild Members | Requests members for a guild
Request Soundboard Sounds | Requests soundboard sounds in a set of guilds
Update Voice State | Joins, moves, or disconnects the app from a voice channel
Update Presence | Updates an app's presence


#### Identify

Used to trigger the initial handshake with the gateway.

Details about identifying is in the [Gateway documentation](/docs/events/gateway#identifying).


### Identify Structure

Field | Type | Description | Default
--- | --- | --- | ---
token | string | Authentication token | -
properties | object | Connection properties | -
compress? | boolean | Whether this connection supports compression of packets | false
large_threshold? | integer | Value between 50 and 250, total number of members where the gateway will stop sending offline members in the guild member list | 50
shard? | array of two integers (shard_id, num_shards) | Used for Guild Sharding | -
presence? | update presence object | Presence structure for initial presence information | -
intents | integer | Gateway Intents you wish to receive | -


### Identify Connection Properties

Field | Type | Description
--- | --- | ---
os | string | Your operating system
browser | string | Your library name
device | string | Your library name

These fields originally were $ prefixed (i.e: `$browser`) but [this syntax is deprecated](/docs/change-log#updated-connection-property-field-names). While they currently still work, it is recommended to move to non-prefixed fields.


### Example Identify
```json
{
  "op": 2,
  "d": {
    "token": "my_token",
    "properties": {
      "os": "linux",
      "browser": "disco",
      "device": "disco"
    },
    "compress": true,
    "large_threshold": 250,
    "shard": [0, 1],
    "presence": {
      "activities": [{
        "name": "Cards Against Humanity",
        "type": 0
      }],
      "status": "dnd",
      "since": 91879201,
      "afk": false
    },
    // This intent represents 1 << 0 for GUILDS, 1 << 1 for GUILD_MEMBERS, and 1 << 2 for GUILD_BANS
    // This connection will only receive the events defined in those three intents
    "intents": 7
  }
}
```


#### Resume

Used to replay missed events when a disconnected client resumes.

Details about resuming are in the [Gateway documentation](/docs/events/gateway#resuming).


### Resume Structure

Field | Type | Description
--- | --- | ---
token | string | Session token
session_id | string | Session ID
seq | integer | Last sequence number received


### Example Resume
```json
{
  "op": 6,
  "d": {
    "token": "randomstring",
    "session_id": "evenmorerandomstring",
    "seq": 1337
  }
}
```


#### Heartbeat

Used to maintain an active gateway connection. Must be sent every `heartbeat_interval` milliseconds after the [Opcode 10 Hello](/docs/events/gateway-events#hello) payload is received. The inner `d` key is the last sequence number—`s`—received by the client. If you have not yet received one, send `null`.

Details about heartbeats are in the [Gateway documentation](/docs/events/gateway#sending-heartbeats).


### Example Heartbeat
```json
{
  "op": 1,
  "d": 251
}
```


#### Request Guild Members

Used to request all members for a guild or a list of guilds. When initially connecting, if you don't have the `GUILD_PRESENCES` [Gateway Intent](/docs/events/gateway#gateway-intents), or if the guild is over 75k members, it will only send members who are in voice, plus the member for you (the connecting user). Otherwise, if a guild has over `large_threshold` members (value in the [Gateway Identify](/docs/events/gateway-events#identify)), it will only send members who are online, have a role, have a nickname, or are in a voice channel, and if it has under `large_threshold` members, it will send all members. If a client wishes to receive additional members, they need to explicitly request them via this operation. The server will send [Guild Members Chunk](/docs/events/gateway-events#guild-members-chunk) events in response with up to 1000 members per chunk until all members that match the request have been sent.

Due to our privacy and infrastructural concerns with this feature, there are some limitations that apply:

-   `GUILD_PRESENCES` intent is required to set `presences = true`. Otherwise, it will always be false
-   `GUILD_MEMBERS` intent is required to request the entire member list—`(query=‘’, limit=0<=n)`
-   You will be limited to requesting 1 `guild_id` per request
-   Requesting a prefix (`query` parameter) will return a maximum of 100 members
-   Requesting `user_ids` will continue to be limited to returning 100 members


### Request Guild Members Structure

Field | Type | Description | Required
--- | --- | --- | ---
guild_id | snowflake | ID of the guild to get members for | true
query? | string | string that username starts with, or an empty string to return all members | one of query or user_ids
limit | integer | maximum number of members to send matching the query; a limit of 0 can be used with an empty string query to return all members | true when specifying query
presences? | boolean | used to specify if we want the presences of the matched members | false
user_ids? | snowflake or array of snowflakes | used to specify which users you wish to fetch | one of query or user_ids
nonce? | string | nonce to identify the Guild Members Chunk response | false

Nonce can only be up to 32 bytes. If you send an invalid nonce it will be ignored and the reply member\_chunk(s) will not have a nonce set.


### Example Request Guild Members
```json
{
  "op": 8,
  "d": {
    "guild_id": "41771983444115456",
    "query": "",
    "limit": 0
  }
}
```


#### Request Soundboard Sounds

Used to request soundboard sounds for a list of guilds. The server will send [Soundboard Sounds](/docs/events/gateway-events#soundboard-sounds) events for each guild in response.


### Request Soundboard Sounds Structure

Field | Type | Description
--- | --- | ---
guild_ids | array of snowflakes | IDs of the guilds to get soundboard sounds for


### Example Request Soundboard Sounds
```json
{
  "op": 31,
  "d": {
    "guild_ids": ["613425648685547541", "81384788765712384"]
  }
}
```


#### Update Voice State

Sent when a client wants to join, move, or disconnect from a voice channel.


### Gateway Voice State Update Structure

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
channel_id | ?snowflake | ID of the voice channel client wants to join (null if disconnecting)
self_mute | boolean | Whether the client is muted
self_deaf | boolean | Whether the client deafened


### Example Gateway Voice State Update
```json
{
  "op": 4,
  "d": {
    "guild_id": "41771983423143937",
    "channel_id": "127121515262115840",
    "self_mute": false,
    "self_deaf": false
  }
}
```


#### Update Presence

Sent by the client to indicate a presence or status update.


### Gateway Presence Update Structure

Field | Type | Description
--- | --- | ---
since | ?integer | Unix time (in milliseconds) of when the client went idle, or null if the client is not idle
activities | array of activity objects | User's activities
status | string | User's new status
afk | boolean | Whether or not the client is afk


### Status Types

Status | Description
--- | ---
online | Online
dnd | Do Not Disturb
idle | AFK
invisible | Invisible and shown as offline
offline | Offline


### Example Gateway Presence Update
```json
{
  "op": 3,
  "d": {
    "since": 91879201,
    "activities": [{
      "name": "Save the Oxford Comma",
      "type": 0
    }],
    "status": "online",
    "afk": false
  }
}
```



---

## Receive Events

Receive events are Gateway events encapsulated in an [event payload](/docs/events/gateway-events#payload-structure), and are sent by Discord to an app through a Gateway connection. Receive events correspond to events that happen in a Discord server where the app is installed.

Name | Description
--- | ---
Hello | Defines the heartbeat interval
Ready | Contains the initial state information
Resumed | Response to Resume
Reconnect | Server is going away, client should reconnect to gateway and resume
Invalid Session | Failure response to Identify or Resume or invalid active session
Application Command Permissions Update | Application command permission was updated
Auto Moderation Rule Create | Auto Moderation rule was created
Auto Moderation Rule Update | Auto Moderation rule was updated
Auto Moderation Rule Delete | Auto Moderation rule was deleted
Auto Moderation Action Execution | Auto Moderation rule was triggered and an action was executed (e.g. a message was blocked)
Channel Create | New guild channel created
Channel Update | Channel was updated
Channel Delete | Channel was deleted
Channel Pins Update | Message was pinned or unpinned
Thread Create | Thread created, also sent when being added to a private thread
Thread Update | Thread was updated
Thread Delete | Thread was deleted
Thread List Sync | Sent when gaining access to a channel, contains all active threads in that channel
Thread Member Update | Thread member for the current user was updated
Thread Members Update | Some user(s) were added to or removed from a thread
Entitlement Create | Entitlement was created
Entitlement Update | Entitlement was updated or renewed
Entitlement Delete | Entitlement was deleted
Guild Create | Lazy-load for unavailable guild, guild became available, or user joined a new guild
Guild Update | Guild was updated
Guild Delete | Guild became unavailable, or user left/was removed from a guild
Guild Audit Log Entry Create | A guild audit log entry was created
Guild Ban Add | User was banned from a guild
Guild Ban Remove | User was unbanned from a guild
Guild Emojis Update | Guild emojis were updated
Guild Stickers Update | Guild stickers were updated
Guild Integrations Update | Guild integration was updated
Guild Member Add | New user joined a guild
Guild Member Remove | User was removed from a guild
Guild Member Update | Guild member was updated
Guild Members Chunk | Response to Request Guild Members
Guild Role Create | Guild role was created
Guild Role Update | Guild role was updated
Guild Role Delete | Guild role was deleted
Guild Scheduled Event Create | Guild scheduled event was created
Guild Scheduled Event Update | Guild scheduled event was updated
Guild Scheduled Event Delete | Guild scheduled event was deleted
Guild Scheduled Event User Add | User subscribed to a guild scheduled event
Guild Scheduled Event User Remove | User unsubscribed from a guild scheduled event
Guild Soundboard Sound Create | Guild soundboard sound was created
Guild Soundboard Sound Update | Guild soundboard sound was updated
Guild Soundboard Sound Delete | Guild soundboard sound was deleted
Guild Soundboard Sounds Update | Guild soundboard sounds were updated
Soundboard Sounds | Response to Request Soundboard Sounds
Integration Create | Guild integration was created
Integration Update | Guild integration was updated
Integration Delete | Guild integration was deleted
Interaction Create | User used an interaction, such as an Application Command
Invite Create | Invite to a channel was created
Invite Delete | Invite to a channel was deleted
Message Create | Message was created
Message Update | Message was edited
Message Delete | Message was deleted
Message Delete Bulk | Multiple messages were deleted at once
Message Reaction Add | User reacted to a message
Message Reaction Remove | User removed a reaction from a message
Message Reaction Remove All | All reactions were explicitly removed from a message
Message Reaction Remove Emoji | All reactions for a given emoji were explicitly removed from a message
Presence Update | User was updated
Stage Instance Create | Stage instance was created
Stage Instance Update | Stage instance was updated
Stage Instance Delete | Stage instance was deleted or closed
Subscription Create | Premium App Subscription was created
Subscription Update | Premium App Subscription was updated
Subscription Delete | Premium App Subscription was deleted
Typing Start | User started typing in a channel
User Update | Properties about the user changed
Voice Channel Effect Send | Someone sent an effect in a voice channel the current user is connected to
Voice State Update | Someone joined, left, or moved a voice channel
Voice Server Update | Guild's voice server was updated
Webhooks Update | Guild channel webhook was created, update, or deleted
Message Poll Vote Add | User voted on a poll
Message Poll Vote Remove | User removed a vote on a poll


#### Hello

Sent on connection to the websocket. Defines the heartbeat interval that an app should heartbeat to.


### Hello Structure

Field | Type | Description
--- | --- | ---
heartbeat_interval | integer | Interval (in milliseconds) an app should heartbeat with


### Example Hello
```json
{
  "op": 10,
  "d": {
    "heartbeat_interval": 45000
  }
}
```


#### Ready

The ready event is dispatched when a client has completed the initial handshake with the gateway (for new sessions). The ready event can be the largest and most complex event the gateway will send, as it contains all the state required for a client to begin interacting with the rest of the platform.

`guilds` are the guilds of which your bot is a member. They start out as unavailable when you connect to the gateway. As they become available, your bot will be notified via [Guild Create](/docs/events/gateway-events#guild-create) events.


### Ready Event Fields

Field | Type | Description
--- | --- | ---
v | integer | API version
user | user object | Information about the user including email
guilds | array of Unavailable Guild objects | Guilds the user is in
session_id | string | Used for resuming connections
resume_gateway_url | string | Gateway URL for resuming connections
shard? | array of two integers (shard_id, num_shards) | Shard information associated with this session, if sent when identifying
application | partial application object | Contains id and flags


#### Resumed

The resumed event is dispatched when a client has sent a [resume payload](/docs/events/gateway-events#resume) to the gateway (for resuming existing sessions).


#### Reconnect

The reconnect event is dispatched when a client should reconnect to the gateway (and resume their existing session, if they have one). This can occur at any point in the gateway connection lifecycle, even before/in place of receiving a [Hello](/docs/events/gateway-events#hello) event. A few seconds after the reconnect event is dispatched, the connection may be closed by the server.


### Example Gateway Reconnect
```json
{
  "op": 7,
  "d": null
}
```


#### Invalid Session

Sent to indicate one of at least three different situations:

-   the gateway could not initialize a session after receiving an [Opcode 2 Identify](/docs/events/gateway-events#identify)
-   the gateway could not resume a previous session after receiving an [Opcode 6 Resume](/docs/events/gateway-events#resume)
-   the gateway has invalidated an active session and is requesting client action

The inner `d` key is a boolean that indicates whether the session may be resumable. See [Connecting](/docs/events/gateway#connecting) and [Resuming](/docs/events/gateway#resuming) for more information.


### Example Gateway Invalid Session
```json
{
  "op": 9,
  "d": false
}
```


### Application Commands


#### Application Command Permissions Update

`APPLICATION_COMMAND_PERMISSIONS_UPDATE` event, sent when an application command's permissions are updated. The inner payload is an [application command permissions](/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure) object.


### Auto Moderation

All [Auto Moderation](/docs/resources/auto-moderation) related events are only sent to bot users which have the `MANAGE_GUILD` permission.


#### Auto Moderation Rule Create

Sent when a rule is created. The inner payload is an [auto moderation rule](/docs/resources/auto-moderation#auto-moderation-rule-object) object.


#### Auto Moderation Rule Update

Sent when a rule is updated. The inner payload is an [auto moderation rule](/docs/resources/auto-moderation#auto-moderation-rule-object) object.


#### Auto Moderation Rule Delete

Sent when a rule is deleted. The inner payload is an [auto moderation rule](/docs/resources/auto-moderation#auto-moderation-rule-object) object.


#### Auto Moderation Action Execution

Sent when a rule is triggered and an action is executed (e.g. when a message is blocked).


### Auto Moderation Action Execution Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild in which action was executed
action | auto moderation action object | Action which was executed
rule_id | snowflake | ID of the rule which action belongs to
rule_trigger_type | trigger_type | Trigger type of rule which was triggered
user_id | snowflake | ID of the user which generated the content which triggered the rule
channel_id? | snowflake | ID of the channel in which user content was posted
message_id? | snowflake | ID of any user message which content belongs to *
alert_system_message_id? | snowflake | ID of any system auto moderation messages posted as a result of this action **
content *** | string | User-generated text content
matched_keyword | ?string | Word or phrase configured in the rule that triggered the rule
matched_content *** | ?string | Substring in content that triggered the rule

\* `message_id` will not exist if message was blocked by [Auto Moderation](/docs/resources/auto-moderation) or content was not part of any message

\*\* `alert_system_message_id` will not exist if this event does not correspond to an action with type `SEND_ALERT_MESSAGE`

\*\*\* `MESSAGE_CONTENT` (`1 << 15`) [gateway intent](/docs/events/gateway#gateway-intents) is required to receive the `content` and `matched_content` fields


### Channels


#### Channel Create

Sent when a new guild channel is created, relevant to the current user. The inner payload is a [channel](/docs/resources/channel#channel-object) object.


#### Channel Update

Sent when a channel is updated. The inner payload is a [channel](/docs/resources/channel#channel-object) object. This is not sent when the field `last_message_id` is altered. To keep track of the last\_message\_id changes, you must listen for [Message Create](/docs/events/gateway-events#message-create) events (or [Thread Create](/docs/events/gateway-events#thread-create) events for `GUILD_FORUM` and `GUILD_MEDIA` channels).

This event may reference roles or guild members that no longer exist in the guild.


#### Channel Delete

Sent when a channel relevant to the current user is deleted. The inner payload is a [channel](/docs/resources/channel#channel-object) object.


#### Thread Create

Sent when a thread is created, relevant to the current user, or when the current user is added to a thread. The inner payload is a [channel](/docs/resources/channel#channel-object) object.

-   When a thread is created, includes an additional `newly_created` boolean field.
-   When being added to an existing private thread, includes a [thread member](/docs/resources/channel#thread-member-object) object.


#### Thread Update

Sent when a thread is updated. The inner payload is a [channel](/docs/resources/channel#channel-object) object. This is not sent when the field `last_message_id` is altered. To keep track of the last\_message\_id changes, you must listen for [Message Create](/docs/events/gateway-events#message-create) events.


#### Thread Delete

Sent when a thread relevant to the current user is deleted. The inner payload is a subset of the [channel](/docs/resources/channel#channel-object) object, containing just the `id`, `guild_id`, `parent_id`, and `type` fields.


#### Thread List Sync

Sent when the current user gains access to a channel.


### Thread List Sync Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
channel_ids? | array of snowflakes | Parent channel IDs whose threads are being synced. If omitted, then threads were synced for the entire guild. This array may contain channel_ids that have no active threads as well, so you know to clear that data.
threads | array of channel objects | All active threads in the given channels that the current user can access
members | array of thread member objects | All thread member objects from the synced threads for the current user, indicating which threads the current user has been added to


#### Thread Member Update

Sent when the [thread member](/docs/resources/channel#thread-member-object) object for the current user is updated. The inner payload is a [thread member](/docs/resources/channel#thread-member-object) object with an extra `guild_id` field. This event is documented for completeness, but unlikely to be used by most bots. For bots, this event largely is just a signal that you are a member of the thread. See the [threads docs](/docs/topics/threads) for more details.


### Thread Member Update Event Extra Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild


#### Thread Members Update

Sent when anyone is added to or removed from a thread. If the current user does not have the `GUILD_MEMBERS` [Gateway Intent](/docs/events/gateway#gateway-intents), then this event will only be sent if the current user was added to or removed from the thread.


### Thread Members Update Event Fields

Field | Type | Description
--- | --- | ---
id | snowflake | ID of the thread
guild_id | snowflake | ID of the guild
member_count | integer | Approximate number of members in the thread, capped at 50
added_members?* | array of thread member objects | Users who were added to the thread
removed_member_ids? | array of snowflakes | ID of the users who were removed from the thread

\* In this gateway event, the thread member objects will also include the [guild member](/docs/resources/guild#guild-member-object) and nullable [presence](/docs/events/gateway-events#presence) objects for each added thread member.


#### Channel Pins Update

Sent when a message is pinned or unpinned in a text channel. This is not sent when a pinned message is deleted.


### Channel Pins Update Event Fields

Field | Type | Description
--- | --- | ---
guild_id? | snowflake | ID of the guild
channel_id | snowflake | ID of the channel
last_pin_timestamp? | ?ISO8601 timestamp | Time at which the most recent pinned message was pinned


### Entitlements


#### Entitlement Create

Note: The`ENTITLEMENT_CREATE` event behavior changed on October 1, 2024. Please see the [Change Log and Entitlement Migration Guide](/docs/change-log#premium-apps-entitlement-migration-and-new-subscription-api) for more information on what changed.

Sent when an entitlement is created. The inner payload is an [entitlement](/docs/resources/entitlement#entitlement-object) object.


#### Entitlement Update

Note: The`ENTITLEMENT_UPDATE` event behavior changed on October 1, 2024. Please see the [Change Log and Entitlement Migration Guide](/docs/change-log#premium-apps-entitlement-migration-and-new-subscription-api) for more information on what changed.

Sent when an entitlement is updated. The inner payload is an [entitlement](/docs/resources/entitlement#entitlement-object) object.

For subscription entitlements, this event is triggered only when a user's subscription ends, providing an `ends_at` timestamp that indicates the end of the entitlement.


#### Entitlement Delete

Sent when an entitlement is deleted. The inner payload is an [entitlement](/docs/resources/entitlement#entitlement-object) object.

Entitlement deletions are infrequent, and occur when:

-   Discord issues a refund for a subscription
-   Discord removes an entitlement from a user via internal tooling
-   Discord deletes an app-managed entitlement they created via the API

Entitlements are not deleted when they expire.


### Guilds


#### Guild Create

This event can be sent in three different scenarios:

1.  When a user is initially connecting, to lazily load and backfill information for all unavailable guilds sent in the [Ready](/docs/events/gateway-events#ready) event. Guilds that are unavailable due to an outage will send a [Guild Delete](/docs/events/gateway-events#guild-delete) event.
2.  When a Guild becomes available again to the client.
3.  When the current user joins a new Guild.

During an outage, the guild object in scenarios 1 and 3 may be marked as unavailable.

The inner payload can be:

-   An available Guild: a [guild](/docs/resources/guild#guild-object) object with extra fields, as noted below.
-   An unavailable Guild: an [unavailable guild](/docs/resources/guild#unavailable-guild-object) object.


### Guild Create Extra Fields

Field | Type | Description
--- | --- | ---
joined_at | ISO8601 timestamp | When this guild was joined at
large | boolean | true if this is considered a large guild
unavailable? | boolean | true if this guild is unavailable due to an outage
member_count | integer | Total number of members in this guild
voice_states | array of partial voice state objects | States of members currently in voice channels; lacks the guild_id key
members | array of guild member objects | Users in the guild
channels | array of channel objects | Channels in the guild
threads | array of channel objects | All active threads in the guild that current user has permission to view
presences | array of partial presence update objects | Presences of the members in the guild, will only include non-offline members if the size is greater than large threshold
stage_instances | array of stage instance objects | Stage instances in the guild
guild_scheduled_events | array of guild scheduled event objects | Scheduled events in the guild
soundboard_sounds | array of soundboard sound objects | Soundboard sounds in the guild

If your bot does not have the `GUILD_PRESENCES` [Gateway Intent](/docs/events/gateway#gateway-intents), or if the guild has over 75k members, members and presences returned in this event will only contain your bot and users in voice channels.


#### Guild Update

Sent when a guild is updated. The inner payload is a [guild](/docs/resources/guild#guild-object) object.


#### Guild Delete

Sent when a guild becomes or was already unavailable due to an outage, or when the user leaves or is removed from a guild. The inner payload is an [unavailable guild](/docs/resources/guild#unavailable-guild-object) object. If the `unavailable` field is not set, the user was removed from the guild.


#### Guild Audit Log Entry Create

Sent when a guild audit log entry is created. The inner payload is an [Audit Log Entry](/docs/resources/audit-log#audit-log-entry-object) object with an extra `guild_id` key. This event is only sent to bots with the `VIEW_AUDIT_LOG` permission.


### Guild Audit Log Entry Create Event Extra Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild


#### Guild Ban Add

Sent when a user is banned from a guild.


### Guild Ban Add Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
user | a user object | User who was banned


#### Guild Ban Remove

Sent when a user is unbanned from a guild.


### Guild Ban Remove Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
user | a user object | User who was unbanned


#### Guild Emojis Update

Sent when a guild's emojis have been updated.


### Guild Emojis Update Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
emojis | array | Array of emojis


#### Guild Stickers Update

Sent when a guild's stickers have been updated.


### Guild Stickers Update Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
stickers | array | Array of stickers


#### Guild Integrations Update

Sent when a guild integration is updated.


### Guild Integrations Update Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild whose integrations were updated


#### Guild Member Add

If using [Gateway Intents](/docs/events/gateway#gateway-intents), the `GUILD_MEMBERS` intent will be required to receive this event.

Sent when a new user joins a guild. The inner payload is a [guild member](/docs/resources/guild#guild-member-object) object with an extra `guild_id` key:


### Guild Member Add Extra Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild


#### Guild Member Remove

If using [Gateway Intents](/docs/events/gateway#gateway-intents), the `GUILD_MEMBERS` intent will be required to receive this event.

Sent when a user is removed from a guild (leave/kick/ban).


### Guild Member Remove Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
user | a user object | User who was removed


#### Guild Member Update

If using [Gateway Intents](/docs/events/gateway#gateway-intents), the `GUILD_MEMBERS` intent will be required to receive this event.

Sent when a guild member is updated. This will also fire when the user object of a guild member changes.


### Guild Member Update Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
roles | array of snowflakes | User role ids
user | a user object | User
nick? | ?string | Nickname of the user in the guild
avatar | ?string | Member's guild avatar hash
banner | ?string | Member's guild banner hash
joined_at | ?ISO8601 timestamp | When the user joined the guild
premium_since? | ?ISO8601 timestamp | When the user starting boosting the guild
deaf? | boolean | Whether the user is deafened in voice channels
mute? | boolean | Whether the user is muted in voice channels
pending? | boolean | Whether the user has not yet passed the guild's Membership Screening requirements
communication_disabled_until? | ?ISO8601 timestamp | When the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out
flags? | integer | Guild member flags represented as a bit set, defaults to 0
avatar_decoration_data? | ?avatar decoration data | Data for the member's guild avatar decoration


#### Guild Members Chunk

Sent in response to [Guild Request Members](/docs/events/gateway-events#request-guild-members). You can use the `chunk_index` and `chunk_count` to calculate how many chunks are left for your request.


### Guild Members Chunk Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
members | array of guild member objects | Set of guild members
chunk_index | integer | Chunk index in the expected chunks for this response (0 <= chunk\_index < chunk\_count)
chunk_count | integer | Total number of expected chunks for this response
not_found? | array | When passing an invalid ID to REQUEST_GUILD_MEMBERS, it will be returned here
presences? | array of presence objects | When passing true to REQUEST_GUILD_MEMBERS, presences of the returned members will be here
nonce? | string | Nonce used in the Guild Members Request


#### Guild Role Create

Sent when a guild role is created.


### Guild Role Create Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
role | a role object | Role that was created


#### Guild Role Update

Sent when a guild role is updated.


### Guild Role Update Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
role | a role object | Role that was updated


#### Guild Role Delete

Sent when a guild role is deleted.


### Guild Role Delete Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
role_id | snowflake | ID of the role


#### Guild Scheduled Event Create

Sent when a guild scheduled event is created. The inner payload is a [guild scheduled event](/docs/resources/guild-scheduled-event#guild-scheduled-event-object) object.


#### Guild Scheduled Event Update

Sent when a guild scheduled event is updated. The inner payload is a [guild scheduled event](/docs/resources/guild-scheduled-event#guild-scheduled-event-object) object.


#### Guild Scheduled Event Delete

Sent when a guild scheduled event is deleted. The inner payload is a [guild scheduled event](/docs/resources/guild-scheduled-event#guild-scheduled-event-object) object.


#### Guild Scheduled Event User Add

Sent when a user has subscribed to a guild scheduled event.


### Guild Scheduled Event User Add Event Fields

Field | Type | Description
--- | --- | ---
guild_scheduled_event_id | snowflake | ID of the guild scheduled event
user_id | snowflake | ID of the user
guild_id | snowflake | ID of the guild


#### Guild Scheduled Event User Remove

Sent when a user has unsubscribed from a guild scheduled event.


### Guild Scheduled Event User Remove Event Fields

Field | Type | Description
--- | --- | ---
guild_scheduled_event_id | snowflake | ID of the guild scheduled event
user_id | snowflake | ID of the user
guild_id | snowflake | ID of the guild


#### Guild Soundboard Sound Create

Sent when a guild soundboard sound is created. The inner payload is a [soundboard sound](/docs/resources/soundboard#soundboard-sound-object) object.


#### Guild Soundboard Sound Update

Sent when a guild soundboard sound is updated. The inner payload is a [soundboard sound](/docs/resources/soundboard#soundboard-sound-object) object.


#### Guild Soundboard Sound Delete

Sent when a guild soundboard sound is deleted.


### Guild Soundboard Sound Delete Event Fields

Field | Type | Description
--- | --- | ---
sound_id | snowflake | ID of the sound that was deleted
guild_id | snowflake | ID of the guild the sound was in


#### Guild Soundboard Sounds Update

Sent when multiple guild soundboard sounds are updated.


### Guild Soundboard Sounds Update Event Fields

Field | Type | Description
--- | --- | ---
soundboard_sounds | array of soundboard sound objects | The guild's soundboard sounds
guild_id | snowflake | ID of the guild


#### Soundboard Sounds

Includes a guild's list of soundboard sounds. Sent in response to [Request Soundboard Sounds](/docs/events/gateway-events#request-soundboard-sounds).


### Soundboard Sounds Event Fields

Field | Type | Description
--- | --- | ---
soundboard_sounds | array of soundboard sound objects | The guild's soundboard sounds
guild_id | snowflake | ID of the guild


### Integrations


#### Integration Create

Sent when an integration is created. The inner payload is an [integration](/docs/resources/guild#integration-object) object with `user` omitted and an additional `guild_id` key:


### Integration Create Event Additional Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild


#### Integration Update

Sent when an integration is updated. The inner payload is an [integration](/docs/resources/guild#integration-object) object with `user` omitted and an additional `guild_id` key:


### Integration Update Event Additional Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild


#### Integration Delete

Sent when an integration is deleted.


### Integration Delete Event Fields

Field | Type | Description
--- | --- | ---
id | snowflake | Integration ID
guild_id | snowflake | ID of the guild
application_id? | snowflake | ID of the bot/OAuth2 application for this discord integration


### Invites

All [Invite](/docs/resources/invite) related events are only sent to bot users with the `MANAGE_CHANNELS` permission on the channel.


#### Invite Create

Sent when a new invite to a channel is created.


### Invite Create Event Fields

Field | Type | Description
--- | --- | ---
channel_id | snowflake | Channel the invite is for
code | string | Unique invite code
created_at | ISO8601 timestamp | Time at which the invite was created
guild_id? | snowflake | Guild of the invite
inviter? | user object | User that created the invite
max_age | integer | How long the invite is valid for (in seconds)
max_uses | integer | Maximum number of times the invite can be used
target_type? | integer | Type of target for this voice channel invite
target_user? | user object | User whose stream to display for this voice channel stream invite
target_application? | partial application object | Embedded application to open for this voice channel embedded application invite
temporary | boolean | Whether or not the invite is temporary (invited users will be kicked on disconnect unless they're assigned a role)
uses | integer | How many times the invite has been used (always will be 0)


#### Invite Delete

Sent when an invite is deleted.


### Invite Delete Event Fields

Field | Type | Description
--- | --- | ---
channel_id | snowflake | Channel of the invite
guild_id? | snowflake | Guild of the invite
code | string | Unique invite code


### Messages

Unlike persistent messages, ephemeral messages are sent directly to the user and the bot who sent the message rather than through the guild channel. Because of this, ephemeral messages are tied to the [`DIRECT_MESSAGES` intent](/docs/events/gateway#list-of-intents), and the message object won't include `guild_id` or `member`.


#### Message Create

Sent when a message is created. The inner payload is a [message](/docs/resources/message#message-object) object with the following extra fields:


### Message Create Extra Fields

Field | Type | Description
--- | --- | ---
guild_id? | snowflake | ID of the guild the message was sent in - unless it is an ephemeral message
member? | partial guild member object | Member properties for this message's author. Missing for ephemeral messages and messages from webhooks
mentions | array of user objects, with an additional partial member field | Users specifically mentioned in the message


#### Message Update

Sent when a message is updated. The inner payload is a [message](/docs/resources/message#message-object) object with the same extra fields as [MESSAGE\_CREATE](/docs/events/gateway-events#message-create).

The value for `tts` will always be false in message updates.


#### Message Delete

Sent when a message is deleted.


### Message Delete Event Fields

Field | Type | Description
--- | --- | ---
id | snowflake | ID of the message
channel_id | snowflake | ID of the channel
guild_id? | snowflake | ID of the guild


#### Message Delete Bulk

Sent when multiple messages are deleted at once.


### Message Delete Bulk Event Fields

Field | Type | Description
--- | --- | ---
ids | array of snowflakes | IDs of the messages
channel_id | snowflake | ID of the channel
guild_id? | snowflake | ID of the guild


#### Message Reaction Add

Sent when a user adds a reaction to a message.


### Message Reaction Add Event Fields

Field | Type | Description
--- | --- | ---
user_id | snowflake | ID of the user
channel_id | snowflake | ID of the channel
message_id | snowflake | ID of the message
guild_id? | snowflake | ID of the guild
member? | member object | Member who reacted if this happened in a guild
emoji | a partial emoji object | Emoji used to react - example
message_author_id? | snowflake | ID of the user who authored the message which was reacted to
burst | boolean | true if this is a super-reaction
burst_colors? | array of strings | Colors used for super-reaction animation in "#rrggbb" format
type | integer | The type of reaction


#### Message Reaction Remove

Sent when a user removes a reaction from a message.


### Message Reaction Remove Event Fields

Field | Type | Description
--- | --- | ---
user_id | snowflake | ID of the user
channel_id | snowflake | ID of the channel
message_id | snowflake | ID of the message
guild_id? | snowflake | ID of the guild
emoji | a partial emoji object | Emoji used to react - example
burst | boolean | true if this was a super-reaction
type | integer | The type of reaction


#### Message Reaction Remove All

Sent when a user explicitly removes all reactions from a message.


### Message Reaction Remove All Event Fields

Field | Type | Description
--- | --- | ---
channel_id | snowflake | ID of the channel
message_id | snowflake | ID of the message
guild_id? | snowflake | ID of the guild


#### Message Reaction Remove Emoji

Sent when a bot removes all instances of a given emoji from the reactions of a message.


### Message Reaction Remove Emoji Event Fields

Field | Type | Description
--- | --- | ---
channel_id | snowflake | ID of the channel
guild_id? | snowflake | ID of the guild
message_id | snowflake | ID of the message
emoji | partial emoji object | Emoji that was removed


### Presence


#### Presence Update

If you are using [Gateway Intents](/docs/events/gateway#gateway-intents), you must specify the `GUILD_PRESENCES` intent in order to receive Presence Update events

A user's presence is their current state on a guild. This event is sent when a user's presence or info, such as name or avatar, is updated.

The user object within this event can be partial, the only field which must be sent is the `id` field, everything else is optional. Along with this limitation, no fields are required, and the types of the fields are not validated. Your client should expect any combination of fields and types within this event.


### Presence Update Event Fields

Field | Type | Description
--- | --- | ---
user | user object | User whose presence is being updated
guild_id | snowflake | ID of the guild
status | string | Either "idle", "dnd", "online", or "offline"
activities | array of activity objects | User's current activities
client_status | client_status object | User's platform-dependent status


#### Client Status Object

Active sessions are indicated with an "online", "idle", or "dnd" string per platform. If a user is offline or invisible, the corresponding field is not present.

Field | Type | Description
--- | --- | ---
desktop? | string | User's status set for an active desktop (Windows, Linux, Mac) application session
mobile? | string | User's status set for an active mobile (iOS, Android) application session
web? | string | User's status set for an active web (browser, bot user) application session


#### Activity Object


### Activity Structure

Field | Type | Description
--- | --- | ---
name | string | Activity's name
type | integer | Activity type
url? | ?string | Stream URL, is validated when type is 1
created_at | integer | Unix timestamp (in milliseconds) of when the activity was added to the user's session
timestamps? | timestamps object | Unix timestamps for start and/or end of the game
application_id? | snowflake | Application ID for the game
details? | ?string | What the player is currently doing
state? | ?string | User's current party status, or text used for a custom status
emoji? | ?emoji object | Emoji used for a custom status
party? | party object | Information for the current party of the player
assets? | assets object | Images for the presence and their hover texts
secrets? | secrets object | Secrets for Rich Presence joining and spectating
instance? | boolean | Whether or not the activity is an instanced game session
flags? | integer | Activity flags ORd together, describes what the payload includes
buttons? | array of buttons | Custom buttons shown in the Rich Presence (max 2)

Bot users are only able to set `name`, `state`, `type`, and `url`.


### Activity Types

ID | Name | Format | Example
--- | --- | --- | ---
0 | Playing | Playing {name} | "Playing Rocket League"
1 | Streaming | Streaming {details} | "Streaming Rocket League"
2 | Listening | Listening to {name} | "Listening to Spotify"
3 | Watching | Watching {name} | "Watching YouTube Together"
4 | Custom | {emoji} {state} | ":smiley: I am cool"
5 | Competing | Competing in {name} | "Competing in Arena World Champions"

The streaming type currently only supports Twitch and YouTube. Only `https://twitch.tv/` and `https://youtube.com/` urls will work.


### Activity Timestamps

Field | Type | Description
--- | --- | ---
start? | integer | Unix time (in milliseconds) of when the activity started
end? | integer | Unix time (in milliseconds) of when the activity ends

For Listening and Watching activities, you can include both start and end timestamps to display a time bar.


### Activity Emoji

Field | Type | Description
--- | --- | ---
name | string | Name of the emoji
id? | snowflake | ID of the emoji
animated? | boolean | Whether the emoji is animated


### Activity Party

Field | Type | Description
--- | --- | ---
id? | string | ID of the party
size? | array of two integers (current_size, max_size) | Used to show the party's current and maximum size


### Activity Assets

Field | Type | Description
--- | --- | ---
large_image? | string | See Activity Asset Image
large_text? | string | Text displayed when hovering over the large image of the activity
small_image? | string | See Activity Asset Image
small_text? | string | Text displayed when hovering over the small image of the activity


### Activity Asset Image

Activity asset images are arbitrary strings which usually contain snowflake IDs or prefixed image IDs. Treat data within this field carefully, as it is user-specifiable and not sanitized.

To use an external image via media proxy, specify the URL as the field's value when sending. You will only receive the `mp:` prefix via the gateway.

Type | Format | Image URL
--- | --- | ---
Application Asset | {application_asset_id} | See Application Asset Image Formatting
Media Proxy Image | mp:{image_id} | https://media.discordapp.net/{image_id}


### Activity Secrets

Field | Type | Description
--- | --- | ---
join? | string | Secret for joining a party
spectate? | string | Secret for spectating a game
match? | string | Secret for a specific instanced match


### Activity Flags

Name | Value
--- | ---
INSTANCE | 1 << 0
JOIN | 1 << 1
SPECTATE | 1 << 2
JOIN_REQUEST | 1 << 3
SYNC | 1 << 4
PLAY | 1 << 5
PARTY_PRIVACY_FRIENDS | 1 << 6
PARTY_PRIVACY_VOICE_CHANNEL | 1 << 7
EMBEDDED | 1 << 8


### Activity Buttons

When received over the gateway, the `buttons` field is an array of strings, which are the button labels. Bots cannot access a user's activity button URLs. When sending, the `buttons` field must be an array of the below object:

Field | Type | Description
--- | --- | ---
label | string | Text shown on the button (1-32 characters)
url | string | URL opened when clicking the button (1-512 characters)


### Example Activity
```json
{
  "details": "24H RL Stream for Charity",
  "state": "Rocket League",
  "name": "Twitch",
  "type": 1,
  "url": "https://www.twitch.tv/discord"
}
```


### Example Activity with Rich Presence
```json
{
  "name": "Rocket League",
  "type": 0,
  "application_id": "379286085710381999",
  "state": "In a Match",
  "details": "Ranked Duos: 2-1",
  "timestamps": {
    "start": 15112000660000
  },
  "party": {
    "id": "9dd6594e-81b3-49f6-a6b5-a679e6a060d3",
    "size": [2, 2]
  },
  "assets": {
    "large_image": "351371005538729000",
    "large_text": "DFH Stadium",
    "small_image": "351371005538729111",
    "small_text": "Silver III"
  },
  "secrets": {
    "join": "025ed05c71f639de8bfaa0d679d7c94b2fdce12f",
    "spectate": "e7eb30d2ee025ed05c71ea495f770b76454ee4e0",
    "match": "4b2fdce12f639de8bfa7e3591b71a0d679d7c93f"
  }
}
```

Clients may only update their game status 5 times per 20 seconds.


#### Typing Start

Sent when a user starts typing in a channel.


### Typing Start Event Fields

Field | Type | Description
--- | --- | ---
channel_id | snowflake | ID of the channel
guild_id? | snowflake | ID of the guild
user_id | snowflake | ID of the user
timestamp | integer | Unix time (in seconds) of when the user started typing
member? | member object | Member who started typing if this happened in a guild


#### User Update

Sent when properties about the current bot's user change. Inner payload is a [user](/docs/resources/user#user-object) object.


### Voice


#### Voice Channel Effect Send

Sent when someone sends an effect, such as an emoji reaction or a soundboard sound, in a voice channel the current user is connected to.


### Voice Channel Effect Send Event Fields

Field | Type | Description
--- | --- | ---
channel_id | snowflake | ID of the channel the effect was sent in
guild_id | snowflake | ID of the guild the effect was sent in
user_id | snowflake | ID of the user who sent the effect
emoji? | ?emoji object | The emoji sent, for emoji reaction and soundboard effects
animation_type? | ?integer | The type of emoji animation, for emoji reaction and soundboard effects
animation_id? | integer | The ID of the emoji animation, for emoji reaction and soundboard effects
sound_id? | snowflake or integer | The ID of the soundboard sound, for soundboard effects
sound_volume? | double | The volume of the soundboard sound, from 0 to 1, for soundboard effects


### Animation Types

Type | Value | Description
--- | --- | ---
PREMIUM | 0 | A fun animation, sent by a Nitro subscriber
BASIC | 1 | The standard animation


#### Voice State Update

Sent when someone joins/leaves/moves voice channels. Inner payload is a [voice state](/docs/resources/voice#voice-state-object) object.


#### Voice Server Update

Sent when a guild's voice server is updated. This is sent when initially connecting to voice, and when the current voice instance fails over to a new server.

A null endpoint means that the voice server allocated has gone away and is trying to be reallocated. You should attempt to disconnect from the currently connected voice server, and not attempt to reconnect until a new voice server is allocated.


### Voice Server Update Event Fields

Field | Type | Description
--- | --- | ---
token | string | Voice connection token
guild_id | snowflake | Guild this voice server update is for
endpoint | ?string | Voice server host


### Example Voice Server Update Payload
```json
{
  "token": "my_token",
  "guild_id": "41771983423143937",
  "endpoint": "smart.loyal.discord.gg"
}
```


### Webhooks


#### Webhooks Update

Sent when a guild channel's webhook is created, updated, or deleted.


### Webhooks Update Event Fields

Field | Type | Description
--- | --- | ---
guild_id | snowflake | ID of the guild
channel_id | snowflake | ID of the channel


### Interactions


#### Interaction Create

Sent when a user uses an [Application Command](/docs/interactions/application-commands) or [Message Component](/docs/interactions/message-components). Inner payload is an [Interaction](/docs/interactions/receiving-and-responding#interaction-object-interaction-structure).


### Stage Instances


#### Stage Instance Create

Sent when a [Stage instance](/docs/resources/stage-instance) is created (i.e. the Stage is now "live"). Inner payload is a [Stage instance](/docs/resources/stage-instance#stage-instance-object)


#### Stage Instance Update

Sent when a [Stage instance](/docs/resources/stage-instance) has been updated. Inner payload is a [Stage instance](/docs/resources/stage-instance#stage-instance-object)


#### Stage Instance Delete

Sent when a [Stage instance](/docs/resources/stage-instance) has been deleted (i.e. the Stage has been closed). Inner payload is a [Stage instance](/docs/resources/stage-instance#stage-instance-object)


### Subscriptions


#### Subscription Create

Subscription status should not be used to grant perks. Use [entitlements](/docs/resources/entitlement#entitlement-object) as an indication of whether a user should have access to a specific SKU. See our guide on [Implementing App Subscriptions](/docs/monetization/implementing-app-subscriptions) for more information.

Sent when a [Subscription](/docs/resources/subscription) for a Premium App is created. Inner payload is a [Subscription](/docs/resources/subscription#subscription-object).

A Subscription's `status` can be either inactive or active when this event is received. You will receive subsequent `SUBSCRIPTION_UPDATE` events if the `status` is updated to active. As a best practice, you should not grant any perks to users until the entitlements are created.


#### Subscription Update

Sent when a [Subscription](/docs/resources/subscription) for a Premium App has been updated. Inner payload is a [Subscription](/docs/resources/subscription#subscription-object) object.


#### Subscription Delete

Sent when a [Subscription](/docs/resources/subscription) for a Premium App has been deleted. Inner payload is a [Subscription](/docs/resources/subscription#subscription-object) object.


### Polls


#### Message Poll Vote Add

Sent when a user votes on a poll. If the poll allows multiple selection, one event will be sent per answer.


### Message Poll Vote Add Fields

Field | Type | Description
--- | --- | ---
user_id | snowflake | ID of the user
channel_id | snowflake | ID of the channel
message_id | snowflake | ID of the message
guild_id? | snowflake | ID of the guild
answer_id | integer | ID of the answer


#### Message Poll Vote Remove

Sent when a user removes their vote on a poll. If the poll allows for multiple selections, one event will be sent per answer.


### Message Poll Vote Remove Fields

Field | Type | Description
--- | --- | ---
user_id | snowflake | ID of the user
channel_id | snowflake | ID of the channel
message_id | snowflake | ID of the message
guild_id? | snowflake | ID of the guild
answer_id | integer | ID of the answer