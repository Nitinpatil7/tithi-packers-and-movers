//controller
const authmiddlewere = require("./middlwere/authmiddlewere");
const blog = require("./models/blog");

const createblog = async (req,res)=>{
   try {
     const {title , content} = req.body;
    
    if(!title && !content ){
        return res.status(404).json({message:"title and content is required "})
    }

    if(title.length < 5 ){
        return res.status(400).json({message:"title must be less that 5 Char "})
    }
    if( content.length < 20){
        return res.status(400).json({message:"content must be less that 20 Char "})
    }

    const newblog = await blog.create({title , content })

   } catch (error) {
    
   }
}