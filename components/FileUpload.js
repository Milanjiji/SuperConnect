import React,{useState} from "react";
import { View,Text,Button } from "react-native";
import DocumentPicker from 'react-native-document-picker';
import Upload from 'react-native-background-upload';

const FileUpload = (props) =>{

    const [responseMessage, setResponseMessage] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0); 
    const [uploadSpeed, setUploadSpeed] = useState(''); 

    let previousLoaded = 0;
    let previousTimestamp = Date.now();

    const uploadFile = async () => {
      try {
        const file = await DocumentPicker.pickSingle({
          type: [DocumentPicker.types.allFiles],
        });
    
        const options = {
          url: `${props.ip}api/upload`,
          path: file.uri,
          method: 'POST',
          field: 'file',
          type: 'multipart',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
    
        const uploadId = await Upload.startUpload(options);
    
        Upload.addListener('progress', uploadId, (data) => {
          const percentComplete = Math.round(data.progress);
          setUploadProgress(percentComplete);

          const currentTime = Date.now();
          const timeElapsed = (currentTime - previousTimestamp) / 1000; // in seconds
          const bytesUploadedSinceLast = data.totalBytesSent - previousLoaded;

          if (timeElapsed > 0) {
            const speedInBytesPerSecond = bytesUploadedSinceLast / timeElapsed;
            console.log(bytesUploadedSinceLast / timeElapsed);
            
            setUploadSpeed(`${(speedInBytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`);
            console.log(`${(speedInBytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`);
             // Speed in MB/s
          }

          previousLoaded = data.totalBytesSent;
          previousTimestamp = currentTime;
        });
    
        Upload.addListener('error', uploadId, (data) => {
          setResponseMessage(`Error: ${data.error}`);
        });
    
        Upload.addListener('completed', uploadId, (data) => {
          setResponseMessage(`File uploaded successfully: ${data.responseBody}`);
        });
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          setResponseMessage('File selection was canceled');
        } else {
          setResponseMessage(`Error: ${err.message}`);
        }
      }
    };
    
    return(
        <View style={{display : props.connection ? 'flex' : 'none',flexDirection:'column'}} >
            <Button title="Upload File" onPress={uploadFile} />
                {responseMessage ? (
                <Text >{responseMessage}</Text>
                ) : null}
            
            <Text>Current Progress : {uploadProgress}</Text>
            <Text>Current Speed : {uploadSpeed}</Text>
        </View>
    )
}

export default FileUpload;