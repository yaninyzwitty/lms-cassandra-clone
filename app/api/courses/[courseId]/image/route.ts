import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server"

export async function PATCH(req:Request, { params: { courseId}}: { params: { courseId: string}}) {
    try {
        const { imageUrl  } = await req.json();
        const { userId } = auth();

        if(!imageUrl) {
            return new NextResponse('description is required', { status: 400 });
        }
        if(!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        // course update
        const updateQuery = `UPDATE course SET image_url = ?, user_id = ?  WHERE id = ?`;
        const params = [imageUrl, userId, courseId];

        const courseDetails = {
            imageUrl,
            userId,
            courseId
        }

        await cassandraDb.execute(updateQuery, params, { prepare: true })
        .then(() => console.log('Updated succcesfully'))
        .catch(err => console.log(err));

        return NextResponse.json(courseDetails);

        
        
        
    } catch (error) {
        console.log('[COURSE_PATCH_IMAGE_URL]', error)
        return new NextResponse('Internal server error');
        
    }
}