import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server"

export async function PATCH(req:Request, { params: { courseId}}: { params: { courseId: string}}) {
    try {
        const { title } = await req.json();
        const { userId } = auth();

        if(!title) {
            return new NextResponse('Title is required', { status: 400 });
        }
        if(!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        // course update
        const updateQuery = `UPDATE course SET title = ?, user_id = ?  WHERE id = ?`;
        const params = [title, userId, courseId];

        const courseDetails = {
            title,
            userId,
            courseId
        }

        await cassandraDb.execute(updateQuery, params, { prepare: true })
        .then(() => console.log('Updated succcesfully'))
        .catch(err => console.log(err));

        return NextResponse.json(courseDetails);

        
        
        
    } catch (error) {
        console.log('[COURSE_PATCH]', error)
        return new NextResponse('Internal server error');
        
    }
}