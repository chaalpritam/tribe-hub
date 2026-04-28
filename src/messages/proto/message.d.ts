import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace tribe. */
export namespace tribe {

    /** Properties of a TribeMessage. */
    interface ITribeMessage {

        /** TribeMessage protocolVersion */
        protocolVersion?: (number|null);

        /** TribeMessage data */
        data?: (tribe.IMessageData|null);

        /** TribeMessage hash */
        hash?: (Uint8Array|null);

        /** TribeMessage signature */
        signature?: (Uint8Array|null);

        /** TribeMessage signer */
        signer?: (Uint8Array|null);
    }

    /** Represents a TribeMessage. */
    class TribeMessage implements ITribeMessage {

        /**
         * Constructs a new TribeMessage.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ITribeMessage);

        /** TribeMessage protocolVersion. */
        public protocolVersion: number;

        /** TribeMessage data. */
        public data?: (tribe.IMessageData|null);

        /** TribeMessage hash. */
        public hash: Uint8Array;

        /** TribeMessage signature. */
        public signature: Uint8Array;

        /** TribeMessage signer. */
        public signer: Uint8Array;

        /**
         * Creates a new TribeMessage instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TribeMessage instance
         */
        public static create(properties?: tribe.ITribeMessage): tribe.TribeMessage;

        /**
         * Encodes the specified TribeMessage message. Does not implicitly {@link tribe.TribeMessage.verify|verify} messages.
         * @param message TribeMessage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ITribeMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TribeMessage message, length delimited. Does not implicitly {@link tribe.TribeMessage.verify|verify} messages.
         * @param message TribeMessage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ITribeMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TribeMessage message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TribeMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.TribeMessage;

        /**
         * Decodes a TribeMessage message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TribeMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.TribeMessage;

        /**
         * Verifies a TribeMessage message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TribeMessage message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TribeMessage
         */
        public static fromObject(object: { [k: string]: any }): tribe.TribeMessage;

        /**
         * Creates a plain object from a TribeMessage message. Also converts values to other types if specified.
         * @param message TribeMessage
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.TribeMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TribeMessage to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TribeMessage
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MessageData. */
    interface IMessageData {

        /** MessageData type */
        type?: (tribe.MessageType|null);

        /** MessageData tid */
        tid?: (number|Long|null);

        /** MessageData timestamp */
        timestamp?: (number|null);

        /** MessageData network */
        network?: (tribe.Network|null);

        /** MessageData tweetAdd */
        tweetAdd?: (tribe.ITweetAddBody|null);

        /** MessageData tweetRemove */
        tweetRemove?: (tribe.ITweetRemoveBody|null);

        /** MessageData reaction */
        reaction?: (tribe.IReactionBody|null);

        /** MessageData userData */
        userData?: (tribe.IUserDataBody|null);

        /** MessageData dmKeyRegister */
        dmKeyRegister?: (tribe.IDmKeyRegisterBody|null);

        /** MessageData dmSend */
        dmSend?: (tribe.IDmSendBody|null);

        /** MessageData bookmark */
        bookmark?: (tribe.IBookmarkBody|null);

        /** MessageData channelAdd */
        channelAdd?: (tribe.IChannelAddBody|null);

        /** MessageData channelMembership */
        channelMembership?: (tribe.IChannelMembershipBody|null);

        /** MessageData pollAdd */
        pollAdd?: (tribe.IPollAddBody|null);

        /** MessageData pollVote */
        pollVote?: (tribe.IPollVoteBody|null);

        /** MessageData eventAdd */
        eventAdd?: (tribe.IEventAddBody|null);

        /** MessageData eventRsvp */
        eventRsvp?: (tribe.IEventRsvpBody|null);

        /** MessageData taskAdd */
        taskAdd?: (tribe.ITaskAddBody|null);

        /** MessageData taskTransition */
        taskTransition?: (tribe.ITaskTransitionBody|null);

        /** MessageData crowdfundAdd */
        crowdfundAdd?: (tribe.ICrowdfundAddBody|null);

        /** MessageData crowdfundPledge */
        crowdfundPledge?: (tribe.ICrowdfundPledgeBody|null);

        /** MessageData tipAdd */
        tipAdd?: (tribe.ITipAddBody|null);

        /** MessageData dmGroupCreate */
        dmGroupCreate?: (tribe.IDmGroupCreateBody|null);

        /** MessageData dmGroupSend */
        dmGroupSend?: (tribe.IDmGroupSendBody|null);

        /** MessageData dmRead */
        dmRead?: (tribe.IDmReadBody|null);
    }

    /** Represents a MessageData. */
    class MessageData implements IMessageData {

        /**
         * Constructs a new MessageData.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IMessageData);

        /** MessageData type. */
        public type: tribe.MessageType;

        /** MessageData tid. */
        public tid: (number|Long);

        /** MessageData timestamp. */
        public timestamp: number;

        /** MessageData network. */
        public network: tribe.Network;

        /** MessageData tweetAdd. */
        public tweetAdd?: (tribe.ITweetAddBody|null);

        /** MessageData tweetRemove. */
        public tweetRemove?: (tribe.ITweetRemoveBody|null);

        /** MessageData reaction. */
        public reaction?: (tribe.IReactionBody|null);

        /** MessageData userData. */
        public userData?: (tribe.IUserDataBody|null);

        /** MessageData dmKeyRegister. */
        public dmKeyRegister?: (tribe.IDmKeyRegisterBody|null);

        /** MessageData dmSend. */
        public dmSend?: (tribe.IDmSendBody|null);

        /** MessageData bookmark. */
        public bookmark?: (tribe.IBookmarkBody|null);

        /** MessageData channelAdd. */
        public channelAdd?: (tribe.IChannelAddBody|null);

        /** MessageData channelMembership. */
        public channelMembership?: (tribe.IChannelMembershipBody|null);

        /** MessageData pollAdd. */
        public pollAdd?: (tribe.IPollAddBody|null);

        /** MessageData pollVote. */
        public pollVote?: (tribe.IPollVoteBody|null);

