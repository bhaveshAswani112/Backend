import mongoose , {Schema} from "mongoose";

const likeSchema = new Schema({
    likedBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    video : 
        {
        type : Schema.Types.ObjectId,
        ref : "Video"
        }
    ,  
    comment : 
        {
        type : Schema.Types.ObjectId,
        ref : "Comment"
        }
    , 
    tweet : 
        {
        type : Schema.Types.ObjectId,
        ref : "Tweet"
        }
       
},{timestamps : true})


likeSchema.methods.removeLike = async function(){
    try {
        const resp = await Like.deleteOne(
            {
                _id : this._id
            }
        )
        console.log("Like deleted successfully.")
        return resp
    } 
    catch (error) {
        console.log("There was some error during deleting like.")
    }
}

export const Like = mongoose.model("Like",likeSchema)