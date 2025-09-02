import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface ChatBubbleProps {
  message: string;
  isSender: boolean;
  avatarUrl?: string;
  timestamp?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isSender, avatarUrl, timestamp }) => {
  return (
    <View style={[styles.container, isSender ? styles.senderContainer : styles.receiverContainer]}>
      {!isSender && avatarUrl && <Image source={{ uri: avatarUrl }} style={styles.avatar} />}
      <View style={styles.bubbleWrapper}>
        <View style={[styles.bubble, isSender ? styles.senderBubble : styles.receiverBubble]}>
          <Text style={[styles.messageText, isSender ? styles.senderText : styles.receiverText]}>
            {message}
          </Text>
        </View>
        {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
      </View>
      {isSender && avatarUrl && <Image source={{ uri: avatarUrl }} style={styles.avatar} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  senderContainer: {
    justifyContent: 'flex-end',
  },
  receiverContainer: {
    justifyContent: 'flex-start',
  },
  bubbleWrapper: {
    maxWidth: '75%',
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  senderBubble: {
    backgroundColor: '#0B93F6',
    borderBottomRightRadius: 0,
  },
  receiverBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  senderText: {
    color: 'white',
  },
  receiverText: {
    color: 'black',
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 4,
  },
});

export default ChatBubble;