        /** MessageData eventAdd. */
        public eventAdd?: (tribe.IEventAddBody|null);

        /** MessageData eventRsvp. */
        public eventRsvp?: (tribe.IEventRsvpBody|null);

        /** MessageData taskAdd. */
        public taskAdd?: (tribe.ITaskAddBody|null);

        /** MessageData taskTransition. */
        public taskTransition?: (tribe.ITaskTransitionBody|null);

        /** MessageData crowdfundAdd. */
        public crowdfundAdd?: (tribe.ICrowdfundAddBody|null);

        /** MessageData crowdfundPledge. */
        public crowdfundPledge?: (tribe.ICrowdfundPledgeBody|null);

        /** MessageData tipAdd. */
        public tipAdd?: (tribe.ITipAddBody|null);

        /** MessageData dmGroupCreate. */
        public dmGroupCreate?: (tribe.IDmGroupCreateBody|null);

        /** MessageData dmGroupSend. */
        public dmGroupSend?: (tribe.IDmGroupSendBody|null);

        /** MessageData dmRead. */
        public dmRead?: (tribe.IDmReadBody|null);

        /** MessageData body. */
        public body?: ("tweetAdd"|"tweetRemove"|"reaction"|"userData"|"dmKeyRegister"|"dmSend"|"bookmark"|"channelAdd"|"channelMembership"|"pollAdd"|"pollVote"|"eventAdd"|"eventRsvp"|"taskAdd"|"taskTransition"|"crowdfundAdd"|"crowdfundPledge"|"tipAdd"|"dmGroupCreate"|"dmGroupSend"|"dmRead");

        /**
         * Creates a new MessageData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageData instance
         */
        public static create(properties?: tribe.IMessageData): tribe.MessageData;

        /**
         * Encodes the specified MessageData message. Does not implicitly {@link tribe.MessageData.verify|verify} messages.
         * @param message MessageData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IMessageData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageData message, length delimited. Does not implicitly {@link tribe.MessageData.verify|verify} messages.
         * @param message MessageData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IMessageData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MessageData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.MessageData;

        /**
         * Decodes a MessageData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MessageData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.MessageData;

        /**
         * Verifies a MessageData message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageData message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageData
         */
        public static fromObject(object: { [k: string]: any }): tribe.MessageData;

        /**
         * Creates a plain object from a MessageData message. Also converts values to other types if specified.
         * @param message MessageData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.MessageData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MessageData
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TweetAddBody. */
    interface ITweetAddBody {

        /** TweetAddBody text */
        text?: (string|null);

        /** TweetAddBody mentions */
        mentions?: ((number|Long)[]|null);

        /** TweetAddBody embeds */
        embeds?: (string[]|null);

        /** TweetAddBody parentHash */
        parentHash?: (Uint8Array|null);

        /** TweetAddBody channelId */
        channelId?: (string|null);
    }

    /** Represents a TweetAddBody. */
    class TweetAddBody implements ITweetAddBody {

        /**
         * Constructs a new TweetAddBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ITweetAddBody);

        /** TweetAddBody text. */
        public text: string;

        /** TweetAddBody mentions. */
        public mentions: (number|Long)[];

        /** TweetAddBody embeds. */
        public embeds: string[];

        /** TweetAddBody parentHash. */
        public parentHash: Uint8Array;

        /** TweetAddBody channelId. */
        public channelId: string;

        /**
         * Creates a new TweetAddBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TweetAddBody instance
         */
        public static create(properties?: tribe.ITweetAddBody): tribe.TweetAddBody;

        /**
         * Encodes the specified TweetAddBody message. Does not implicitly {@link tribe.TweetAddBody.verify|verify} messages.
         * @param message TweetAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ITweetAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TweetAddBody message, length delimited. Does not implicitly {@link tribe.TweetAddBody.verify|verify} messages.
         * @param message TweetAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ITweetAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TweetAddBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TweetAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.TweetAddBody;

        /**
         * Decodes a TweetAddBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TweetAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.TweetAddBody;

        /**
         * Verifies a TweetAddBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TweetAddBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TweetAddBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.TweetAddBody;

        /**
         * Creates a plain object from a TweetAddBody message. Also converts values to other types if specified.
         * @param message TweetAddBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.TweetAddBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TweetAddBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TweetAddBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TweetRemoveBody. */
    interface ITweetRemoveBody {

        /** TweetRemoveBody targetHash */
        targetHash?: (Uint8Array|null);
    }

    /** Represents a TweetRemoveBody. */
    class TweetRemoveBody implements ITweetRemoveBody {

        /**
         * Constructs a new TweetRemoveBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ITweetRemoveBody);

        /** TweetRemoveBody targetHash. */
        public targetHash: Uint8Array;

        /**
         * Creates a new TweetRemoveBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TweetRemoveBody instance
         */
        public static create(properties?: tribe.ITweetRemoveBody): tribe.TweetRemoveBody;

        /**
         * Encodes the specified TweetRemoveBody message. Does not implicitly {@link tribe.TweetRemoveBody.verify|verify} messages.
         * @param message TweetRemoveBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ITweetRemoveBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TweetRemoveBody message, length delimited. Does not implicitly {@link tribe.TweetRemoveBody.verify|verify} messages.
         * @param message TweetRemoveBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ITweetRemoveBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TweetRemoveBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TweetRemoveBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.TweetRemoveBody;

        /**
         * Decodes a TweetRemoveBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TweetRemoveBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.TweetRemoveBody;

        /**
         * Verifies a TweetRemoveBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TweetRemoveBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TweetRemoveBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.TweetRemoveBody;

        /**
         * Creates a plain object from a TweetRemoveBody message. Also converts values to other types if specified.
         * @param message TweetRemoveBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.TweetRemoveBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TweetRemoveBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TweetRemoveBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ReactionBody. */
    interface IReactionBody {

        /** ReactionBody type */
        type?: (tribe.ReactionType|null);

        /** ReactionBody targetHash */
        targetHash?: (Uint8Array|null);
    }

    /** Represents a ReactionBody. */
    class ReactionBody implements IReactionBody {

