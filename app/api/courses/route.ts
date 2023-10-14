import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid"

export async function POST(req:Request, res:Response) {
    try {
        const { userId } = auth();
        const { title } = await req.json();
        const id = uuid();


        if(!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        
        };

        if(!title) {
            return new NextResponse('Title is misssing', { status: 500 });
        }

        // add to db

        const insertQuery = `INSERT INTO course (id, user_id, title, description, image_url, price, is_published, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [id, userId, title, null, null, null, false, null]
        await cassandraDb.execute(insertQuery, params, { prepare: true })
        .then(() => console.log("Details put succesfully"))
        .catch((error) => console.log(error))

        const course = {
            id,
            title
        }
        return NextResponse.json(course);
        
    } catch (error) {
        console.log('[COURSE_POST]', error);
        return new NextResponse('Internal error', { status: 500 })
        
    }
}