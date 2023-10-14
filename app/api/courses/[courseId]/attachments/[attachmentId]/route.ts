import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function DELETE(req:Request, { params: { courseId, attachmentId }}: { params: { courseId: string, attachmentId: string }}) {
    try {
        const { userId } = auth();
        if(!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

         // check if courseOwner
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

    const attachment = {
        attachmentId,
        userId
    }

    // delete attachment
    const deleteQuery = `DELETE FROM attachment_by_course WHERE id = ?`;
    const deleteParams = [attachmentId];
    await cassandraDb.execute(deleteQuery, deleteParams, { prepare: true })
    .then(() => console.log("Deleted succesfully"))
    .catch((err) => console.log(err));

    return NextResponse.json(attachment);
    } catch (error) {
        console.log('[ATTACHMENT_ID_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
        
    }

}