        /**
         * Constructs a new ReactionBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IReactionBody);

        /** ReactionBody type. */
        public type: tribe.ReactionType;

        /** ReactionBody targetHash. */
        public targetHash: Uint8Array;

        /**
         * Creates a new ReactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ReactionBody instance
         */
        public static create(properties?: tribe.IReactionBody): tribe.ReactionBody;

        /**
         * Encodes the specified ReactionBody message. Does not implicitly {@link tribe.ReactionBody.verify|verify} messages.
         * @param message ReactionBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IReactionBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ReactionBody message, length delimited. Does not implicitly {@link tribe.ReactionBody.verify|verify} messages.
         * @param message ReactionBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IReactionBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ReactionBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ReactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.ReactionBody;

        /**
         * Decodes a ReactionBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ReactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.ReactionBody;

        /**
         * Verifies a ReactionBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ReactionBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ReactionBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.ReactionBody;

        /**
         * Creates a plain object from a ReactionBody message. Also converts values to other types if specified.
         * @param message ReactionBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.ReactionBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ReactionBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ReactionBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a UserDataBody. */
    interface IUserDataBody {

        /** UserDataBody field */
        field?: (string|null);

        /** UserDataBody value */
        value?: (string|null);
    }

    /** Represents a UserDataBody. */
    class UserDataBody implements IUserDataBody {

        /**
         * Constructs a new UserDataBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IUserDataBody);

        /** UserDataBody field. */
        public field: string;

        /** UserDataBody value. */
        public value: string;

        /**
         * Creates a new UserDataBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UserDataBody instance
         */
        public static create(properties?: tribe.IUserDataBody): tribe.UserDataBody;

        /**
         * Encodes the specified UserDataBody message. Does not implicitly {@link tribe.UserDataBody.verify|verify} messages.
         * @param message UserDataBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IUserDataBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UserDataBody message, length delimited. Does not implicitly {@link tribe.UserDataBody.verify|verify} messages.
         * @param message UserDataBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IUserDataBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a UserDataBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UserDataBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.UserDataBody;

        /**
         * Decodes a UserDataBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UserDataBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.UserDataBody;

        /**
         * Verifies a UserDataBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserDataBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserDataBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.UserDataBody;

        /**
         * Creates a plain object from a UserDataBody message. Also converts values to other types if specified.
         * @param message UserDataBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.UserDataBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserDataBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UserDataBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a DmKeyRegisterBody. */
    interface IDmKeyRegisterBody {

        /** DmKeyRegisterBody x25519Pubkey */
        x25519Pubkey?: (string|null);
    }

    /** Represents a DmKeyRegisterBody. */
    class DmKeyRegisterBody implements IDmKeyRegisterBody {

        /**
         * Constructs a new DmKeyRegisterBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IDmKeyRegisterBody);

        /** DmKeyRegisterBody x25519Pubkey. */
        public x25519Pubkey: string;

        /**
         * Creates a new DmKeyRegisterBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DmKeyRegisterBody instance
         */
        public static create(properties?: tribe.IDmKeyRegisterBody): tribe.DmKeyRegisterBody;

        /**
         * Encodes the specified DmKeyRegisterBody message. Does not implicitly {@link tribe.DmKeyRegisterBody.verify|verify} messages.
         * @param message DmKeyRegisterBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IDmKeyRegisterBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified DmKeyRegisterBody message, length delimited. Does not implicitly {@link tribe.DmKeyRegisterBody.verify|verify} messages.
         * @param message DmKeyRegisterBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IDmKeyRegisterBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DmKeyRegisterBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DmKeyRegisterBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.DmKeyRegisterBody;

        /**
         * Decodes a DmKeyRegisterBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns DmKeyRegisterBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.DmKeyRegisterBody;

        /**
         * Verifies a DmKeyRegisterBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DmKeyRegisterBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DmKeyRegisterBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.DmKeyRegisterBody;

        /**
         * Creates a plain object from a DmKeyRegisterBody message. Also converts values to other types if specified.
         * @param message DmKeyRegisterBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.DmKeyRegisterBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DmKeyRegisterBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for DmKeyRegisterBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a DmSendBody. */
    interface IDmSendBody {

        /** DmSendBody recipientTid */
        recipientTid?: (number|Long|null);

        /** DmSendBody ciphertext */
        ciphertext?: (string|null);

        /** DmSendBody nonce */
        nonce?: (string|null);

        /** DmSendBody senderX25519 */
        senderX25519?: (string|null);
    }

    /** Represents a DmSendBody. */
    class DmSendBody implements IDmSendBody {

        /**
         * Constructs a new DmSendBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IDmSendBody);

        /** DmSendBody recipientTid. */
        public recipientTid: (number|Long);

        /** DmSendBody ciphertext. */
        public ciphertext: string;

        /** DmSendBody nonce. */
        public nonce: string;

        /** DmSendBody senderX25519. */
        public senderX25519: string;

        /**
         * Creates a new DmSendBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DmSendBody instance
         */
        public static create(properties?: tribe.IDmSendBody): tribe.DmSendBody;

        /**
         * Encodes the specified DmSendBody message. Does not implicitly {@link tribe.DmSendBody.verify|verify} messages.
         * @param message DmSendBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IDmSendBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified DmSendBody message, length delimited. Does not implicitly {@link tribe.DmSendBody.verify|verify} messages.
         * @param message DmSendBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IDmSendBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DmSendBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DmSendBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.DmSendBody;

        /**
         * Decodes a DmSendBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns DmSendBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.DmSendBody;

        /**
         * Verifies a DmSendBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DmSendBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DmSendBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.DmSendBody;

        /**
         * Creates a plain object from a DmSendBody message. Also converts values to other types if specified.
         * @param message DmSendBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.DmSendBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DmSendBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for DmSendBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a BookmarkBody. */
    interface IBookmarkBody {

        /** BookmarkBody targetHash */
        targetHash?: (string|null);
    }

    /** Represents a BookmarkBody. */
    class BookmarkBody implements IBookmarkBody {

