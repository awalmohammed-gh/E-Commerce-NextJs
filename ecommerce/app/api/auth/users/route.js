import { connectMongodb } from "@/lib/mongodb";
import { Users } from "@/models/User";
import { NextResponse } from "next/server";


export async function GET(){
    try {
        
        await connectMongodb();
        const users = await Users.find({});

        if(users.length === 0){
            return NextResponse.json({success:false, message:"No users found"},{status:404})
        }

        return NextResponse.json({success:true, users},{status:200})
    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false, message:"Failed to retrieve user"}, {status:500})
    }
}


//remove users by their ids
export async function DELETE(request){
    try {
        await connectMongodb();

        const id = request.nextUrl.searchParams.get("id");

        if(!id){
             return NextResponse.json(
               { success: false, message: "No Id found" },
               { status: 400 },
             );
        }

        const user = await Users.findByIdAndDelete(id);
        if(!user){
            return NextResponse.json(
              { success: false, message: "user not found" },
              { status: 404 },
            );
        }

        return NextResponse.json({ success: true, message:"User deleted successfully" },{status:200});
    } catch (error) {
        console.error(error);
        return NextResponse.json(
          { success: false, message: "Failed to delete user" },
          { status: 500 },
        );
    }
}