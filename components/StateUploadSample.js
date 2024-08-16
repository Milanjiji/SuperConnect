import React,{useState,useEffect} from "react";
import { Text, View,Button } from "react-native";

const StateUpload = (props) =>{

    const [isSending, setIsSending] = useState(false);
    console.log(props.ip,"from state");
    
    useEffect(() => {
        let intervalId;
        if (isSending) {
        intervalId = setInterval(() => {
            sendTextData();
        }, 100); 
        }
        return () => clearInterval(intervalId);
    }, [isSending]);

    const sendTextData = async () => {
        try {
        const response = await fetch(`${props.ip}api/state`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: 'Hello, Server!' }),
        });

        const data = await response.json();
        console.log('Server response:', data);
        } catch (error) {
        console.error('Error sending text data:', error);
        }
    };

    const toggleSending = () => {
        setIsSending(!isSending);
    };

    return (
        <View>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>Text Sending App</Text>
            <Button
                title={isSending ? 'Stop Sending' : 'Start Sending'}
                onPress={toggleSending}
            />

            
        </View>
    )
}

export default StateUpload;