        /**
         * Constructs a new BookmarkBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IBookmarkBody);

        /** BookmarkBody targetHash. */
        public targetHash: string;

        /**
         * Creates a new BookmarkBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BookmarkBody instance
         */
        public static create(properties?: tribe.IBookmarkBody): tribe.BookmarkBody;

        /**
         * Encodes the specified BookmarkBody message. Does not implicitly {@link tribe.BookmarkBody.verify|verify} messages.
         * @param message BookmarkBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IBookmarkBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified BookmarkBody message, length delimited. Does not implicitly {@link tribe.BookmarkBody.verify|verify} messages.
         * @param message BookmarkBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IBookmarkBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BookmarkBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns BookmarkBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.BookmarkBody;

        /**
         * Decodes a BookmarkBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns BookmarkBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.BookmarkBody;

        /**
         * Verifies a BookmarkBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a BookmarkBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns BookmarkBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.BookmarkBody;

        /**
         * Creates a plain object from a BookmarkBody message. Also converts values to other types if specified.
         * @param message BookmarkBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.BookmarkBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this BookmarkBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for BookmarkBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ChannelAddBody. */
    interface IChannelAddBody {

        /** ChannelAddBody channelId */
        channelId?: (string|null);

        /** ChannelAddBody name */
        name?: (string|null);

        /** ChannelAddBody description */
        description?: (string|null);

        /** ChannelAddBody kind */
        kind?: (tribe.ChannelKind|null);

        /** ChannelAddBody latitude */
        latitude?: (number|null);

        /** ChannelAddBody longitude */
        longitude?: (number|null);
    }

    /** Represents a ChannelAddBody. */
    class ChannelAddBody implements IChannelAddBody {

        /**
         * Constructs a new ChannelAddBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IChannelAddBody);

        /** ChannelAddBody channelId. */
        public channelId: string;

        /** ChannelAddBody name. */
        public name: string;

        /** ChannelAddBody description. */
        public description: string;

        /** ChannelAddBody kind. */
        public kind: tribe.ChannelKind;

        /** ChannelAddBody latitude. */
        public latitude: number;

        /** ChannelAddBody longitude. */
        public longitude: number;

        /**
         * Creates a new ChannelAddBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ChannelAddBody instance
         */
        public static create(properties?: tribe.IChannelAddBody): tribe.ChannelAddBody;

        /**
         * Encodes the specified ChannelAddBody message. Does not implicitly {@link tribe.ChannelAddBody.verify|verify} messages.
         * @param message ChannelAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IChannelAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ChannelAddBody message, length delimited. Does not implicitly {@link tribe.ChannelAddBody.verify|verify} messages.
         * @param message ChannelAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IChannelAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ChannelAddBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ChannelAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.ChannelAddBody;

        /**
         * Decodes a ChannelAddBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ChannelAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.ChannelAddBody;

        /**
         * Verifies a ChannelAddBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ChannelAddBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ChannelAddBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.ChannelAddBody;

        /**
         * Creates a plain object from a ChannelAddBody message. Also converts values to other types if specified.
         * @param message ChannelAddBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.ChannelAddBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ChannelAddBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ChannelAddBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ChannelMembershipBody. */
    interface IChannelMembershipBody {

        /** ChannelMembershipBody channelId */
        channelId?: (string|null);
    }

    /** Represents a ChannelMembershipBody. */
    class ChannelMembershipBody implements IChannelMembershipBody {

        /**
         * Constructs a new ChannelMembershipBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IChannelMembershipBody);

        /** ChannelMembershipBody channelId. */
        public channelId: string;

        /**
         * Creates a new ChannelMembershipBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ChannelMembershipBody instance
         */
        public static create(properties?: tribe.IChannelMembershipBody): tribe.ChannelMembershipBody;

        /**
         * Encodes the specified ChannelMembershipBody message. Does not implicitly {@link tribe.ChannelMembershipBody.verify|verify} messages.
         * @param message ChannelMembershipBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IChannelMembershipBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ChannelMembershipBody message, length delimited. Does not implicitly {@link tribe.ChannelMembershipBody.verify|verify} messages.
         * @param message ChannelMembershipBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IChannelMembershipBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ChannelMembershipBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ChannelMembershipBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.ChannelMembershipBody;

        /**
         * Decodes a ChannelMembershipBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ChannelMembershipBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.ChannelMembershipBody;

        /**
         * Verifies a ChannelMembershipBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ChannelMembershipBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ChannelMembershipBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.ChannelMembershipBody;

        /**
         * Creates a plain object from a ChannelMembershipBody message. Also converts values to other types if specified.
         * @param message ChannelMembershipBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.ChannelMembershipBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ChannelMembershipBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ChannelMembershipBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PollAddBody. */
    interface IPollAddBody {

        /** PollAddBody pollId */
        pollId?: (string|null);

        /** PollAddBody question */
        question?: (string|null);

        /** PollAddBody options */
        options?: (string[]|null);

        /** PollAddBody expiresAt */
        expiresAt?: (number|null);

        /** PollAddBody channelId */
        channelId?: (string|null);
    }

    /** Represents a PollAddBody. */
    class PollAddBody implements IPollAddBody {

        /**
         * Constructs a new PollAddBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IPollAddBody);

        /** PollAddBody pollId. */
        public pollId: string;

        /** PollAddBody question. */
        public question: string;

        /** PollAddBody options. */
        public options: string[];

        /** PollAddBody expiresAt. */
        public expiresAt: number;

        /** PollAddBody channelId. */
        public channelId: string;

        /**
         * Creates a new PollAddBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PollAddBody instance
         */
        public static create(properties?: tribe.IPollAddBody): tribe.PollAddBody;

        /**
         * Encodes the specified PollAddBody message. Does not implicitly {@link tribe.PollAddBody.verify|verify} messages.
         * @param message PollAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IPollAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PollAddBody message, length delimited. Does not implicitly {@link tribe.PollAddBody.verify|verify} messages.
         * @param message PollAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IPollAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PollAddBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PollAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.PollAddBody;

        /**
         * Decodes a PollAddBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PollAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.PollAddBody;

        /**
         * Verifies a PollAddBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PollAddBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PollAddBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.PollAddBody;

        /**
         * Creates a plain object from a PollAddBody message. Also converts values to other types if specified.
         * @param message PollAddBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.PollAddBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PollAddBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PollAddBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PollVoteBody. */
    interface IPollVoteBody {

