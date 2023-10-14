import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(req:Request, { params: { courseId, chapterId }}: { params: { courseId: string, chapterId: string }}) {
    try {
        const { userId } = auth();
        const { title } = await req.json();
        if(!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        
        };

        if(!title) {
            return new NextResponse('Title is misssing', { status: 500 });
        }

             // check if own course
             const courseQuery = `SELECT * FROM course WHERE id = ?`;
             const courseParams = [courseId];
             const courseRes = await cassandraDb.execute(courseQuery, courseParams, { prepare: true })
             const courseData = courseRes.rows.map(row => ({
               id: row.id.toString(),
               userId: row.user_id,
               title: row.title,
               description: row.description,
               imageUrl: row.image_url,
               price: row.price,
               isPublished: row.is_published,
               categoryId: row.category_id?.toString(),
         
             }));
         
             const courseOwner = courseData.find(user => user.userId === userId);
             if(!courseOwner) {
               return new NextResponse('Unauthorized', { status: 401 })
             };

            

                // update chapter

    const chapter = {
        chapterId,
        courseId,
        title
    }

    const updateQuery = `UPDATE chapter_by_course SET title = ? WHERE id = ?`;
    const params = [title, chapterId];
    await cassandraDb.execute(updateQuery, params, { prepare: true })
    .then(() => console.log('Updated succcesfully'))
    .catch(err => console.log(err));

    return NextResponse.json(chapter)


        
    } catch (error) {
        console.log('[CHAPTER_ID_PATCH]', error);
        return new NextResponse('Internal Error', { status: 500 })
        
    }
}