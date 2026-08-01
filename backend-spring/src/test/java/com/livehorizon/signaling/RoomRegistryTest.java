package com.livehorizon.signaling;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import com.livehorizon.TestProperties;

import org.junit.jupiter.api.Test;

class RoomRegistryTest {

    private static final String ROOM = "https://app.example/meeting-42";

    @Test
    void joinReturnsEveryMemberInJoinOrder() {
        RoomRegistry registry = new RoomRegistry(TestProperties.defaults());

        assertThat(registry.join(ROOM, "a").members()).containsExactly("a");
        assertThat(registry.join(ROOM, "b").members()).containsExactly("a", "b");
        assertThat(registry.join(ROOM, "c").members()).containsExactly("a", "b", "c");
    }

    @Test
    void joinReplaysExistingChatHistory() {
        RoomRegistry registry = new RoomRegistry(TestProperties.defaults());
        registry.join(ROOM, "a");
        registry.recordMessage("a", "hello", "Ada");

        RoomRegistry.JoinResult joined = registry.join(ROOM, "b");

        assertThat(joined.history()).containsExactly(new ChatMessage("hello", "Ada", "a"));
    }

    @Test
    void chatHistoryIsCappedAtTheConfiguredLimit() {
        RoomRegistry registry = new RoomRegistry(TestProperties.withChatHistoryLimit(3));
        registry.join(ROOM, "a");

        for (int i = 0; i < 10; i++) {
            registry.recordMessage("a", "message-" + i, "Ada");
        }

        List<ChatMessage> history = registry.join(ROOM, "b").history();
        assertThat(history).hasSize(3);
        assertThat(history).extracting(ChatMessage::data)
                .containsExactly("message-7", "message-8", "message-9");
    }

    @Test
    void leaveReportsRemainingMembers() {
        RoomRegistry registry = new RoomRegistry(TestProperties.defaults());
        registry.join(ROOM, "a");
        registry.join(ROOM, "b");

        RoomRegistry.LeaveResult result = registry.leave("a").orElseThrow();

        assertThat(result.roomName()).isEqualTo(ROOM);
        assertThat(result.remainingMembers()).containsExactly("b");
    }

    @Test
    void emptyRoomIsReleasedAlongWithItsHistory() {
        RoomRegistry registry = new RoomRegistry(TestProperties.defaults());
        registry.join(ROOM, "a");
        registry.recordMessage("a", "hello", "Ada");

        registry.leave("a");

        assertThat(registry.roomCount()).isZero();
        assertThat(registry.connectedCount()).isZero();
        assertThat(registry.join(ROOM, "b").history()).isEmpty();
    }

    @Test
    void leavingTwiceIsANoOp() {
        RoomRegistry registry = new RoomRegistry(TestProperties.defaults());
        registry.join(ROOM, "a");

        assertThat(registry.leave("a")).isPresent();
        assertThat(registry.leave("a")).isEmpty();
    }

    @Test
    void messagesFromSocketsOutsideAnyRoomAreDropped() {
        RoomRegistry registry = new RoomRegistry(TestProperties.defaults());

        assertThat(registry.recordMessage("ghost", "hello", "Ada")).isEmpty();
    }

    @Test
    void sharesRoomIsTrueOnlyWithinTheSameRoom() {
        RoomRegistry registry = new RoomRegistry(TestProperties.defaults());
        registry.join(ROOM, "a");
        registry.join(ROOM, "b");
        registry.join("other-room", "c");

        assertThat(registry.sharesRoom("a", "b")).isTrue();
        assertThat(registry.sharesRoom("a", "c")).isFalse();
        assertThat(registry.sharesRoom("a", "unknown")).isFalse();
    }
}