        /** PollVoteBody pollId */
        pollId?: (string|null);

        /** PollVoteBody optionIndex */
        optionIndex?: (number|null);
    }

    /** Represents a PollVoteBody. */
    class PollVoteBody implements IPollVoteBody {

        /**
         * Constructs a new PollVoteBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IPollVoteBody);

        /** PollVoteBody pollId. */
        public pollId: string;

        /** PollVoteBody optionIndex. */
        public optionIndex: number;

        /**
         * Creates a new PollVoteBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PollVoteBody instance
         */
        public static create(properties?: tribe.IPollVoteBody): tribe.PollVoteBody;

        /**
         * Encodes the specified PollVoteBody message. Does not implicitly {@link tribe.PollVoteBody.verify|verify} messages.
         * @param message PollVoteBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IPollVoteBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PollVoteBody message, length delimited. Does not implicitly {@link tribe.PollVoteBody.verify|verify} messages.
         * @param message PollVoteBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IPollVoteBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PollVoteBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PollVoteBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.PollVoteBody;

        /**
         * Decodes a PollVoteBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PollVoteBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.PollVoteBody;

        /**
         * Verifies a PollVoteBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PollVoteBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PollVoteBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.PollVoteBody;

        /**
         * Creates a plain object from a PollVoteBody message. Also converts values to other types if specified.
         * @param message PollVoteBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.PollVoteBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PollVoteBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PollVoteBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an EventAddBody. */
    interface IEventAddBody {

        /** EventAddBody eventId */
        eventId?: (string|null);

        /** EventAddBody title */
        title?: (string|null);

        /** EventAddBody description */
        description?: (string|null);

        /** EventAddBody startsAt */
        startsAt?: (number|null);

        /** EventAddBody endsAt */
        endsAt?: (number|null);

        /** EventAddBody locationText */
        locationText?: (string|null);

        /** EventAddBody latitude */
        latitude?: (number|null);

        /** EventAddBody longitude */
        longitude?: (number|null);

        /** EventAddBody channelId */
        channelId?: (string|null);

        /** EventAddBody imageUrl */
        imageUrl?: (string|null);
    }

    /** Represents an EventAddBody. */
    class EventAddBody implements IEventAddBody {

        /**
         * Constructs a new EventAddBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IEventAddBody);

        /** EventAddBody eventId. */
        public eventId: string;

        /** EventAddBody title. */
        public title: string;

        /** EventAddBody description. */
        public description: string;

        /** EventAddBody startsAt. */
        public startsAt: number;

        /** EventAddBody endsAt. */
        public endsAt: number;

        /** EventAddBody locationText. */
        public locationText: string;

        /** EventAddBody latitude. */
        public latitude: number;

        /** EventAddBody longitude. */
        public longitude: number;

        /** EventAddBody channelId. */
        public channelId: string;

        /** EventAddBody imageUrl. */
        public imageUrl: string;

        /**
         * Creates a new EventAddBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventAddBody instance
         */
        public static create(properties?: tribe.IEventAddBody): tribe.EventAddBody;

        /**
         * Encodes the specified EventAddBody message. Does not implicitly {@link tribe.EventAddBody.verify|verify} messages.
         * @param message EventAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IEventAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventAddBody message, length delimited. Does not implicitly {@link tribe.EventAddBody.verify|verify} messages.
         * @param message EventAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IEventAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventAddBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns EventAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.EventAddBody;

        /**
         * Decodes an EventAddBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns EventAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.EventAddBody;

        /**
         * Verifies an EventAddBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventAddBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventAddBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.EventAddBody;

        /**
         * Creates a plain object from an EventAddBody message. Also converts values to other types if specified.
         * @param message EventAddBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.EventAddBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventAddBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for EventAddBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an EventRsvpBody. */
    interface IEventRsvpBody {

        /** EventRsvpBody eventId */
        eventId?: (string|null);

        /** EventRsvpBody status */
        status?: (string|null);
    }

    /** Represents an EventRsvpBody. */
    class EventRsvpBody implements IEventRsvpBody {

        /**
         * Constructs a new EventRsvpBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IEventRsvpBody);

        /** EventRsvpBody eventId. */
        public eventId: string;

        /** EventRsvpBody status. */
        public status: string;

        /**
         * Creates a new EventRsvpBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EventRsvpBody instance
         */
        public static create(properties?: tribe.IEventRsvpBody): tribe.EventRsvpBody;

        /**
         * Encodes the specified EventRsvpBody message. Does not implicitly {@link tribe.EventRsvpBody.verify|verify} messages.
         * @param message EventRsvpBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IEventRsvpBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EventRsvpBody message, length delimited. Does not implicitly {@link tribe.EventRsvpBody.verify|verify} messages.
         * @param message EventRsvpBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IEventRsvpBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EventRsvpBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns EventRsvpBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.EventRsvpBody;

        /**
         * Decodes an EventRsvpBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns EventRsvpBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.EventRsvpBody;

        /**
         * Verifies an EventRsvpBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EventRsvpBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EventRsvpBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.EventRsvpBody;

        /**
         * Creates a plain object from an EventRsvpBody message. Also converts values to other types if specified.
         * @param message EventRsvpBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.EventRsvpBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EventRsvpBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for EventRsvpBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TaskAddBody. */
    interface ITaskAddBody {

        /** TaskAddBody taskId */
        taskId?: (string|null);

        /** TaskAddBody title */
        title?: (string|null);

        /** TaskAddBody description */
        description?: (string|null);

        /** TaskAddBody rewardText */
        rewardText?: (string|null);

        /** TaskAddBody channelId */
        channelId?: (string|null);
    }

    /** Represents a TaskAddBody. */
    class TaskAddBody implements ITaskAddBody {

