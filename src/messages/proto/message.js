/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.tribe = (function() {

    /**
     * Namespace tribe.
     * @exports tribe
     * @namespace
     */
    var tribe = {};

    tribe.TribeMessage = (function() {

        /**
         * Properties of a TribeMessage.
         * @memberof tribe
         * @interface ITribeMessage
         * @property {number|null} [protocolVersion] TribeMessage protocolVersion
         * @property {tribe.IMessageData|null} [data] TribeMessage data
         * @property {Uint8Array|null} [hash] TribeMessage hash
         * @property {Uint8Array|null} [signature] TribeMessage signature
         * @property {Uint8Array|null} [signer] TribeMessage signer
         */

        /**
         * Constructs a new TribeMessage.
         * @memberof tribe
         * @classdesc Represents a TribeMessage.
         * @implements ITribeMessage
         * @constructor
         * @param {tribe.ITribeMessage=} [properties] Properties to set
         */
        function TribeMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TribeMessage protocolVersion.
         * @member {number} protocolVersion
         * @memberof tribe.TribeMessage
         * @instance
         */
        TribeMessage.prototype.protocolVersion = 0;

        /**
         * TribeMessage data.
         * @member {tribe.IMessageData|null|undefined} data
         * @memberof tribe.TribeMessage
         * @instance
         */
        TribeMessage.prototype.data = null;

        /**
         * TribeMessage hash.
         * @member {Uint8Array} hash
         * @memberof tribe.TribeMessage
         * @instance
         */
        TribeMessage.prototype.hash = $util.newBuffer([]);

        /**
         * TribeMessage signature.
         * @member {Uint8Array} signature
         * @memberof tribe.TribeMessage
         * @instance
         */
        TribeMessage.prototype.signature = $util.newBuffer([]);

        /**
         * TribeMessage signer.
         * @member {Uint8Array} signer
         * @memberof tribe.TribeMessage
         * @instance
         */
        TribeMessage.prototype.signer = $util.newBuffer([]);

        /**
         * Creates a new TribeMessage instance using the specified properties.
         * @function create
         * @memberof tribe.TribeMessage
         * @static
         * @param {tribe.ITribeMessage=} [properties] Properties to set
         * @returns {tribe.TribeMessage} TribeMessage instance
         */
        TribeMessage.create = function create(properties) {
            return new TribeMessage(properties);
        };

        /**
         * Encodes the specified TribeMessage message. Does not implicitly {@link tribe.TribeMessage.verify|verify} messages.
         * @function encode
         * @memberof tribe.TribeMessage
         * @static
         * @param {tribe.ITribeMessage} message TribeMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TribeMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.protocolVersion != null && Object.hasOwnProperty.call(message, "protocolVersion"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.protocolVersion);
            if (message.data != null && Object.hasOwnProperty.call(message, "data"))
                $root.tribe.MessageData.encode(message.data, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.hash != null && Object.hasOwnProperty.call(message, "hash"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.hash);
            if (message.signature != null && Object.hasOwnProperty.call(message, "signature"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.signature);
            if (message.signer != null && Object.hasOwnProperty.call(message, "signer"))
                writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.signer);
            return writer;
        };

        /**
         * Encodes the specified TribeMessage message, length delimited. Does not implicitly {@link tribe.TribeMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.TribeMessage
         * @static
         * @param {tribe.ITribeMessage} message TribeMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TribeMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TribeMessage message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.TribeMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.TribeMessage} TribeMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TribeMessage.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.TribeMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.protocolVersion = reader.uint32();
                        break;
                    }
                case 2: {
                        message.data = $root.tribe.MessageData.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.hash = reader.bytes();
                        break;
                    }
                case 4: {
                        message.signature = reader.bytes();
                        break;
                    }
                case 5: {
                        message.signer = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TribeMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.TribeMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.TribeMessage} TribeMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TribeMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TribeMessage message.
         * @function verify
         * @memberof tribe.TribeMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TribeMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.protocolVersion != null && message.hasOwnProperty("protocolVersion"))
                if (!$util.isInteger(message.protocolVersion))
                    return "protocolVersion: integer expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                var error = $root.tribe.MessageData.verify(message.data);
                if (error)
                    return "data." + error;
            }
            if (message.hash != null && message.hasOwnProperty("hash"))
                if (!(message.hash && typeof message.hash.length === "number" || $util.isString(message.hash)))
                    return "hash: buffer expected";
            if (message.signature != null && message.hasOwnProperty("signature"))
                if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                    return "signature: buffer expected";
            if (message.signer != null && message.hasOwnProperty("signer"))
                if (!(message.signer && typeof message.signer.length === "number" || $util.isString(message.signer)))
                    return "signer: buffer expected";
            return null;
        };

        /**
         * Creates a TribeMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.TribeMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.TribeMessage} TribeMessage
         */
        TribeMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.TribeMessage)
                return object;
            var message = new $root.tribe.TribeMessage();
            if (object.protocolVersion != null)
                message.protocolVersion = object.protocolVersion >>> 0;
            if (object.data != null) {
                if (typeof object.data !== "object")
                    throw TypeError(".tribe.TribeMessage.data: object expected");
                message.data = $root.tribe.MessageData.fromObject(object.data);
            }
            if (object.hash != null)
                if (typeof object.hash === "string")
                    $util.base64.decode(object.hash, message.hash = $util.newBuffer($util.base64.length(object.hash)), 0);
                else if (object.hash.length >= 0)
                    message.hash = object.hash;
            if (object.signature != null)
                if (typeof object.signature === "string")
                    $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
                else if (object.signature.length >= 0)
                    message.signature = object.signature;
            if (object.signer != null)
                if (typeof object.signer === "string")
                    $util.base64.decode(object.signer, message.signer = $util.newBuffer($util.base64.length(object.signer)), 0);
                else if (object.signer.length >= 0)
                    message.signer = object.signer;
            return message;
        };

        /**
         * Creates a plain object from a TribeMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.TribeMessage
         * @static
         * @param {tribe.TribeMessage} message TribeMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TribeMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.protocolVersion = 0;
                object.data = null;
                if (options.bytes === String)
                    object.hash = "";
                else {
                    object.hash = [];
                    if (options.bytes !== Array)
                        object.hash = $util.newBuffer(object.hash);
                }
                if (options.bytes === String)
                    object.signature = "";
                else {
                    object.signature = [];
                    if (options.bytes !== Array)
                        object.signature = $util.newBuffer(object.signature);
                }
                if (options.bytes === String)
                    object.signer = "";
                else {
                    object.signer = [];
                    if (options.bytes !== Array)
                        object.signer = $util.newBuffer(object.signer);
                }
            }
            if (message.protocolVersion != null && message.hasOwnProperty("protocolVersion"))
                object.protocolVersion = message.protocolVersion;
            if (message.data != null && message.hasOwnProperty("data"))
                object.data = $root.tribe.MessageData.toObject(message.data, options);
            if (message.hash != null && message.hasOwnProperty("hash"))
                object.hash = options.bytes === String ? $util.base64.encode(message.hash, 0, message.hash.length) : options.bytes === Array ? Array.prototype.slice.call(message.hash) : message.hash;
            if (message.signature != null && message.hasOwnProperty("signature"))
                object.signature = options.bytes === String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.signature) : message.signature;
            if (message.signer != null && message.hasOwnProperty("signer"))
                object.signer = options.bytes === String ? $util.base64.encode(message.signer, 0, message.signer.length) : options.bytes === Array ? Array.prototype.slice.call(message.signer) : message.signer;
            return object;
        };

        /**
         * Converts this TribeMessage to JSON.
         * @function toJSON
         * @memberof tribe.TribeMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TribeMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TribeMessage
         * @function getTypeUrl
         * @memberof tribe.TribeMessage
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TribeMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.TribeMessage";
        };

        return TribeMessage;
    })();

    tribe.MessageData = (function() {

        /**
         * Properties of a MessageData.
         * @memberof tribe
         * @interface IMessageData
         * @property {tribe.MessageType|null} [type] MessageData type
         * @property {number|Long|null} [tid] MessageData tid
         * @property {number|null} [timestamp] MessageData timestamp
         * @property {tribe.Network|null} [network] MessageData network
         * @property {tribe.ITweetAddBody|null} [tweetAdd] MessageData tweetAdd
         * @property {tribe.ITweetRemoveBody|null} [tweetRemove] MessageData tweetRemove
         * @property {tribe.IReactionBody|null} [reaction] MessageData reaction
         * @property {tribe.IUserDataBody|null} [userData] MessageData userData
         * @property {tribe.IDmKeyRegisterBody|null} [dmKeyRegister] MessageData dmKeyRegister
         * @property {tribe.IDmSendBody|null} [dmSend] MessageData dmSend
         * @property {tribe.IBookmarkBody|null} [bookmark] MessageData bookmark
         * @property {tribe.IChannelAddBody|null} [channelAdd] MessageData channelAdd
         * @property {tribe.IChannelMembershipBody|null} [channelMembership] MessageData channelMembership
         * @property {tribe.IPollAddBody|null} [pollAdd] MessageData pollAdd
         * @property {tribe.IPollVoteBody|null} [pollVote] MessageData pollVote
         * @property {tribe.IEventAddBody|null} [eventAdd] MessageData eventAdd
         * @property {tribe.IEventRsvpBody|null} [eventRsvp] MessageData eventRsvp
         * @property {tribe.ITaskAddBody|null} [taskAdd] MessageData taskAdd
         * @property {tribe.ITaskTransitionBody|null} [taskTransition] MessageData taskTransition
         * @property {tribe.ICrowdfundAddBody|null} [crowdfundAdd] MessageData crowdfundAdd
         * @property {tribe.ICrowdfundPledgeBody|null} [crowdfundPledge] MessageData crowdfundPledge
         * @property {tribe.ITipAddBody|null} [tipAdd] MessageData tipAdd
         * @property {tribe.IDmGroupCreateBody|null} [dmGroupCreate] MessageData dmGroupCreate
         * @property {tribe.IDmGroupSendBody|null} [dmGroupSend] MessageData dmGroupSend
         * @property {tribe.IDmReadBody|null} [dmRead] MessageData dmRead
         */

        /**
         * Constructs a new MessageData.
         * @memberof tribe
         * @classdesc Represents a MessageData.
         * @implements IMessageData
         * @constructor
         * @param {tribe.IMessageData=} [properties] Properties to set
         */
        function MessageData(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageData type.
         * @member {tribe.MessageType} type
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.type = 0;

        /**
         * MessageData tid.
         * @member {number|Long} tid
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.tid = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * MessageData timestamp.
         * @member {number} timestamp
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.timestamp = 0;

        /**
         * MessageData network.
         * @member {tribe.Network} network
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.network = 0;

        /**
         * MessageData tweetAdd.
         * @member {tribe.ITweetAddBody|null|undefined} tweetAdd
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.tweetAdd = null;

        /**
         * MessageData tweetRemove.
         * @member {tribe.ITweetRemoveBody|null|undefined} tweetRemove
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.tweetRemove = null;

        /**
         * MessageData reaction.
         * @member {tribe.IReactionBody|null|undefined} reaction
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.reaction = null;

        /**
         * MessageData userData.
         * @member {tribe.IUserDataBody|null|undefined} userData
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.userData = null;

        /**
         * MessageData dmKeyRegister.
         * @member {tribe.IDmKeyRegisterBody|null|undefined} dmKeyRegister
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.dmKeyRegister = null;

        /**
         * MessageData dmSend.
         * @member {tribe.IDmSendBody|null|undefined} dmSend
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.dmSend = null;

        /**
         * MessageData bookmark.
         * @member {tribe.IBookmarkBody|null|undefined} bookmark
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.bookmark = null;

        /**
         * MessageData channelAdd.
         * @member {tribe.IChannelAddBody|null|undefined} channelAdd
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.channelAdd = null;

        /**
         * MessageData channelMembership.
         * @member {tribe.IChannelMembershipBody|null|undefined} channelMembership
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.channelMembership = null;

        /**
         * MessageData pollAdd.
         * @member {tribe.IPollAddBody|null|undefined} pollAdd
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.pollAdd = null;

        /**
         * MessageData pollVote.
         * @member {tribe.IPollVoteBody|null|undefined} pollVote
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.pollVote = null;

        /**
         * MessageData eventAdd.
         * @member {tribe.IEventAddBody|null|undefined} eventAdd
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.eventAdd = null;

        /**
         * MessageData eventRsvp.
         * @member {tribe.IEventRsvpBody|null|undefined} eventRsvp
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.eventRsvp = null;

        /**
         * MessageData taskAdd.
         * @member {tribe.ITaskAddBody|null|undefined} taskAdd
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.taskAdd = null;

        /**
         * MessageData taskTransition.
         * @member {tribe.ITaskTransitionBody|null|undefined} taskTransition
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.taskTransition = null;

        /**
         * MessageData crowdfundAdd.
         * @member {tribe.ICrowdfundAddBody|null|undefined} crowdfundAdd
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.crowdfundAdd = null;

        /**
         * MessageData crowdfundPledge.
         * @member {tribe.ICrowdfundPledgeBody|null|undefined} crowdfundPledge
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.crowdfundPledge = null;

        /**
         * MessageData tipAdd.
         * @member {tribe.ITipAddBody|null|undefined} tipAdd
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.tipAdd = null;

        /**
         * MessageData dmGroupCreate.
         * @member {tribe.IDmGroupCreateBody|null|undefined} dmGroupCreate
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.dmGroupCreate = null;

        /**
         * MessageData dmGroupSend.
         * @member {tribe.IDmGroupSendBody|null|undefined} dmGroupSend
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.dmGroupSend = null;

        /**
         * MessageData dmRead.
         * @member {tribe.IDmReadBody|null|undefined} dmRead
         * @memberof tribe.MessageData
         * @instance
         */
        MessageData.prototype.dmRead = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * MessageData body.
         * @member {"tweetAdd"|"tweetRemove"|"reaction"|"userData"|"dmKeyRegister"|"dmSend"|"bookmark"|"channelAdd"|"channelMembership"|"pollAdd"|"pollVote"|"eventAdd"|"eventRsvp"|"taskAdd"|"taskTransition"|"crowdfundAdd"|"crowdfundPledge"|"tipAdd"|"dmGroupCreate"|"dmGroupSend"|"dmRead"|undefined} body
         * @memberof tribe.MessageData
         * @instance
         */
        Object.defineProperty(MessageData.prototype, "body", {
            get: $util.oneOfGetter($oneOfFields = ["tweetAdd", "tweetRemove", "reaction", "userData", "dmKeyRegister", "dmSend", "bookmark", "channelAdd", "channelMembership", "pollAdd", "pollVote", "eventAdd", "eventRsvp", "taskAdd", "taskTransition", "crowdfundAdd", "crowdfundPledge", "tipAdd", "dmGroupCreate", "dmGroupSend", "dmRead"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new MessageData instance using the specified properties.
         * @function create
         * @memberof tribe.MessageData
         * @static
         * @param {tribe.IMessageData=} [properties] Properties to set
         * @returns {tribe.MessageData} MessageData instance
         */
        MessageData.create = function create(properties) {
            return new MessageData(properties);
        };

        /**
         * Encodes the specified MessageData message. Does not implicitly {@link tribe.MessageData.verify|verify} messages.
         * @function encode
         * @memberof tribe.MessageData
         * @static
         * @param {tribe.IMessageData} message MessageData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
            if (message.tid != null && Object.hasOwnProperty.call(message, "tid"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.tid);
            if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.timestamp);
            if (message.network != null && Object.hasOwnProperty.call(message, "network"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.network);
            if (message.tweetAdd != null && Object.hasOwnProperty.call(message, "tweetAdd"))
                $root.tribe.TweetAddBody.encode(message.tweetAdd, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.tweetRemove != null && Object.hasOwnProperty.call(message, "tweetRemove"))
                $root.tribe.TweetRemoveBody.encode(message.tweetRemove, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.reaction != null && Object.hasOwnProperty.call(message, "reaction"))
                $root.tribe.ReactionBody.encode(message.reaction, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.userData != null && Object.hasOwnProperty.call(message, "userData"))
                $root.tribe.UserDataBody.encode(message.userData, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.dmKeyRegister != null && Object.hasOwnProperty.call(message, "dmKeyRegister"))
                $root.tribe.DmKeyRegisterBody.encode(message.dmKeyRegister, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.dmSend != null && Object.hasOwnProperty.call(message, "dmSend"))
                $root.tribe.DmSendBody.encode(message.dmSend, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.bookmark != null && Object.hasOwnProperty.call(message, "bookmark"))
                $root.tribe.BookmarkBody.encode(message.bookmark, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            if (message.channelAdd != null && Object.hasOwnProperty.call(message, "channelAdd"))
                $root.tribe.ChannelAddBody.encode(message.channelAdd, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
            if (message.channelMembership != null && Object.hasOwnProperty.call(message, "channelMembership"))
                $root.tribe.ChannelMembershipBody.encode(message.channelMembership, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
            if (message.pollAdd != null && Object.hasOwnProperty.call(message, "pollAdd"))
                $root.tribe.PollAddBody.encode(message.pollAdd, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
            if (message.pollVote != null && Object.hasOwnProperty.call(message, "pollVote"))
                $root.tribe.PollVoteBody.encode(message.pollVote, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
            if (message.eventAdd != null && Object.hasOwnProperty.call(message, "eventAdd"))
                $root.tribe.EventAddBody.encode(message.eventAdd, writer.uint32(/* id 16, wireType 2 =*/130).fork()).ldelim();
            if (message.eventRsvp != null && Object.hasOwnProperty.call(message, "eventRsvp"))
                $root.tribe.EventRsvpBody.encode(message.eventRsvp, writer.uint32(/* id 17, wireType 2 =*/138).fork()).ldelim();
            if (message.taskAdd != null && Object.hasOwnProperty.call(message, "taskAdd"))
                $root.tribe.TaskAddBody.encode(message.taskAdd, writer.uint32(/* id 18, wireType 2 =*/146).fork()).ldelim();
            if (message.taskTransition != null && Object.hasOwnProperty.call(message, "taskTransition"))
                $root.tribe.TaskTransitionBody.encode(message.taskTransition, writer.uint32(/* id 19, wireType 2 =*/154).fork()).ldelim();
            if (message.crowdfundAdd != null && Object.hasOwnProperty.call(message, "crowdfundAdd"))
                $root.tribe.CrowdfundAddBody.encode(message.crowdfundAdd, writer.uint32(/* id 20, wireType 2 =*/162).fork()).ldelim();
            if (message.crowdfundPledge != null && Object.hasOwnProperty.call(message, "crowdfundPledge"))
                $root.tribe.CrowdfundPledgeBody.encode(message.crowdfundPledge, writer.uint32(/* id 21, wireType 2 =*/170).fork()).ldelim();
            if (message.tipAdd != null && Object.hasOwnProperty.call(message, "tipAdd"))
                $root.tribe.TipAddBody.encode(message.tipAdd, writer.uint32(/* id 22, wireType 2 =*/178).fork()).ldelim();
            if (message.dmGroupCreate != null && Object.hasOwnProperty.call(message, "dmGroupCreate"))
                $root.tribe.DmGroupCreateBody.encode(message.dmGroupCreate, writer.uint32(/* id 23, wireType 2 =*/186).fork()).ldelim();
            if (message.dmGroupSend != null && Object.hasOwnProperty.call(message, "dmGroupSend"))
                $root.tribe.DmGroupSendBody.encode(message.dmGroupSend, writer.uint32(/* id 24, wireType 2 =*/194).fork()).ldelim();
            if (message.dmRead != null && Object.hasOwnProperty.call(message, "dmRead"))
                $root.tribe.DmReadBody.encode(message.dmRead, writer.uint32(/* id 25, wireType 2 =*/202).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified MessageData message, length delimited. Does not implicitly {@link tribe.MessageData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.MessageData
         * @static
         * @param {tribe.IMessageData} message MessageData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageData message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.MessageData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.MessageData} MessageData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageData.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.MessageData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.type = reader.int32();
                        break;
                    }
                case 2: {
                        message.tid = reader.uint64();
                        break;
                    }
                case 3: {
                        message.timestamp = reader.uint32();
                        break;
                    }
                case 4: {
                        message.network = reader.int32();
                        break;
                    }
                case 5: {
                        message.tweetAdd = $root.tribe.TweetAddBody.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.tweetRemove = $root.tribe.TweetRemoveBody.decode(reader, reader.uint32());
                        break;
                    }
                case 7: {
                        message.reaction = $root.tribe.ReactionBody.decode(reader, reader.uint32());
                        break;
                    }
                case 8: {
                        message.userData = $root.tribe.UserDataBody.decode(reader, reader.uint32());
                        break;
                    }
                case 9: {
                        message.dmKeyRegister = $root.tribe.DmKeyRegisterBody.decode(reader, reader.uint32());
                        break;
                    }
                case 10: {
                        message.dmSend = $root.tribe.DmSendBody.decode(reader, reader.uint32());
                        break;
                    }
                case 11: {
                        message.bookmark = $root.tribe.BookmarkBody.decode(reader, reader.uint32());
                        break;
                    }
                case 12: {
                        message.channelAdd = $root.tribe.ChannelAddBody.decode(reader, reader.uint32());
                        break;
                    }
                case 13: {
                        message.channelMembership = $root.tribe.ChannelMembershipBody.decode(reader, reader.uint32());
                        break;
                    }
                case 14: {
                        message.pollAdd = $root.tribe.PollAddBody.decode(reader, reader.uint32());
                        break;
                    }
                case 15: {
                        message.pollVote = $root.tribe.PollVoteBody.decode(reader, reader.uint32());
                        break;
                    }
                case 16: {
                        message.eventAdd = $root.tribe.EventAddBody.decode(reader, reader.uint32());
                        break;
                    }
                case 17: {
                        message.eventRsvp = $root.tribe.EventRsvpBody.decode(reader, reader.uint32());
                        break;
                    }
                case 18: {
                        message.taskAdd = $root.tribe.TaskAddBody.decode(reader, reader.uint32());
                        break;
                    }
                case 19: {
                        message.taskTransition = $root.tribe.TaskTransitionBody.decode(reader, reader.uint32());
                        break;
                    }
                case 20: {
                        message.crowdfundAdd = $root.tribe.CrowdfundAddBody.decode(reader, reader.uint32());
                        break;
                    }
                case 21: {
                        message.crowdfundPledge = $root.tribe.CrowdfundPledgeBody.decode(reader, reader.uint32());
                        break;
                    }
                case 22: {
                        message.tipAdd = $root.tribe.TipAddBody.decode(reader, reader.uint32());
                        break;
                    }
                case 23: {
                        message.dmGroupCreate = $root.tribe.DmGroupCreateBody.decode(reader, reader.uint32());
                        break;
                    }
                case 24: {
                        message.dmGroupSend = $root.tribe.DmGroupSendBody.decode(reader, reader.uint32());
                        break;
                    }
                case 25: {
                        message.dmRead = $root.tribe.DmReadBody.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.MessageData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.MessageData} MessageData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageData message.
         * @function verify
         * @memberof tribe.MessageData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.type != null && message.hasOwnProperty("type"))
                switch (message.type) {
                default:
                    return "type: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                case 16:
                case 17:
                case 18:
                case 19:
                case 20:
                case 21:
                case 22:
                case 23:
                case 24:
                case 25:
                case 26:
                case 27:
                case 28:
                    break;
                }
            if (message.tid != null && message.hasOwnProperty("tid"))
                if (!$util.isInteger(message.tid) && !(message.tid && $util.isInteger(message.tid.low) && $util.isInteger(message.tid.high)))
                    return "tid: integer|Long expected";
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (!$util.isInteger(message.timestamp))
                    return "timestamp: integer expected";
            if (message.network != null && message.hasOwnProperty("network"))
                switch (message.network) {
                default:
                    return "network: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.tweetAdd != null && message.hasOwnProperty("tweetAdd")) {
                properties.body = 1;
                {
                    var error = $root.tribe.TweetAddBody.verify(message.tweetAdd);
                    if (error)
                        return "tweetAdd." + error;
                }
            }
            if (message.tweetRemove != null && message.hasOwnProperty("tweetRemove")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.TweetRemoveBody.verify(message.tweetRemove);
                    if (error)
                        return "tweetRemove." + error;
                }
            }
            if (message.reaction != null && message.hasOwnProperty("reaction")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.ReactionBody.verify(message.reaction);
                    if (error)
                        return "reaction." + error;
                }
            }
            if (message.userData != null && message.hasOwnProperty("userData")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.UserDataBody.verify(message.userData);
                    if (error)
                        return "userData." + error;
                }
            }
            if (message.dmKeyRegister != null && message.hasOwnProperty("dmKeyRegister")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.DmKeyRegisterBody.verify(message.dmKeyRegister);
                    if (error)
                        return "dmKeyRegister." + error;
                }
            }
            if (message.dmSend != null && message.hasOwnProperty("dmSend")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.DmSendBody.verify(message.dmSend);
                    if (error)
                        return "dmSend." + error;
                }
            }
            if (message.bookmark != null && message.hasOwnProperty("bookmark")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.BookmarkBody.verify(message.bookmark);
                    if (error)
                        return "bookmark." + error;
                }
            }
            if (message.channelAdd != null && message.hasOwnProperty("channelAdd")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.ChannelAddBody.verify(message.channelAdd);
                    if (error)
                        return "channelAdd." + error;
                }
            }
            if (message.channelMembership != null && message.hasOwnProperty("channelMembership")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.ChannelMembershipBody.verify(message.channelMembership);
                    if (error)
                        return "channelMembership." + error;
                }
            }
            if (message.pollAdd != null && message.hasOwnProperty("pollAdd")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.PollAddBody.verify(message.pollAdd);
                    if (error)
                        return "pollAdd." + error;
                }
            }
            if (message.pollVote != null && message.hasOwnProperty("pollVote")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.PollVoteBody.verify(message.pollVote);
                    if (error)
                        return "pollVote." + error;
                }
            }
            if (message.eventAdd != null && message.hasOwnProperty("eventAdd")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.EventAddBody.verify(message.eventAdd);
                    if (error)
                        return "eventAdd." + error;
                }
            }
            if (message.eventRsvp != null && message.hasOwnProperty("eventRsvp")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.EventRsvpBody.verify(message.eventRsvp);
                    if (error)
                        return "eventRsvp." + error;
                }
            }
            if (message.taskAdd != null && message.hasOwnProperty("taskAdd")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.TaskAddBody.verify(message.taskAdd);
                    if (error)
                        return "taskAdd." + error;
                }
            }
            if (message.taskTransition != null && message.hasOwnProperty("taskTransition")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.TaskTransitionBody.verify(message.taskTransition);
                    if (error)
                        return "taskTransition." + error;
                }
            }
            if (message.crowdfundAdd != null && message.hasOwnProperty("crowdfundAdd")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.CrowdfundAddBody.verify(message.crowdfundAdd);
                    if (error)
                        return "crowdfundAdd." + error;
                }
            }
            if (message.crowdfundPledge != null && message.hasOwnProperty("crowdfundPledge")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.CrowdfundPledgeBody.verify(message.crowdfundPledge);
                    if (error)
                        return "crowdfundPledge." + error;
                }
            }
            if (message.tipAdd != null && message.hasOwnProperty("tipAdd")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.TipAddBody.verify(message.tipAdd);
                    if (error)
                        return "tipAdd." + error;
                }
            }
            if (message.dmGroupCreate != null && message.hasOwnProperty("dmGroupCreate")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.DmGroupCreateBody.verify(message.dmGroupCreate);
                    if (error)
                        return "dmGroupCreate." + error;
                }
            }
            if (message.dmGroupSend != null && message.hasOwnProperty("dmGroupSend")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.DmGroupSendBody.verify(message.dmGroupSend);
                    if (error)
                        return "dmGroupSend." + error;
                }
            }
            if (message.dmRead != null && message.hasOwnProperty("dmRead")) {
                if (properties.body === 1)
                    return "body: multiple values";
                properties.body = 1;
                {
                    var error = $root.tribe.DmReadBody.verify(message.dmRead);
                    if (error)
                        return "dmRead." + error;
                }
            }
            return null;
        };

        /**
         * Creates a MessageData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.MessageData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.MessageData} MessageData
         */
        MessageData.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.MessageData)
                return object;
            var message = new $root.tribe.MessageData();
            switch (object.type) {
            default:
                if (typeof object.type === "number") {
                    message.type = object.type;
                    break;
                }
                break;
            case "MESSAGE_TYPE_NONE":
            case 0:
                message.type = 0;
                break;
            case "TWEET_ADD":
            case 1:
                message.type = 1;
                break;
            case "TWEET_REMOVE":
            case 2:
                message.type = 2;
                break;
            case "REACTION_ADD":
            case 3:
                message.type = 3;
                break;
            case "REACTION_REMOVE":
            case 4:
                message.type = 4;
                break;
            case "LINK_ADD":
            case 5:
                message.type = 5;
                break;
            case "LINK_REMOVE":
            case 6:
                message.type = 6;
                break;
            case "USER_DATA_ADD":
            case 7:
                message.type = 7;
                break;
            case "USERNAME_PROOF":
            case 8:
                message.type = 8;
                break;
            case "CHANNEL_ADD":
            case 9:
                message.type = 9;
                break;
            case "CHANNEL_JOIN":
            case 10:
                message.type = 10;
                break;
            case "CHANNEL_LEAVE":
            case 11:
                message.type = 11;
                break;
            case "DM_KEY_REGISTER":
            case 12:
                message.type = 12;
                break;
            case "DM_SEND":
            case 13:
                message.type = 13;
                break;
            case "BOOKMARK_ADD":
            case 14:
                message.type = 14;
                break;
            case "BOOKMARK_REMOVE":
            case 15:
                message.type = 15;
                break;
            case "POLL_ADD":
            case 16:
                message.type = 16;
                break;
            case "POLL_VOTE":
            case 17:
                message.type = 17;
                break;
            case "EVENT_ADD":
            case 18:
                message.type = 18;
                break;
            case "EVENT_RSVP":
            case 19:
                message.type = 19;
                break;
            case "TASK_ADD":
            case 20:
                message.type = 20;
                break;
            case "TASK_CLAIM":
            case 21:
                message.type = 21;
                break;
            case "TASK_COMPLETE":
            case 22:
                message.type = 22;
                break;
            case "CROWDFUND_ADD":
            case 23:
                message.type = 23;
                break;
            case "CROWDFUND_PLEDGE":
            case 24:
                message.type = 24;
                break;
            case "TIP_ADD":
            case 25:
                message.type = 25;
                break;
            case "DM_GROUP_CREATE":
            case 26:
                message.type = 26;
                break;
            case "DM_GROUP_SEND":
            case 27:
                message.type = 27;
                break;
            case "DM_READ":
            case 28:
                message.type = 28;
                break;
            }
            if (object.tid != null)
                if ($util.Long)
                    (message.tid = $util.Long.fromValue(object.tid)).unsigned = true;
                else if (typeof object.tid === "string")
                    message.tid = parseInt(object.tid, 10);
                else if (typeof object.tid === "number")
                    message.tid = object.tid;
                else if (typeof object.tid === "object")
                    message.tid = new $util.LongBits(object.tid.low >>> 0, object.tid.high >>> 0).toNumber(true);
            if (object.timestamp != null)
                message.timestamp = object.timestamp >>> 0;
            switch (object.network) {
            default:
                if (typeof object.network === "number") {
                    message.network = object.network;
                    break;
                }
                break;
            case "NETWORK_NONE":
            case 0:
                message.network = 0;
                break;
            case "MAINNET":
            case 1:
                message.network = 1;
                break;
            case "DEVNET":
            case 2:
                message.network = 2;
                break;
            }
            if (object.tweetAdd != null) {
                if (typeof object.tweetAdd !== "object")
                    throw TypeError(".tribe.MessageData.tweetAdd: object expected");
                message.tweetAdd = $root.tribe.TweetAddBody.fromObject(object.tweetAdd);
            }
            if (object.tweetRemove != null) {
                if (typeof object.tweetRemove !== "object")
                    throw TypeError(".tribe.MessageData.tweetRemove: object expected");
                message.tweetRemove = $root.tribe.TweetRemoveBody.fromObject(object.tweetRemove);
            }
            if (object.reaction != null) {
                if (typeof object.reaction !== "object")
                    throw TypeError(".tribe.MessageData.reaction: object expected");
                message.reaction = $root.tribe.ReactionBody.fromObject(object.reaction);
            }
            if (object.userData != null) {
                if (typeof object.userData !== "object")
                    throw TypeError(".tribe.MessageData.userData: object expected");
                message.userData = $root.tribe.UserDataBody.fromObject(object.userData);
            }
            if (object.dmKeyRegister != null) {
                if (typeof object.dmKeyRegister !== "object")
                    throw TypeError(".tribe.MessageData.dmKeyRegister: object expected");
                message.dmKeyRegister = $root.tribe.DmKeyRegisterBody.fromObject(object.dmKeyRegister);
            }
            if (object.dmSend != null) {
                if (typeof object.dmSend !== "object")
                    throw TypeError(".tribe.MessageData.dmSend: object expected");
                message.dmSend = $root.tribe.DmSendBody.fromObject(object.dmSend);
            }
            if (object.bookmark != null) {
                if (typeof object.bookmark !== "object")
                    throw TypeError(".tribe.MessageData.bookmark: object expected");
                message.bookmark = $root.tribe.BookmarkBody.fromObject(object.bookmark);
            }
            if (object.channelAdd != null) {
                if (typeof object.channelAdd !== "object")
                    throw TypeError(".tribe.MessageData.channelAdd: object expected");
                message.channelAdd = $root.tribe.ChannelAddBody.fromObject(object.channelAdd);
            }
            if (object.channelMembership != null) {
                if (typeof object.channelMembership !== "object")
                    throw TypeError(".tribe.MessageData.channelMembership: object expected");
                message.channelMembership = $root.tribe.ChannelMembershipBody.fromObject(object.channelMembership);
            }
            if (object.pollAdd != null) {
                if (typeof object.pollAdd !== "object")
                    throw TypeError(".tribe.MessageData.pollAdd: object expected");
                message.pollAdd = $root.tribe.PollAddBody.fromObject(object.pollAdd);
            }
            if (object.pollVote != null) {
                if (typeof object.pollVote !== "object")
                    throw TypeError(".tribe.MessageData.pollVote: object expected");
                message.pollVote = $root.tribe.PollVoteBody.fromObject(object.pollVote);
            }
            if (object.eventAdd != null) {
                if (typeof object.eventAdd !== "object")
                    throw TypeError(".tribe.MessageData.eventAdd: object expected");
                message.eventAdd = $root.tribe.EventAddBody.fromObject(object.eventAdd);
            }
            if (object.eventRsvp != null) {
                if (typeof object.eventRsvp !== "object")
                    throw TypeError(".tribe.MessageData.eventRsvp: object expected");
                message.eventRsvp = $root.tribe.EventRsvpBody.fromObject(object.eventRsvp);
            }
            if (object.taskAdd != null) {
                if (typeof object.taskAdd !== "object")
                    throw TypeError(".tribe.MessageData.taskAdd: object expected");
                message.taskAdd = $root.tribe.TaskAddBody.fromObject(object.taskAdd);
            }
            if (object.taskTransition != null) {
                if (typeof object.taskTransition !== "object")
                    throw TypeError(".tribe.MessageData.taskTransition: object expected");
                message.taskTransition = $root.tribe.TaskTransitionBody.fromObject(object.taskTransition);
            }
            if (object.crowdfundAdd != null) {
                if (typeof object.crowdfundAdd !== "object")
                    throw TypeError(".tribe.MessageData.crowdfundAdd: object expected");
                message.crowdfundAdd = $root.tribe.CrowdfundAddBody.fromObject(object.crowdfundAdd);
            }
            if (object.crowdfundPledge != null) {
                if (typeof object.crowdfundPledge !== "object")
                    throw TypeError(".tribe.MessageData.crowdfundPledge: object expected");
                message.crowdfundPledge = $root.tribe.CrowdfundPledgeBody.fromObject(object.crowdfundPledge);
            }
            if (object.tipAdd != null) {
                if (typeof object.tipAdd !== "object")
                    throw TypeError(".tribe.MessageData.tipAdd: object expected");
                message.tipAdd = $root.tribe.TipAddBody.fromObject(object.tipAdd);
            }
            if (object.dmGroupCreate != null) {
                if (typeof object.dmGroupCreate !== "object")
                    throw TypeError(".tribe.MessageData.dmGroupCreate: object expected");
                message.dmGroupCreate = $root.tribe.DmGroupCreateBody.fromObject(object.dmGroupCreate);
            }
            if (object.dmGroupSend != null) {
                if (typeof object.dmGroupSend !== "object")
                    throw TypeError(".tribe.MessageData.dmGroupSend: object expected");
                message.dmGroupSend = $root.tribe.DmGroupSendBody.fromObject(object.dmGroupSend);
            }
            if (object.dmRead != null) {
                if (typeof object.dmRead !== "object")
                    throw TypeError(".tribe.MessageData.dmRead: object expected");
                message.dmRead = $root.tribe.DmReadBody.fromObject(object.dmRead);
            }
            return message;
        };

        /**
         * Creates a plain object from a MessageData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.MessageData
         * @static
         * @param {tribe.MessageData} message MessageData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.type = options.enums === String ? "MESSAGE_TYPE_NONE" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.tid = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.tid = options.longs === String ? "0" : 0;
                object.timestamp = 0;
                object.network = options.enums === String ? "NETWORK_NONE" : 0;
            }
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = options.enums === String ? $root.tribe.MessageType[message.type] === undefined ? message.type : $root.tribe.MessageType[message.type] : message.type;
            if (message.tid != null && message.hasOwnProperty("tid"))
                if (typeof message.tid === "number")
                    object.tid = options.longs === String ? String(message.tid) : message.tid;
                else
                    object.tid = options.longs === String ? $util.Long.prototype.toString.call(message.tid) : options.longs === Number ? new $util.LongBits(message.tid.low >>> 0, message.tid.high >>> 0).toNumber(true) : message.tid;
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                object.timestamp = message.timestamp;
            if (message.network != null && message.hasOwnProperty("network"))
                object.network = options.enums === String ? $root.tribe.Network[message.network] === undefined ? message.network : $root.tribe.Network[message.network] : message.network;
            if (message.tweetAdd != null && message.hasOwnProperty("tweetAdd")) {
                object.tweetAdd = $root.tribe.TweetAddBody.toObject(message.tweetAdd, options);
                if (options.oneofs)
                    object.body = "tweetAdd";
            }
            if (message.tweetRemove != null && message.hasOwnProperty("tweetRemove")) {
                object.tweetRemove = $root.tribe.TweetRemoveBody.toObject(message.tweetRemove, options);
                if (options.oneofs)
                    object.body = "tweetRemove";
            }
            if (message.reaction != null && message.hasOwnProperty("reaction")) {
                object.reaction = $root.tribe.ReactionBody.toObject(message.reaction, options);
                if (options.oneofs)
                    object.body = "reaction";
            }
            if (message.userData != null && message.hasOwnProperty("userData")) {
                object.userData = $root.tribe.UserDataBody.toObject(message.userData, options);
                if (options.oneofs)
                    object.body = "userData";
            }
            if (message.dmKeyRegister != null && message.hasOwnProperty("dmKeyRegister")) {
                object.dmKeyRegister = $root.tribe.DmKeyRegisterBody.toObject(message.dmKeyRegister, options);
                if (options.oneofs)
                    object.body = "dmKeyRegister";
            }
            if (message.dmSend != null && message.hasOwnProperty("dmSend")) {
                object.dmSend = $root.tribe.DmSendBody.toObject(message.dmSend, options);
                if (options.oneofs)
                    object.body = "dmSend";
            }
            if (message.bookmark != null && message.hasOwnProperty("bookmark")) {
                object.bookmark = $root.tribe.BookmarkBody.toObject(message.bookmark, options);
                if (options.oneofs)
                    object.body = "bookmark";
            }
            if (message.channelAdd != null && message.hasOwnProperty("channelAdd")) {
                object.channelAdd = $root.tribe.ChannelAddBody.toObject(message.channelAdd, options);
                if (options.oneofs)
                    object.body = "channelAdd";
            }
            if (message.channelMembership != null && message.hasOwnProperty("channelMembership")) {
                object.channelMembership = $root.tribe.ChannelMembershipBody.toObject(message.channelMembership, options);
                if (options.oneofs)
                    object.body = "channelMembership";
            }
            if (message.pollAdd != null && message.hasOwnProperty("pollAdd")) {
                object.pollAdd = $root.tribe.PollAddBody.toObject(message.pollAdd, options);
                if (options.oneofs)
                    object.body = "pollAdd";
            }
            if (message.pollVote != null && message.hasOwnProperty("pollVote")) {
                object.pollVote = $root.tribe.PollVoteBody.toObject(message.pollVote, options);
                if (options.oneofs)
                    object.body = "pollVote";
            }
            if (message.eventAdd != null && message.hasOwnProperty("eventAdd")) {
                object.eventAdd = $root.tribe.EventAddBody.toObject(message.eventAdd, options);
                if (options.oneofs)
                    object.body = "eventAdd";
            }
            if (message.eventRsvp != null && message.hasOwnProperty("eventRsvp")) {
                object.eventRsvp = $root.tribe.EventRsvpBody.toObject(message.eventRsvp, options);
                if (options.oneofs)
                    object.body = "eventRsvp";
            }
            if (message.taskAdd != null && message.hasOwnProperty("taskAdd")) {
                object.taskAdd = $root.tribe.TaskAddBody.toObject(message.taskAdd, options);
                if (options.oneofs)
                    object.body = "taskAdd";
            }
            if (message.taskTransition != null && message.hasOwnProperty("taskTransition")) {
                object.taskTransition = $root.tribe.TaskTransitionBody.toObject(message.taskTransition, options);
                if (options.oneofs)
                    object.body = "taskTransition";
            }
            if (message.crowdfundAdd != null && message.hasOwnProperty("crowdfundAdd")) {
                object.crowdfundAdd = $root.tribe.CrowdfundAddBody.toObject(message.crowdfundAdd, options);
                if (options.oneofs)
                    object.body = "crowdfundAdd";
            }
            if (message.crowdfundPledge != null && message.hasOwnProperty("crowdfundPledge")) {
                object.crowdfundPledge = $root.tribe.CrowdfundPledgeBody.toObject(message.crowdfundPledge, options);
                if (options.oneofs)
                    object.body = "crowdfundPledge";
            }
            if (message.tipAdd != null && message.hasOwnProperty("tipAdd")) {
                object.tipAdd = $root.tribe.TipAddBody.toObject(message.tipAdd, options);
                if (options.oneofs)
                    object.body = "tipAdd";
            }
            if (message.dmGroupCreate != null && message.hasOwnProperty("dmGroupCreate")) {
                object.dmGroupCreate = $root.tribe.DmGroupCreateBody.toObject(message.dmGroupCreate, options);
                if (options.oneofs)
                    object.body = "dmGroupCreate";
            }
            if (message.dmGroupSend != null && message.hasOwnProperty("dmGroupSend")) {
                object.dmGroupSend = $root.tribe.DmGroupSendBody.toObject(message.dmGroupSend, options);
                if (options.oneofs)
                    object.body = "dmGroupSend";
            }
            if (message.dmRead != null && message.hasOwnProperty("dmRead")) {
                object.dmRead = $root.tribe.DmReadBody.toObject(message.dmRead, options);
                if (options.oneofs)
                    object.body = "dmRead";
            }
            return object;
        };

        /**
         * Converts this MessageData to JSON.
         * @function toJSON
         * @memberof tribe.MessageData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MessageData
         * @function getTypeUrl
         * @memberof tribe.MessageData
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.MessageData";
        };

        return MessageData;
    })();

    tribe.TweetAddBody = (function() {

        /**
         * Properties of a TweetAddBody.
         * @memberof tribe
         * @interface ITweetAddBody
         * @property {string|null} [text] TweetAddBody text
         * @property {Array.<number|Long>|null} [mentions] TweetAddBody mentions
         * @property {Array.<string>|null} [embeds] TweetAddBody embeds
         * @property {Uint8Array|null} [parentHash] TweetAddBody parentHash
         * @property {string|null} [channelId] TweetAddBody channelId
         */

        /**
         * Constructs a new TweetAddBody.
         * @memberof tribe
         * @classdesc Represents a TweetAddBody.
         * @implements ITweetAddBody
         * @constructor
         * @param {tribe.ITweetAddBody=} [properties] Properties to set
         */
        function TweetAddBody(properties) {
            this.mentions = [];
            this.embeds = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TweetAddBody text.
         * @member {string} text
         * @memberof tribe.TweetAddBody
         * @instance
         */
        TweetAddBody.prototype.text = "";

        /**
         * TweetAddBody mentions.
         * @member {Array.<number|Long>} mentions
         * @memberof tribe.TweetAddBody
         * @instance
         */
        TweetAddBody.prototype.mentions = $util.emptyArray;

        /**
         * TweetAddBody embeds.
         * @member {Array.<string>} embeds
         * @memberof tribe.TweetAddBody
         * @instance
         */
        TweetAddBody.prototype.embeds = $util.emptyArray;

        /**
         * TweetAddBody parentHash.
         * @member {Uint8Array} parentHash
         * @memberof tribe.TweetAddBody
         * @instance
         */
        TweetAddBody.prototype.parentHash = $util.newBuffer([]);

        /**
         * TweetAddBody channelId.
         * @member {string} channelId
         * @memberof tribe.TweetAddBody
         * @instance
         */
        TweetAddBody.prototype.channelId = "";

        /**
         * Creates a new TweetAddBody instance using the specified properties.
         * @function create
         * @memberof tribe.TweetAddBody
         * @static
         * @param {tribe.ITweetAddBody=} [properties] Properties to set
         * @returns {tribe.TweetAddBody} TweetAddBody instance
         */
        TweetAddBody.create = function create(properties) {
            return new TweetAddBody(properties);
        };

        /**
         * Encodes the specified TweetAddBody message. Does not implicitly {@link tribe.TweetAddBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.TweetAddBody
         * @static
         * @param {tribe.ITweetAddBody} message TweetAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TweetAddBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.text != null && Object.hasOwnProperty.call(message, "text"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.text);
            if (message.mentions != null && message.mentions.length) {
                writer.uint32(/* id 2, wireType 2 =*/18).fork();
                for (var i = 0; i < message.mentions.length; ++i)
                    writer.uint64(message.mentions[i]);
                writer.ldelim();
            }
            if (message.embeds != null && message.embeds.length)
                for (var i = 0; i < message.embeds.length; ++i)
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.embeds[i]);
            if (message.parentHash != null && Object.hasOwnProperty.call(message, "parentHash"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.parentHash);
            if (message.channelId != null && Object.hasOwnProperty.call(message, "channelId"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.channelId);
            return writer;
        };

        /**
         * Encodes the specified TweetAddBody message, length delimited. Does not implicitly {@link tribe.TweetAddBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.TweetAddBody
         * @static
         * @param {tribe.ITweetAddBody} message TweetAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TweetAddBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TweetAddBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.TweetAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.TweetAddBody} TweetAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TweetAddBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.TweetAddBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.text = reader.string();
                        break;
                    }
                case 2: {
                        if (!(message.mentions && message.mentions.length))
                            message.mentions = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.mentions.push(reader.uint64());
                        } else
                            message.mentions.push(reader.uint64());
                        break;
                    }
                case 3: {
                        if (!(message.embeds && message.embeds.length))
                            message.embeds = [];
                        message.embeds.push(reader.string());
                        break;
                    }
                case 4: {
                        message.parentHash = reader.bytes();
                        break;
                    }
                case 5: {
                        message.channelId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TweetAddBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.TweetAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.TweetAddBody} TweetAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TweetAddBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TweetAddBody message.
         * @function verify
         * @memberof tribe.TweetAddBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TweetAddBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.text != null && message.hasOwnProperty("text"))
                if (!$util.isString(message.text))
                    return "text: string expected";
            if (message.mentions != null && message.hasOwnProperty("mentions")) {
                if (!Array.isArray(message.mentions))
                    return "mentions: array expected";
                for (var i = 0; i < message.mentions.length; ++i)
                    if (!$util.isInteger(message.mentions[i]) && !(message.mentions[i] && $util.isInteger(message.mentions[i].low) && $util.isInteger(message.mentions[i].high)))
                        return "mentions: integer|Long[] expected";
            }
            if (message.embeds != null && message.hasOwnProperty("embeds")) {
                if (!Array.isArray(message.embeds))
                    return "embeds: array expected";
                for (var i = 0; i < message.embeds.length; ++i)
                    if (!$util.isString(message.embeds[i]))
                        return "embeds: string[] expected";
            }
            if (message.parentHash != null && message.hasOwnProperty("parentHash"))
                if (!(message.parentHash && typeof message.parentHash.length === "number" || $util.isString(message.parentHash)))
                    return "parentHash: buffer expected";
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                if (!$util.isString(message.channelId))
                    return "channelId: string expected";
            return null;
        };

        /**
         * Creates a TweetAddBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.TweetAddBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.TweetAddBody} TweetAddBody
         */
        TweetAddBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.TweetAddBody)
                return object;
            var message = new $root.tribe.TweetAddBody();
            if (object.text != null)
                message.text = String(object.text);
            if (object.mentions) {
                if (!Array.isArray(object.mentions))
                    throw TypeError(".tribe.TweetAddBody.mentions: array expected");
                message.mentions = [];
                for (var i = 0; i < object.mentions.length; ++i)
                    if ($util.Long)
                        (message.mentions[i] = $util.Long.fromValue(object.mentions[i])).unsigned = true;
                    else if (typeof object.mentions[i] === "string")
                        message.mentions[i] = parseInt(object.mentions[i], 10);
                    else if (typeof object.mentions[i] === "number")
                        message.mentions[i] = object.mentions[i];
                    else if (typeof object.mentions[i] === "object")
                        message.mentions[i] = new $util.LongBits(object.mentions[i].low >>> 0, object.mentions[i].high >>> 0).toNumber(true);
            }
            if (object.embeds) {
                if (!Array.isArray(object.embeds))
                    throw TypeError(".tribe.TweetAddBody.embeds: array expected");
                message.embeds = [];
                for (var i = 0; i < object.embeds.length; ++i)
                    message.embeds[i] = String(object.embeds[i]);
            }
            if (object.parentHash != null)
                if (typeof object.parentHash === "string")
                    $util.base64.decode(object.parentHash, message.parentHash = $util.newBuffer($util.base64.length(object.parentHash)), 0);
                else if (object.parentHash.length >= 0)
                    message.parentHash = object.parentHash;
            if (object.channelId != null)
                message.channelId = String(object.channelId);
            return message;
        };

        /**
         * Creates a plain object from a TweetAddBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.TweetAddBody
         * @static
         * @param {tribe.TweetAddBody} message TweetAddBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TweetAddBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.mentions = [];
                object.embeds = [];
            }
            if (options.defaults) {
                object.text = "";
                if (options.bytes === String)
                    object.parentHash = "";
                else {
                    object.parentHash = [];
                    if (options.bytes !== Array)
                        object.parentHash = $util.newBuffer(object.parentHash);
                }
                object.channelId = "";
            }
            if (message.text != null && message.hasOwnProperty("text"))
                object.text = message.text;
            if (message.mentions && message.mentions.length) {
                object.mentions = [];
                for (var j = 0; j < message.mentions.length; ++j)
                    if (typeof message.mentions[j] === "number")
                        object.mentions[j] = options.longs === String ? String(message.mentions[j]) : message.mentions[j];
                    else
                        object.mentions[j] = options.longs === String ? $util.Long.prototype.toString.call(message.mentions[j]) : options.longs === Number ? new $util.LongBits(message.mentions[j].low >>> 0, message.mentions[j].high >>> 0).toNumber(true) : message.mentions[j];
            }
            if (message.embeds && message.embeds.length) {
                object.embeds = [];
                for (var j = 0; j < message.embeds.length; ++j)
                    object.embeds[j] = message.embeds[j];
            }
            if (message.parentHash != null && message.hasOwnProperty("parentHash"))
                object.parentHash = options.bytes === String ? $util.base64.encode(message.parentHash, 0, message.parentHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.parentHash) : message.parentHash;
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                object.channelId = message.channelId;
            return object;
        };

        /**
         * Converts this TweetAddBody to JSON.
         * @function toJSON
         * @memberof tribe.TweetAddBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TweetAddBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TweetAddBody
         * @function getTypeUrl
         * @memberof tribe.TweetAddBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TweetAddBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.TweetAddBody";
        };

        return TweetAddBody;
    })();

    tribe.TweetRemoveBody = (function() {

        /**
         * Properties of a TweetRemoveBody.
         * @memberof tribe
         * @interface ITweetRemoveBody
         * @property {Uint8Array|null} [targetHash] TweetRemoveBody targetHash
         */

        /**
         * Constructs a new TweetRemoveBody.
         * @memberof tribe
         * @classdesc Represents a TweetRemoveBody.
         * @implements ITweetRemoveBody
         * @constructor
         * @param {tribe.ITweetRemoveBody=} [properties] Properties to set
         */
        function TweetRemoveBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TweetRemoveBody targetHash.
         * @member {Uint8Array} targetHash
         * @memberof tribe.TweetRemoveBody
         * @instance
         */
        TweetRemoveBody.prototype.targetHash = $util.newBuffer([]);

        /**
         * Creates a new TweetRemoveBody instance using the specified properties.
         * @function create
         * @memberof tribe.TweetRemoveBody
         * @static
         * @param {tribe.ITweetRemoveBody=} [properties] Properties to set
         * @returns {tribe.TweetRemoveBody} TweetRemoveBody instance
         */
        TweetRemoveBody.create = function create(properties) {
            return new TweetRemoveBody(properties);
        };

        /**
         * Encodes the specified TweetRemoveBody message. Does not implicitly {@link tribe.TweetRemoveBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.TweetRemoveBody
         * @static
         * @param {tribe.ITweetRemoveBody} message TweetRemoveBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TweetRemoveBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.targetHash != null && Object.hasOwnProperty.call(message, "targetHash"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.targetHash);
            return writer;
        };

        /**
         * Encodes the specified TweetRemoveBody message, length delimited. Does not implicitly {@link tribe.TweetRemoveBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.TweetRemoveBody
         * @static
         * @param {tribe.ITweetRemoveBody} message TweetRemoveBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TweetRemoveBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TweetRemoveBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.TweetRemoveBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.TweetRemoveBody} TweetRemoveBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TweetRemoveBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.TweetRemoveBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.targetHash = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TweetRemoveBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.TweetRemoveBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.TweetRemoveBody} TweetRemoveBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TweetRemoveBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TweetRemoveBody message.
         * @function verify
         * @memberof tribe.TweetRemoveBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TweetRemoveBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.targetHash != null && message.hasOwnProperty("targetHash"))
                if (!(message.targetHash && typeof message.targetHash.length === "number" || $util.isString(message.targetHash)))
                    return "targetHash: buffer expected";
            return null;
        };

        /**
         * Creates a TweetRemoveBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.TweetRemoveBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.TweetRemoveBody} TweetRemoveBody
         */
        TweetRemoveBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.TweetRemoveBody)
                return object;
            var message = new $root.tribe.TweetRemoveBody();
            if (object.targetHash != null)
                if (typeof object.targetHash === "string")
                    $util.base64.decode(object.targetHash, message.targetHash = $util.newBuffer($util.base64.length(object.targetHash)), 0);
                else if (object.targetHash.length >= 0)
                    message.targetHash = object.targetHash;
            return message;
        };

        /**
         * Creates a plain object from a TweetRemoveBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.TweetRemoveBody
         * @static
         * @param {tribe.TweetRemoveBody} message TweetRemoveBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TweetRemoveBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if (options.bytes === String)
                    object.targetHash = "";
                else {
                    object.targetHash = [];
                    if (options.bytes !== Array)
                        object.targetHash = $util.newBuffer(object.targetHash);
                }
            if (message.targetHash != null && message.hasOwnProperty("targetHash"))
                object.targetHash = options.bytes === String ? $util.base64.encode(message.targetHash, 0, message.targetHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.targetHash) : message.targetHash;
            return object;
        };

        /**
         * Converts this TweetRemoveBody to JSON.
         * @function toJSON
         * @memberof tribe.TweetRemoveBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TweetRemoveBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TweetRemoveBody
         * @function getTypeUrl
         * @memberof tribe.TweetRemoveBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TweetRemoveBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.TweetRemoveBody";
        };

        return TweetRemoveBody;
    })();

    tribe.ReactionBody = (function() {

        /**
         * Properties of a ReactionBody.
         * @memberof tribe
         * @interface IReactionBody
         * @property {tribe.ReactionType|null} [type] ReactionBody type
         * @property {Uint8Array|null} [targetHash] ReactionBody targetHash
         */

        /**
         * Constructs a new ReactionBody.
         * @memberof tribe
         * @classdesc Represents a ReactionBody.
         * @implements IReactionBody
         * @constructor
         * @param {tribe.IReactionBody=} [properties] Properties to set
         */
        function ReactionBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ReactionBody type.
         * @member {tribe.ReactionType} type
         * @memberof tribe.ReactionBody
         * @instance
         */
        ReactionBody.prototype.type = 0;

        /**
         * ReactionBody targetHash.
         * @member {Uint8Array} targetHash
         * @memberof tribe.ReactionBody
         * @instance
         */
        ReactionBody.prototype.targetHash = $util.newBuffer([]);

        /**
         * Creates a new ReactionBody instance using the specified properties.
         * @function create
         * @memberof tribe.ReactionBody
         * @static
         * @param {tribe.IReactionBody=} [properties] Properties to set
         * @returns {tribe.ReactionBody} ReactionBody instance
         */
        ReactionBody.create = function create(properties) {
            return new ReactionBody(properties);
        };

        /**
         * Encodes the specified ReactionBody message. Does not implicitly {@link tribe.ReactionBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.ReactionBody
         * @static
         * @param {tribe.IReactionBody} message ReactionBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ReactionBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
            if (message.targetHash != null && Object.hasOwnProperty.call(message, "targetHash"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.targetHash);
            return writer;
        };

        /**
         * Encodes the specified ReactionBody message, length delimited. Does not implicitly {@link tribe.ReactionBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.ReactionBody
         * @static
         * @param {tribe.IReactionBody} message ReactionBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ReactionBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ReactionBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.ReactionBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.ReactionBody} ReactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ReactionBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.ReactionBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.type = reader.int32();
                        break;
                    }
                case 2: {
                        message.targetHash = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ReactionBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.ReactionBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.ReactionBody} ReactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ReactionBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ReactionBody message.
         * @function verify
         * @memberof tribe.ReactionBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ReactionBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.type != null && message.hasOwnProperty("type"))
                switch (message.type) {
                default:
                    return "type: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.targetHash != null && message.hasOwnProperty("targetHash"))
                if (!(message.targetHash && typeof message.targetHash.length === "number" || $util.isString(message.targetHash)))
                    return "targetHash: buffer expected";
            return null;
        };

        /**
         * Creates a ReactionBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.ReactionBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.ReactionBody} ReactionBody
         */
        ReactionBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.ReactionBody)
                return object;
            var message = new $root.tribe.ReactionBody();
            switch (object.type) {
            default:
                if (typeof object.type === "number") {
                    message.type = object.type;
                    break;
                }
                break;
            case "REACTION_TYPE_NONE":
            case 0:
                message.type = 0;
                break;
            case "LIKE":
            case 1:
                message.type = 1;
                break;
            case "RECAST":
            case 2:
                message.type = 2;
                break;
            }
            if (object.targetHash != null)
                if (typeof object.targetHash === "string")
                    $util.base64.decode(object.targetHash, message.targetHash = $util.newBuffer($util.base64.length(object.targetHash)), 0);
                else if (object.targetHash.length >= 0)
                    message.targetHash = object.targetHash;
            return message;
        };

        /**
         * Creates a plain object from a ReactionBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.ReactionBody
         * @static
         * @param {tribe.ReactionBody} message ReactionBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ReactionBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.type = options.enums === String ? "REACTION_TYPE_NONE" : 0;
                if (options.bytes === String)
                    object.targetHash = "";
                else {
                    object.targetHash = [];
                    if (options.bytes !== Array)
                        object.targetHash = $util.newBuffer(object.targetHash);
                }
            }
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = options.enums === String ? $root.tribe.ReactionType[message.type] === undefined ? message.type : $root.tribe.ReactionType[message.type] : message.type;
            if (message.targetHash != null && message.hasOwnProperty("targetHash"))
                object.targetHash = options.bytes === String ? $util.base64.encode(message.targetHash, 0, message.targetHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.targetHash) : message.targetHash;
            return object;
        };

        /**
         * Converts this ReactionBody to JSON.
         * @function toJSON
         * @memberof tribe.ReactionBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ReactionBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ReactionBody
         * @function getTypeUrl
         * @memberof tribe.ReactionBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ReactionBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.ReactionBody";
        };

        return ReactionBody;
    })();

    tribe.UserDataBody = (function() {

        /**
         * Properties of a UserDataBody.
         * @memberof tribe
         * @interface IUserDataBody
         * @property {string|null} [field] UserDataBody field
         * @property {string|null} [value] UserDataBody value
         */

        /**
         * Constructs a new UserDataBody.
         * @memberof tribe
         * @classdesc Represents a UserDataBody.
         * @implements IUserDataBody
         * @constructor
         * @param {tribe.IUserDataBody=} [properties] Properties to set
         */
        function UserDataBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UserDataBody field.
         * @member {string} field
         * @memberof tribe.UserDataBody
         * @instance
         */
        UserDataBody.prototype.field = "";

        /**
         * UserDataBody value.
         * @member {string} value
         * @memberof tribe.UserDataBody
         * @instance
         */
        UserDataBody.prototype.value = "";

        /**
         * Creates a new UserDataBody instance using the specified properties.
         * @function create
         * @memberof tribe.UserDataBody
         * @static
         * @param {tribe.IUserDataBody=} [properties] Properties to set
         * @returns {tribe.UserDataBody} UserDataBody instance
         */
        UserDataBody.create = function create(properties) {
            return new UserDataBody(properties);
        };

        /**
         * Encodes the specified UserDataBody message. Does not implicitly {@link tribe.UserDataBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.UserDataBody
         * @static
         * @param {tribe.IUserDataBody} message UserDataBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UserDataBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.field != null && Object.hasOwnProperty.call(message, "field"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.field);
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.value);
            return writer;
        };

        /**
         * Encodes the specified UserDataBody message, length delimited. Does not implicitly {@link tribe.UserDataBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.UserDataBody
         * @static
         * @param {tribe.IUserDataBody} message UserDataBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UserDataBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a UserDataBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.UserDataBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.UserDataBody} UserDataBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UserDataBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.UserDataBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.field = reader.string();
                        break;
                    }
                case 2: {
                        message.value = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a UserDataBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.UserDataBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.UserDataBody} UserDataBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UserDataBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a UserDataBody message.
         * @function verify
         * @memberof tribe.UserDataBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UserDataBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.field != null && message.hasOwnProperty("field"))
                if (!$util.isString(message.field))
                    return "field: string expected";
            if (message.value != null && message.hasOwnProperty("value"))
                if (!$util.isString(message.value))
                    return "value: string expected";
            return null;
        };

        /**
         * Creates a UserDataBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.UserDataBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.UserDataBody} UserDataBody
         */
        UserDataBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.UserDataBody)
                return object;
            var message = new $root.tribe.UserDataBody();
            if (object.field != null)
                message.field = String(object.field);
            if (object.value != null)
                message.value = String(object.value);
            return message;
        };

        /**
         * Creates a plain object from a UserDataBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.UserDataBody
         * @static
         * @param {tribe.UserDataBody} message UserDataBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UserDataBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.field = "";
                object.value = "";
            }
            if (message.field != null && message.hasOwnProperty("field"))
                object.field = message.field;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = message.value;
            return object;
        };

        /**
         * Converts this UserDataBody to JSON.
         * @function toJSON
         * @memberof tribe.UserDataBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UserDataBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UserDataBody
         * @function getTypeUrl
         * @memberof tribe.UserDataBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UserDataBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.UserDataBody";
        };

        return UserDataBody;
    })();

    tribe.DmKeyRegisterBody = (function() {

        /**
         * Properties of a DmKeyRegisterBody.
         * @memberof tribe
         * @interface IDmKeyRegisterBody
         * @property {string|null} [x25519Pubkey] DmKeyRegisterBody x25519Pubkey
         */

        /**
         * Constructs a new DmKeyRegisterBody.
         * @memberof tribe
         * @classdesc Represents a DmKeyRegisterBody.
         * @implements IDmKeyRegisterBody
         * @constructor
         * @param {tribe.IDmKeyRegisterBody=} [properties] Properties to set
         */
        function DmKeyRegisterBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DmKeyRegisterBody x25519Pubkey.
         * @member {string} x25519Pubkey
         * @memberof tribe.DmKeyRegisterBody
         * @instance
         */
        DmKeyRegisterBody.prototype.x25519Pubkey = "";

        /**
         * Creates a new DmKeyRegisterBody instance using the specified properties.
         * @function create
         * @memberof tribe.DmKeyRegisterBody
         * @static
         * @param {tribe.IDmKeyRegisterBody=} [properties] Properties to set
         * @returns {tribe.DmKeyRegisterBody} DmKeyRegisterBody instance
         */
        DmKeyRegisterBody.create = function create(properties) {
            return new DmKeyRegisterBody(properties);
        };

        /**
         * Encodes the specified DmKeyRegisterBody message. Does not implicitly {@link tribe.DmKeyRegisterBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.DmKeyRegisterBody
         * @static
         * @param {tribe.IDmKeyRegisterBody} message DmKeyRegisterBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DmKeyRegisterBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.x25519Pubkey != null && Object.hasOwnProperty.call(message, "x25519Pubkey"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.x25519Pubkey);
            return writer;
        };

        /**
         * Encodes the specified DmKeyRegisterBody message, length delimited. Does not implicitly {@link tribe.DmKeyRegisterBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.DmKeyRegisterBody
         * @static
         * @param {tribe.IDmKeyRegisterBody} message DmKeyRegisterBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DmKeyRegisterBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DmKeyRegisterBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.DmKeyRegisterBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.DmKeyRegisterBody} DmKeyRegisterBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DmKeyRegisterBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.DmKeyRegisterBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.x25519Pubkey = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DmKeyRegisterBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.DmKeyRegisterBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.DmKeyRegisterBody} DmKeyRegisterBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DmKeyRegisterBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DmKeyRegisterBody message.
         * @function verify
         * @memberof tribe.DmKeyRegisterBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DmKeyRegisterBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.x25519Pubkey != null && message.hasOwnProperty("x25519Pubkey"))
                if (!$util.isString(message.x25519Pubkey))
                    return "x25519Pubkey: string expected";
            return null;
        };

        /**
         * Creates a DmKeyRegisterBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.DmKeyRegisterBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.DmKeyRegisterBody} DmKeyRegisterBody
         */
        DmKeyRegisterBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.DmKeyRegisterBody)
                return object;
            var message = new $root.tribe.DmKeyRegisterBody();
            if (object.x25519Pubkey != null)
                message.x25519Pubkey = String(object.x25519Pubkey);
            return message;
        };

        /**
         * Creates a plain object from a DmKeyRegisterBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.DmKeyRegisterBody
         * @static
         * @param {tribe.DmKeyRegisterBody} message DmKeyRegisterBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DmKeyRegisterBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.x25519Pubkey = "";
            if (message.x25519Pubkey != null && message.hasOwnProperty("x25519Pubkey"))
                object.x25519Pubkey = message.x25519Pubkey;
            return object;
        };

        /**
         * Converts this DmKeyRegisterBody to JSON.
         * @function toJSON
         * @memberof tribe.DmKeyRegisterBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DmKeyRegisterBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DmKeyRegisterBody
         * @function getTypeUrl
         * @memberof tribe.DmKeyRegisterBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DmKeyRegisterBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.DmKeyRegisterBody";
        };

        return DmKeyRegisterBody;
    })();

    tribe.DmSendBody = (function() {

        /**
         * Properties of a DmSendBody.
         * @memberof tribe
         * @interface IDmSendBody
         * @property {number|Long|null} [recipientTid] DmSendBody recipientTid
         * @property {string|null} [ciphertext] DmSendBody ciphertext
         * @property {string|null} [nonce] DmSendBody nonce
         * @property {string|null} [senderX25519] DmSendBody senderX25519
         */

        /**
         * Constructs a new DmSendBody.
         * @memberof tribe
         * @classdesc Represents a DmSendBody.
         * @implements IDmSendBody
         * @constructor
         * @param {tribe.IDmSendBody=} [properties] Properties to set
         */
        function DmSendBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DmSendBody recipientTid.
         * @member {number|Long} recipientTid
         * @memberof tribe.DmSendBody
         * @instance
         */
        DmSendBody.prototype.recipientTid = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DmSendBody ciphertext.
         * @member {string} ciphertext
         * @memberof tribe.DmSendBody
         * @instance
         */
        DmSendBody.prototype.ciphertext = "";

        /**
         * DmSendBody nonce.
         * @member {string} nonce
         * @memberof tribe.DmSendBody
         * @instance
         */
        DmSendBody.prototype.nonce = "";

        /**
         * DmSendBody senderX25519.
         * @member {string} senderX25519
         * @memberof tribe.DmSendBody
         * @instance
         */
        DmSendBody.prototype.senderX25519 = "";

        /**
         * Creates a new DmSendBody instance using the specified properties.
         * @function create
         * @memberof tribe.DmSendBody
         * @static
         * @param {tribe.IDmSendBody=} [properties] Properties to set
         * @returns {tribe.DmSendBody} DmSendBody instance
         */
        DmSendBody.create = function create(properties) {
            return new DmSendBody(properties);
        };

        /**
         * Encodes the specified DmSendBody message. Does not implicitly {@link tribe.DmSendBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.DmSendBody
         * @static
         * @param {tribe.IDmSendBody} message DmSendBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DmSendBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.recipientTid != null && Object.hasOwnProperty.call(message, "recipientTid"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.recipientTid);
            if (message.ciphertext != null && Object.hasOwnProperty.call(message, "ciphertext"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.ciphertext);
            if (message.nonce != null && Object.hasOwnProperty.call(message, "nonce"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.nonce);
            if (message.senderX25519 != null && Object.hasOwnProperty.call(message, "senderX25519"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.senderX25519);
            return writer;
        };

        /**
         * Encodes the specified DmSendBody message, length delimited. Does not implicitly {@link tribe.DmSendBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.DmSendBody
         * @static
         * @param {tribe.IDmSendBody} message DmSendBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DmSendBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DmSendBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.DmSendBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.DmSendBody} DmSendBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DmSendBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.DmSendBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.recipientTid = reader.uint64();
                        break;
                    }
                case 2: {
                        message.ciphertext = reader.string();
                        break;
                    }
                case 3: {
                        message.nonce = reader.string();
                        break;
                    }
                case 4: {
                        message.senderX25519 = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DmSendBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.DmSendBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.DmSendBody} DmSendBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DmSendBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DmSendBody message.
         * @function verify
         * @memberof tribe.DmSendBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DmSendBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.recipientTid != null && message.hasOwnProperty("recipientTid"))
                if (!$util.isInteger(message.recipientTid) && !(message.recipientTid && $util.isInteger(message.recipientTid.low) && $util.isInteger(message.recipientTid.high)))
                    return "recipientTid: integer|Long expected";
            if (message.ciphertext != null && message.hasOwnProperty("ciphertext"))
                if (!$util.isString(message.ciphertext))
                    return "ciphertext: string expected";
            if (message.nonce != null && message.hasOwnProperty("nonce"))
                if (!$util.isString(message.nonce))
                    return "nonce: string expected";
            if (message.senderX25519 != null && message.hasOwnProperty("senderX25519"))
                if (!$util.isString(message.senderX25519))
                    return "senderX25519: string expected";
            return null;
        };

        /**
         * Creates a DmSendBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.DmSendBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.DmSendBody} DmSendBody
         */
        DmSendBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.DmSendBody)
                return object;
            var message = new $root.tribe.DmSendBody();
            if (object.recipientTid != null)
                if ($util.Long)
                    (message.recipientTid = $util.Long.fromValue(object.recipientTid)).unsigned = true;
                else if (typeof object.recipientTid === "string")
                    message.recipientTid = parseInt(object.recipientTid, 10);
                else if (typeof object.recipientTid === "number")
                    message.recipientTid = object.recipientTid;
                else if (typeof object.recipientTid === "object")
                    message.recipientTid = new $util.LongBits(object.recipientTid.low >>> 0, object.recipientTid.high >>> 0).toNumber(true);
            if (object.ciphertext != null)
                message.ciphertext = String(object.ciphertext);
            if (object.nonce != null)
                message.nonce = String(object.nonce);
            if (object.senderX25519 != null)
                message.senderX25519 = String(object.senderX25519);
            return message;
        };

        /**
         * Creates a plain object from a DmSendBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.DmSendBody
         * @static
         * @param {tribe.DmSendBody} message DmSendBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DmSendBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.recipientTid = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.recipientTid = options.longs === String ? "0" : 0;
                object.ciphertext = "";
                object.nonce = "";
                object.senderX25519 = "";
            }
            if (message.recipientTid != null && message.hasOwnProperty("recipientTid"))
                if (typeof message.recipientTid === "number")
                    object.recipientTid = options.longs === String ? String(message.recipientTid) : message.recipientTid;
                else
                    object.recipientTid = options.longs === String ? $util.Long.prototype.toString.call(message.recipientTid) : options.longs === Number ? new $util.LongBits(message.recipientTid.low >>> 0, message.recipientTid.high >>> 0).toNumber(true) : message.recipientTid;
            if (message.ciphertext != null && message.hasOwnProperty("ciphertext"))
                object.ciphertext = message.ciphertext;
            if (message.nonce != null && message.hasOwnProperty("nonce"))
                object.nonce = message.nonce;
            if (message.senderX25519 != null && message.hasOwnProperty("senderX25519"))
                object.senderX25519 = message.senderX25519;
            return object;
        };

        /**
         * Converts this DmSendBody to JSON.
         * @function toJSON
         * @memberof tribe.DmSendBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DmSendBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DmSendBody
         * @function getTypeUrl
         * @memberof tribe.DmSendBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DmSendBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.DmSendBody";
        };

        return DmSendBody;
    })();

    tribe.BookmarkBody = (function() {

        /**
         * Properties of a BookmarkBody.
         * @memberof tribe
         * @interface IBookmarkBody
         * @property {string|null} [targetHash] BookmarkBody targetHash
         */

        /**
         * Constructs a new BookmarkBody.
         * @memberof tribe
         * @classdesc Represents a BookmarkBody.
         * @implements IBookmarkBody
         * @constructor
         * @param {tribe.IBookmarkBody=} [properties] Properties to set
         */
        function BookmarkBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BookmarkBody targetHash.
         * @member {string} targetHash
         * @memberof tribe.BookmarkBody
         * @instance
         */
        BookmarkBody.prototype.targetHash = "";

        /**
         * Creates a new BookmarkBody instance using the specified properties.
         * @function create
         * @memberof tribe.BookmarkBody
         * @static
         * @param {tribe.IBookmarkBody=} [properties] Properties to set
         * @returns {tribe.BookmarkBody} BookmarkBody instance
         */
        BookmarkBody.create = function create(properties) {
            return new BookmarkBody(properties);
        };

        /**
         * Encodes the specified BookmarkBody message. Does not implicitly {@link tribe.BookmarkBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.BookmarkBody
         * @static
         * @param {tribe.IBookmarkBody} message BookmarkBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BookmarkBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.targetHash != null && Object.hasOwnProperty.call(message, "targetHash"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.targetHash);
            return writer;
        };

        /**
         * Encodes the specified BookmarkBody message, length delimited. Does not implicitly {@link tribe.BookmarkBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.BookmarkBody
         * @static
         * @param {tribe.IBookmarkBody} message BookmarkBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BookmarkBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a BookmarkBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.BookmarkBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.BookmarkBody} BookmarkBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BookmarkBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.BookmarkBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.targetHash = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a BookmarkBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.BookmarkBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.BookmarkBody} BookmarkBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BookmarkBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a BookmarkBody message.
         * @function verify
         * @memberof tribe.BookmarkBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BookmarkBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.targetHash != null && message.hasOwnProperty("targetHash"))
                if (!$util.isString(message.targetHash))
                    return "targetHash: string expected";
            return null;
        };

        /**
         * Creates a BookmarkBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.BookmarkBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.BookmarkBody} BookmarkBody
         */
        BookmarkBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.BookmarkBody)
                return object;
            var message = new $root.tribe.BookmarkBody();
            if (object.targetHash != null)
                message.targetHash = String(object.targetHash);
            return message;
        };

        /**
         * Creates a plain object from a BookmarkBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.BookmarkBody
         * @static
         * @param {tribe.BookmarkBody} message BookmarkBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        BookmarkBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.targetHash = "";
            if (message.targetHash != null && message.hasOwnProperty("targetHash"))
                object.targetHash = message.targetHash;
            return object;
        };

        /**
         * Converts this BookmarkBody to JSON.
         * @function toJSON
         * @memberof tribe.BookmarkBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        BookmarkBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for BookmarkBody
         * @function getTypeUrl
         * @memberof tribe.BookmarkBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        BookmarkBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.BookmarkBody";
        };

        return BookmarkBody;
    })();

    tribe.ChannelAddBody = (function() {

        /**
         * Properties of a ChannelAddBody.
         * @memberof tribe
         * @interface IChannelAddBody
         * @property {string|null} [channelId] ChannelAddBody channelId
         * @property {string|null} [name] ChannelAddBody name
         * @property {string|null} [description] ChannelAddBody description
         * @property {tribe.ChannelKind|null} [kind] ChannelAddBody kind
         * @property {number|null} [latitude] ChannelAddBody latitude
         * @property {number|null} [longitude] ChannelAddBody longitude
         */

        /**
         * Constructs a new ChannelAddBody.
         * @memberof tribe
         * @classdesc Represents a ChannelAddBody.
         * @implements IChannelAddBody
         * @constructor
         * @param {tribe.IChannelAddBody=} [properties] Properties to set
         */
        function ChannelAddBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ChannelAddBody channelId.
         * @member {string} channelId
         * @memberof tribe.ChannelAddBody
         * @instance
         */
        ChannelAddBody.prototype.channelId = "";

        /**
         * ChannelAddBody name.
         * @member {string} name
         * @memberof tribe.ChannelAddBody
         * @instance
         */
        ChannelAddBody.prototype.name = "";

        /**
         * ChannelAddBody description.
         * @member {string} description
         * @memberof tribe.ChannelAddBody
         * @instance
         */
        ChannelAddBody.prototype.description = "";

        /**
         * ChannelAddBody kind.
         * @member {tribe.ChannelKind} kind
         * @memberof tribe.ChannelAddBody
         * @instance
         */
        ChannelAddBody.prototype.kind = 0;

        /**
         * ChannelAddBody latitude.
         * @member {number} latitude
         * @memberof tribe.ChannelAddBody
         * @instance
         */
        ChannelAddBody.prototype.latitude = 0;

        /**
         * ChannelAddBody longitude.
         * @member {number} longitude
         * @memberof tribe.ChannelAddBody
         * @instance
         */
        ChannelAddBody.prototype.longitude = 0;

        /**
         * Creates a new ChannelAddBody instance using the specified properties.
         * @function create
         * @memberof tribe.ChannelAddBody
         * @static
         * @param {tribe.IChannelAddBody=} [properties] Properties to set
         * @returns {tribe.ChannelAddBody} ChannelAddBody instance
         */
        ChannelAddBody.create = function create(properties) {
            return new ChannelAddBody(properties);
        };

        /**
         * Encodes the specified ChannelAddBody message. Does not implicitly {@link tribe.ChannelAddBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.ChannelAddBody
         * @static
         * @param {tribe.IChannelAddBody} message ChannelAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ChannelAddBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.channelId != null && Object.hasOwnProperty.call(message, "channelId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.channelId);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.kind != null && Object.hasOwnProperty.call(message, "kind"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.kind);
            if (message.latitude != null && Object.hasOwnProperty.call(message, "latitude"))
                writer.uint32(/* id 5, wireType 1 =*/41).double(message.latitude);
            if (message.longitude != null && Object.hasOwnProperty.call(message, "longitude"))
                writer.uint32(/* id 6, wireType 1 =*/49).double(message.longitude);
            return writer;
        };

        /**
         * Encodes the specified ChannelAddBody message, length delimited. Does not implicitly {@link tribe.ChannelAddBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.ChannelAddBody
         * @static
         * @param {tribe.IChannelAddBody} message ChannelAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ChannelAddBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ChannelAddBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.ChannelAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.ChannelAddBody} ChannelAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ChannelAddBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.ChannelAddBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.channelId = reader.string();
                        break;
                    }
                case 2: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.kind = reader.int32();
                        break;
                    }
                case 5: {
                        message.latitude = reader.double();
                        break;
                    }
                case 6: {
                        message.longitude = reader.double();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ChannelAddBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.ChannelAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.ChannelAddBody} ChannelAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ChannelAddBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ChannelAddBody message.
         * @function verify
         * @memberof tribe.ChannelAddBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ChannelAddBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                if (!$util.isString(message.channelId))
                    return "channelId: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.kind != null && message.hasOwnProperty("kind"))
                switch (message.kind) {
                default:
                    return "kind: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.latitude != null && message.hasOwnProperty("latitude"))
                if (typeof message.latitude !== "number")
                    return "latitude: number expected";
            if (message.longitude != null && message.hasOwnProperty("longitude"))
                if (typeof message.longitude !== "number")
                    return "longitude: number expected";
            return null;
        };

        /**
         * Creates a ChannelAddBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.ChannelAddBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.ChannelAddBody} ChannelAddBody
         */
        ChannelAddBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.ChannelAddBody)
                return object;
            var message = new $root.tribe.ChannelAddBody();
            if (object.channelId != null)
                message.channelId = String(object.channelId);
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.kind) {
            default:
                if (typeof object.kind === "number") {
                    message.kind = object.kind;
                    break;
                }
                break;
            case "CHANNEL_KIND_NONE":
            case 0:
                message.kind = 0;
                break;
            case "GENERAL":
            case 1:
                message.kind = 1;
                break;
            case "CITY":
            case 2:
                message.kind = 2;
                break;
            case "INTEREST":
            case 3:
                message.kind = 3;
                break;
            }
            if (object.latitude != null)
                message.latitude = Number(object.latitude);
            if (object.longitude != null)
                message.longitude = Number(object.longitude);
            return message;
        };

        /**
         * Creates a plain object from a ChannelAddBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.ChannelAddBody
         * @static
         * @param {tribe.ChannelAddBody} message ChannelAddBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ChannelAddBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.channelId = "";
                object.name = "";
                object.description = "";
                object.kind = options.enums === String ? "CHANNEL_KIND_NONE" : 0;
                object.latitude = 0;
                object.longitude = 0;
            }
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                object.channelId = message.channelId;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.kind != null && message.hasOwnProperty("kind"))
                object.kind = options.enums === String ? $root.tribe.ChannelKind[message.kind] === undefined ? message.kind : $root.tribe.ChannelKind[message.kind] : message.kind;
            if (message.latitude != null && message.hasOwnProperty("latitude"))
                object.latitude = options.json && !isFinite(message.latitude) ? String(message.latitude) : message.latitude;
            if (message.longitude != null && message.hasOwnProperty("longitude"))
                object.longitude = options.json && !isFinite(message.longitude) ? String(message.longitude) : message.longitude;
            return object;
        };

        /**
         * Converts this ChannelAddBody to JSON.
         * @function toJSON
         * @memberof tribe.ChannelAddBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ChannelAddBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ChannelAddBody
         * @function getTypeUrl
         * @memberof tribe.ChannelAddBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ChannelAddBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.ChannelAddBody";
        };

        return ChannelAddBody;
    })();

    tribe.ChannelMembershipBody = (function() {

        /**
         * Properties of a ChannelMembershipBody.
         * @memberof tribe
         * @interface IChannelMembershipBody
         * @property {string|null} [channelId] ChannelMembershipBody channelId
         */

        /**
         * Constructs a new ChannelMembershipBody.
         * @memberof tribe
         * @classdesc Represents a ChannelMembershipBody.
         * @implements IChannelMembershipBody
         * @constructor
         * @param {tribe.IChannelMembershipBody=} [properties] Properties to set
         */
        function ChannelMembershipBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ChannelMembershipBody channelId.
         * @member {string} channelId
         * @memberof tribe.ChannelMembershipBody
         * @instance
         */
        ChannelMembershipBody.prototype.channelId = "";

        /**
         * Creates a new ChannelMembershipBody instance using the specified properties.
         * @function create
         * @memberof tribe.ChannelMembershipBody
         * @static
         * @param {tribe.IChannelMembershipBody=} [properties] Properties to set
         * @returns {tribe.ChannelMembershipBody} ChannelMembershipBody instance
         */
        ChannelMembershipBody.create = function create(properties) {
            return new ChannelMembershipBody(properties);
        };

        /**
         * Encodes the specified ChannelMembershipBody message. Does not implicitly {@link tribe.ChannelMembershipBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.ChannelMembershipBody
         * @static
         * @param {tribe.IChannelMembershipBody} message ChannelMembershipBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ChannelMembershipBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.channelId != null && Object.hasOwnProperty.call(message, "channelId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.channelId);
            return writer;
        };

        /**
         * Encodes the specified ChannelMembershipBody message, length delimited. Does not implicitly {@link tribe.ChannelMembershipBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.ChannelMembershipBody
         * @static
         * @param {tribe.IChannelMembershipBody} message ChannelMembershipBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ChannelMembershipBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ChannelMembershipBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.ChannelMembershipBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.ChannelMembershipBody} ChannelMembershipBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ChannelMembershipBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.ChannelMembershipBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.channelId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ChannelMembershipBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.ChannelMembershipBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.ChannelMembershipBody} ChannelMembershipBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ChannelMembershipBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ChannelMembershipBody message.
         * @function verify
         * @memberof tribe.ChannelMembershipBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ChannelMembershipBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                if (!$util.isString(message.channelId))
                    return "channelId: string expected";
            return null;
        };

        /**
         * Creates a ChannelMembershipBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.ChannelMembershipBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.ChannelMembershipBody} ChannelMembershipBody
         */
        ChannelMembershipBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.ChannelMembershipBody)
                return object;
            var message = new $root.tribe.ChannelMembershipBody();
            if (object.channelId != null)
                message.channelId = String(object.channelId);
            return message;
        };

        /**
         * Creates a plain object from a ChannelMembershipBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.ChannelMembershipBody
         * @static
         * @param {tribe.ChannelMembershipBody} message ChannelMembershipBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ChannelMembershipBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.channelId = "";
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                object.channelId = message.channelId;
            return object;
        };

        /**
         * Converts this ChannelMembershipBody to JSON.
         * @function toJSON
         * @memberof tribe.ChannelMembershipBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ChannelMembershipBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ChannelMembershipBody
         * @function getTypeUrl
         * @memberof tribe.ChannelMembershipBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ChannelMembershipBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.ChannelMembershipBody";
        };

        return ChannelMembershipBody;
    })();

    tribe.PollAddBody = (function() {

        /**
         * Properties of a PollAddBody.
         * @memberof tribe
         * @interface IPollAddBody
         * @property {string|null} [pollId] PollAddBody pollId
         * @property {string|null} [question] PollAddBody question
         * @property {Array.<string>|null} [options] PollAddBody options
         * @property {number|null} [expiresAt] PollAddBody expiresAt
         * @property {string|null} [channelId] PollAddBody channelId
         */

        /**
         * Constructs a new PollAddBody.
         * @memberof tribe
         * @classdesc Represents a PollAddBody.
         * @implements IPollAddBody
         * @constructor
         * @param {tribe.IPollAddBody=} [properties] Properties to set
         */
        function PollAddBody(properties) {
            this.options = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PollAddBody pollId.
         * @member {string} pollId
         * @memberof tribe.PollAddBody
         * @instance
         */
        PollAddBody.prototype.pollId = "";

        /**
         * PollAddBody question.
         * @member {string} question
         * @memberof tribe.PollAddBody
         * @instance
         */
        PollAddBody.prototype.question = "";

        /**
         * PollAddBody options.
         * @member {Array.<string>} options
         * @memberof tribe.PollAddBody
         * @instance
         */
        PollAddBody.prototype.options = $util.emptyArray;

        /**
         * PollAddBody expiresAt.
         * @member {number} expiresAt
         * @memberof tribe.PollAddBody
         * @instance
         */
        PollAddBody.prototype.expiresAt = 0;

        /**
         * PollAddBody channelId.
         * @member {string} channelId
         * @memberof tribe.PollAddBody
         * @instance
         */
        PollAddBody.prototype.channelId = "";

        /**
         * Creates a new PollAddBody instance using the specified properties.
         * @function create
         * @memberof tribe.PollAddBody
         * @static
         * @param {tribe.IPollAddBody=} [properties] Properties to set
         * @returns {tribe.PollAddBody} PollAddBody instance
         */
        PollAddBody.create = function create(properties) {
            return new PollAddBody(properties);
        };

        /**
         * Encodes the specified PollAddBody message. Does not implicitly {@link tribe.PollAddBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.PollAddBody
         * @static
         * @param {tribe.IPollAddBody} message PollAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PollAddBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.pollId != null && Object.hasOwnProperty.call(message, "pollId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.pollId);
            if (message.question != null && Object.hasOwnProperty.call(message, "question"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.question);
            if (message.options != null && message.options.length)
                for (var i = 0; i < message.options.length; ++i)
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.options[i]);
            if (message.expiresAt != null && Object.hasOwnProperty.call(message, "expiresAt"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.expiresAt);
            if (message.channelId != null && Object.hasOwnProperty.call(message, "channelId"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.channelId);
            return writer;
        };

        /**
         * Encodes the specified PollAddBody message, length delimited. Does not implicitly {@link tribe.PollAddBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.PollAddBody
         * @static
         * @param {tribe.IPollAddBody} message PollAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PollAddBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PollAddBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.PollAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.PollAddBody} PollAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PollAddBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.PollAddBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.pollId = reader.string();
                        break;
                    }
                case 2: {
                        message.question = reader.string();
                        break;
                    }
                case 3: {
                        if (!(message.options && message.options.length))
                            message.options = [];
                        message.options.push(reader.string());
                        break;
                    }
                case 4: {
                        message.expiresAt = reader.uint32();
                        break;
                    }
                case 5: {
                        message.channelId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PollAddBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.PollAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.PollAddBody} PollAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PollAddBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PollAddBody message.
         * @function verify
         * @memberof tribe.PollAddBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PollAddBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.pollId != null && message.hasOwnProperty("pollId"))
                if (!$util.isString(message.pollId))
                    return "pollId: string expected";
            if (message.question != null && message.hasOwnProperty("question"))
                if (!$util.isString(message.question))
                    return "question: string expected";
            if (message.options != null && message.hasOwnProperty("options")) {
                if (!Array.isArray(message.options))
                    return "options: array expected";
                for (var i = 0; i < message.options.length; ++i)
                    if (!$util.isString(message.options[i]))
                        return "options: string[] expected";
            }
            if (message.expiresAt != null && message.hasOwnProperty("expiresAt"))
                if (!$util.isInteger(message.expiresAt))
                    return "expiresAt: integer expected";
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                if (!$util.isString(message.channelId))
                    return "channelId: string expected";
            return null;
        };

        /**
         * Creates a PollAddBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.PollAddBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.PollAddBody} PollAddBody
         */
        PollAddBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.PollAddBody)
                return object;
            var message = new $root.tribe.PollAddBody();
            if (object.pollId != null)
                message.pollId = String(object.pollId);
            if (object.question != null)
                message.question = String(object.question);
            if (object.options) {
                if (!Array.isArray(object.options))
                    throw TypeError(".tribe.PollAddBody.options: array expected");
                message.options = [];
                for (var i = 0; i < object.options.length; ++i)
                    message.options[i] = String(object.options[i]);
            }
            if (object.expiresAt != null)
                message.expiresAt = object.expiresAt >>> 0;
            if (object.channelId != null)
                message.channelId = String(object.channelId);
            return message;
        };

        /**
         * Creates a plain object from a PollAddBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.PollAddBody
         * @static
         * @param {tribe.PollAddBody} message PollAddBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PollAddBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.options = [];
            if (options.defaults) {
                object.pollId = "";
                object.question = "";
                object.expiresAt = 0;
                object.channelId = "";
            }
            if (message.pollId != null && message.hasOwnProperty("pollId"))
                object.pollId = message.pollId;
            if (message.question != null && message.hasOwnProperty("question"))
                object.question = message.question;
            if (message.options && message.options.length) {
                object.options = [];
                for (var j = 0; j < message.options.length; ++j)
                    object.options[j] = message.options[j];
            }
            if (message.expiresAt != null && message.hasOwnProperty("expiresAt"))
                object.expiresAt = message.expiresAt;
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                object.channelId = message.channelId;
            return object;
        };

        /**
         * Converts this PollAddBody to JSON.
         * @function toJSON
         * @memberof tribe.PollAddBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PollAddBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PollAddBody
         * @function getTypeUrl
         * @memberof tribe.PollAddBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PollAddBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.PollAddBody";
        };

        return PollAddBody;
    })();

    tribe.PollVoteBody = (function() {

        /**
         * Properties of a PollVoteBody.
         * @memberof tribe
         * @interface IPollVoteBody
         * @property {string|null} [pollId] PollVoteBody pollId
         * @property {number|null} [optionIndex] PollVoteBody optionIndex
         */

        /**
         * Constructs a new PollVoteBody.
         * @memberof tribe
         * @classdesc Represents a PollVoteBody.
         * @implements IPollVoteBody
         * @constructor
         * @param {tribe.IPollVoteBody=} [properties] Properties to set
         */
        function PollVoteBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PollVoteBody pollId.
         * @member {string} pollId
         * @memberof tribe.PollVoteBody
         * @instance
         */
        PollVoteBody.prototype.pollId = "";

        /**
         * PollVoteBody optionIndex.
         * @member {number} optionIndex
         * @memberof tribe.PollVoteBody
         * @instance
         */
        PollVoteBody.prototype.optionIndex = 0;

        /**
         * Creates a new PollVoteBody instance using the specified properties.
         * @function create
         * @memberof tribe.PollVoteBody
         * @static
         * @param {tribe.IPollVoteBody=} [properties] Properties to set
         * @returns {tribe.PollVoteBody} PollVoteBody instance
         */
        PollVoteBody.create = function create(properties) {
            return new PollVoteBody(properties);
        };

        /**
         * Encodes the specified PollVoteBody message. Does not implicitly {@link tribe.PollVoteBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.PollVoteBody
         * @static
         * @param {tribe.IPollVoteBody} message PollVoteBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PollVoteBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.pollId != null && Object.hasOwnProperty.call(message, "pollId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.pollId);
            if (message.optionIndex != null && Object.hasOwnProperty.call(message, "optionIndex"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.optionIndex);
            return writer;
        };

        /**
         * Encodes the specified PollVoteBody message, length delimited. Does not implicitly {@link tribe.PollVoteBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.PollVoteBody
         * @static
         * @param {tribe.IPollVoteBody} message PollVoteBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PollVoteBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PollVoteBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.PollVoteBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.PollVoteBody} PollVoteBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PollVoteBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.PollVoteBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.pollId = reader.string();
                        break;
                    }
                case 2: {
                        message.optionIndex = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PollVoteBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.PollVoteBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.PollVoteBody} PollVoteBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PollVoteBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PollVoteBody message.
         * @function verify
         * @memberof tribe.PollVoteBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PollVoteBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.pollId != null && message.hasOwnProperty("pollId"))
                if (!$util.isString(message.pollId))
                    return "pollId: string expected";
            if (message.optionIndex != null && message.hasOwnProperty("optionIndex"))
                if (!$util.isInteger(message.optionIndex))
                    return "optionIndex: integer expected";
            return null;
        };

        /**
         * Creates a PollVoteBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.PollVoteBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.PollVoteBody} PollVoteBody
         */
        PollVoteBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.PollVoteBody)
                return object;
            var message = new $root.tribe.PollVoteBody();
            if (object.pollId != null)
                message.pollId = String(object.pollId);
            if (object.optionIndex != null)
                message.optionIndex = object.optionIndex >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a PollVoteBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.PollVoteBody
         * @static
         * @param {tribe.PollVoteBody} message PollVoteBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PollVoteBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.pollId = "";
                object.optionIndex = 0;
            }
            if (message.pollId != null && message.hasOwnProperty("pollId"))
                object.pollId = message.pollId;
            if (message.optionIndex != null && message.hasOwnProperty("optionIndex"))
                object.optionIndex = message.optionIndex;
            return object;
        };

        /**
         * Converts this PollVoteBody to JSON.
         * @function toJSON
         * @memberof tribe.PollVoteBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PollVoteBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PollVoteBody
         * @function getTypeUrl
         * @memberof tribe.PollVoteBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PollVoteBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.PollVoteBody";
        };

        return PollVoteBody;
    })();

    tribe.EventAddBody = (function() {

        /**
         * Properties of an EventAddBody.
         * @memberof tribe
         * @interface IEventAddBody
         * @property {string|null} [eventId] EventAddBody eventId
         * @property {string|null} [title] EventAddBody title
         * @property {string|null} [description] EventAddBody description
         * @property {number|null} [startsAt] EventAddBody startsAt
         * @property {number|null} [endsAt] EventAddBody endsAt
         * @property {string|null} [locationText] EventAddBody locationText
         * @property {number|null} [latitude] EventAddBody latitude
         * @property {number|null} [longitude] EventAddBody longitude
         * @property {string|null} [channelId] EventAddBody channelId
         * @property {string|null} [imageUrl] EventAddBody imageUrl
         */

        /**
         * Constructs a new EventAddBody.
         * @memberof tribe
         * @classdesc Represents an EventAddBody.
         * @implements IEventAddBody
         * @constructor
         * @param {tribe.IEventAddBody=} [properties] Properties to set
         */
        function EventAddBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * EventAddBody eventId.
         * @member {string} eventId
         * @memberof tribe.EventAddBody
         * @instance
         */
        EventAddBody.prototype.eventId = "";

        /**
         * EventAddBody title.
         * @member {string} title
         * @memberof tribe.EventAddBody
         * @instance
         */
        EventAddBody.prototype.title = "";

        /**
         * EventAddBody description.
         * @member {string} description
         * @memberof tribe.EventAddBody
         * @instance
         */
        EventAddBody.prototype.description = "";

        /**
         * EventAddBody startsAt.
         * @member {number} startsAt
         * @memberof tribe.EventAddBody
         * @instance
         */
        EventAddBody.prototype.startsAt = 0;

        /**
         * EventAddBody endsAt.
         * @member {number} endsAt
         * @memberof tribe.EventAddBody
         * @instance
         */
        EventAddBody.prototype.endsAt = 0;

        /**
         * EventAddBody locationText.
         * @member {string} locationText
         * @memberof tribe.EventAddBody
         * @instance
         */
        EventAddBody.prototype.locationText = "";

        /**
         * EventAddBody latitude.
         * @member {number} latitude
         * @memberof tribe.EventAddBody
         * @instance
         */
        EventAddBody.prototype.latitude = 0;

        /**
         * EventAddBody longitude.
         * @member {number} longitude
         * @memberof tribe.EventAddBody
         * @instance
         */
        EventAddBody.prototype.longitude = 0;

        /**
         * EventAddBody channelId.
         * @member {string} channelId
         * @memberof tribe.EventAddBody
         * @instance
         */
        EventAddBody.prototype.channelId = "";

        /**
         * EventAddBody imageUrl.
         * @member {string} imageUrl
         * @memberof tribe.EventAddBody
         * @instance
         */
        EventAddBody.prototype.imageUrl = "";

        /**
         * Creates a new EventAddBody instance using the specified properties.
         * @function create
         * @memberof tribe.EventAddBody
         * @static
         * @param {tribe.IEventAddBody=} [properties] Properties to set
         * @returns {tribe.EventAddBody} EventAddBody instance
         */
        EventAddBody.create = function create(properties) {
            return new EventAddBody(properties);
        };

        /**
         * Encodes the specified EventAddBody message. Does not implicitly {@link tribe.EventAddBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.EventAddBody
         * @static
         * @param {tribe.IEventAddBody} message EventAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EventAddBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.eventId != null && Object.hasOwnProperty.call(message, "eventId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.eventId);
            if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.startsAt != null && Object.hasOwnProperty.call(message, "startsAt"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.startsAt);
            if (message.endsAt != null && Object.hasOwnProperty.call(message, "endsAt"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.endsAt);
            if (message.locationText != null && Object.hasOwnProperty.call(message, "locationText"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.locationText);
            if (message.latitude != null && Object.hasOwnProperty.call(message, "latitude"))
                writer.uint32(/* id 7, wireType 1 =*/57).double(message.latitude);
            if (message.longitude != null && Object.hasOwnProperty.call(message, "longitude"))
                writer.uint32(/* id 8, wireType 1 =*/65).double(message.longitude);
            if (message.channelId != null && Object.hasOwnProperty.call(message, "channelId"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.channelId);
            if (message.imageUrl != null && Object.hasOwnProperty.call(message, "imageUrl"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.imageUrl);
            return writer;
        };

        /**
         * Encodes the specified EventAddBody message, length delimited. Does not implicitly {@link tribe.EventAddBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.EventAddBody
         * @static
         * @param {tribe.IEventAddBody} message EventAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EventAddBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an EventAddBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.EventAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.EventAddBody} EventAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EventAddBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.EventAddBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.eventId = reader.string();
                        break;
                    }
                case 2: {
                        message.title = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.startsAt = reader.uint32();
                        break;
                    }
                case 5: {
                        message.endsAt = reader.uint32();
                        break;
                    }
                case 6: {
                        message.locationText = reader.string();
                        break;
                    }
                case 7: {
                        message.latitude = reader.double();
                        break;
                    }
                case 8: {
                        message.longitude = reader.double();
                        break;
                    }
                case 9: {
                        message.channelId = reader.string();
                        break;
                    }
                case 10: {
                        message.imageUrl = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an EventAddBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.EventAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.EventAddBody} EventAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EventAddBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an EventAddBody message.
         * @function verify
         * @memberof tribe.EventAddBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        EventAddBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.eventId != null && message.hasOwnProperty("eventId"))
                if (!$util.isString(message.eventId))
                    return "eventId: string expected";
            if (message.title != null && message.hasOwnProperty("title"))
                if (!$util.isString(message.title))
                    return "title: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.startsAt != null && message.hasOwnProperty("startsAt"))
                if (!$util.isInteger(message.startsAt))
                    return "startsAt: integer expected";
            if (message.endsAt != null && message.hasOwnProperty("endsAt"))
                if (!$util.isInteger(message.endsAt))
                    return "endsAt: integer expected";
            if (message.locationText != null && message.hasOwnProperty("locationText"))
                if (!$util.isString(message.locationText))
                    return "locationText: string expected";
            if (message.latitude != null && message.hasOwnProperty("latitude"))
                if (typeof message.latitude !== "number")
                    return "latitude: number expected";
            if (message.longitude != null && message.hasOwnProperty("longitude"))
                if (typeof message.longitude !== "number")
                    return "longitude: number expected";
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                if (!$util.isString(message.channelId))
                    return "channelId: string expected";
            if (message.imageUrl != null && message.hasOwnProperty("imageUrl"))
                if (!$util.isString(message.imageUrl))
                    return "imageUrl: string expected";
            return null;
        };

        /**
         * Creates an EventAddBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.EventAddBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.EventAddBody} EventAddBody
         */
        EventAddBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.EventAddBody)
                return object;
            var message = new $root.tribe.EventAddBody();
            if (object.eventId != null)
                message.eventId = String(object.eventId);
            if (object.title != null)
                message.title = String(object.title);
            if (object.description != null)
                message.description = String(object.description);
            if (object.startsAt != null)
                message.startsAt = object.startsAt >>> 0;
            if (object.endsAt != null)
                message.endsAt = object.endsAt >>> 0;
            if (object.locationText != null)
                message.locationText = String(object.locationText);
            if (object.latitude != null)
                message.latitude = Number(object.latitude);
            if (object.longitude != null)
                message.longitude = Number(object.longitude);
            if (object.channelId != null)
                message.channelId = String(object.channelId);
            if (object.imageUrl != null)
                message.imageUrl = String(object.imageUrl);
            return message;
        };

        /**
         * Creates a plain object from an EventAddBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.EventAddBody
         * @static
         * @param {tribe.EventAddBody} message EventAddBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        EventAddBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.eventId = "";
                object.title = "";
                object.description = "";
                object.startsAt = 0;
                object.endsAt = 0;
                object.locationText = "";
                object.latitude = 0;
                object.longitude = 0;
                object.channelId = "";
                object.imageUrl = "";
            }
            if (message.eventId != null && message.hasOwnProperty("eventId"))
                object.eventId = message.eventId;
            if (message.title != null && message.hasOwnProperty("title"))
                object.title = message.title;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.startsAt != null && message.hasOwnProperty("startsAt"))
                object.startsAt = message.startsAt;
            if (message.endsAt != null && message.hasOwnProperty("endsAt"))
                object.endsAt = message.endsAt;
            if (message.locationText != null && message.hasOwnProperty("locationText"))
                object.locationText = message.locationText;
            if (message.latitude != null && message.hasOwnProperty("latitude"))
                object.latitude = options.json && !isFinite(message.latitude) ? String(message.latitude) : message.latitude;
            if (message.longitude != null && message.hasOwnProperty("longitude"))
                object.longitude = options.json && !isFinite(message.longitude) ? String(message.longitude) : message.longitude;
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                object.channelId = message.channelId;
            if (message.imageUrl != null && message.hasOwnProperty("imageUrl"))
                object.imageUrl = message.imageUrl;
            return object;
        };

        /**
         * Converts this EventAddBody to JSON.
         * @function toJSON
         * @memberof tribe.EventAddBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        EventAddBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for EventAddBody
         * @function getTypeUrl
         * @memberof tribe.EventAddBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        EventAddBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.EventAddBody";
        };

        return EventAddBody;
    })();

    tribe.EventRsvpBody = (function() {

        /**
         * Properties of an EventRsvpBody.
         * @memberof tribe
         * @interface IEventRsvpBody
         * @property {string|null} [eventId] EventRsvpBody eventId
         * @property {string|null} [status] EventRsvpBody status
         */

        /**
         * Constructs a new EventRsvpBody.
         * @memberof tribe
         * @classdesc Represents an EventRsvpBody.
         * @implements IEventRsvpBody
         * @constructor
         * @param {tribe.IEventRsvpBody=} [properties] Properties to set
         */
        function EventRsvpBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * EventRsvpBody eventId.
         * @member {string} eventId
         * @memberof tribe.EventRsvpBody
         * @instance
         */
        EventRsvpBody.prototype.eventId = "";

        /**
         * EventRsvpBody status.
         * @member {string} status
         * @memberof tribe.EventRsvpBody
         * @instance
         */
        EventRsvpBody.prototype.status = "";

        /**
         * Creates a new EventRsvpBody instance using the specified properties.
         * @function create
         * @memberof tribe.EventRsvpBody
         * @static
         * @param {tribe.IEventRsvpBody=} [properties] Properties to set
         * @returns {tribe.EventRsvpBody} EventRsvpBody instance
         */
        EventRsvpBody.create = function create(properties) {
            return new EventRsvpBody(properties);
        };

        /**
         * Encodes the specified EventRsvpBody message. Does not implicitly {@link tribe.EventRsvpBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.EventRsvpBody
         * @static
         * @param {tribe.IEventRsvpBody} message EventRsvpBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EventRsvpBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.eventId != null && Object.hasOwnProperty.call(message, "eventId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.eventId);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.status);
            return writer;
        };

        /**
         * Encodes the specified EventRsvpBody message, length delimited. Does not implicitly {@link tribe.EventRsvpBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.EventRsvpBody
         * @static
         * @param {tribe.IEventRsvpBody} message EventRsvpBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EventRsvpBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an EventRsvpBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.EventRsvpBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.EventRsvpBody} EventRsvpBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EventRsvpBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.EventRsvpBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.eventId = reader.string();
                        break;
                    }
                case 2: {
                        message.status = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an EventRsvpBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.EventRsvpBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.EventRsvpBody} EventRsvpBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EventRsvpBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an EventRsvpBody message.
         * @function verify
         * @memberof tribe.EventRsvpBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        EventRsvpBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.eventId != null && message.hasOwnProperty("eventId"))
                if (!$util.isString(message.eventId))
                    return "eventId: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                if (!$util.isString(message.status))
                    return "status: string expected";
            return null;
        };

        /**
         * Creates an EventRsvpBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.EventRsvpBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.EventRsvpBody} EventRsvpBody
         */
        EventRsvpBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.EventRsvpBody)
                return object;
            var message = new $root.tribe.EventRsvpBody();
            if (object.eventId != null)
                message.eventId = String(object.eventId);
            if (object.status != null)
                message.status = String(object.status);
            return message;
        };

        /**
         * Creates a plain object from an EventRsvpBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.EventRsvpBody
         * @static
         * @param {tribe.EventRsvpBody} message EventRsvpBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        EventRsvpBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.eventId = "";
                object.status = "";
            }
            if (message.eventId != null && message.hasOwnProperty("eventId"))
                object.eventId = message.eventId;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = message.status;
            return object;
        };

        /**
         * Converts this EventRsvpBody to JSON.
         * @function toJSON
         * @memberof tribe.EventRsvpBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        EventRsvpBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for EventRsvpBody
         * @function getTypeUrl
         * @memberof tribe.EventRsvpBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        EventRsvpBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.EventRsvpBody";
        };

        return EventRsvpBody;
    })();

    tribe.TaskAddBody = (function() {

        /**
         * Properties of a TaskAddBody.
         * @memberof tribe
         * @interface ITaskAddBody
         * @property {string|null} [taskId] TaskAddBody taskId
         * @property {string|null} [title] TaskAddBody title
         * @property {string|null} [description] TaskAddBody description
         * @property {string|null} [rewardText] TaskAddBody rewardText
         * @property {string|null} [channelId] TaskAddBody channelId
         */

        /**
         * Constructs a new TaskAddBody.
         * @memberof tribe
         * @classdesc Represents a TaskAddBody.
         * @implements ITaskAddBody
         * @constructor
         * @param {tribe.ITaskAddBody=} [properties] Properties to set
         */
        function TaskAddBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TaskAddBody taskId.
         * @member {string} taskId
         * @memberof tribe.TaskAddBody
         * @instance
         */
        TaskAddBody.prototype.taskId = "";

        /**
         * TaskAddBody title.
         * @member {string} title
         * @memberof tribe.TaskAddBody
         * @instance
         */
        TaskAddBody.prototype.title = "";

        /**
         * TaskAddBody description.
         * @member {string} description
         * @memberof tribe.TaskAddBody
         * @instance
         */
        TaskAddBody.prototype.description = "";

        /**
         * TaskAddBody rewardText.
         * @member {string} rewardText
         * @memberof tribe.TaskAddBody
         * @instance
         */
        TaskAddBody.prototype.rewardText = "";

        /**
         * TaskAddBody channelId.
         * @member {string} channelId
         * @memberof tribe.TaskAddBody
         * @instance
         */
        TaskAddBody.prototype.channelId = "";

        /**
         * Creates a new TaskAddBody instance using the specified properties.
         * @function create
         * @memberof tribe.TaskAddBody
         * @static
         * @param {tribe.ITaskAddBody=} [properties] Properties to set
         * @returns {tribe.TaskAddBody} TaskAddBody instance
         */
        TaskAddBody.create = function create(properties) {
            return new TaskAddBody(properties);
        };

        /**
         * Encodes the specified TaskAddBody message. Does not implicitly {@link tribe.TaskAddBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.TaskAddBody
         * @static
         * @param {tribe.ITaskAddBody} message TaskAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TaskAddBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.taskId != null && Object.hasOwnProperty.call(message, "taskId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.taskId);
            if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.rewardText != null && Object.hasOwnProperty.call(message, "rewardText"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.rewardText);
            if (message.channelId != null && Object.hasOwnProperty.call(message, "channelId"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.channelId);
            return writer;
        };

        /**
         * Encodes the specified TaskAddBody message, length delimited. Does not implicitly {@link tribe.TaskAddBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.TaskAddBody
         * @static
         * @param {tribe.ITaskAddBody} message TaskAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TaskAddBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TaskAddBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.TaskAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.TaskAddBody} TaskAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TaskAddBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.TaskAddBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.taskId = reader.string();
                        break;
                    }
                case 2: {
                        message.title = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.rewardText = reader.string();
                        break;
                    }
                case 5: {
                        message.channelId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TaskAddBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.TaskAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.TaskAddBody} TaskAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TaskAddBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TaskAddBody message.
         * @function verify
         * @memberof tribe.TaskAddBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TaskAddBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                if (!$util.isString(message.taskId))
                    return "taskId: string expected";
            if (message.title != null && message.hasOwnProperty("title"))
                if (!$util.isString(message.title))
                    return "title: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.rewardText != null && message.hasOwnProperty("rewardText"))
                if (!$util.isString(message.rewardText))
                    return "rewardText: string expected";
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                if (!$util.isString(message.channelId))
                    return "channelId: string expected";
            return null;
        };

        /**
         * Creates a TaskAddBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.TaskAddBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.TaskAddBody} TaskAddBody
         */
        TaskAddBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.TaskAddBody)
                return object;
            var message = new $root.tribe.TaskAddBody();
            if (object.taskId != null)
                message.taskId = String(object.taskId);
            if (object.title != null)
                message.title = String(object.title);
            if (object.description != null)
                message.description = String(object.description);
            if (object.rewardText != null)
                message.rewardText = String(object.rewardText);
            if (object.channelId != null)
                message.channelId = String(object.channelId);
            return message;
        };

        /**
         * Creates a plain object from a TaskAddBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.TaskAddBody
         * @static
         * @param {tribe.TaskAddBody} message TaskAddBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TaskAddBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.taskId = "";
                object.title = "";
                object.description = "";
                object.rewardText = "";
                object.channelId = "";
            }
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                object.taskId = message.taskId;
            if (message.title != null && message.hasOwnProperty("title"))
                object.title = message.title;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.rewardText != null && message.hasOwnProperty("rewardText"))
                object.rewardText = message.rewardText;
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                object.channelId = message.channelId;
            return object;
        };

        /**
         * Converts this TaskAddBody to JSON.
         * @function toJSON
         * @memberof tribe.TaskAddBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TaskAddBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TaskAddBody
         * @function getTypeUrl
         * @memberof tribe.TaskAddBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TaskAddBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.TaskAddBody";
        };

        return TaskAddBody;
    })();

    tribe.TaskTransitionBody = (function() {

        /**
         * Properties of a TaskTransitionBody.
         * @memberof tribe
         * @interface ITaskTransitionBody
         * @property {string|null} [taskId] TaskTransitionBody taskId
         */

        /**
         * Constructs a new TaskTransitionBody.
         * @memberof tribe
         * @classdesc Represents a TaskTransitionBody.
         * @implements ITaskTransitionBody
         * @constructor
         * @param {tribe.ITaskTransitionBody=} [properties] Properties to set
         */
        function TaskTransitionBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TaskTransitionBody taskId.
         * @member {string} taskId
         * @memberof tribe.TaskTransitionBody
         * @instance
         */
        TaskTransitionBody.prototype.taskId = "";

        /**
         * Creates a new TaskTransitionBody instance using the specified properties.
         * @function create
         * @memberof tribe.TaskTransitionBody
         * @static
         * @param {tribe.ITaskTransitionBody=} [properties] Properties to set
         * @returns {tribe.TaskTransitionBody} TaskTransitionBody instance
         */
        TaskTransitionBody.create = function create(properties) {
            return new TaskTransitionBody(properties);
        };

        /**
         * Encodes the specified TaskTransitionBody message. Does not implicitly {@link tribe.TaskTransitionBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.TaskTransitionBody
         * @static
         * @param {tribe.ITaskTransitionBody} message TaskTransitionBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TaskTransitionBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.taskId != null && Object.hasOwnProperty.call(message, "taskId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.taskId);
            return writer;
        };

        /**
         * Encodes the specified TaskTransitionBody message, length delimited. Does not implicitly {@link tribe.TaskTransitionBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.TaskTransitionBody
         * @static
         * @param {tribe.ITaskTransitionBody} message TaskTransitionBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TaskTransitionBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TaskTransitionBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.TaskTransitionBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.TaskTransitionBody} TaskTransitionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TaskTransitionBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.TaskTransitionBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.taskId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TaskTransitionBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.TaskTransitionBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.TaskTransitionBody} TaskTransitionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TaskTransitionBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TaskTransitionBody message.
         * @function verify
         * @memberof tribe.TaskTransitionBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TaskTransitionBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                if (!$util.isString(message.taskId))
                    return "taskId: string expected";
            return null;
        };

        /**
         * Creates a TaskTransitionBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.TaskTransitionBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.TaskTransitionBody} TaskTransitionBody
         */
        TaskTransitionBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.TaskTransitionBody)
                return object;
            var message = new $root.tribe.TaskTransitionBody();
            if (object.taskId != null)
                message.taskId = String(object.taskId);
            return message;
        };

        /**
         * Creates a plain object from a TaskTransitionBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.TaskTransitionBody
         * @static
         * @param {tribe.TaskTransitionBody} message TaskTransitionBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TaskTransitionBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.taskId = "";
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                object.taskId = message.taskId;
            return object;
        };

        /**
         * Converts this TaskTransitionBody to JSON.
         * @function toJSON
         * @memberof tribe.TaskTransitionBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TaskTransitionBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TaskTransitionBody
         * @function getTypeUrl
         * @memberof tribe.TaskTransitionBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TaskTransitionBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.TaskTransitionBody";
        };

        return TaskTransitionBody;
    })();

    tribe.CrowdfundAddBody = (function() {

        /**
         * Properties of a CrowdfundAddBody.
         * @memberof tribe
         * @interface ICrowdfundAddBody
         * @property {string|null} [crowdfundId] CrowdfundAddBody crowdfundId
         * @property {string|null} [title] CrowdfundAddBody title
         * @property {string|null} [description] CrowdfundAddBody description
         * @property {number|null} [goalAmount] CrowdfundAddBody goalAmount
         * @property {string|null} [currency] CrowdfundAddBody currency
         * @property {number|null} [deadlineAt] CrowdfundAddBody deadlineAt
         * @property {string|null} [imageUrl] CrowdfundAddBody imageUrl
         * @property {string|null} [channelId] CrowdfundAddBody channelId
         */

        /**
         * Constructs a new CrowdfundAddBody.
         * @memberof tribe
         * @classdesc Represents a CrowdfundAddBody.
         * @implements ICrowdfundAddBody
         * @constructor
         * @param {tribe.ICrowdfundAddBody=} [properties] Properties to set
         */
        function CrowdfundAddBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CrowdfundAddBody crowdfundId.
         * @member {string} crowdfundId
         * @memberof tribe.CrowdfundAddBody
         * @instance
         */
        CrowdfundAddBody.prototype.crowdfundId = "";

        /**
         * CrowdfundAddBody title.
         * @member {string} title
         * @memberof tribe.CrowdfundAddBody
         * @instance
         */
        CrowdfundAddBody.prototype.title = "";

        /**
         * CrowdfundAddBody description.
         * @member {string} description
         * @memberof tribe.CrowdfundAddBody
         * @instance
         */
        CrowdfundAddBody.prototype.description = "";

        /**
         * CrowdfundAddBody goalAmount.
         * @member {number} goalAmount
         * @memberof tribe.CrowdfundAddBody
         * @instance
         */
        CrowdfundAddBody.prototype.goalAmount = 0;

        /**
         * CrowdfundAddBody currency.
         * @member {string} currency
         * @memberof tribe.CrowdfundAddBody
         * @instance
         */
        CrowdfundAddBody.prototype.currency = "";

        /**
         * CrowdfundAddBody deadlineAt.
         * @member {number} deadlineAt
         * @memberof tribe.CrowdfundAddBody
         * @instance
         */
        CrowdfundAddBody.prototype.deadlineAt = 0;

        /**
         * CrowdfundAddBody imageUrl.
         * @member {string} imageUrl
         * @memberof tribe.CrowdfundAddBody
         * @instance
         */
        CrowdfundAddBody.prototype.imageUrl = "";

        /**
         * CrowdfundAddBody channelId.
         * @member {string} channelId
         * @memberof tribe.CrowdfundAddBody
         * @instance
         */
        CrowdfundAddBody.prototype.channelId = "";

        /**
         * Creates a new CrowdfundAddBody instance using the specified properties.
         * @function create
         * @memberof tribe.CrowdfundAddBody
         * @static
         * @param {tribe.ICrowdfundAddBody=} [properties] Properties to set
         * @returns {tribe.CrowdfundAddBody} CrowdfundAddBody instance
         */
        CrowdfundAddBody.create = function create(properties) {
            return new CrowdfundAddBody(properties);
        };

        /**
         * Encodes the specified CrowdfundAddBody message. Does not implicitly {@link tribe.CrowdfundAddBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.CrowdfundAddBody
         * @static
         * @param {tribe.ICrowdfundAddBody} message CrowdfundAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CrowdfundAddBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.crowdfundId != null && Object.hasOwnProperty.call(message, "crowdfundId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.crowdfundId);
            if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.goalAmount != null && Object.hasOwnProperty.call(message, "goalAmount"))
                writer.uint32(/* id 4, wireType 1 =*/33).double(message.goalAmount);
            if (message.currency != null && Object.hasOwnProperty.call(message, "currency"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.currency);
            if (message.deadlineAt != null && Object.hasOwnProperty.call(message, "deadlineAt"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.deadlineAt);
            if (message.imageUrl != null && Object.hasOwnProperty.call(message, "imageUrl"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.imageUrl);
            if (message.channelId != null && Object.hasOwnProperty.call(message, "channelId"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.channelId);
            return writer;
        };

        /**
         * Encodes the specified CrowdfundAddBody message, length delimited. Does not implicitly {@link tribe.CrowdfundAddBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.CrowdfundAddBody
         * @static
         * @param {tribe.ICrowdfundAddBody} message CrowdfundAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CrowdfundAddBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CrowdfundAddBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.CrowdfundAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.CrowdfundAddBody} CrowdfundAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CrowdfundAddBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.CrowdfundAddBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.crowdfundId = reader.string();
                        break;
                    }
                case 2: {
                        message.title = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.goalAmount = reader.double();
                        break;
                    }
                case 5: {
                        message.currency = reader.string();
                        break;
                    }
                case 6: {
                        message.deadlineAt = reader.uint32();
                        break;
                    }
                case 7: {
                        message.imageUrl = reader.string();
                        break;
                    }
                case 8: {
                        message.channelId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CrowdfundAddBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.CrowdfundAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.CrowdfundAddBody} CrowdfundAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CrowdfundAddBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CrowdfundAddBody message.
         * @function verify
         * @memberof tribe.CrowdfundAddBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CrowdfundAddBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.crowdfundId != null && message.hasOwnProperty("crowdfundId"))
                if (!$util.isString(message.crowdfundId))
                    return "crowdfundId: string expected";
            if (message.title != null && message.hasOwnProperty("title"))
                if (!$util.isString(message.title))
                    return "title: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.goalAmount != null && message.hasOwnProperty("goalAmount"))
                if (typeof message.goalAmount !== "number")
                    return "goalAmount: number expected";
            if (message.currency != null && message.hasOwnProperty("currency"))
                if (!$util.isString(message.currency))
                    return "currency: string expected";
            if (message.deadlineAt != null && message.hasOwnProperty("deadlineAt"))
                if (!$util.isInteger(message.deadlineAt))
                    return "deadlineAt: integer expected";
            if (message.imageUrl != null && message.hasOwnProperty("imageUrl"))
                if (!$util.isString(message.imageUrl))
                    return "imageUrl: string expected";
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                if (!$util.isString(message.channelId))
                    return "channelId: string expected";
            return null;
        };

        /**
         * Creates a CrowdfundAddBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.CrowdfundAddBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.CrowdfundAddBody} CrowdfundAddBody
         */
        CrowdfundAddBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.CrowdfundAddBody)
                return object;
            var message = new $root.tribe.CrowdfundAddBody();
            if (object.crowdfundId != null)
                message.crowdfundId = String(object.crowdfundId);
            if (object.title != null)
                message.title = String(object.title);
            if (object.description != null)
                message.description = String(object.description);
            if (object.goalAmount != null)
                message.goalAmount = Number(object.goalAmount);
            if (object.currency != null)
                message.currency = String(object.currency);
            if (object.deadlineAt != null)
                message.deadlineAt = object.deadlineAt >>> 0;
            if (object.imageUrl != null)
                message.imageUrl = String(object.imageUrl);
            if (object.channelId != null)
                message.channelId = String(object.channelId);
            return message;
        };

        /**
         * Creates a plain object from a CrowdfundAddBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.CrowdfundAddBody
         * @static
         * @param {tribe.CrowdfundAddBody} message CrowdfundAddBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CrowdfundAddBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.crowdfundId = "";
                object.title = "";
                object.description = "";
                object.goalAmount = 0;
                object.currency = "";
                object.deadlineAt = 0;
                object.imageUrl = "";
                object.channelId = "";
            }
            if (message.crowdfundId != null && message.hasOwnProperty("crowdfundId"))
                object.crowdfundId = message.crowdfundId;
            if (message.title != null && message.hasOwnProperty("title"))
                object.title = message.title;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.goalAmount != null && message.hasOwnProperty("goalAmount"))
                object.goalAmount = options.json && !isFinite(message.goalAmount) ? String(message.goalAmount) : message.goalAmount;
            if (message.currency != null && message.hasOwnProperty("currency"))
                object.currency = message.currency;
            if (message.deadlineAt != null && message.hasOwnProperty("deadlineAt"))
                object.deadlineAt = message.deadlineAt;
            if (message.imageUrl != null && message.hasOwnProperty("imageUrl"))
                object.imageUrl = message.imageUrl;
            if (message.channelId != null && message.hasOwnProperty("channelId"))
                object.channelId = message.channelId;
            return object;
        };

        /**
         * Converts this CrowdfundAddBody to JSON.
         * @function toJSON
         * @memberof tribe.CrowdfundAddBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CrowdfundAddBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CrowdfundAddBody
         * @function getTypeUrl
         * @memberof tribe.CrowdfundAddBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CrowdfundAddBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.CrowdfundAddBody";
        };

        return CrowdfundAddBody;
    })();

    tribe.CrowdfundPledgeBody = (function() {

        /**
         * Properties of a CrowdfundPledgeBody.
         * @memberof tribe
         * @interface ICrowdfundPledgeBody
         * @property {string|null} [crowdfundId] CrowdfundPledgeBody crowdfundId
         * @property {number|null} [amount] CrowdfundPledgeBody amount
         * @property {string|null} [currency] CrowdfundPledgeBody currency
         */

        /**
         * Constructs a new CrowdfundPledgeBody.
         * @memberof tribe
         * @classdesc Represents a CrowdfundPledgeBody.
         * @implements ICrowdfundPledgeBody
         * @constructor
         * @param {tribe.ICrowdfundPledgeBody=} [properties] Properties to set
         */
        function CrowdfundPledgeBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CrowdfundPledgeBody crowdfundId.
         * @member {string} crowdfundId
         * @memberof tribe.CrowdfundPledgeBody
         * @instance
         */
        CrowdfundPledgeBody.prototype.crowdfundId = "";

        /**
         * CrowdfundPledgeBody amount.
         * @member {number} amount
         * @memberof tribe.CrowdfundPledgeBody
         * @instance
         */
        CrowdfundPledgeBody.prototype.amount = 0;

        /**
         * CrowdfundPledgeBody currency.
         * @member {string} currency
         * @memberof tribe.CrowdfundPledgeBody
         * @instance
         */
        CrowdfundPledgeBody.prototype.currency = "";

        /**
         * Creates a new CrowdfundPledgeBody instance using the specified properties.
         * @function create
         * @memberof tribe.CrowdfundPledgeBody
         * @static
         * @param {tribe.ICrowdfundPledgeBody=} [properties] Properties to set
         * @returns {tribe.CrowdfundPledgeBody} CrowdfundPledgeBody instance
         */
        CrowdfundPledgeBody.create = function create(properties) {
            return new CrowdfundPledgeBody(properties);
        };

        /**
         * Encodes the specified CrowdfundPledgeBody message. Does not implicitly {@link tribe.CrowdfundPledgeBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.CrowdfundPledgeBody
         * @static
         * @param {tribe.ICrowdfundPledgeBody} message CrowdfundPledgeBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CrowdfundPledgeBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.crowdfundId != null && Object.hasOwnProperty.call(message, "crowdfundId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.crowdfundId);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.amount);
            if (message.currency != null && Object.hasOwnProperty.call(message, "currency"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.currency);
            return writer;
        };

        /**
         * Encodes the specified CrowdfundPledgeBody message, length delimited. Does not implicitly {@link tribe.CrowdfundPledgeBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.CrowdfundPledgeBody
         * @static
         * @param {tribe.ICrowdfundPledgeBody} message CrowdfundPledgeBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CrowdfundPledgeBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CrowdfundPledgeBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.CrowdfundPledgeBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.CrowdfundPledgeBody} CrowdfundPledgeBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CrowdfundPledgeBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.CrowdfundPledgeBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.crowdfundId = reader.string();
                        break;
                    }
                case 2: {
                        message.amount = reader.double();
                        break;
                    }
                case 3: {
                        message.currency = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CrowdfundPledgeBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.CrowdfundPledgeBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.CrowdfundPledgeBody} CrowdfundPledgeBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CrowdfundPledgeBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CrowdfundPledgeBody message.
         * @function verify
         * @memberof tribe.CrowdfundPledgeBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CrowdfundPledgeBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.crowdfundId != null && message.hasOwnProperty("crowdfundId"))
                if (!$util.isString(message.crowdfundId))
                    return "crowdfundId: string expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount !== "number")
                    return "amount: number expected";
            if (message.currency != null && message.hasOwnProperty("currency"))
                if (!$util.isString(message.currency))
                    return "currency: string expected";
            return null;
        };

        /**
         * Creates a CrowdfundPledgeBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.CrowdfundPledgeBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.CrowdfundPledgeBody} CrowdfundPledgeBody
         */
        CrowdfundPledgeBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.CrowdfundPledgeBody)
                return object;
            var message = new $root.tribe.CrowdfundPledgeBody();
            if (object.crowdfundId != null)
                message.crowdfundId = String(object.crowdfundId);
            if (object.amount != null)
                message.amount = Number(object.amount);
            if (object.currency != null)
                message.currency = String(object.currency);
            return message;
        };

        /**
         * Creates a plain object from a CrowdfundPledgeBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.CrowdfundPledgeBody
         * @static
         * @param {tribe.CrowdfundPledgeBody} message CrowdfundPledgeBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CrowdfundPledgeBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.crowdfundId = "";
                object.amount = 0;
                object.currency = "";
            }
            if (message.crowdfundId != null && message.hasOwnProperty("crowdfundId"))
                object.crowdfundId = message.crowdfundId;
            if (message.amount != null && message.hasOwnProperty("amount"))
                object.amount = options.json && !isFinite(message.amount) ? String(message.amount) : message.amount;
            if (message.currency != null && message.hasOwnProperty("currency"))
                object.currency = message.currency;
            return object;
        };

        /**
         * Converts this CrowdfundPledgeBody to JSON.
         * @function toJSON
         * @memberof tribe.CrowdfundPledgeBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CrowdfundPledgeBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CrowdfundPledgeBody
         * @function getTypeUrl
         * @memberof tribe.CrowdfundPledgeBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CrowdfundPledgeBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.CrowdfundPledgeBody";
        };

        return CrowdfundPledgeBody;
    })();

    tribe.TipAddBody = (function() {

        /**
         * Properties of a TipAddBody.
         * @memberof tribe
         * @interface ITipAddBody
         * @property {number|Long|null} [recipientTid] TipAddBody recipientTid
         * @property {number|null} [amount] TipAddBody amount
         * @property {string|null} [currency] TipAddBody currency
         * @property {string|null} [targetHash] TipAddBody targetHash
         * @property {string|null} [txSignature] TipAddBody txSignature
         */

        /**
         * Constructs a new TipAddBody.
         * @memberof tribe
         * @classdesc Represents a TipAddBody.
         * @implements ITipAddBody
         * @constructor
         * @param {tribe.ITipAddBody=} [properties] Properties to set
         */
        function TipAddBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TipAddBody recipientTid.
         * @member {number|Long} recipientTid
         * @memberof tribe.TipAddBody
         * @instance
         */
        TipAddBody.prototype.recipientTid = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * TipAddBody amount.
         * @member {number} amount
         * @memberof tribe.TipAddBody
         * @instance
         */
        TipAddBody.prototype.amount = 0;

        /**
         * TipAddBody currency.
         * @member {string} currency
         * @memberof tribe.TipAddBody
         * @instance
         */
        TipAddBody.prototype.currency = "";

        /**
         * TipAddBody targetHash.
         * @member {string} targetHash
         * @memberof tribe.TipAddBody
         * @instance
         */
        TipAddBody.prototype.targetHash = "";

        /**
         * TipAddBody txSignature.
         * @member {string} txSignature
         * @memberof tribe.TipAddBody
         * @instance
         */
        TipAddBody.prototype.txSignature = "";

        /**
         * Creates a new TipAddBody instance using the specified properties.
         * @function create
         * @memberof tribe.TipAddBody
         * @static
         * @param {tribe.ITipAddBody=} [properties] Properties to set
         * @returns {tribe.TipAddBody} TipAddBody instance
         */
        TipAddBody.create = function create(properties) {
            return new TipAddBody(properties);
        };

        /**
         * Encodes the specified TipAddBody message. Does not implicitly {@link tribe.TipAddBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.TipAddBody
         * @static
         * @param {tribe.ITipAddBody} message TipAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TipAddBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.recipientTid != null && Object.hasOwnProperty.call(message, "recipientTid"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.recipientTid);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.amount);
            if (message.currency != null && Object.hasOwnProperty.call(message, "currency"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.currency);
            if (message.targetHash != null && Object.hasOwnProperty.call(message, "targetHash"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.targetHash);
            if (message.txSignature != null && Object.hasOwnProperty.call(message, "txSignature"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.txSignature);
            return writer;
        };

        /**
         * Encodes the specified TipAddBody message, length delimited. Does not implicitly {@link tribe.TipAddBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.TipAddBody
         * @static
         * @param {tribe.ITipAddBody} message TipAddBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TipAddBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TipAddBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.TipAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.TipAddBody} TipAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TipAddBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.TipAddBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.recipientTid = reader.uint64();
                        break;
                    }
                case 2: {
                        message.amount = reader.double();
                        break;
                    }
                case 3: {
                        message.currency = reader.string();
                        break;
                    }
                case 4: {
                        message.targetHash = reader.string();
                        break;
                    }
                case 5: {
                        message.txSignature = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TipAddBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.TipAddBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.TipAddBody} TipAddBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TipAddBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TipAddBody message.
         * @function verify
         * @memberof tribe.TipAddBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TipAddBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.recipientTid != null && message.hasOwnProperty("recipientTid"))
                if (!$util.isInteger(message.recipientTid) && !(message.recipientTid && $util.isInteger(message.recipientTid.low) && $util.isInteger(message.recipientTid.high)))
                    return "recipientTid: integer|Long expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount !== "number")
                    return "amount: number expected";
            if (message.currency != null && message.hasOwnProperty("currency"))
                if (!$util.isString(message.currency))
                    return "currency: string expected";
            if (message.targetHash != null && message.hasOwnProperty("targetHash"))
                if (!$util.isString(message.targetHash))
                    return "targetHash: string expected";
            if (message.txSignature != null && message.hasOwnProperty("txSignature"))
                if (!$util.isString(message.txSignature))
                    return "txSignature: string expected";
            return null;
        };

        /**
         * Creates a TipAddBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.TipAddBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.TipAddBody} TipAddBody
         */
        TipAddBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.TipAddBody)
                return object;
            var message = new $root.tribe.TipAddBody();
            if (object.recipientTid != null)
                if ($util.Long)
                    (message.recipientTid = $util.Long.fromValue(object.recipientTid)).unsigned = true;
                else if (typeof object.recipientTid === "string")
                    message.recipientTid = parseInt(object.recipientTid, 10);
                else if (typeof object.recipientTid === "number")
                    message.recipientTid = object.recipientTid;
                else if (typeof object.recipientTid === "object")
                    message.recipientTid = new $util.LongBits(object.recipientTid.low >>> 0, object.recipientTid.high >>> 0).toNumber(true);
            if (object.amount != null)
                message.amount = Number(object.amount);
            if (object.currency != null)
                message.currency = String(object.currency);
            if (object.targetHash != null)
                message.targetHash = String(object.targetHash);
            if (object.txSignature != null)
                message.txSignature = String(object.txSignature);
            return message;
        };

        /**
         * Creates a plain object from a TipAddBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.TipAddBody
         * @static
         * @param {tribe.TipAddBody} message TipAddBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TipAddBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.recipientTid = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.recipientTid = options.longs === String ? "0" : 0;
                object.amount = 0;
                object.currency = "";
                object.targetHash = "";
                object.txSignature = "";
            }
            if (message.recipientTid != null && message.hasOwnProperty("recipientTid"))
                if (typeof message.recipientTid === "number")
                    object.recipientTid = options.longs === String ? String(message.recipientTid) : message.recipientTid;
                else
                    object.recipientTid = options.longs === String ? $util.Long.prototype.toString.call(message.recipientTid) : options.longs === Number ? new $util.LongBits(message.recipientTid.low >>> 0, message.recipientTid.high >>> 0).toNumber(true) : message.recipientTid;
            if (message.amount != null && message.hasOwnProperty("amount"))
                object.amount = options.json && !isFinite(message.amount) ? String(message.amount) : message.amount;
            if (message.currency != null && message.hasOwnProperty("currency"))
                object.currency = message.currency;
            if (message.targetHash != null && message.hasOwnProperty("targetHash"))
                object.targetHash = message.targetHash;
            if (message.txSignature != null && message.hasOwnProperty("txSignature"))
                object.txSignature = message.txSignature;
            return object;
        };

        /**
         * Converts this TipAddBody to JSON.
         * @function toJSON
         * @memberof tribe.TipAddBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TipAddBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TipAddBody
         * @function getTypeUrl
         * @memberof tribe.TipAddBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TipAddBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.TipAddBody";
        };

        return TipAddBody;
    })();

    tribe.DmGroupCreateBody = (function() {

        /**
         * Properties of a DmGroupCreateBody.
         * @memberof tribe
         * @interface IDmGroupCreateBody
         * @property {string|null} [groupId] DmGroupCreateBody groupId
         * @property {string|null} [name] DmGroupCreateBody name
         * @property {Array.<number|Long>|null} [memberTids] DmGroupCreateBody memberTids
         */

        /**
         * Constructs a new DmGroupCreateBody.
         * @memberof tribe
         * @classdesc Represents a DmGroupCreateBody.
         * @implements IDmGroupCreateBody
         * @constructor
         * @param {tribe.IDmGroupCreateBody=} [properties] Properties to set
         */
        function DmGroupCreateBody(properties) {
            this.memberTids = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DmGroupCreateBody groupId.
         * @member {string} groupId
         * @memberof tribe.DmGroupCreateBody
         * @instance
         */
        DmGroupCreateBody.prototype.groupId = "";

        /**
         * DmGroupCreateBody name.
         * @member {string} name
         * @memberof tribe.DmGroupCreateBody
         * @instance
         */
        DmGroupCreateBody.prototype.name = "";

        /**
         * DmGroupCreateBody memberTids.
         * @member {Array.<number|Long>} memberTids
         * @memberof tribe.DmGroupCreateBody
         * @instance
         */
        DmGroupCreateBody.prototype.memberTids = $util.emptyArray;

        /**
         * Creates a new DmGroupCreateBody instance using the specified properties.
         * @function create
         * @memberof tribe.DmGroupCreateBody
         * @static
         * @param {tribe.IDmGroupCreateBody=} [properties] Properties to set
         * @returns {tribe.DmGroupCreateBody} DmGroupCreateBody instance
         */
        DmGroupCreateBody.create = function create(properties) {
            return new DmGroupCreateBody(properties);
        };

        /**
         * Encodes the specified DmGroupCreateBody message. Does not implicitly {@link tribe.DmGroupCreateBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.DmGroupCreateBody
         * @static
         * @param {tribe.IDmGroupCreateBody} message DmGroupCreateBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DmGroupCreateBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.groupId != null && Object.hasOwnProperty.call(message, "groupId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.groupId);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.memberTids != null && message.memberTids.length) {
                writer.uint32(/* id 3, wireType 2 =*/26).fork();
                for (var i = 0; i < message.memberTids.length; ++i)
                    writer.uint64(message.memberTids[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified DmGroupCreateBody message, length delimited. Does not implicitly {@link tribe.DmGroupCreateBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.DmGroupCreateBody
         * @static
         * @param {tribe.IDmGroupCreateBody} message DmGroupCreateBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DmGroupCreateBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DmGroupCreateBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.DmGroupCreateBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.DmGroupCreateBody} DmGroupCreateBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DmGroupCreateBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.DmGroupCreateBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.groupId = reader.string();
                        break;
                    }
                case 2: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        if (!(message.memberTids && message.memberTids.length))
                            message.memberTids = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.memberTids.push(reader.uint64());
                        } else
                            message.memberTids.push(reader.uint64());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DmGroupCreateBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.DmGroupCreateBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.DmGroupCreateBody} DmGroupCreateBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DmGroupCreateBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DmGroupCreateBody message.
         * @function verify
         * @memberof tribe.DmGroupCreateBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DmGroupCreateBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.groupId != null && message.hasOwnProperty("groupId"))
                if (!$util.isString(message.groupId))
                    return "groupId: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.memberTids != null && message.hasOwnProperty("memberTids")) {
                if (!Array.isArray(message.memberTids))
                    return "memberTids: array expected";
                for (var i = 0; i < message.memberTids.length; ++i)
                    if (!$util.isInteger(message.memberTids[i]) && !(message.memberTids[i] && $util.isInteger(message.memberTids[i].low) && $util.isInteger(message.memberTids[i].high)))
                        return "memberTids: integer|Long[] expected";
            }
            return null;
        };

        /**
         * Creates a DmGroupCreateBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.DmGroupCreateBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.DmGroupCreateBody} DmGroupCreateBody
         */
        DmGroupCreateBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.DmGroupCreateBody)
                return object;
            var message = new $root.tribe.DmGroupCreateBody();
            if (object.groupId != null)
                message.groupId = String(object.groupId);
            if (object.name != null)
                message.name = String(object.name);
            if (object.memberTids) {
                if (!Array.isArray(object.memberTids))
                    throw TypeError(".tribe.DmGroupCreateBody.memberTids: array expected");
                message.memberTids = [];
                for (var i = 0; i < object.memberTids.length; ++i)
                    if ($util.Long)
                        (message.memberTids[i] = $util.Long.fromValue(object.memberTids[i])).unsigned = true;
                    else if (typeof object.memberTids[i] === "string")
                        message.memberTids[i] = parseInt(object.memberTids[i], 10);
                    else if (typeof object.memberTids[i] === "number")
                        message.memberTids[i] = object.memberTids[i];
                    else if (typeof object.memberTids[i] === "object")
                        message.memberTids[i] = new $util.LongBits(object.memberTids[i].low >>> 0, object.memberTids[i].high >>> 0).toNumber(true);
            }
            return message;
        };

        /**
         * Creates a plain object from a DmGroupCreateBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.DmGroupCreateBody
         * @static
         * @param {tribe.DmGroupCreateBody} message DmGroupCreateBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DmGroupCreateBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.memberTids = [];
            if (options.defaults) {
                object.groupId = "";
                object.name = "";
            }
            if (message.groupId != null && message.hasOwnProperty("groupId"))
                object.groupId = message.groupId;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.memberTids && message.memberTids.length) {
                object.memberTids = [];
                for (var j = 0; j < message.memberTids.length; ++j)
                    if (typeof message.memberTids[j] === "number")
                        object.memberTids[j] = options.longs === String ? String(message.memberTids[j]) : message.memberTids[j];
                    else
                        object.memberTids[j] = options.longs === String ? $util.Long.prototype.toString.call(message.memberTids[j]) : options.longs === Number ? new $util.LongBits(message.memberTids[j].low >>> 0, message.memberTids[j].high >>> 0).toNumber(true) : message.memberTids[j];
            }
            return object;
        };

        /**
         * Converts this DmGroupCreateBody to JSON.
         * @function toJSON
         * @memberof tribe.DmGroupCreateBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DmGroupCreateBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DmGroupCreateBody
         * @function getTypeUrl
         * @memberof tribe.DmGroupCreateBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DmGroupCreateBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.DmGroupCreateBody";
        };

        return DmGroupCreateBody;
    })();

    tribe.DmGroupCipher = (function() {

        /**
         * Properties of a DmGroupCipher.
         * @memberof tribe
         * @interface IDmGroupCipher
         * @property {number|Long|null} [recipientTid] DmGroupCipher recipientTid
         * @property {string|null} [ciphertext] DmGroupCipher ciphertext
         * @property {string|null} [nonce] DmGroupCipher nonce
         */

        /**
         * Constructs a new DmGroupCipher.
         * @memberof tribe
         * @classdesc Represents a DmGroupCipher.
         * @implements IDmGroupCipher
         * @constructor
         * @param {tribe.IDmGroupCipher=} [properties] Properties to set
         */
        function DmGroupCipher(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DmGroupCipher recipientTid.
         * @member {number|Long} recipientTid
         * @memberof tribe.DmGroupCipher
         * @instance
         */
        DmGroupCipher.prototype.recipientTid = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * DmGroupCipher ciphertext.
         * @member {string} ciphertext
         * @memberof tribe.DmGroupCipher
         * @instance
         */
        DmGroupCipher.prototype.ciphertext = "";

        /**
         * DmGroupCipher nonce.
         * @member {string} nonce
         * @memberof tribe.DmGroupCipher
         * @instance
         */
        DmGroupCipher.prototype.nonce = "";

        /**
         * Creates a new DmGroupCipher instance using the specified properties.
         * @function create
         * @memberof tribe.DmGroupCipher
         * @static
         * @param {tribe.IDmGroupCipher=} [properties] Properties to set
         * @returns {tribe.DmGroupCipher} DmGroupCipher instance
         */
        DmGroupCipher.create = function create(properties) {
            return new DmGroupCipher(properties);
        };

        /**
         * Encodes the specified DmGroupCipher message. Does not implicitly {@link tribe.DmGroupCipher.verify|verify} messages.
         * @function encode
         * @memberof tribe.DmGroupCipher
         * @static
         * @param {tribe.IDmGroupCipher} message DmGroupCipher message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DmGroupCipher.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.recipientTid != null && Object.hasOwnProperty.call(message, "recipientTid"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.recipientTid);
            if (message.ciphertext != null && Object.hasOwnProperty.call(message, "ciphertext"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.ciphertext);
            if (message.nonce != null && Object.hasOwnProperty.call(message, "nonce"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.nonce);
            return writer;
        };

        /**
         * Encodes the specified DmGroupCipher message, length delimited. Does not implicitly {@link tribe.DmGroupCipher.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.DmGroupCipher
         * @static
         * @param {tribe.IDmGroupCipher} message DmGroupCipher message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DmGroupCipher.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DmGroupCipher message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.DmGroupCipher
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.DmGroupCipher} DmGroupCipher
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DmGroupCipher.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.DmGroupCipher();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.recipientTid = reader.uint64();
                        break;
                    }
                case 2: {
                        message.ciphertext = reader.string();
                        break;
                    }
                case 3: {
                        message.nonce = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DmGroupCipher message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.DmGroupCipher
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.DmGroupCipher} DmGroupCipher
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DmGroupCipher.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DmGroupCipher message.
         * @function verify
         * @memberof tribe.DmGroupCipher
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DmGroupCipher.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.recipientTid != null && message.hasOwnProperty("recipientTid"))
                if (!$util.isInteger(message.recipientTid) && !(message.recipientTid && $util.isInteger(message.recipientTid.low) && $util.isInteger(message.recipientTid.high)))
                    return "recipientTid: integer|Long expected";
            if (message.ciphertext != null && message.hasOwnProperty("ciphertext"))
                if (!$util.isString(message.ciphertext))
                    return "ciphertext: string expected";
            if (message.nonce != null && message.hasOwnProperty("nonce"))
                if (!$util.isString(message.nonce))
                    return "nonce: string expected";
            return null;
        };

        /**
         * Creates a DmGroupCipher message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.DmGroupCipher
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.DmGroupCipher} DmGroupCipher
         */
        DmGroupCipher.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.DmGroupCipher)
                return object;
            var message = new $root.tribe.DmGroupCipher();
            if (object.recipientTid != null)
                if ($util.Long)
                    (message.recipientTid = $util.Long.fromValue(object.recipientTid)).unsigned = true;
                else if (typeof object.recipientTid === "string")
                    message.recipientTid = parseInt(object.recipientTid, 10);
                else if (typeof object.recipientTid === "number")
                    message.recipientTid = object.recipientTid;
                else if (typeof object.recipientTid === "object")
                    message.recipientTid = new $util.LongBits(object.recipientTid.low >>> 0, object.recipientTid.high >>> 0).toNumber(true);
            if (object.ciphertext != null)
                message.ciphertext = String(object.ciphertext);
            if (object.nonce != null)
                message.nonce = String(object.nonce);
            return message;
        };

        /**
         * Creates a plain object from a DmGroupCipher message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.DmGroupCipher
         * @static
         * @param {tribe.DmGroupCipher} message DmGroupCipher
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DmGroupCipher.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.recipientTid = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.recipientTid = options.longs === String ? "0" : 0;
                object.ciphertext = "";
                object.nonce = "";
            }
            if (message.recipientTid != null && message.hasOwnProperty("recipientTid"))
                if (typeof message.recipientTid === "number")
                    object.recipientTid = options.longs === String ? String(message.recipientTid) : message.recipientTid;
                else
                    object.recipientTid = options.longs === String ? $util.Long.prototype.toString.call(message.recipientTid) : options.longs === Number ? new $util.LongBits(message.recipientTid.low >>> 0, message.recipientTid.high >>> 0).toNumber(true) : message.recipientTid;
            if (message.ciphertext != null && message.hasOwnProperty("ciphertext"))
                object.ciphertext = message.ciphertext;
            if (message.nonce != null && message.hasOwnProperty("nonce"))
                object.nonce = message.nonce;
            return object;
        };

        /**
         * Converts this DmGroupCipher to JSON.
         * @function toJSON
         * @memberof tribe.DmGroupCipher
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DmGroupCipher.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DmGroupCipher
         * @function getTypeUrl
         * @memberof tribe.DmGroupCipher
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DmGroupCipher.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.DmGroupCipher";
        };

        return DmGroupCipher;
    })();

    tribe.DmGroupSendBody = (function() {

        /**
         * Properties of a DmGroupSendBody.
         * @memberof tribe
         * @interface IDmGroupSendBody
         * @property {string|null} [groupId] DmGroupSendBody groupId
         * @property {string|null} [senderX25519] DmGroupSendBody senderX25519
         * @property {Array.<tribe.IDmGroupCipher>|null} [ciphertexts] DmGroupSendBody ciphertexts
         */

        /**
         * Constructs a new DmGroupSendBody.
         * @memberof tribe
         * @classdesc Represents a DmGroupSendBody.
         * @implements IDmGroupSendBody
         * @constructor
         * @param {tribe.IDmGroupSendBody=} [properties] Properties to set
         */
        function DmGroupSendBody(properties) {
            this.ciphertexts = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DmGroupSendBody groupId.
         * @member {string} groupId
         * @memberof tribe.DmGroupSendBody
         * @instance
         */
        DmGroupSendBody.prototype.groupId = "";

        /**
         * DmGroupSendBody senderX25519.
         * @member {string} senderX25519
         * @memberof tribe.DmGroupSendBody
         * @instance
         */
        DmGroupSendBody.prototype.senderX25519 = "";

        /**
         * DmGroupSendBody ciphertexts.
         * @member {Array.<tribe.IDmGroupCipher>} ciphertexts
         * @memberof tribe.DmGroupSendBody
         * @instance
         */
        DmGroupSendBody.prototype.ciphertexts = $util.emptyArray;

        /**
         * Creates a new DmGroupSendBody instance using the specified properties.
         * @function create
         * @memberof tribe.DmGroupSendBody
         * @static
         * @param {tribe.IDmGroupSendBody=} [properties] Properties to set
         * @returns {tribe.DmGroupSendBody} DmGroupSendBody instance
         */
        DmGroupSendBody.create = function create(properties) {
            return new DmGroupSendBody(properties);
        };

        /**
         * Encodes the specified DmGroupSendBody message. Does not implicitly {@link tribe.DmGroupSendBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.DmGroupSendBody
         * @static
         * @param {tribe.IDmGroupSendBody} message DmGroupSendBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DmGroupSendBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.groupId != null && Object.hasOwnProperty.call(message, "groupId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.groupId);
            if (message.senderX25519 != null && Object.hasOwnProperty.call(message, "senderX25519"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.senderX25519);
            if (message.ciphertexts != null && message.ciphertexts.length)
                for (var i = 0; i < message.ciphertexts.length; ++i)
                    $root.tribe.DmGroupCipher.encode(message.ciphertexts[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified DmGroupSendBody message, length delimited. Does not implicitly {@link tribe.DmGroupSendBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.DmGroupSendBody
         * @static
         * @param {tribe.IDmGroupSendBody} message DmGroupSendBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DmGroupSendBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DmGroupSendBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.DmGroupSendBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.DmGroupSendBody} DmGroupSendBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DmGroupSendBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.DmGroupSendBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.groupId = reader.string();
                        break;
                    }
                case 2: {
                        message.senderX25519 = reader.string();
                        break;
                    }
                case 3: {
                        if (!(message.ciphertexts && message.ciphertexts.length))
                            message.ciphertexts = [];
                        message.ciphertexts.push($root.tribe.DmGroupCipher.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DmGroupSendBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.DmGroupSendBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.DmGroupSendBody} DmGroupSendBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DmGroupSendBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DmGroupSendBody message.
         * @function verify
         * @memberof tribe.DmGroupSendBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DmGroupSendBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.groupId != null && message.hasOwnProperty("groupId"))
                if (!$util.isString(message.groupId))
                    return "groupId: string expected";
            if (message.senderX25519 != null && message.hasOwnProperty("senderX25519"))
                if (!$util.isString(message.senderX25519))
                    return "senderX25519: string expected";
            if (message.ciphertexts != null && message.hasOwnProperty("ciphertexts")) {
                if (!Array.isArray(message.ciphertexts))
                    return "ciphertexts: array expected";
                for (var i = 0; i < message.ciphertexts.length; ++i) {
                    var error = $root.tribe.DmGroupCipher.verify(message.ciphertexts[i]);
                    if (error)
                        return "ciphertexts." + error;
                }
            }
            return null;
        };

        /**
         * Creates a DmGroupSendBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.DmGroupSendBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.DmGroupSendBody} DmGroupSendBody
         */
        DmGroupSendBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.DmGroupSendBody)
                return object;
            var message = new $root.tribe.DmGroupSendBody();
            if (object.groupId != null)
                message.groupId = String(object.groupId);
            if (object.senderX25519 != null)
                message.senderX25519 = String(object.senderX25519);
            if (object.ciphertexts) {
                if (!Array.isArray(object.ciphertexts))
                    throw TypeError(".tribe.DmGroupSendBody.ciphertexts: array expected");
                message.ciphertexts = [];
                for (var i = 0; i < object.ciphertexts.length; ++i) {
                    if (typeof object.ciphertexts[i] !== "object")
                        throw TypeError(".tribe.DmGroupSendBody.ciphertexts: object expected");
                    message.ciphertexts[i] = $root.tribe.DmGroupCipher.fromObject(object.ciphertexts[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a DmGroupSendBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.DmGroupSendBody
         * @static
         * @param {tribe.DmGroupSendBody} message DmGroupSendBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DmGroupSendBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.ciphertexts = [];
            if (options.defaults) {
                object.groupId = "";
                object.senderX25519 = "";
            }
            if (message.groupId != null && message.hasOwnProperty("groupId"))
                object.groupId = message.groupId;
            if (message.senderX25519 != null && message.hasOwnProperty("senderX25519"))
                object.senderX25519 = message.senderX25519;
            if (message.ciphertexts && message.ciphertexts.length) {
                object.ciphertexts = [];
                for (var j = 0; j < message.ciphertexts.length; ++j)
                    object.ciphertexts[j] = $root.tribe.DmGroupCipher.toObject(message.ciphertexts[j], options);
            }
            return object;
        };

        /**
         * Converts this DmGroupSendBody to JSON.
         * @function toJSON
         * @memberof tribe.DmGroupSendBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DmGroupSendBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DmGroupSendBody
         * @function getTypeUrl
         * @memberof tribe.DmGroupSendBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DmGroupSendBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.DmGroupSendBody";
        };

        return DmGroupSendBody;
    })();

    tribe.DmReadBody = (function() {

        /**
         * Properties of a DmReadBody.
         * @memberof tribe
         * @interface IDmReadBody
         * @property {string|null} [conversationId] DmReadBody conversationId
         * @property {string|null} [lastReadHash] DmReadBody lastReadHash
         */

        /**
         * Constructs a new DmReadBody.
         * @memberof tribe
         * @classdesc Represents a DmReadBody.
         * @implements IDmReadBody
         * @constructor
         * @param {tribe.IDmReadBody=} [properties] Properties to set
         */
        function DmReadBody(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DmReadBody conversationId.
         * @member {string} conversationId
         * @memberof tribe.DmReadBody
         * @instance
         */
        DmReadBody.prototype.conversationId = "";

        /**
         * DmReadBody lastReadHash.
         * @member {string} lastReadHash
         * @memberof tribe.DmReadBody
         * @instance
         */
        DmReadBody.prototype.lastReadHash = "";

        /**
         * Creates a new DmReadBody instance using the specified properties.
         * @function create
         * @memberof tribe.DmReadBody
         * @static
         * @param {tribe.IDmReadBody=} [properties] Properties to set
         * @returns {tribe.DmReadBody} DmReadBody instance
         */
        DmReadBody.create = function create(properties) {
            return new DmReadBody(properties);
        };

        /**
         * Encodes the specified DmReadBody message. Does not implicitly {@link tribe.DmReadBody.verify|verify} messages.
         * @function encode
         * @memberof tribe.DmReadBody
         * @static
         * @param {tribe.IDmReadBody} message DmReadBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DmReadBody.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.conversationId != null && Object.hasOwnProperty.call(message, "conversationId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.conversationId);
            if (message.lastReadHash != null && Object.hasOwnProperty.call(message, "lastReadHash"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.lastReadHash);
            return writer;
        };

        /**
         * Encodes the specified DmReadBody message, length delimited. Does not implicitly {@link tribe.DmReadBody.verify|verify} messages.
         * @function encodeDelimited
         * @memberof tribe.DmReadBody
         * @static
         * @param {tribe.IDmReadBody} message DmReadBody message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DmReadBody.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DmReadBody message from the specified reader or buffer.
         * @function decode
         * @memberof tribe.DmReadBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {tribe.DmReadBody} DmReadBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DmReadBody.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.tribe.DmReadBody();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.conversationId = reader.string();
                        break;
                    }
                case 2: {
                        message.lastReadHash = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DmReadBody message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof tribe.DmReadBody
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {tribe.DmReadBody} DmReadBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DmReadBody.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DmReadBody message.
         * @function verify
         * @memberof tribe.DmReadBody
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DmReadBody.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.conversationId != null && message.hasOwnProperty("conversationId"))
                if (!$util.isString(message.conversationId))
                    return "conversationId: string expected";
            if (message.lastReadHash != null && message.hasOwnProperty("lastReadHash"))
                if (!$util.isString(message.lastReadHash))
                    return "lastReadHash: string expected";
            return null;
        };

        /**
         * Creates a DmReadBody message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof tribe.DmReadBody
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {tribe.DmReadBody} DmReadBody
         */
        DmReadBody.fromObject = function fromObject(object) {
            if (object instanceof $root.tribe.DmReadBody)
                return object;
            var message = new $root.tribe.DmReadBody();
            if (object.conversationId != null)
                message.conversationId = String(object.conversationId);
            if (object.lastReadHash != null)
                message.lastReadHash = String(object.lastReadHash);
            return message;
        };

        /**
         * Creates a plain object from a DmReadBody message. Also converts values to other types if specified.
         * @function toObject
         * @memberof tribe.DmReadBody
         * @static
         * @param {tribe.DmReadBody} message DmReadBody
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DmReadBody.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.conversationId = "";
                object.lastReadHash = "";
            }
            if (message.conversationId != null && message.hasOwnProperty("conversationId"))
                object.conversationId = message.conversationId;
            if (message.lastReadHash != null && message.hasOwnProperty("lastReadHash"))
                object.lastReadHash = message.lastReadHash;
            return object;
        };

        /**
         * Converts this DmReadBody to JSON.
         * @function toJSON
         * @memberof tribe.DmReadBody
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DmReadBody.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DmReadBody
         * @function getTypeUrl
         * @memberof tribe.DmReadBody
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DmReadBody.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/tribe.DmReadBody";
        };

        return DmReadBody;
    })();

    /**
     * MessageType enum.
     * @name tribe.MessageType
     * @enum {number}
     * @property {number} MESSAGE_TYPE_NONE=0 MESSAGE_TYPE_NONE value
     * @property {number} TWEET_ADD=1 TWEET_ADD value
     * @property {number} TWEET_REMOVE=2 TWEET_REMOVE value
     * @property {number} REACTION_ADD=3 REACTION_ADD value
     * @property {number} REACTION_REMOVE=4 REACTION_REMOVE value
     * @property {number} LINK_ADD=5 LINK_ADD value
     * @property {number} LINK_REMOVE=6 LINK_REMOVE value
     * @property {number} USER_DATA_ADD=7 USER_DATA_ADD value
     * @property {number} USERNAME_PROOF=8 USERNAME_PROOF value
     * @property {number} CHANNEL_ADD=9 CHANNEL_ADD value
     * @property {number} CHANNEL_JOIN=10 CHANNEL_JOIN value
     * @property {number} CHANNEL_LEAVE=11 CHANNEL_LEAVE value
     * @property {number} DM_KEY_REGISTER=12 DM_KEY_REGISTER value
     * @property {number} DM_SEND=13 DM_SEND value
     * @property {number} BOOKMARK_ADD=14 BOOKMARK_ADD value
     * @property {number} BOOKMARK_REMOVE=15 BOOKMARK_REMOVE value
     * @property {number} POLL_ADD=16 POLL_ADD value
     * @property {number} POLL_VOTE=17 POLL_VOTE value
     * @property {number} EVENT_ADD=18 EVENT_ADD value
     * @property {number} EVENT_RSVP=19 EVENT_RSVP value
     * @property {number} TASK_ADD=20 TASK_ADD value
     * @property {number} TASK_CLAIM=21 TASK_CLAIM value
     * @property {number} TASK_COMPLETE=22 TASK_COMPLETE value
     * @property {number} CROWDFUND_ADD=23 CROWDFUND_ADD value
     * @property {number} CROWDFUND_PLEDGE=24 CROWDFUND_PLEDGE value
     * @property {number} TIP_ADD=25 TIP_ADD value
     * @property {number} DM_GROUP_CREATE=26 DM_GROUP_CREATE value
     * @property {number} DM_GROUP_SEND=27 DM_GROUP_SEND value
     * @property {number} DM_READ=28 DM_READ value
     */
    tribe.MessageType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "MESSAGE_TYPE_NONE"] = 0;
        values[valuesById[1] = "TWEET_ADD"] = 1;
        values[valuesById[2] = "TWEET_REMOVE"] = 2;
        values[valuesById[3] = "REACTION_ADD"] = 3;
        values[valuesById[4] = "REACTION_REMOVE"] = 4;
        values[valuesById[5] = "LINK_ADD"] = 5;
        values[valuesById[6] = "LINK_REMOVE"] = 6;
        values[valuesById[7] = "USER_DATA_ADD"] = 7;
        values[valuesById[8] = "USERNAME_PROOF"] = 8;
        values[valuesById[9] = "CHANNEL_ADD"] = 9;
        values[valuesById[10] = "CHANNEL_JOIN"] = 10;
        values[valuesById[11] = "CHANNEL_LEAVE"] = 11;
        values[valuesById[12] = "DM_KEY_REGISTER"] = 12;
        values[valuesById[13] = "DM_SEND"] = 13;
        values[valuesById[14] = "BOOKMARK_ADD"] = 14;
        values[valuesById[15] = "BOOKMARK_REMOVE"] = 15;
        values[valuesById[16] = "POLL_ADD"] = 16;
        values[valuesById[17] = "POLL_VOTE"] = 17;
        values[valuesById[18] = "EVENT_ADD"] = 18;
        values[valuesById[19] = "EVENT_RSVP"] = 19;
        values[valuesById[20] = "TASK_ADD"] = 20;
        values[valuesById[21] = "TASK_CLAIM"] = 21;
        values[valuesById[22] = "TASK_COMPLETE"] = 22;
        values[valuesById[23] = "CROWDFUND_ADD"] = 23;
        values[valuesById[24] = "CROWDFUND_PLEDGE"] = 24;
        values[valuesById[25] = "TIP_ADD"] = 25;
        values[valuesById[26] = "DM_GROUP_CREATE"] = 26;
        values[valuesById[27] = "DM_GROUP_SEND"] = 27;
        values[valuesById[28] = "DM_READ"] = 28;
        return values;
    })();

    /**
     * ReactionType enum.
     * @name tribe.ReactionType
     * @enum {number}
     * @property {number} REACTION_TYPE_NONE=0 REACTION_TYPE_NONE value
     * @property {number} LIKE=1 LIKE value
     * @property {number} RECAST=2 RECAST value
     */
    tribe.ReactionType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "REACTION_TYPE_NONE"] = 0;
        values[valuesById[1] = "LIKE"] = 1;
        values[valuesById[2] = "RECAST"] = 2;
        return values;
    })();

    /**
     * ChannelKind enum.
     * @name tribe.ChannelKind
     * @enum {number}
     * @property {number} CHANNEL_KIND_NONE=0 CHANNEL_KIND_NONE value
     * @property {number} GENERAL=1 GENERAL value
     * @property {number} CITY=2 CITY value
     * @property {number} INTEREST=3 INTEREST value
     */
    tribe.ChannelKind = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "CHANNEL_KIND_NONE"] = 0;
        values[valuesById[1] = "GENERAL"] = 1;
        values[valuesById[2] = "CITY"] = 2;
        values[valuesById[3] = "INTEREST"] = 3;
        return values;
    })();

    /**
     * Network enum.
     * @name tribe.Network
     * @enum {number}
     * @property {number} NETWORK_NONE=0 NETWORK_NONE value
     * @property {number} MAINNET=1 MAINNET value
     * @property {number} DEVNET=2 DEVNET value
     */
    tribe.Network = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "NETWORK_NONE"] = 0;
        values[valuesById[1] = "MAINNET"] = 1;
        values[valuesById[2] = "DEVNET"] = 2;
        return values;
    })();

    return tribe;
})();

module.exports = $root;
