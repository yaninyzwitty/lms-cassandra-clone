import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req:Request, { params: { courseId }}: { params: { courseId: string}}) {
  try {
    const { userId } = auth();
    const { url  } = await req.json();
    const id = crypto.randomUUID()
    if(!url) {
      return new NextResponse('Url is required', { status: 400 })
    };

    if(!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    };

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
      id,
      url, 
      courseId
    }
    // create an attachment
    const insertQuery = `INSERT INTO attachment_by_course (
      id,
      name,
      url,
      course_id,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)`;
    
    const params = [id, url.split("/").pop(), url, courseId, Date.now(), Date.now()];
    await cassandraDb.execute(insertQuery, params, { prepare: true });


    return NextResponse.json(attachment);
    }   
   catch (error) {
    console.log('[ATTACHMENTS_POST]', error);
    return new NextResponse('Internal Server', { status: 500 })
    
  }

}