        /**
         * Constructs a new TaskAddBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ITaskAddBody);

        /** TaskAddBody taskId. */
        public taskId: string;

        /** TaskAddBody title. */
        public title: string;

        /** TaskAddBody description. */
        public description: string;

        /** TaskAddBody rewardText. */
        public rewardText: string;

        /** TaskAddBody channelId. */
        public channelId: string;

        /**
         * Creates a new TaskAddBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TaskAddBody instance
         */
        public static create(properties?: tribe.ITaskAddBody): tribe.TaskAddBody;

        /**
         * Encodes the specified TaskAddBody message. Does not implicitly {@link tribe.TaskAddBody.verify|verify} messages.
         * @param message TaskAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ITaskAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TaskAddBody message, length delimited. Does not implicitly {@link tribe.TaskAddBody.verify|verify} messages.
         * @param message TaskAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ITaskAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TaskAddBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TaskAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.TaskAddBody;

        /**
         * Decodes a TaskAddBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TaskAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.TaskAddBody;

        /**
         * Verifies a TaskAddBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TaskAddBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TaskAddBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.TaskAddBody;

        /**
         * Creates a plain object from a TaskAddBody message. Also converts values to other types if specified.
         * @param message TaskAddBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.TaskAddBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TaskAddBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TaskAddBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TaskTransitionBody. */
    interface ITaskTransitionBody {

        /** TaskTransitionBody taskId */
        taskId?: (string|null);
    }

    /** Represents a TaskTransitionBody. */
    class TaskTransitionBody implements ITaskTransitionBody {

        /**
         * Constructs a new TaskTransitionBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ITaskTransitionBody);

        /** TaskTransitionBody taskId. */
        public taskId: string;

        /**
         * Creates a new TaskTransitionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TaskTransitionBody instance
         */
        public static create(properties?: tribe.ITaskTransitionBody): tribe.TaskTransitionBody;

        /**
         * Encodes the specified TaskTransitionBody message. Does not implicitly {@link tribe.TaskTransitionBody.verify|verify} messages.
         * @param message TaskTransitionBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ITaskTransitionBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TaskTransitionBody message, length delimited. Does not implicitly {@link tribe.TaskTransitionBody.verify|verify} messages.
         * @param message TaskTransitionBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ITaskTransitionBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TaskTransitionBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TaskTransitionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.TaskTransitionBody;

        /**
         * Decodes a TaskTransitionBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TaskTransitionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.TaskTransitionBody;

        /**
         * Verifies a TaskTransitionBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TaskTransitionBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TaskTransitionBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.TaskTransitionBody;

        /**
         * Creates a plain object from a TaskTransitionBody message. Also converts values to other types if specified.
         * @param message TaskTransitionBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.TaskTransitionBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TaskTransitionBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TaskTransitionBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CrowdfundAddBody. */
    interface ICrowdfundAddBody {

        /** CrowdfundAddBody crowdfundId */
        crowdfundId?: (string|null);

        /** CrowdfundAddBody title */
        title?: (string|null);

        /** CrowdfundAddBody description */
        description?: (string|null);

        /** CrowdfundAddBody goalAmount */
        goalAmount?: (number|null);

        /** CrowdfundAddBody currency */
        currency?: (string|null);

        /** CrowdfundAddBody deadlineAt */
        deadlineAt?: (number|null);

        /** CrowdfundAddBody imageUrl */
        imageUrl?: (string|null);

        /** CrowdfundAddBody channelId */
        channelId?: (string|null);
    }

    /** Represents a CrowdfundAddBody. */
    class CrowdfundAddBody implements ICrowdfundAddBody {

        /**
         * Constructs a new CrowdfundAddBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ICrowdfundAddBody);

        /** CrowdfundAddBody crowdfundId. */
        public crowdfundId: string;

        /** CrowdfundAddBody title. */
        public title: string;

        /** CrowdfundAddBody description. */
        public description: string;

        /** CrowdfundAddBody goalAmount. */
        public goalAmount: number;

        /** CrowdfundAddBody currency. */
        public currency: string;

        /** CrowdfundAddBody deadlineAt. */
        public deadlineAt: number;

        /** CrowdfundAddBody imageUrl. */
        public imageUrl: string;

        /** CrowdfundAddBody channelId. */
        public channelId: string;

        /**
         * Creates a new CrowdfundAddBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CrowdfundAddBody instance
         */
        public static create(properties?: tribe.ICrowdfundAddBody): tribe.CrowdfundAddBody;

        /**
         * Encodes the specified CrowdfundAddBody message. Does not implicitly {@link tribe.CrowdfundAddBody.verify|verify} messages.
         * @param message CrowdfundAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ICrowdfundAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CrowdfundAddBody message, length delimited. Does not implicitly {@link tribe.CrowdfundAddBody.verify|verify} messages.
         * @param message CrowdfundAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ICrowdfundAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CrowdfundAddBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CrowdfundAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.CrowdfundAddBody;

        /**
         * Decodes a CrowdfundAddBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CrowdfundAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.CrowdfundAddBody;

        /**
         * Verifies a CrowdfundAddBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CrowdfundAddBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CrowdfundAddBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.CrowdfundAddBody;

        /**
         * Creates a plain object from a CrowdfundAddBody message. Also converts values to other types if specified.
         * @param message CrowdfundAddBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.CrowdfundAddBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CrowdfundAddBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CrowdfundAddBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CrowdfundPledgeBody. */
    interface ICrowdfundPledgeBody {

        /** CrowdfundPledgeBody crowdfundId */
        crowdfundId?: (string|null);

        /** CrowdfundPledgeBody amount */
        amount?: (number|null);

        /** CrowdfundPledgeBody currency */
        currency?: (string|null);
    }

    /** Represents a CrowdfundPledgeBody. */
    class CrowdfundPledgeBody implements ICrowdfundPledgeBody {

        /**
         * Constructs a new CrowdfundPledgeBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ICrowdfundPledgeBody);

        /** CrowdfundPledgeBody crowdfundId. */
        public crowdfundId: string;

        /** CrowdfundPledgeBody amount. */
        public amount: number;

