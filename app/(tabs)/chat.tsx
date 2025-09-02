import React, { useEffect, useState } from 'react';
import { View, FlatList, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { auth, db } from '../../services/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import ChatBubble from '../../components/ChatBubble';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  text: string;
  uid: string;
  email: string;
  createdAt: any;
}

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace('/(tabs)/Login');
      return;
    }

    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Message));
      setMessages(messageList);
    }, (error) => {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    });

    return unsubscribe;
  }, []);

  const sendMessage = async () => {
    if (message.trim() === '' || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: message.trim(),
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      return timestamp.toDate().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble 
            message={item.text}
            isSender={item.uid === auth.currentUser?.uid}
            timestamp={formatTimestamp(item.createdAt)}
          />
        )}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <Button title="Send" onPress={sendMessage} disabled={!message.trim()} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  messagesList: {
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'flex-end',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
});