import React, { useState } from 'react';
import { View, Button, Text, StyleSheet,PermissionsAndroid,ToastAndroid } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { Platform,Alert,Linking } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';


const CHUNK_SIZE = 1024 * 1024  // 5MB chunks

const Chunks = () => {
  const [responseMessage, setResponseMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const grandPermission = async () =>{
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);
  
    if (
      granted['android.permission.READ_EXTERNAL_STORAGE'] === 'never_ask_again' ||
      granted['android.permission.WRITE_EXTERNAL_STORAGE'] === 'never_ask_again'
    ) {
      handlePermissionsDenied();
    } else if (
      granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log('Permissions granted');
      uploadFileInChunks();

    } else {
      console.log('Permissions denied');
    }
    
  }

  const handlePermissionsDenied = () => {
    Alert.alert(
      "Permission Required",
      "This app needs storage access to function properly. Please enable the permissions from the app settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() }
      ],
      { cancelable: false }
    );
  };

  const uploadFileInChunks = async () => {
    try {
      // Pick a file using the DocumentPicker
      const file = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
  
      console.log('File URI:', file.uri);
  
      let totalChunks;
      let previousLoaded = 0;
      let currentChunk = 0;
  
      // Create a file stream with RNFetchBlob for content URIs
      const fileStream = RNFetchBlob.fs.readStream(
        file.uri,
        'base64',
        CHUNK_SIZE
      );
  
      // Calculate total number of chunks
      if (Platform.OS === 'android') {
        const fileStat = await RNFetchBlob.fs.stat(file.uri);
        totalChunks = Math.ceil(fileStat.size / CHUNK_SIZE);
      } else {
        const fileStat = await RNFS.stat(file.uri.replace('file://', ''));
        totalChunks = Math.ceil(fileStat.size / CHUNK_SIZE);
      }
  
      // Function to upload a single chunk
      const uploadChunk = async (chunk, chunkIndex) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://192.168.x.x:3000/upload', true); // Replace with your server URL
  
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(((previousLoaded + event.loaded) / totalChunks) * 100);
            setUploadProgress(percentComplete);
          }
        });
  
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            console.log(`Chunk ${chunkIndex + 1} uploaded successfully`);
            previousLoaded += chunk.length; // Update loaded size
            currentChunk += 1;
            if (currentChunk < totalChunks) {
              uploadNextChunk(); // Upload the next chunk
            } else {
              setResponseMessage('File uploaded successfully');
            }
          } else {
            setResponseMessage(`Error: ${xhr.statusText}`);
          }
        });
  
        xhr.addEventListener('error', () => {
          setResponseMessage('Upload failed due to network error.');
        });
  
        xhr.addEventListener('timeout', () => {
          setResponseMessage('Upload failed due to timeout.');
        });
  
        // Convert base64 chunk to binary blob
        const byteCharacters = atob(chunk);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blobChunk = new Blob([byteArray]);
  
        xhr.send(blobChunk);
      };
  
      // Function to read and upload the next chunk
      const uploadNextChunk = () => {
        fileStream.open();
        fileStream.onData(async (chunk) => {
          await uploadChunk(chunk, currentChunk);
        });
  
        fileStream.onError((err) => {
          console.log('Chunk read error:', err);
          setResponseMessage(`Error: ${err.message}`);
        });
  
        fileStream.onEnd(() => {
          console.log('All chunks have been read');
        });
      };
  
      // Start uploading the first chunk
      uploadNextChunk();
  
    } catch (err) {
      console.log(err);
      if (DocumentPicker.isCancel(err)) {
        setResponseMessage('File selection was canceled');
      } else {
        setResponseMessage(`Error: ${err.message}`);
      }
    }
  };
  

  return (
    <View style={styles.container}>
      <Button title="Upload File" onPress={grandPermission} />
      <Text style={styles.responseText}>Upload Progress: {uploadProgress}%</Text>
      {responseMessage ? <Text style={styles.responseText}>{responseMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fcff',
  },
  responseText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});

export default Chunks;