        /** CrowdfundPledgeBody currency. */
        public currency: string;

        /**
         * Creates a new CrowdfundPledgeBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CrowdfundPledgeBody instance
         */
        public static create(properties?: tribe.ICrowdfundPledgeBody): tribe.CrowdfundPledgeBody;

        /**
         * Encodes the specified CrowdfundPledgeBody message. Does not implicitly {@link tribe.CrowdfundPledgeBody.verify|verify} messages.
         * @param message CrowdfundPledgeBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ICrowdfundPledgeBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CrowdfundPledgeBody message, length delimited. Does not implicitly {@link tribe.CrowdfundPledgeBody.verify|verify} messages.
         * @param message CrowdfundPledgeBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ICrowdfundPledgeBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CrowdfundPledgeBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CrowdfundPledgeBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.CrowdfundPledgeBody;

        /**
         * Decodes a CrowdfundPledgeBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CrowdfundPledgeBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.CrowdfundPledgeBody;

        /**
         * Verifies a CrowdfundPledgeBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CrowdfundPledgeBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CrowdfundPledgeBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.CrowdfundPledgeBody;

        /**
         * Creates a plain object from a CrowdfundPledgeBody message. Also converts values to other types if specified.
         * @param message CrowdfundPledgeBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.CrowdfundPledgeBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CrowdfundPledgeBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CrowdfundPledgeBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TipAddBody. */
    interface ITipAddBody {

        /** TipAddBody recipientTid */
        recipientTid?: (number|Long|null);

        /** TipAddBody amount */
        amount?: (number|null);

        /** TipAddBody currency */
        currency?: (string|null);

        /** TipAddBody targetHash */
        targetHash?: (string|null);

        /** TipAddBody txSignature */
        txSignature?: (string|null);
    }

    /** Represents a TipAddBody. */
    class TipAddBody implements ITipAddBody {

        /**
         * Constructs a new TipAddBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.ITipAddBody);

        /** TipAddBody recipientTid. */
        public recipientTid: (number|Long);

        /** TipAddBody amount. */
        public amount: number;

        /** TipAddBody currency. */
        public currency: string;

        /** TipAddBody targetHash. */
        public targetHash: string;

        /** TipAddBody txSignature. */
        public txSignature: string;

        /**
         * Creates a new TipAddBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TipAddBody instance
         */
        public static create(properties?: tribe.ITipAddBody): tribe.TipAddBody;

        /**
         * Encodes the specified TipAddBody message. Does not implicitly {@link tribe.TipAddBody.verify|verify} messages.
         * @param message TipAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.ITipAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TipAddBody message, length delimited. Does not implicitly {@link tribe.TipAddBody.verify|verify} messages.
         * @param message TipAddBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.ITipAddBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TipAddBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TipAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.TipAddBody;

        /**
         * Decodes a TipAddBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TipAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.TipAddBody;

        /**
         * Verifies a TipAddBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TipAddBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TipAddBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.TipAddBody;

        /**
         * Creates a plain object from a TipAddBody message. Also converts values to other types if specified.
         * @param message TipAddBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.TipAddBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TipAddBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TipAddBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a DmGroupCreateBody. */
    interface IDmGroupCreateBody {

        /** DmGroupCreateBody groupId */
        groupId?: (string|null);

        /** DmGroupCreateBody name */
        name?: (string|null);

        /** DmGroupCreateBody memberTids */
        memberTids?: ((number|Long)[]|null);
    }

    /** Represents a DmGroupCreateBody. */
    class DmGroupCreateBody implements IDmGroupCreateBody {

        /**
         * Constructs a new DmGroupCreateBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IDmGroupCreateBody);

        /** DmGroupCreateBody groupId. */
        public groupId: string;

        /** DmGroupCreateBody name. */
        public name: string;

        /** DmGroupCreateBody memberTids. */
        public memberTids: (number|Long)[];

        /**
         * Creates a new DmGroupCreateBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DmGroupCreateBody instance
         */
        public static create(properties?: tribe.IDmGroupCreateBody): tribe.DmGroupCreateBody;

        /**
         * Encodes the specified DmGroupCreateBody message. Does not implicitly {@link tribe.DmGroupCreateBody.verify|verify} messages.
         * @param message DmGroupCreateBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IDmGroupCreateBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified DmGroupCreateBody message, length delimited. Does not implicitly {@link tribe.DmGroupCreateBody.verify|verify} messages.
         * @param message DmGroupCreateBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IDmGroupCreateBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DmGroupCreateBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DmGroupCreateBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.DmGroupCreateBody;

        /**
         * Decodes a DmGroupCreateBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns DmGroupCreateBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.DmGroupCreateBody;

        /**
         * Verifies a DmGroupCreateBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DmGroupCreateBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DmGroupCreateBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.DmGroupCreateBody;

        /**
         * Creates a plain object from a DmGroupCreateBody message. Also converts values to other types if specified.
         * @param message DmGroupCreateBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.DmGroupCreateBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DmGroupCreateBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for DmGroupCreateBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a DmGroupCipher. */
    interface IDmGroupCipher {

        /** DmGroupCipher recipientTid */
        recipientTid?: (number|Long|null);

        /** DmGroupCipher ciphertext */
        ciphertext?: (string|null);

        /** DmGroupCipher nonce */
        nonce?: (string|null);
    }

    /** Represents a DmGroupCipher. */
    class DmGroupCipher implements IDmGroupCipher {

        /**
         * Constructs a new DmGroupCipher.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IDmGroupCipher);

        /** DmGroupCipher recipientTid. */
        public recipientTid: (number|Long);

        /** DmGroupCipher ciphertext. */
        public ciphertext: string;

        /** DmGroupCipher nonce. */
        public nonce: string;

        /**
         * Creates a new DmGroupCipher instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DmGroupCipher instance
         */
        public static create(properties?: tribe.IDmGroupCipher): tribe.DmGroupCipher;

