import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if(!name){
        throw new ApiError(400,"Name of playlist is required")
    }
    const resp = await Playlist.create(
        {
            name : name,
            description : description ? description : "",
            owner : req?.user
        }
    )
    if(!resp){
        throw new ApiError(500,"Error from backend side on creating playlist")
    }
    return res.status(200).json(
        new ApiResponse(200,{resp},"Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!userId){
        throw new ApiError(400,"Please provide a valid userId")
    }
    const playlists = await Playlist.find(
        {
            owner : userId
        }
    )
    if(!playlists || playlists.length==0){
        throw new ApiError("No playlist exist for this user")
    }
    return res.status(200).json(
        new ApiResponse(200,{playlists},"Playlists fetched successfully")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId){
        throw new ApiError(400,"Please provide a valid playlist id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"No playlist exist with this id")
    }
    return res.status(200).json(
        new ApiResponse(200,playlist,"Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId || !videoId){
        throw new ApiError(400,"Incorrect id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"Playlist not found")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video not found")
    }
    playlist.videos.push(video)
    const resp = await playlist.save({validateBeforeSave : false})
    return res.status(200).json(
        new ApiResponse(200,resp,"Video added in playlist")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId || !videoId){
        throw new ApiError(400,"Incorrect id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"Playlist not found")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video not found")
    }
    const idx = playlist.videos.indexOf(video)
    if(idx!=-1){
        throw new ApiError(400,"Video is not present in this playlist")
    }
    playlist.videos.splice(idx,1)
    const resp = await playlist.save({validateBeforeSave : false})
    return res.status(200).json(
        new ApiResponse(200,resp,"Video removed from  playlist")
    )


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(400,"Please provide a valid playlist id")
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId)
    if(!playlist){
        throw new ApiError(400,"No playlist exist with this id")
    }
    return res.status(200).json(
        new ApiResponse(200,playlist,'Playlist deleted successfully')
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId){
        throw new ApiError(400,"Please provide a valid playlist id")
    }
    if(!name && !description){
        throw new ApiError(400,"Nothing to update in playlist")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"No playlist exist with this id")
    }
    if(name){
        playlist.name  = name
    }
    if(description){
        playlist.description  = description
    }
    const resp = await playlist.save({validateBeforeSave : false})
    if(!resp){
        throw new ApiError(500,"Error from backend side")
    }
    return res.status(200).json(
        new ApiResponse(200,{resp},'Playlist updated successfully')
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
