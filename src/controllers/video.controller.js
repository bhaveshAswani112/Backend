import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import fs from "fs";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description){
        throw new ApiError(400,"title and description is required")
    }
    let video_path = undefined
    let thumbnail_path = undefined
    if(req.files && Array.isArray(req.files.videoFile) && req.files?.videoFile.length > 0){
        video_path = req.files?.videoFile[0].path
    }
    if(req.files && Array.isArray(req.files.thumbnail) && req.files?.thumbnail.length > 0){
        thumbnail_path = req.files?.thumbnail[0].path
    }
    if(!video_path || !thumbnail_path){
        throw new ApiError(400,"video_path and thumbnail are required")
    }
    const vidres = await uploadOnCloudinary(video_path)
    const thumres = await uploadOnCloudinary(thumbnail_path)

    if(!thumres){
        fs.unlinkSync(req.files.thumbnail[0].path)
        throw new ApiError(400,"Error in uploading thumbnail")
    }
    if(!vidres){
        fs.unlinkSync(req.files.videoFile[0].path)
        throw new ApiError(400,"Error in uploading video")
    }
    
    console.log(vidres)
    const video = await Video.create({
        title : title,
        description : description,
        duration : vidres.duration,
        videoFile : vidres?.url,
        thumbnail : thumres?.url,
        owner : req?.user,
    })
    return res.status(200).json(
        new ApiResponse(200,video,"Video and thumbnail uploaded successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    console.log(videoId)
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"No video available with this id")
    }
    return res.status(200).json(
        new ApiResponse(200,video,"Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    let {title , description} = req.body
    const oldvideo = await Video.findById(videoId)
    if(!oldvideo){
        throw new ApiError(400,"No video with this id exist")
    }
    let thumbnail_path = req.file?.path

    if(!title && !description && !thumbnail_path){
        throw new ApiError(400,"Nothing to update")
    }
    let resp = undefined
    if(thumbnail_path){
       resp = await uploadOnCloudinary(thumbnail_path) 
    }
    let thmburl = oldvideo.thumbnail
    let video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set : {
                title : title ? title : oldvideo.title,
                description : description ? description : oldvideo.description,
                thumbnail : resp?.url ? thumbnail : oldvideo.thumbnail
            }
        }
    )
    await deleteFromCloudinary(thmburl)
    video = await Video.findById(videoId)
    return res.status(200).json(
        new ApiResponse(200,{video},"Video updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const dlt = await Video.findByIdAndDelete(videoId)
    if(!dlt){
        throw new ApiError(400,"No video by this id")
    }
    await deleteFromCloudinary(dlt.videoFile)
    await deleteFromCloudinary(dlt.thumbnail)
    return res.status(200).json(
        new ApiResponse(200,{dlt},"Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
