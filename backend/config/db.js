import mongoose from 'mongoose';

const mongoDB= async()=>{
    try {
        const connection= await mongoose.connect("mongodb://localhost:27017/taskforge",{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        });
        console.log(`Database Connected Successfully!`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}

export default mongoDB;