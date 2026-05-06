// Message type registry — kept in sync with @tribe-protocol/sdk's
// MessageType enum (proto/message.proto is the canonical schema).
// Update both when adding a new type.

export const MessageType = {
  TWEET_ADD: 1,
  TWEET_REMOVE: 2,
  REACTION_ADD: 3,
  REACTION_REMOVE: 4,
  LINK_ADD: 5,
  LINK_REMOVE: 6,
  USER_DATA_ADD: 7,
  USERNAME_PROOF: 8,
  CHANNEL_ADD: 9,
  CHANNEL_JOIN: 10,
  CHANNEL_LEAVE: 11,
  DM_KEY_REGISTER: 12,
  DM_SEND: 13,
  BOOKMARK_ADD: 14,
  BOOKMARK_REMOVE: 15,
  POLL_ADD: 16,
  POLL_VOTE: 17,
  EVENT_ADD: 18,
  EVENT_RSVP: 19,
  TASK_ADD: 20,
  TASK_CLAIM: 21,
  TASK_COMPLETE: 22,
  CROWDFUND_ADD: 23,
  CROWDFUND_PLEDGE: 24,
  TIP_ADD: 25,
  DM_GROUP_CREATE: 26,
  DM_GROUP_SEND: 27,
  DM_READ: 28,
  DM_GROUP_LEAVE: 29,
  DM_GROUP_ADD_MEMBER: 30,
  DM_GROUP_REMOVE_MEMBER: 31,
  DM_GROUP_DELETE: 32,
} as const;

export type MessageTypeKey = keyof typeof MessageType;
export type MessageTypeId = (typeof MessageType)[MessageTypeKey];
