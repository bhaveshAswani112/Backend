import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"       
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret:  process.env.CLOUDINARY_SECRET
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if(!filePath)return null
        const response = await cloudinary.uploader.upload(filePath,{
            resource_type : 'auto'
        })
        // console.log("File has been uploaded successfully!!!"  ,response.url)
        fs.unlinkSync(filePath)
        // console.log("I am cloudinary response  ",response)
        return response
        
    } catch (error) {
        fs.unlinkSync(filePath) // remove the locally save temporary file as the upload operation got failed
    }
    
}

const deleteFromCloudinary = async(public_url) => {
    try {
        if(!public_url)return null
        const idx = public_url.split("/").pop().lastIndexOf('.')
        const public_id = public_url.split("/").pop().slice(0,idx)
        if(!public_id)return null
        const resp = await cloudinary.uploader.destroy(public_id)
        return resp
    } catch (error) {
        console.log("Error while deleting image from cloudinary ",error)
    }
}

export {uploadOnCloudinary,deleteFromCloudinary}