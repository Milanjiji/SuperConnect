import React,{useState} from "react";
import { View,Text,Button } from "react-native";
import DocumentPicker from 'react-native-document-picker';
import Upload from 'react-native-background-upload';

const FileUpload = (props) =>{

    const [responseMessage, setResponseMessage] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0); 
    const [uploadState,setUploadState] = useState('');


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
        });
    
        Upload.addListener('error', uploadId, (data) => {
          setUploadState('Upload failed')
        });
    
        Upload.addListener('completed', uploadId, (data) => {
          setUploadState('File Uploaded Successfully')

        });
      } catch (err) {
      setUploadState(err)
        
      }
    };
    
    return(
        <View style={{display : props.connection ? 'flex' : 'none',flexDirection:'column',width:'100%',marginTop:40}} >
            <Button title="Upload File" onPress={uploadFile} />
              <View style={{
                height:10,
                width:`${uploadProgress}%`,
                backgroundColor:'green',
                marginTop:10,
                borderRadius:10
              }} ></View>
              <Text style={{color:'black',marginTop:10}} >Current Progress : {uploadProgress}% {uploadState}</Text>
        </View>
    )
}

export default FileUpload;