        /**
         * Encodes the specified DmGroupCipher message. Does not implicitly {@link tribe.DmGroupCipher.verify|verify} messages.
         * @param message DmGroupCipher message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IDmGroupCipher, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified DmGroupCipher message, length delimited. Does not implicitly {@link tribe.DmGroupCipher.verify|verify} messages.
         * @param message DmGroupCipher message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IDmGroupCipher, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DmGroupCipher message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DmGroupCipher
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.DmGroupCipher;

        /**
         * Decodes a DmGroupCipher message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns DmGroupCipher
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.DmGroupCipher;

        /**
         * Verifies a DmGroupCipher message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DmGroupCipher message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DmGroupCipher
         */
        public static fromObject(object: { [k: string]: any }): tribe.DmGroupCipher;

        /**
         * Creates a plain object from a DmGroupCipher message. Also converts values to other types if specified.
         * @param message DmGroupCipher
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.DmGroupCipher, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DmGroupCipher to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for DmGroupCipher
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a DmGroupSendBody. */
    interface IDmGroupSendBody {

        /** DmGroupSendBody groupId */
        groupId?: (string|null);

        /** DmGroupSendBody senderX25519 */
        senderX25519?: (string|null);

        /** DmGroupSendBody ciphertexts */
        ciphertexts?: (tribe.IDmGroupCipher[]|null);
    }

    /** Represents a DmGroupSendBody. */
    class DmGroupSendBody implements IDmGroupSendBody {

        /**
         * Constructs a new DmGroupSendBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IDmGroupSendBody);

        /** DmGroupSendBody groupId. */
        public groupId: string;

        /** DmGroupSendBody senderX25519. */
        public senderX25519: string;

        /** DmGroupSendBody ciphertexts. */
        public ciphertexts: tribe.IDmGroupCipher[];

        /**
         * Creates a new DmGroupSendBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DmGroupSendBody instance
         */
        public static create(properties?: tribe.IDmGroupSendBody): tribe.DmGroupSendBody;

        /**
         * Encodes the specified DmGroupSendBody message. Does not implicitly {@link tribe.DmGroupSendBody.verify|verify} messages.
         * @param message DmGroupSendBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IDmGroupSendBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified DmGroupSendBody message, length delimited. Does not implicitly {@link tribe.DmGroupSendBody.verify|verify} messages.
         * @param message DmGroupSendBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IDmGroupSendBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DmGroupSendBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DmGroupSendBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.DmGroupSendBody;

        /**
         * Decodes a DmGroupSendBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns DmGroupSendBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.DmGroupSendBody;

        /**
         * Verifies a DmGroupSendBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DmGroupSendBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DmGroupSendBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.DmGroupSendBody;

        /**
         * Creates a plain object from a DmGroupSendBody message. Also converts values to other types if specified.
         * @param message DmGroupSendBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.DmGroupSendBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DmGroupSendBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for DmGroupSendBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a DmReadBody. */
    interface IDmReadBody {

        /** DmReadBody conversationId */
        conversationId?: (string|null);

        /** DmReadBody lastReadHash */
        lastReadHash?: (string|null);
    }

    /** Represents a DmReadBody. */
    class DmReadBody implements IDmReadBody {

        /**
         * Constructs a new DmReadBody.
         * @param [properties] Properties to set
         */
        constructor(properties?: tribe.IDmReadBody);

        /** DmReadBody conversationId. */
        public conversationId: string;

        /** DmReadBody lastReadHash. */
        public lastReadHash: string;

        /**
         * Creates a new DmReadBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DmReadBody instance
         */
        public static create(properties?: tribe.IDmReadBody): tribe.DmReadBody;

        /**
         * Encodes the specified DmReadBody message. Does not implicitly {@link tribe.DmReadBody.verify|verify} messages.
         * @param message DmReadBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: tribe.IDmReadBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified DmReadBody message, length delimited. Does not implicitly {@link tribe.DmReadBody.verify|verify} messages.
         * @param message DmReadBody message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: tribe.IDmReadBody, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DmReadBody message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DmReadBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tribe.DmReadBody;

        /**
         * Decodes a DmReadBody message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns DmReadBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tribe.DmReadBody;

        /**
         * Verifies a DmReadBody message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DmReadBody message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DmReadBody
         */
        public static fromObject(object: { [k: string]: any }): tribe.DmReadBody;

        /**
         * Creates a plain object from a DmReadBody message. Also converts values to other types if specified.
         * @param message DmReadBody
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: tribe.DmReadBody, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DmReadBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for DmReadBody
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** MessageType enum. */
    enum MessageType {
        MESSAGE_TYPE_NONE = 0,
        TWEET_ADD = 1,
        TWEET_REMOVE = 2,
        REACTION_ADD = 3,
        REACTION_REMOVE = 4,
        LINK_ADD = 5,
        LINK_REMOVE = 6,
        USER_DATA_ADD = 7,
        USERNAME_PROOF = 8,
        CHANNEL_ADD = 9,
        CHANNEL_JOIN = 10,
        CHANNEL_LEAVE = 11,
        DM_KEY_REGISTER = 12,
        DM_SEND = 13,
        BOOKMARK_ADD = 14,
        BOOKMARK_REMOVE = 15,
        POLL_ADD = 16,
        POLL_VOTE = 17,
        EVENT_ADD = 18,
        EVENT_RSVP = 19,
        TASK_ADD = 20,
        TASK_CLAIM = 21,
        TASK_COMPLETE = 22,
        CROWDFUND_ADD = 23,
        CROWDFUND_PLEDGE = 24,
        TIP_ADD = 25,
        DM_GROUP_CREATE = 26,
        DM_GROUP_SEND = 27,
        DM_READ = 28
    }

    /** ReactionType enum. */
    enum ReactionType {
        REACTION_TYPE_NONE = 0,
        LIKE = 1,
        RECAST = 2
    }

    /** ChannelKind enum. */
    enum ChannelKind {
        CHANNEL_KIND_NONE = 0,
        GENERAL = 1,
        CITY = 2,
        INTEREST = 3
    }

    /** Network enum. */
    enum Network {
        NETWORK_NONE = 0,
        MAINNET = 1,
        DEVNET = 2
    }
}
