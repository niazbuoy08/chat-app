import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  Text,
  ActivityIndicator,
  SafeAreaView,
  Image
} from 'react-native';
import { auth, db } from '../../services/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, signOut } from 'firebase/firestore';
import ChatBubble from '../../components/ChatBubble';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
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
      setIsLoading(false);
      
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        if (flatListRef.current && messageList.length > 0) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }, (error) => {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const sendMessage = async () => {
    if (message.trim() === '' || !auth.currentUser) return;

    setIsSending(true);
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
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/(tabs)/Login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
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

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Room</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>Loading messages...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.emptyIcon} 
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptyText}>Be the first to send a message!</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble 
              message={item.text}
              isSender={item.uid === auth.currentUser?.uid}
              timestamp={formatTimestamp(item.createdAt)}
            />
          )}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.emptyList
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          onContentSizeChange={() => {
            if (flatListRef.current && messages.length > 0) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }}
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
            editable={!isSending}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              (!message.trim() || isSending) && styles.disabledSendButton
            ]} 
            onPress={sendMessage}
            disabled={!message.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: { 
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  messagesList: {
    padding: 10,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'flex-end',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: '#ccc',
  },
});