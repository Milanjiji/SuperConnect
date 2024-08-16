import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet,TextInput,Button } from 'react-native';


import Chunks from './Chunk';
import TextUpload from './components/TextUpload';
import FileUpload from './components/FileUpload';
import StateUpload from './components/StateUploadSample';

const App = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [connection,setConnection] = useState(false)
  const [ip,setIp] = useState('http://192.168.43.79:3000/');

  
  console.log(ip);
  

    const CheakConnection = async () => {
      try {
        const response = await fetch(ip, {
          method: 'GET', // or 'POST', etc.
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        console.log(result);
        setConnection(true);
        setError('All good');
      } catch (err) {
        setError(err.message);
        console.log(err.message);
        
      }

    };

 
  return (
    <View style={styles.container}>

      <View>
        <TextInput onChangeText={(text)=>setIp(`http://${text}:3000/`)} style={{borderWidth:1,borderColor:'black',margin:10}} placeholder='Enter the ip address' />
        <Button onPress={CheakConnection} title='Connect' />
      </View>

      {error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : data ? (
          <Text style={styles.dataText}>Data from server: {JSON.stringify(data)}</Text>
        ) : (
          <Text style={styles.loadingText}>Loading...</Text>
        )}


      <TextUpload ip={ip} connection={connection} />
      <FileUpload ip={ip} connection={connection} />
      <StateUpload ip={ip} />
      


      
      {/* <Chunks /> */}
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
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  errorText: {
    fontSize: 18,
    color: 'black',
  },
  dataText: {
    fontSize: 18,
    color: '#333',
  },
});

export default App;
