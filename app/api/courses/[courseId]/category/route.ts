import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server"

export async function PATCH(req:Request, { params: { courseId}}: { params: { courseId: string}}) {
    try {
        const { categoryId  } = await req.json();
        const { userId } = auth();

        if(!categoryId) {
            return new NextResponse('description is required', { status: 400 });
        }
        if(!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        // course update
        const updateQuery = `UPDATE course SET category_id = ?, user_id = ?  WHERE id = ?`;
        const params = [categoryId, userId, courseId];

        const courseDetails = {
            categoryId,
            userId,
            courseId
        }

        await cassandraDb.execute(updateQuery, params, { prepare: true })
        .then(() => console.log('Updated succcesfully'))
        .catch(err => console.log(err));

        return NextResponse.json(courseDetails);

        
        
        
    } catch (error) {
        console.log('[COURSE_PATCH_CATEGORY]', error)
        return new NextResponse('Internal server error');
        
    }
}