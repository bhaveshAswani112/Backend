import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/APiResponse.js";


const registerUser = asyncHandler(async (req,res)=>{
    // will take data from frontend
    // validate the data => check required field are not empty
    // check if username and email already exists or not
    // check for images , check for avatar as it is required
    // upload them to cloudinary
    // create user object - entry in db
    // remove password and refresh token from response
    // check for user creation
    // return response

    const {fullName,username,email,password} = req.body
    if(
        [fullName,username,email,password].some((field) => field?.trim() === "")
    ){
        ApiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or : [{ username } , { email }]
    }
    )
    if(existedUser){
        throw new ApiError(409,"User with mail or username already exists")
    }

    const avatar_local_path = req.files?.avatar[0]?.path
    const cover_local_path = req.files?.coverImage[0]?.path
    if(!avatar_local_path)throw new ApiError(400,"Avatar is required")

    const avatar = await uploadOnCloudinary(avatar_local_path)
    const coverImage = await uploadOnCloudinary(cover_local_path)

    if(!avatar)throw new ApiError(400,"Avatar is required")

    const user = await User.create({
        fullName : fullName,
        username : username.toLwerCase(),
        email : email,
        password : password,
        avatar : avatar.url,
        coverImage : coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id)?.select(
        "-password -refreshToken"
    )
    if(!createdUser)throw new ApiError(500,"Error while registering the user")

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registerd Successfully")
    )

})

export {registerUser}