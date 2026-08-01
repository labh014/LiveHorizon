package com.livehorizon.signaling;

/** One chat line, in the argument order the client's `chat-message` handler expects. */
public record ChatMessage(String data, String sender, String socketIdSender) {
}
