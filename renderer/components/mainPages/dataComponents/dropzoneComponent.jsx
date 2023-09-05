import React, { useCallback, useState, useContext } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios';
import { parse } from "csv";
import fs from 'fs';
import os from 'os';
import { WorkspaceContext } from '../../workspace/WorkspaceContext';

export default function DropzoneComponent({ children }) {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Retrieve the Workspace context from the WorkspaceProvider
    const { workspace, setWorkspace } = useContext(WorkspaceContext);
    console.log('TEST',workspace['path']);
    const onDrop = useCallback(acceptedFiles => {
        const reader = new FileReader();

        reader.onabort = () => console.log("file reading was aborted");
        reader.onerror = () => console.log("file reading failed");
        reader.onload = () => {
            // Parse CSV file
            acceptedFiles.forEach((file) => {
                console.log('file', file);
            parse(reader.result, (err, data) => {
                console.log("Parsed CSV data: ", data);
                fs.writeFile(`${workspace['path']}/DATA/${file['name']}`, data.join('\n'), 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                    } else {
                        console.log('File written successfully');
                    }
                });
            });
            });
        };
      
        // read file contents
        acceptedFiles.forEach((file) => reader.readAsText(file));
    }, []);

    
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({ onDrop });

    
    const handleDownload = () => {

    };

    return (
        <div style={{ display: 'block' }}>
            <div {...getRootProps()} style={{ display: 'grid' }} >
                <input {...getInputProps()} />
                {children}
            </div>
            {uploadedFile && (
                <div>
                    <p>File uploaded: {uploadedFile}</p>
                    <button onClick={handleDownload}>Download File</button>
                </div>
            )}
            {uploadProgress > 0 && (
                <div>
                    <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>
                    <progress max="100" value={uploadProgress}></progress>
                </div>
            )}
        </div>
    )
}