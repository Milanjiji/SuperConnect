import React,{useState} from "react";
import {View,Text,TextInput,Button} from 'react-native'

const TextUpload = (props) =>{
    const [inputData, setInputData] = useState('');
    const [responseMessage, setResponseMessage] = useState('');


    const sendDataToServer = async () => {
        const serverUrl = `${props.ip}api/text`; // Replace with your PC's IP address
    
        try {
          const response = await fetch(serverUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: inputData }), // Sending data as JSON
          });
    
          const result = await response.json();
          setResponseMessage(`Server response: ${JSON.stringify(result)}`);
        } catch (error) {
          setResponseMessage(`Error: ${error.message}`);
        }
      };

    return(
        <View style={{display : props.connection ? 'flex' : 'none',flexDirection:'column'}} >
            <TextInput
                placeholder="Enter some data"
                value={inputData}
                onChangeText={setInputData}
                />
            <Button title="Send to Server" onPress={sendDataToServer} />
            {responseMessage ? (
                <Text >{responseMessage}</Text>
            ) : null}
        </View>
    )
}

export default TextUpload;